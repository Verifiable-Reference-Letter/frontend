import * as EthUtil from "ethereumjs-util";
import * as SigUtil from "eth-sig-util";
import FileData from "../common/FileData.interface";

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
          console.log(encryptedMessage.length);
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
        console.log(decryptedMessage.length);
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
