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

const Web3 = require("web3");
export let web3: typeof Web3;

// need to fix
interface Dictionary<Letter> {
  [key: number]: Letter;
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
  uploadInitialDisplayMessage?: string;
  selectedLetterKey: number;
  selectedLetterId: number;
}

class Writer extends React.Component<WriterProps, WriterState> {
  private uploadModal = React.createRef<FileUpload>();

  componentWillMount() {
    // Modal.setAppElement("body");
    // api call to get letters
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
          requester: {
            name: "Simba",
            publicAddress: "0xabcdefghijklmnop",
            email: "",
            jwtToken: "",
          },
          letter_uploaded: false,
        },
        {
          letter_id: 2,
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323",
            email: "",
            jwtToken: "",
          },
          requester: {
            name: "Curious George",
            publicAddress: "0x142857142857142857",
            email: "",
            jwtToken: "",
          },
          letter_uploaded: false,
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
          requester: {
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
        },
        {
          letter_id: 2,
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323",
            email: "",
            jwtToken: "",
          },
          requester: {
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
    };
  }

  onUploadClick(
    // event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    key: number
  ) {
    this.openUploadModal(key);
  }

  onViewClick(
    // event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    key: number
  ) {
    this.openViewModal(key);
  }

  openUploadModal(key: number) {
    console.log("opening upload modal");
    console.log(key);
    this.setState({
      uploadIsOpen: true,
      selectedLetterKey: key,
      selectedLetterId: this.state.letters[key].letter_id,
    });
  }

  closeUploadModal() {
    console.log("closing modal");
    this.setState({ uploadIsOpen: false });
  }

  onUploadSubmit(file: File) {
    console.log(file);
    // TODO: do stuff with file
    // TODO: send File to backend
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
          this.uploadModal.current!.changeDisplayMessage("Upload Failed. Try Again Later.")
        }
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }

  openViewModal(key: number) {
    console.log("opening view modal");
    console.log(key);
    this.setState({
      viewIsOpen: true,
      selectedLetterKey: key,
      selectedLetterId: this.state.letters[key].letter_id,
    });
  }

  render() {
    const { publicAddress, name, email, jwtToken } = this.props.user;
    const {
      letters,
      sentLetters,
      uploadIsOpen,
      selectedLetterKey,
      selectedLetterId,
    } = this.state;

    const lettersList = letters.map((l, k) => (
      <Row key={k}>
        <div className="full-width">
          <span className="text-float-left">({l.letter_id})&nbsp;</span>
          <span className="text-float-left">For: {l.requester.name}</span>
          <Button
            className="left-float-right-button"
            onClick={() => {
              this.onViewClick(k);
            }}
          >
            view
          </Button>

          <Button
            className="left-float-right-button"
            onClick={() => {
              this.onUploadClick(k);
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
          <span className="text-float-left">For: {l.requester.name}</span>

          <Button
            className="left-float-right-button"
            onClick={() => {
              this.onViewClick(k);
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
          show={uploadIsOpen}
          onHide={this.closeUploadModal.bind(this)}
          backdrop="static"
          animation={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Upload File</Modal.Title>
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
