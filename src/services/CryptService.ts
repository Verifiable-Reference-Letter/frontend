class CryptService {
  encrypt(file: File) {
    return "encrypted file";
  }
  decrypt(file: string) {
    return new File([""], "filename.pdf", {type: "application/pdf"});
  }
} export default CryptService;