//import { BigNumber } from "bignumber.js";
// import { TutorialToken } from "./contract-types/TutorialToken"; // import is correct
import React from "react";
// import Modal from "react-modal";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Modal from "react-bootstrap/Modal";
import Container from "react-bootstrap/Container";
import "./Writer.css";
import User from "../../../interfaces/User.interface";
import Letter from "../../../interfaces/Letter.interface";
import SentLetter from "../../../interfaces/SentLetter.interface";
import FileUpload from "../../file-upload/FileUpload";
import FileView from "../../file-view/FileView";

const Web3 = require("web3");
export let web3: typeof Web3;

enum LetterCategory {
  letters,
  sentLetters,
  invalid,
}

interface WriterProps {
  user: User;
}

interface WriterState {
  // need to change into dictionary
  letters: Letter[]; // letter table
  sentLetters: SentLetter[]; // letter-recipient table
  uploadIsOpen: boolean;
  viewIsOpen: boolean;
  selectedLetterKey: number;
  selectedLetterId: number;
  selectedLetterCategory: LetterCategory;
}

class Writer extends React.Component<WriterProps, WriterState> {
  private uploadModal = React.createRef<FileUpload>();
  private viewModal = React.createRef<FileView>();

  componentWillMount() {
    // Modal.setAppElement("body");
    // api call to get letters
    console.log("componentWillMount");
    this.setState({
      letters: [
        {
          letter_id: 1,
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323",
            email: "",
            jwtToken: "",
          },
          requestor: {
            name: "Simba",
            publicAddress: "0xabcdefghijklmnop",
            email: "",
            jwtToken: "",
          },
          contents: new File([], ""),
        },
        {
          letter_id: 2,
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323",
            email: "",
            jwtToken: "",
          },
          requestor: {
            name: "Curious George",
            publicAddress: "0x142857142857142857",
            email: "",
            jwtToken: "",
          },
          contents: new File([], ""),
        },
      ],
      sentLetters: [
        {
          letter_id: 2,
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323",
            email: "",
            jwtToken: "",
          },
          requestor: {
            name: "Simba",
            publicAddress: "0xabcdefghijklmnop",
            email: "",
            jwtToken: "",
          },
          recipient: {
            name: "Elton John",
            publicAddress: "0x101100101001101110100",
            email: "",
            jwtToken: "",
          },
          contents: new File([], ""),
        },
        {
          letter_id: 2,
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323",
            email: "",
            jwtToken: "",
          },
          requestor: {
            name: "Simba",
            publicAddress: "0xabcdefghijklmnop",
            email: "",
            jwtToken: "",
          },
          recipient: {
            name: "Curious George",
            publicAddress: "0x142857142857142857",
            email: "",
            jwtToken: "",
          },
          contents: new File([], ""),
        },
      ],
    });
  }

  constructor(props: WriterProps) {
    super(props);
    this.state = {
      letters: [],
      sentLetters: [],
      viewIsOpen: false,
      uploadIsOpen: false,
      selectedLetterKey: -1,
      selectedLetterId: -1,
      selectedLetterCategory: LetterCategory.invalid,
    };
  }

  openUploadModal(key: number, cat: LetterCategory) {
    console.log("opening upload modal");
    console.log(cat, key);
    if (cat === LetterCategory.letters) {
      this.setState({
        uploadIsOpen: true,
        selectedLetterKey: key,
        selectedLetterId: this.state.letters[key].letter_id,
        selectedLetterCategory: cat,
      });
    } else if (cat === LetterCategory.sentLetters) {
      this.setState({
        uploadIsOpen: true,
        selectedLetterKey: key,
        selectedLetterId: this.state.sentLetters[key].letter_id,
        selectedLetterCategory: cat,
      });
    }
  }

  closeUploadModal() {
    console.log("closing upload modal");
    this.setState({ uploadIsOpen: false });
  }

  onUploadSubmit(file: File) {
    console.log(file);
    console.log("onUploadSubmit");
    // TODO: do stuff with file
    // TODO: send File to backend
    // REMOVE: here testing purposes, should be a query in uploadToServer following a successful request
    let newLetters = [...this.state.letters];
    newLetters[this.state.selectedLetterKey].contents = file;
    let newSentLetters = [...this.state.sentLetters];
    for (let i = 0; i < newSentLetters.length; i++) {
      if (newSentLetters[i].letter_id === this.state.selectedLetterId) {
        newSentLetters[i].contents = file;
      }
    }
    // END REMOVE

    console.log("newLetters");
    console.log(newLetters);

    this.setState({
      letters: newLetters,
      sentLetters: newSentLetters,
    });

    console.log("setting state");
    setTimeout(() => {
      console.log(this.state.letters);
    }, 2000);

    let fetchUrl =
      "/api/users/" +
      this.props.user.publicAddress +
      "/letters/" +
      this.state.selectedLetterId +
      "/content";
    this.uploadToServer(file, fetchUrl);
  }

  uploadToServer(file: File, fetchUrl: string) {
    let fileForm: FormData = new FormData();
    fileForm.append("file", file);

    fetch(`${process.env.REACT_APP_BACKEND_URL}` + fetchUrl, {
      body: fileForm,
      headers: {
        "Content-Type": "mutlipart/form-data",
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
        }
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }

  openViewModal(key: number, cat: LetterCategory) {
    console.log("opening view modal");
    console.log(cat, key);
    if (cat === LetterCategory.letters) {
      this.setState({
        viewIsOpen: true,
        selectedLetterKey: key,
        selectedLetterId: this.state.letters[key].letter_id,
        selectedLetterCategory: cat,
      });
    } else if (cat === LetterCategory.sentLetters) {
      this.setState({
        viewIsOpen: true,
        selectedLetterKey: key,
        selectedLetterId: this.state.sentLetters[key].letter_id,
        selectedLetterCategory: cat,
      });
    }
  }

  closeViewModal() {
    console.log("closing view modal");
    this.setState({ viewIsOpen: false });
  }

  getCorrectUserName() {
    if (this.state.selectedLetterCategory === LetterCategory.letters) {
      return this.state.letters[this.state.selectedLetterKey]?.requestor.name;
    } else if (
      this.state.selectedLetterCategory === LetterCategory.sentLetters
    ) {
      return this.state.sentLetters[this.state.selectedLetterKey]?.requestor
        .name;
    }
    return "";
  }

  getCorrectLetter() {
    if (this.state.selectedLetterCategory === LetterCategory.letters) {
      return this.state.letters[this.state.selectedLetterKey];
    } else {
      return this.state.sentLetters[this.state.selectedLetterKey];
    }
  }

  render() {
    const { name } = this.props.user;
    const {
      letters,
      sentLetters,
      uploadIsOpen,
      viewIsOpen,
      selectedLetterId,
    } = this.state;

    const lettersList = letters.map((l, k) => (
      <Row key={k}>
        <div className="full-width">
          <span className="text-float-left">({l.letter_id})&nbsp;</span>
          <span className="text-float-left">For: {l.requestor.name}</span>
          {l.contents && (
            <Button
              className="left-float-right-button"
              onClick={() => {
                this.openViewModal(k, LetterCategory.letters);
              }}
            >
              view
            </Button>
          )}
          <Button
            className="left-float-right-button"
            onClick={() => {
              this.openUploadModal(k, LetterCategory.letters);
            }}
          >
            upload
          </Button>
        </div>
      </Row>
    ));

    const sentLettersList = sentLetters.map((l, k) => (
      <Row key={k}>
        <div className="full-width">
          <span className="text-float-left">({l.letter_id})&nbsp;</span>
          <span className="text-float-left">For: {l.requestor.name}</span>

          <Button
            className="left-float-right-button"
            onClick={() => {
              this.openViewModal(k, LetterCategory.sentLetters);
            }}
          >
            view
          </Button>
          <span className="text-float-right">To: {l.recipient.name}</span>
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
              {this.getCorrectUserName()} ({selectedLetterId})
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FileUpload
              ref={this.uploadModal}
              user={this.props.user}
              /*fetchUrl={
                "/api/users/" +
                publicAddress +
                "/letters/" +
                selectedLetterId +
                "/content"
              }*/
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
          // size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {this.getCorrectUserName()} ({selectedLetterId})
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FileView
              ref={this.viewModal}
              user={this.props.user}
              letter={this.getCorrectLetter()}
              /*fetchUrl={
                "/api/users/" +
                publicAddress +
                "/letters/" +
                selectedLetterId +
                "/content"
              }*/
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

        {/* <Modal
          isOpen={uploadIsOpen}
          onRequestClose={this.closeUploadModal.bind(this)}
          contentLabel="Upload Modal"
        >
          <FileUpload
            user={this.props.user} callback={this.onUploadSubmit.bind(this)}
          ></FileUpload>
        </Modal> */}

        <div className="letters">
          <h3> Letters </h3>
          <Container fluid>{lettersList}</Container>
          <hr></hr>
        </div>

        <div className="sentLetters">
          <h3> History </h3>
          <Container fluid>{sentLettersList}</Container>
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
