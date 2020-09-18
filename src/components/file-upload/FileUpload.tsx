import React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import User from "../../interfaces/User.interface";
import "./FileUpload.css";

interface FileUploadProps {
  user: User;
  fetchUrl?: string;
  onUpload: (file: File) => void;
  onClose: () => void;
}
interface FileUploadState {
  file: File;
  displayMessage: string;
}

class FileUpload extends React.Component<FileUploadProps, FileUploadState> {
  constructor(props: FileUploadProps) {
    super(props);
    this.state = {
      file: new File([], ""),
      displayMessage: "",
    };
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    // this.fileUpload = this.fileUpload.bind(this);
  }

  onFormSubmit() //e: React.FormEvent
  {
    console.log(this.state.file);
    if (this.state.file.size === 0) {
      console.log("no file uploaded");
      this.setState({ displayMessage: "No File Uploaded." });
    } else {
      console.log("checking if upload to server");
      if (this.props?.fetchUrl) this.fileUploadToServer(this.state.file);
      else this.props.onUpload(this.state.file);
    }
  }

  onChange(e: any) {
    console.log("file changed");
    this.setState({ file: e.target.files[0] });
  }

  fileUploadToServer(file: File) {
    console.log("sending file to server");
    let fileForm: FormData = new FormData();
    fileForm.append("file", file);
    if (this.props?.fetchUrl) {
      fetch(`${process.env.REACT_APP_BACKEND_URL}` + this.props.fetchUrl, {
        body: fileForm,
        headers: {
          "Content-Type": "mutlipart/form-data",
          jwtToken: this.props.user.jwtToken,
        },
        method: "POST",
      })
        .then((response: any) => {
          console.log(response.json);
        })
        .catch((e: Error) => {
          console.log(e);
        });

      this.props.onUpload(file);
    }
  }

  render() {
    const displayMessage = this.state.displayMessage;
    return (
      <Form onSubmit={this.onFormSubmit.bind(this)}>
        <Form.Group>
          <Form.File id="fileUpload" onChange={this.onChange} />
          <div>
            <div className="display-message"> {displayMessage} </div>

            <Button
              className="form-button"
              onClick={(e: any) => {
                this.props.onClose();
              }}
            >
              Close
            </Button>
            <Button
              className="form-button"
              //type="submit"
              onClick={this.onFormSubmit}
            >
              Upload
            </Button>
          </div>
        </Form.Group>
      </Form>

      // <form onSubmit={this.onFormSubmit}>
      //   <input type="file" onChange={this.onChange} />
      //   <button type="submit">Upload</button>
      // </form>
    );
  }
}

export default FileUpload;
