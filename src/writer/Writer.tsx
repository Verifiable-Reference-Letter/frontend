import React from "react";
import { Button, Accordion, Card, Modal, Spinner } from "react-bootstrap";

import UserAuth from "../common/UserAuth.interface";
import LetterDetails from "../common/LetterDetails.interface";
import FileData from "../common/FileData.interface";
import RequestBody from "../common/RequestBody.interface";
import ResponseBody from "../common/ResponseBody.interface";

import CryptService from "../services/CryptService";
import CacheService from "../services/CacheService";

import FileUpload from "../components/FileUpload/FileUpload";
import FileView from "../components/FileView/FileView";

import "./Writer.css";
import LetterHistory from "../common/LetterHistory.interface";

interface WriterProps {
  user: UserAuth;
}

interface WriterState {
  letters: LetterDetails[];
  numRecipients: Number[];
  history: LetterHistory[];
  loadingLetters: boolean;
  uploadIsOpen: boolean;
  viewIsOpen: boolean;
  selectedLetterKey: number;
  selectedLetterId: string;
  selectedFileData?: FileData;
}

class Writer extends React.Component<WriterProps, WriterState> {
  private uploadModal = React.createRef<FileUpload>();
  private viewModal = React.createRef<FileView>();
  private cryptService: CryptService;
  private cacheService: CacheService<string, string>;

  componentWillMount() {
    // api call to get letters
    const letterFetchUrl = `/api/v1/letters/written`;
    const init: RequestInit = {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth: {
          jwtToken: this.props.user.jwtToken,
          publicAddress: this.props.user.publicAddress,
        },
        data: {},
      }),
    };

    // get letters from server
    fetch(`${process.env.REACT_APP_BACKEND_URL}${letterFetchUrl}`, init)
      .then((response) => {
        response
          .json()
          .then((body: ResponseBody) => {
            const data: { letters: LetterDetails[], numRecipients: Number[]} = body.data;

            console.log(response);
            if (data) {
              this.setState({
                letters: data.letters,
                numRecipients: data.numRecipients,
                loadingLetters: false,
              });
            } else {
              console.log("problem with response data for writer");
            }
          })
          .catch((e: Error) => {
            console.log(e);
          });
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }

  constructor(props: WriterProps) {
    super(props);
    this.state = {
      letters: [],
      numRecipients: [],
      history: [],
      loadingLetters: true,
      viewIsOpen: false,
      uploadIsOpen: false,
      selectedLetterKey: -1,
      selectedLetterId: "",
    };
    this.cryptService = new CryptService();
    this.cacheService = new CacheService(1);
  }

  openUploadModal(key: number) {
    console.log("opening upload modal");
    this.setState({
      uploadIsOpen: true,
      selectedLetterKey: key,
      selectedLetterId: this.state.letters[key].letterId,
    });
  }

  onUploadSubmit(file: File) {
    const fetchUrl = `/api/v1/letters/${this.state.selectedLetterId}/content`;
    this.uploadToServer(file, fetchUrl);
  }

  closeUploadModal() {
    console.log("closing upload modal");
    this.setState({ uploadIsOpen: false });
  }

  async uploadToServer(file: File, fetchUrl: string) {
    console.log("uploading to server");
    console.log(file);

    // encrypt file
    let encryptedFile = await this.cryptService.encrypt(
      file,
      this.props.user.publicAddress
    );
    console.log(encryptedFile);

    if (!encryptedFile) {
      console.log("encryption failed");
      this.closeUploadModal();
      return;
    }

    // cache encrypted file
    console.log(this.state.selectedLetterId);
    this.cacheService.put(this.state.selectedLetterId, encryptedFile);
    console.log("put encryptedFile into memcache");

    // post encrypted file to server
    fetch(`${process.env.REACT_APP_BACKEND_URL}${fetchUrl}`, {
      body: JSON.stringify({
        auth: {
          publicAddress: this.props.user.publicAddress,
          jwtToken: this.props.user.jwtToken,
        },
        data: { contents: encryptedFile },
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "application/json",
      },
      method: "POST",
    })
      .then((response: any) => {
        console.log(response.status);
        if (response.status === 200) {
          this.closeUploadModal();
        } else {
          this.uploadModal.current!.changeDisplayMessage(
            "Upload Failed. Try Again Later."
          );
          this.closeUploadModal(); // DELETE
        }
      })
      .catch((e: Error) => {
        console.log(e);
        this.closeUploadModal(); // DELETE
      });
  }

  async openViewModal(key: number) {
    console.log("opening view modal");
    const letterId = this.state.letters[key].letterId;
    const fetchUrl = `/api/v1/letters/${letterId}/contents`;
    console.log(letterId);
    let encryptedLetter = this.cacheService.get(letterId);

    if (encryptedLetter === null) {
      this.retrieveLetterContentsFromServer(fetchUrl, key);
    } else {
      try {
        let fileData = await this.cryptService.decrypt(
          encryptedLetter,
          this.props.user.publicAddress
        );
        // console.log("fileData", fileData);
        console.log(fileData.letterType);
        this.setState({
          viewIsOpen: true,
          selectedLetterKey: key,
          selectedLetterId: letterId,
          selectedFileData: fileData,
        });
      } catch (error) {
        console.log("error with decryption");
      }
    }
  }

  closeViewModal() {
    console.log("closing view modal");
    this.setState({ viewIsOpen: false });
  }

  retrieveLetterContentsFromServer(fetchUrl: string, key: number) {
    console.log("retrieving from server");
    const init: RequestInit = {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth: {
          jwtToken: this.props.user.jwtToken,
          publicAddress: this.props.user.publicAddress,
        },
        data: {},
      }),
    };
    const letterId = this.state.letters[key].letterId;
    // get letter from server
    fetch(`${process.env.REACT_APP_BACKEND_URL}${fetchUrl}`, init)
      .then((response) => {
        console.log("logging response");
        console.log(response);
        return response.json();
      })
      .then((encryptedLetter) => {
        // decrypt letter
        this.cryptService
          .decrypt(encryptedLetter, this.props.user.publicAddress)
          .then((fileData) => {
            if (fileData) {
              this.setState({
                viewIsOpen: true,
                selectedLetterKey: key,
                selectedLetterId: letterId,
                selectedFileData: fileData,
              });
            }
          });
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }

  getRequestor() {
    return this.state.letters[this.state.selectedLetterKey]?.letterRequestor;
  }

  getWriter() {
    return this.state.letters[this.state.selectedLetterKey]?.letterWriter;
  }

  render() {
    const { name } = this.props.user;
    const {
      letters,
      numRecipients,
      loadingLetters,
      uploadIsOpen,
      viewIsOpen,
      selectedLetterId,
    } = this.state;
    let requestor = this.getRequestor();

    const lettersList = letters.map((l, k) => (
      <Card className="full-width opacity-0">
        <Accordion.Toggle
          as={Card.Header}
          className="d-flex"
          id={k.toString}
          eventKey={k.toString()}
        >
          <div className="flex-fill button-blur">
            <span className="mr-3">For:</span>
            <Button
              variant="outline-light"
              onClick={(e: any) => {
                e.stopPropagation();
                // this.openProfileModal(l.letterRequestor.publicAddress);
              }}
            >
              {l.letterRequestor?.name}
            </Button>
          </div>

          <div className="button-blur">
            <Button
              disabled={numRecipients[k] === 0}
              variant="outline-light"
              className="flex-shrink-1 float-right ml-3"
              onClick={(e: any) => {
                e.stopPropagation();
                if (numRecipients[k] !== 0) {
                  //this.openHistoryModal(k);
                }
              }}
            >
              History
            </Button>
            <Button
              disabled={numRecipients[k] === 0}
              variant="outline-light"
              className="flex-shrink-1 float-right ml-3"
              onClick={(e: any) => {
                e.stopPropagation();
                if (numRecipients[k] !== 0) {
                  this.openViewModal(k);
                }
              }}
            >
              View
            </Button>
            <Button
              // TODO: add Tooltip
              disabled={numRecipients[k] !== 0}
              variant="outline-light"
              className="flex-shrink-1 float-right ml-3"
              onClick={(e: any) => {
                e.stopPropagation();
                if (numRecipients[k] === 0) {
                  this.openUploadModal(k);
                }
              }}
            >
              Upload
            </Button>
            {/* {!l.uploadedAt && (
              <div className="display-text flex-shrink-1 float-right">
                Pending
              </div>
            )} */}
          </div>
        </Accordion.Toggle>
        <Accordion.Collapse as={Card.Body} eventKey={k.toString()}>
          {/* <Card.Body className="">({l.letterId}) {l.writer.name} ({l.writer.publicAddress})</Card.Body> */}
          {/*<div className="body-text button-blur">
            <a>
              From: 
            </a>
            <Button
              variant="outline-light"
              className="ml-3"
              onClick={(e: any) => {
                e.stopPropagation();
                this.openProfileModal(l.writer.publicAddress);
              }}
            >
              {l.writer.name}
            </Button>
          </div>*/}
          <div className="body-text display-text d-flex text-white-50">
            <div className="flex-fill">
              Requested: {l.requestedAt?.toString()}
            </div>
            {l.uploadedAt && (
              <div className=" flex-shrink-1 float-right">
                Uploaded: {l.uploadedAt?.toString()}
              </div>
            )}
            {!l.uploadedAt && (
              <div className=" flex-shrink-1 float-right">Not Uploaded</div>
            )}
          </div>
          {/* <Button
              variant="outline-light"
              className="flex-shrink-1 float-right ml-2"
              onClick={(e: any) => {
                e.stopPropagation();
                this.openProfileModal(l.writer.publicAddress);
              }}
            >
              View: {l.writer.name}
            </Button> */}
        </Accordion.Collapse>
      </Card>
    ));

    // const lettersList = letters.map((l, k) => (
    //   <Row key={k}>
    //     <div className="full-width">
    //       {/* <span className="text-float-left">({l.letterId})&nbsp;</span> */}
    //       <span className="text-float-left">
    //         For: {l.letterRequestor?.name}
    //       </span>
    //       <Button
    //         className="left-float-right-button"
    //         onClick={() => {
    //           this.openViewModal(k);
    //         }}
    //       >
    //         View
    //       </Button>

    //       <Button
    //         className="left-float-right-button"
    //         onClick={() => {
    //           this.openUploadModal(k);
    //         }}
    //       >
    //         Upload
    //       </Button>
    //     </div>
    //   </Row>
    // ));

    return (
      <div id="writer" className="writer">
        <Modal
          id="upload-modal"
          show={uploadIsOpen}
          onHide={this.closeUploadModal.bind(this)}
          backdrop="static"
          size="lg"
          animation={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              For: {requestor?.name} ({selectedLetterId})
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FileUpload
              ref={this.uploadModal}
              user={this.props.user}
              restrictPdf={true}
              onUpload={this.onUploadSubmit.bind(this)}
              onClose={this.closeUploadModal.bind(this)}
            ></FileUpload>
          </Modal.Body>
        </Modal>

        <Modal
          id="view-modal"
          show={viewIsOpen}
          onHide={this.closeViewModal.bind(this)}
          backdrop="static"
          animation={false}
          className="modal"
          scrollable={false}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Letter For {requestor?.name} ({selectedLetterId})
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FileView
              fileData={this.state.selectedFileData}
              ref={this.viewModal}
              user={this.props.user}
              letter={letters[this.state.selectedLetterKey]}
              onClose={this.closeViewModal.bind(this)}
            ></FileView>
          </Modal.Body>
        </Modal>
        <div className="writer-header mb-3">
          <h1> Writer Page </h1>
          {/* <hr></hr> */}
        </div>

        <div className="letters">
          {!loadingLetters && (
            <div className="mb-4">
              <h3> Letters </h3>
              <Accordion>{lettersList}</Accordion>
            </div>
          )}
          {loadingLetters && (
            <div className="d-flex justify-content-center mb-4">
              <Spinner
                className="float-right"
                animation="border"
                variant="secondary"
              />
              {/* <hr></hr> */}
            </div>
          )}
        </div>

        <div className="writer-footer">
          <span> Product of Team Gas</span>
        </div>
      </div>
    );
  }
}
export default Writer;
