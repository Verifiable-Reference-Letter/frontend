class ReaderService {
  private reader: FileReader = new FileReader();
  readAsUrl(file: File) {
    this.reader.readAsDataURL(file);
    let letterUrl: any;
    this.reader.onload = (e: any) => {
      if (this.reader.result) {
        // console.log("result", this.reader.result);
        letterUrl = this.reader.result;
      }
    };
    return letterUrl;
  }
} export default ReaderService;