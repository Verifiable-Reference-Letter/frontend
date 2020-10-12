import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";

import UserAuth from "../common/UserAuth.interface";
import LetterDetails from "../common/LetterDetails.interface";
import FileData from "../common/FileData.interface";
import Body from "../common/Body.interface";

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
  history: LetterHistory[];
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

    // get user profile from server
    fetch(`${process.env.REACT_APP_BACKEND_URL}${letterFetchUrl}`, init)
      .then((response) => {
        response
          .json()
          .then((body: Body) => {
            const data: LetterDetails[] = body.data;
            console.log(response);
            if (data) {
              this.setState({
                letters: data,
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

    console.log("componentWillMount");
    this.setState({
      letters: [
        {
          letterId: "1",
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323",
          },
          requestor: {
            name: "Simba",
            publicAddress: "0xabcdefghijklmnop",
          },
          requestedAt: null,
          uploadedAt: null,
        },
        {
          letterId: "2",
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323",
          },
          requestor: {
            name: "Curious George",
            publicAddress: "0x142857142857142857",
          },
          requestedAt: null,
          uploadedAt: null,
        },
      ],
      history: [
        {
          letterId: "1",
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323",
          },
          requestor: {
            name: "Simba",
            publicAddress: "0xabcdefghijklmnop",
          },
          requestedAt: null,
          uploadedAt: null,
          recipient: {
            name: "Elton John",
            publicAddress: "0x101100101001101110100",
          },
          sentAt: null,
        },
      ],
    });
  }

  constructor(props: WriterProps) {
    super(props);
    this.state = {
      letters: [],
      history: [],
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
    const fetchUrl = `/api/users/${this.props.user.publicAddress}/letters/${this.state.selectedLetterId}/content`;
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
      body: JSON.stringify({ content: encryptedFile }),
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
    const fetchUrl = `/api/users/${this.props.user.publicAddress}/letters/${letterId}/content`;
    console.log(letterId);
    let encryptedLetter = this.cacheService.get(letterId);
    // console.log(encryptedLetter);

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
    return this.state.letters[this.state.selectedLetterKey]?.requestor;
  }

  getWriter() {
    return this.state.letters[this.state.selectedLetterKey]?.writer;
  }

  render() {
    const { name } = this.props.user;
    const { letters, uploadIsOpen, viewIsOpen, selectedLetterId } = this.state;
    let requestor = this.getRequestor();

    const lettersList = letters.map((l, k) => (
      <Row key={k}>
        <div className="full-width">
          <span className="text-float-left">({l.letterId})&nbsp;</span>
          <span className="text-float-left">For: {l.requestor.name}</span>
          <Button
            className="left-float-right-button"
            onClick={() => {
              this.openViewModal(k);
            }}
          >
            View
          </Button>

          <Button
            className="left-float-right-button"
            onClick={() => {
              this.openUploadModal(k);
            }}
          >
            Upload
          </Button>
        </div>
      </Row>
    ));

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
              Letter for {requestor?.name} ({selectedLetterId})
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
        <div className="writer-header">
          <h1> Writer Page </h1>
          <p>
            <em>{name}</em>
          </p>
          <hr></hr>
        </div>

        <div className="letters">
          <h3> Letters </h3>
          <Container fluid>{lettersList}</Container>
          <hr></hr>
        </div>

        <div className="writer-footer">
          <p> Product of Team Gas</p>
        </div>
      </div>
    );
  }
}
export default Writer;
