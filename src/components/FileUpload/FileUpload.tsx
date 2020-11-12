import React from "react";
import {
  Button,
  Form,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import User from "../../common/UserAuth.interface";
import "./FileUpload.css";
import { DropdownDivider } from "react-bootstrap/Dropdown";
import CryptService from "../../services/CryptService";

interface FileUploadProps {
  user: User;
  restrictPdf?: boolean;
  encrypt: boolean;
  reUpload: boolean;
  onEncryptedUpload: (encryptedFile: string) => void;
  onClose: () => void;
}
interface FileUploadState {
  file: File;
  displayMessage: string;
  displayVariant: number; // 0 = white, 1 = warning
  submitClicked: boolean;
  buffering: boolean;
  failedEncryption: boolean;
}

class FileUpload extends React.Component<FileUploadProps, FileUploadState> {
  private cryptService: CryptService;

  constructor(props: FileUploadProps) {
    super(props);
    this.state = {
      file: new File([], ""),
      displayMessage: "",
      displayVariant: 0,
      submitClicked: false,
      buffering: false,
      failedEncryption: false,
    };
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.cryptService = new CryptService();
  }

  onChange(e: any) {
    console.log("file changed");
    this.setState({ file: e.target.files[0] });
  }

  async onFormSubmit() {
    const file = this.state.file;
    console.log(file);
    if (!file || file.size === 0) {
      console.log("no file uploaded");
      this.setState({
        displayMessage: "No File Uploaded.",
        displayVariant: 0,
        submitClicked: true,
      });
    } else if (this.props.restrictPdf && file.type !== "application/pdf") {
      console.log("not a pdf");
      this.setState({
        displayMessage: "Please Upload a PDF.",
        displayVariant: 0,
        submitClicked: true,
        file: new File([], ""),
      });
    } else {
      if (this.props.encrypt) {
        this.setState({
          displayMessage: "See Metamask to Upload",
          displayVariant: 0,
          submitClicked: true,
          failedEncryption: false,
        });

        // handle encryption for uploaded file
        // encrypt file
        let encryptedFile = await this.cryptService.encrypt(
          file,
          this.props.user.publicAddress
        );

        if (!encryptedFile) {
          console.log("encryption failed");
          this.setState({
            failedEncryption: true,
            submitClicked: false,
            displayMessage: "Failed to Encrypt",
            displayVariant: 0,
          });
        } else {
          console.log("checking if upload to server");
          this.setState({
            buffering: true,
            displayMessage: "",
            submitClicked: false,
          });
          setTimeout(() => {
            this.props.onEncryptedUpload(encryptedFile);
          }, 1000);
        }
      }
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
    const { reUpload } = this.props;
    const {
      displayMessage,
      displayVariant,
      submitClicked,
      buffering,
      failedEncryption,
      file,
    } = this.state;
    return (
      <Form onSubmit={this.onFormSubmit.bind(this)}>
        <Form.Group>
          <div className="text-center mb-3">Upload</div>

          <Form.File
            id="fileUpload"
            className="file-upload-form"
            label={
              file && file.name !== ""
                ? file.name
                : reUpload
                ? "Change Your Upload"
                : "Upload a New Letter"
            }
            data-browse="Select"
            onChange={this.onChange}
            custom
          />

          <div className="d-flex border-radius button-blur mb-2">
            {failedEncryption && (
              <div className="flex-shrink-1 mt-4 mr-3">
                <OverlayTrigger
                  overlay={
                    <Tooltip id="learn-more">
                      <>
                        <div>
                          Please click <em>Provide</em> on Metamask. We need
                          your <b>Public Key</b> to encrypt your letter. This
                          keeps your letters secure so that only you can view
                          it. See <b>End-to-End Encryption</b> in the FAQs.
                        </div>
                      </>
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    size="lg"
                    className="ml-3"
                  />
                </OverlayTrigger>
              </div>
            )}

            {submitClicked && (
              <div className="flex-shrink-1 mt-4 mr-3">
                <OverlayTrigger
                  overlay={
                    <Tooltip id="learn-more">
                      <>
                        {/* when file exists and submitClicked is going on (metamask prompt) */}
                        {file && file.name !== "" && (
                          <div>
                            We use <b>Metamask</b> to get your <b>Public Key</b>{" "}
                            which we use to encrypt your letter. This makes your
                            letter secure so that only you can view it. See{" "}
                            <b>End-to-End Encryption</b> in the FAQs.
                          </div>
                        )}

                        {/* when submit button is clicked but no file uploaded */}
                        {file && file.name === "" && (
                          <div>
                            Please Upload a <em>Valid</em> File. We keep your letter secure by
                            submitClicked your letter with your{" "}
                            <b>Public Key</b>. See <b>End-to-End Encryption</b>{" "}
                            in the FAQs.
                          </div>
                        )}
                      </>
                    </Tooltip>
                  }
                >
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    size="lg"
                    className="ml-3"
                  />
                </OverlayTrigger>
              </div>
            )}

            {displayVariant === 0 && (
              <div className="text-white mt-4 flex-fill ">{displayMessage}</div>
            )}
            {displayVariant === 1 && (
              <div className="text-warning mt-4 flex-fill ">
                {displayMessage}
              </div>
            )}

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
