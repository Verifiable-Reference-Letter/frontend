import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";

import UserAuth from "../common/UserAuth.interface";
import LetterDetails from "../common/LetterDetails.interface";

import CryptService from "../services/CryptService";
import CacheService from "../services/CacheService";

import FileUpload from "../components/FileUpload/FileUpload";
import FileView from "../components/FileView/FileView";

import "./Writer.css";

interface WriterProps {
  user: UserAuth;
}

interface WriterState {
  letters: LetterDetails[];
  uploadIsOpen: boolean;
  viewIsOpen: boolean;
  selectedLetterKey: number;
  selectedLetterId: number;
  file?: File;
}

class Writer extends React.Component<WriterProps, WriterState> {
  private uploadModal = React.createRef<FileUpload>();
  private viewModal = React.createRef<FileView>();
  private cryptService: CryptService;
  private cacheService: CacheService<number, string>;
  private testCacheService: CacheService<number, File>;

  componentWillMount() {
    // api call to get letters
    console.log("componentWillMount");
    this.setState({
      letters: [
        {
          letterId: 1,
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323",
            jwtToken: "",
          },
          requestor: {
            name: "Simba",
            publicAddress: "0xabcdefghijklmnop",
            jwtToken: "",
          },
        },
        {
          letterId: 2,
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323",
            jwtToken: "",
          },
          requestor: {
            name: "Curious George",
            publicAddress: "0x142857142857142857",
            jwtToken: "",
          },
        },
      ],
    });
  }

  constructor(props: WriterProps) {
    super(props);
    this.state = {
      letters: [],
      viewIsOpen: false,
      uploadIsOpen: false,
      selectedLetterKey: -1,
      selectedLetterId: -1,
    };
    this.cryptService = new CryptService();
    this.cacheService = new CacheService(1);
    this.testCacheService = new CacheService(1);
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

  uploadToServer(file: File, fetchUrl: string) {
    console.log("uploading to server");
    // encrypt file
    let encryptedFile: string = this.cryptService.encrypt(file);
    // cache encrypted file
    // this.cacheService.put(this.state.selectedLetterId, encryptedFile);
    this.testCacheService.put(this.state.selectedLetterId, file);

    // post encrypted file to server
    fetch(`${process.env.REACT_APP_BACKEND_URL}${fetchUrl}`, {
      body: JSON.stringify({ content: encryptedFile }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "application/json",
        jwtToken: this.props.user.jwtToken,
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
      });
  }

  openViewModal(key: number) {
    console.log("opening view modal");
    const letterId = this.state.letters[key].letterId;
    const fetchUrl = `/api/users/${this.props.user.publicAddress}/letters/${letterId}/content`;

    // let encryptedLetter = this.cacheService.get(letterId);
    let encryptedLetter = this.testCacheService.get(letterId); // DELETE
    if (encryptedLetter === null) {
      this.retrieveFromServer(fetchUrl, key);
    } else {
      // let file = this.cryptService.decrypt(encryptedLetter);
      let file = encryptedLetter; // DELETE
      console.log("file", file);
      if (file) {
        this.setState({
          file: file,
          viewIsOpen: true,
          selectedLetterKey: key,
          selectedLetterId: letterId,
        });
      }
    }
  }

  closeViewModal() {
    console.log("closing view modal");
    this.setState({ viewIsOpen: false });
  }

  retrieveFromServer(fetchUrl: string, key: number) {
    console.log("retrieving from server");
    const init: RequestInit = {
      method: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
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
        let file = this.cryptService.decrypt(encryptedLetter);
        this.setState({
          file: file,
          viewIsOpen: true,
          selectedLetterKey: key,
          selectedLetterId: letterId,
        });
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }

  getUserName() {
    return this.state.letters[this.state.selectedLetterKey]?.requestor.name;
  }

  render() {
    const { name } = this.props.user;
    const { letters, uploadIsOpen, viewIsOpen, selectedLetterId } = this.state;

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
            view
          </Button>

          <Button
            className="left-float-right-button"
            onClick={() => {
              this.openUploadModal(k);
            }}
          >
            upload
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
              {this.getUserName()} ({selectedLetterId})
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
              {this.getUserName()} ({selectedLetterId})
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FileView
              file={this.state.file}
              ref={this.viewModal}
              user={this.props.user}
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
