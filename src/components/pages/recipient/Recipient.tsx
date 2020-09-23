import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";

import User from "../../../interfaces/User.interface";
import Letter from "../../../interfaces/Letter.interface";
import LetterCategory from "../../../interfaces/LetterCategory.enum";

import FileView from "../../file-view/FileView";

import "./Recipient.css";

interface RecipientProps {
  user: User;
}
interface RecipientState {
  letters: Letter[];
  viewIsOpen: boolean;
  selectedLetterKey: number;
  selectedLetterId: number;
  selectedLetterCategory: LetterCategory;
}

class Recipient extends React.Component<RecipientProps, RecipientState> {
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
          contents: new File([], ""),
        },
      ],
    });
  }

  constructor(props: RecipientProps) {
    super(props);
    this.state = {
      letters: [],
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
    } else {
      console.log("error with letterCategory");
    }
  }

  getCorrectUserName() {
    if (this.state.selectedLetterCategory === LetterCategory.letters) {
      return this.state.letters[this.state.selectedLetterKey]?.requestor.name;
    } else {
      console.log("error with letterCategory");
      return;
    }
  }

  getCorrectLetter() {
    if (this.state.selectedLetterCategory === LetterCategory.letters) {
      return this.state.letters[this.state.selectedLetterKey];
    } else {
      console.log("error with letterCategory");
      return;
    }
  }

  render() {
    const { name } = this.props.user;
    const { letters, viewIsOpen, selectedLetterId } = this.state;

    const lettersList = letters.map((l, k) => (
      <Row key={k}>
        <div className="full-width">
          <span className="text-float-left">({l.letter_id})&nbsp;</span>
          <span className="text-float-left">For: {l.requestor.name}</span>
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

    return (
      <div className="recipient">
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

        <div className="recipient-header">
          <h1> Recipient Page </h1>
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

        <div className="recipient-footer">
          <p> Product of Team Gas</p>
        </div>
      </div>
    );
  }
}
export default Recipient;
