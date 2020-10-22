import * as EthUtil from "ethereumjs-util";
import * as SigUtil from "eth-sig-util";
import FileData from "../common/FileData.interface";
import { web3 } from "../App";

class CryptService {
  private publicKey: string = "";
  private ethereum: any;

  constructor() {
    this.publicKey = "";
    this.ethereum = (window as any).ethereum;
    this.ethereum
      .enable()
      .then(() => {})
      .catch((e: Error) => {});
  }

  async encrypt(file: File, publicAddress: string): Promise<string> {
    try {
      const fileData = await this.createFileData(file); // rejects on failure

      let fileDataString: string | null = null;
      console.log(publicAddress);
      console.log(fileData.letterType);
      return this.ethereum
        .request({
          method: "eth_getEncryptionPublicKey",
          params: [publicAddress], // you must have access to the specified account
        })
        .then((publicKey: string) => {
          console.log(publicKey);
          this.publicKey = publicKey;
  
          const encryptedMessage = EthUtil.bufferToHex(
            Buffer.from(
              JSON.stringify(
                SigUtil.encrypt(
                  this.publicKey,
                  { data: JSON.stringify(fileData) },
                  "x25519-xsalsa20-poly1305"
                )
              ),
              "utf8"
            )
          );
          // console.log(encryptedMessage);
          fileDataString = encryptedMessage;
          return Promise.resolve(fileDataString);
        })
        .catch((e: Error) => {
          console.log(e);
          return Promise.resolve(fileDataString);
        });
    } catch (error) {
      console.log("error in file reader and/or encryption");
      return Promise.reject("error in file reader and/or encryption");
    }
  }

  async sign(file: File, publicAddress: string): Promise<string> {
  	// Logic to sign https://github.com/MetaMask/eth-sig-util/blob/master/index.ts
  	// eth-sign from here json rpc: https://eth.wiki/json-rpc/API#eth_sign
  	try {
  		const fileData = await this.createFileData(file); // rejects on failure
  		let signedFile: string | null = null;
  		let message = JSON.stringify(fileData)

  		return new Promise((resolve, reject) => {
      // web3.eth.sign doesn't seem to work (never finishes)
	      web3.eth.personal
	        .sign(
	          message,
	          // web3.utils.utf8ToHex(`${message}`),
	          publicAddress,
	          "",
	          (err, signature) => {
	            //console.log(web3.eth.accounts.recover(web3.utils.keccak256(nonce), signature));
	            //web3.eth.personal.ecRecover(message, signature).then((v) => console.log(v));
	            if (err) {
	              console.log("error when signing");
	              return reject(err);
	            }
	            console.log("message signed");
	            return resolve(signature);
	          }
	        )
	        .then(console.log)
	        .catch((err: Error) => {
	          console.log();
	        });
	    });


  	} catch (error) {
  		console.log("error in file reader and/or digital signature");
      	return Promise.reject("error in file reader and/or digital signature");
  	}
  }

  async decrypt(file: string, publicAddress: string) : Promise<FileData> {
    console.log(publicAddress);
    console.log(file);
    let fileData: FileData = {letterTitle: "", letterType: "invalid", letterUrl: ""};
    return this.ethereum
      .request({
        method: "eth_decrypt",
        params: [file, publicAddress],
      })
      .then((decryptedMessage: string) => {
        // console.log(decryptedMessage);
        fileData = JSON.parse(decryptedMessage);
        console.log("parsed");
        return Promise.resolve(fileData);
      })
      .catch((e: Error) => {
        console.log(e);
        return Promise.reject("failure to decrypt");
      });
  }

  async createFileData(file: File) : Promise<FileData> {
    let fileData: FileData = {
      letterUrl: "",
      letterTitle: "",
      letterType: "invalid",
    };
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      if (file !== undefined) {
        reader.readAsDataURL(file);
        reader.onload = (e: any) => {
          if (typeof reader.result === "string") {
            console.log("letterUrl obtained");
            // console.log(reader.result);
            fileData.letterTitle = file.name;
            fileData.letterType = file.type;
            fileData.letterUrl = reader.result;
            resolve(fileData);
            // console.log(fileData);
            // { letterUrl: reader.result, letterTitle: file.name, letterType : file.type };
          } else {
            console.log("error with reader.result type");
            reject("failed to get reader.result type string");
          }
        };
      }
    });
  }
}
export default CryptService;
