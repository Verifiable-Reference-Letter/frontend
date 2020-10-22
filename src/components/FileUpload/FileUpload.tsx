import React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";

import User from "../../common/UserAuth.interface";
import "./FileUpload.css";
import { DropdownDivider } from "react-bootstrap/Dropdown";

interface FileUploadProps {
  user: User;
  restrictPdf?: boolean;
  onUpload: (file: File) => void;
  onClose: () => void;
}
interface FileUploadState {
  file: File;
  displayMessage: string;
  buffering: boolean;
}

class FileUpload extends React.Component<FileUploadProps, FileUploadState> {
  constructor(props: FileUploadProps) {
    super(props);
    this.state = {
      file: new File([], ""),
      displayMessage: "",
      buffering: false,
    };
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(e: any) {
    console.log("file changed");
    this.setState({ file: e.target.files[0] });
  }

  onFormSubmit() {
    const file = this.state.file;
    console.log(file);
    if (file && file.size === 0) {
      console.log("no file uploaded");
      this.setState({ displayMessage: "No File Uploaded." });
    } else if (this.props.restrictPdf && file.type !== "application/pdf") {
      console.log("not a pdf");
      this.setState({ displayMessage: "Please Upload a PDF." });
    } else {
      console.log("checking if upload to server");
      this.setState({ buffering: true });
      setTimeout(() => {
        this.props.onUpload(file);
      }, 1000);
    }
  }

  /*encryptFile(file: File) {
    console.log("pretending to encrypt file");
    this.fileUploadToServer(file);
  }

  fileUploadToServer(file: File) {
    console.log("sending file to server");

    // let fileForm: string = this.encryptFile(file);
    
    // REMOVE:
    let fileForm: FormData = new FormData();
    fileForm.append("file", file);
    // END REMOVE

    this.setState({displayMessage: "Uploading File."});

    fetch(`${process.env.REACT_APP_BACKEND_URL}` + this.props.fetchUrl, {
      body: fileForm,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "mutlipart/form-data",
        jwtToken: this.props.user.jwtToken,
      },
      method: "POST",
    })
      .then((response: any) => {
        console.log("body", response.json);
        console.log("status", response.status);
        if (response.status === 200) {
          this.props.onUpload(this.state.file);
        } else {
          this.changeDisplayMessage("Upload Failed. Try Again Later.");
          this.props.onUpload(this.state.file); // DELETE: here for testing purposes
        }
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }*/

  changeDisplayMessage(newDisplayMessage: string) {
    this.setState({ displayMessage: newDisplayMessage });
  }

  render() {
    const { displayMessage, buffering } = this.state;
    return (
      <Form onSubmit={this.onFormSubmit.bind(this)}>
        <Form.Group>
          <Form.File id="fileUpload" onChange={this.onChange} />
          <div className="d-flex border-radius button-blur mb-2">
            <div className="text-warning mt-3 flex-fill ">
              {displayMessage}
            </div>
            {/* {buffering && (
              <div className="d-flex justify-content-end">
                <Spinner
                  className="mt-4 mr-3"
                  animation="border"
                  variant="secondary"
                />
              </div>
            )} */}
            <Button
              className="mt-3 mr-3 flex-shrink-1 float-right"
              variant="outline-light"
              onClick={this.onFormSubmit}
            >
              Submit
            </Button>
            <Button
              className="mt-3 flex-shrink-1 float-right"
              variant="outline-light"
              onClick={(e: any) => {
                this.props.onClose();
              }}
            >
              Close
            </Button>
          </div>
        </Form.Group>
      </Form>
    );
  }
}

export default FileUpload;
