//import { BigNumber } from "bignumber.js";
// import { TutorialToken } from "./contract-types/TutorialToken"; // import is correct
import React from "react";
import Modal from "react-modal";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
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
  modalIsOpen: boolean;
  letterKey: number;
}

class Writer extends React.Component<WriterProps, WriterState> {
  componentWillMount() {
    // api call to get letters
    Modal.setAppElement("body");
    this.setState({
      letters: [
        {
          letter_id: 1,
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323",
          },
          requester: {
            name: "Simba",
            publicAddress: "0xabcdefghijklmnop",
          },
          letter_uploaded: false,
        },
        {
          letter_id: 2,
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323",
          },
          requester: {
            name: "Curious George",
            publicAddress: "0x142857142857142857",
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
          },
          requester: {
            name: "Simba",
            publicAddress: "0xabcdefghijklmnop",
          },
          recipient: {
            name: "Elton John",
            publicAddress: "0x101100101001101110100",
          },
        },
        {
          letter_id: 2,
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323",
          },
          requester: {
            name: "Simba",
            publicAddress: "0xabcdefghijklmnop",
          },
          recipient: {
            name: "Curious George",
            publicAddress: "0x142857142857142857",
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
      modalIsOpen: false,
      letterKey: -1,
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
  ) {}

  openUploadModal(key: number) {
    this.setState({ modalIsOpen: true, letterKey: key });
  }

  closeUploadModal() {
    this.setState({ modalIsOpen: false });
  }

  onUploadSubmit(file: FormData) {
    this.closeUploadModal();
    console.log(this.state.letterKey);
    console.log(file);
    // send letter to backend
  }

  // letterView() {
  //   if (this.state.letters.) {
  //     return <UserGreeting />;
  //   }
  //   return <GuestGreeting />;
  // }

  render() {
    const { name, publicAddress } = this.props.user;
    const { letters, sentLetters, modalIsOpen, letterKey } = this.state;

    const lettersList = letters.map((l, key) => (
      <Row key={l.letter_id}>
        <div className="full-width">
          <span className="text-float-left">({l.letter_id})&nbsp;</span>
          <span className="text-float-left">For: {l.requester.name}</span>
          <Button
            className="left-float-right-button"
            // style={{ marginLeft: "10px", float: "right" }}
            onClick={() => {
              this.onViewClick(l.letter_id);
            }}
          >
            view
          </Button>

          <Button
            className="left-float-right-button"
            // style={{ marginLeft: "10px", float: "right" }}
            onClick={() => {
              this.onUploadClick(l.letter_id);
            }}
          >
            upload
          </Button>
        </div>
      </Row>
    ));

    const sentLettersList = sentLetters.map((l, key) => (
      <Row key={l.letter_id + "x" + l.recipient.publicAddress}>
        <div className="full-width">
          <span className="text-float-left">({l.letter_id})&nbsp;</span>
          <span className="text-float-left">For: {l.requester.name}</span>

          <Button
            className="left-float-right-button"
            // style={{ marginLeft: "10px", float: "right" }}
            onClick={() => {
              this.onViewClick(l.letter_id);
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
        <div className="writer-header">
          <h1> Writer Page </h1>
          <p>
            <em>{name}</em>
          </p>
          <hr></hr>
        </div>

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={this.closeUploadModal.bind(this)}
          contentLabel="Upload Modal"
        >
          <FileUpload callback={this.onUploadSubmit.bind(this)}></FileUpload>
        </Modal>

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
