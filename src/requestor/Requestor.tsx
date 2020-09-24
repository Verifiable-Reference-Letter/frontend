//import { BigNumber } from "bignumber.js";
// import { TutorialToken } from "./contract-types/TutorialToken"; // import is correct
import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";

import User from "../common/UserAuth.interface";
import Letter from "../common/LetterDetails.interface";
import FileView from "../components/FileView/FileView";

import "./Requestor.css";

interface RequestorProps {
  user: User;
}

interface RequestorState {
  letters: Letter[];
  letterKey: number;
  viewIsOpen: boolean;
  selectedLetterKey: number;
  selectedLetterId: number;
}

class Requestor extends React.Component<RequestorProps, RequestorState> {
  private viewModal = React.createRef<FileView>();

  componentWillMount() {
    // api call to get letters
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
      ],
    });
  }

  constructor(props: RequestorProps) {
    super(props);
    this.state = {
      letters: [],
      letterKey: -1,
      viewIsOpen: false,
      selectedLetterKey: -1,
      selectedLetterId: -1,
    };
  }

  closeViewModal() {
    console.log("closing view modal");
    this.setState({ viewIsOpen: false });
  }

  openViewModal(key: number) {
    console.log("opening view modal");

    this.setState({
      viewIsOpen: true,
      selectedLetterKey: key,
      selectedLetterId: this.state.letters[key].letterId,
    });
  }

  getUserName() {
    return this.state.letters[this.state.selectedLetterKey]?.requestor.name;
  }

  render() {
    const { name } = this.props.user;
    const { letters, viewIsOpen, selectedLetterId } = this.state;

    const lettersList = letters.map((l, k) => (
      <Row key={k}>
        <div className="full-width">
          <span className="text-float-left">({l.letterId})&nbsp;</span>
          <span className="text-float-left">From: {l.writer.name}</span>
          <Button
            className="left-float-right-button"
            onClick={() => {
              this.openViewModal(k);
            }}
          >
            view
          </Button>
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
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {this.getUserName()} ({selectedLetterId})
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <FileView
              ref={this.viewModal}
              user={this.props.user}
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

        <div className="requestor-footer">
          <p> Product of Team Gas</p>
        </div>
      </div>
    );
  }
}
export default Requestor;
