//import { BigNumber } from "bignumber.js";
// import { TutorialToken } from "./contract-types/TutorialToken"; // import is correct
import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";

import User from "../../../interfaces/User.interface";
import Letter from "../../../interfaces/Letter.interface";
import SentLetter from "../../../interfaces/SentLetter.interface";
import LetterCategory from "../../../interfaces/LetterCategory.enum";

import FileView from "../../file-view/FileView";

import "./Requestor.css";

interface RequestorProps {
  user: User;
}

interface RequestorState {
  // need to change into dictionary
  letters: Letter[]; // letter table
  sentLetters: SentLetter[]; // letter-recipient table
  letterKey: number;
  viewIsOpen: boolean;
  selectedLetterKey: number;
  selectedLetterId: number;
  selectedLetterCategory: LetterCategory;
}

class Requestor extends React.Component<RequestorProps, RequestorState> {

  private viewModal = React.createRef<FileView>();

  componentWillMount() {
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
          requestor: {
            name: "Simba",
            publicAddress: "0xabcdefghijklmnop",
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
            name: "Curious George",
            publicAddress: "0x142857142857142857",
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

  constructor(props: RequestorProps) {
    super(props);
    this.state = {
      letters: [],
      sentLetters: [],
      letterKey: -1,
      viewIsOpen: false,
      selectedLetterKey: -1,
      selectedLetterId: -1,
      selectedLetterCategory: LetterCategory.invalid,
    };
  }

  closeViewModal() {
    console.log("closing view modal");
    this.setState({ viewIsOpen: false });
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
    const { letters, sentLetters, viewIsOpen, selectedLetterId } = this.state;

    const lettersList = letters.map((l, k) => (
      <Row key={k}>
        <div className="full-width">
          <span className="text-float-left">({l.letter_id})&nbsp;</span>
          <span className="text-float-left">From: {l.writer.name}</span>
          <Button
            disabled={l.contents.size === 0}
            className="left-float-right-button"
            onClick={() => {
              this.openViewModal(k, LetterCategory.letters);
            }}
          >
            view
          </Button>
        </div>
      </Row>
    ));

    const sentLettersList = sentLetters.map((l, k) => (
      <Row key={k}>
        <div className="full-width">
          <span className="text-float-left">({l.letter_id})&nbsp;</span>
          <span className="text-float-left">From: {l.writer.name}</span>

          <Button
            disabled={l.contents.size === 0}
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
      <div className="requestor">
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

        <div className="requestor-header">
          <h1> Requestor Page </h1>
          <p>
            <em>{name}</em>
          </p>
          <hr></hr>
        </div>

        <div>
          <h3> Request </h3>
          <input placeholder="Writer Id" />
          <Button className="left-float-right-button" onClick={() => {}}>
            request
          </Button>
          <hr></hr>
        </div>

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

        <div className="requestor-footer">
          <p> Product of Team Gas</p>
        </div>
      </div>
    );
  }
}
export default Requestor;
