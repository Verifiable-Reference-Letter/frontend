import { web3 } from "../App";
import * as EthUtil from "ethereumjs-util";
import * as SigUtil from "eth-sig-util";

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

  encrypt(file: Blob, publicAddress: string) {
    console.log(publicAddress);
    this.ethereum
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
                { data: "file" },
                "x25519-xsalsa20-poly1305"
              )
            ),
            "utf8"
          )
        );
        console.log(encryptedMessage);
        this.decrypt(encryptedMessage, publicAddress); // REMOVE
        return encryptedMessage;
      })
      .catch((e: Error) => {
        console.log(e);
      });
    return "";
  }

  decrypt(file: string, publicAddress: string) {
    this.ethereum
      .request({
        method: "eth_decrypt",
        params: [file, publicAddress],
      })
      .then((decryptedMessage: string) => {
        console.log(decryptedMessage);
      })
      .catch((e: Error) => console.log(e));
    return new File([""], "filename.pdf", { type: "application/pdf" });
  }
}
export default CryptService;
