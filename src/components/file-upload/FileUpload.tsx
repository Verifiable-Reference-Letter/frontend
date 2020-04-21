import React from "react";
interface FileUploadProps {
  callback: (file: FormData) => void
}
interface FileUploadState {
  file: FormData
}

class FileUpload extends React.Component<FileUploadProps, FileUploadState> {

  constructor(props: FileUploadProps) {
    super(props);
    this.state = {
      file: new FormData(undefined)
    };
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    // this.fileUpload = this.fileUpload.bind(this);
  }
  
  onFormSubmit(e: React.FormEvent) {
    e.preventDefault(); // Stop form submit
    this.props.callback(this.state.file);
    // this.fileUpload(this.state.file).then((response) => {
    //   console.log(response.data);
    // });
  }

  onChange(e: any) {
    this.setState({ file: e.target.files[0] });
  }

  // fileUpload(file) {
  //   const url = "http://example.com/file-upload";
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   const config = {
  //     headers: {
  //       "content-type": "multipart/form-data",
  //     },
  //   };
  //   return post(url, formData, config);
  // }

  render() {
    return (
      <form onSubmit={this.onFormSubmit}>
        <h1>File Upload</h1>
        <input type="file" onChange={this.onChange} />
        <button type="submit">Upload</button>
      </form>
    );
  }
}

export default FileUpload;
