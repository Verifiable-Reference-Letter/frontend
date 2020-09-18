//import { BigNumber } from "bignumber.js";
// import { TutorialToken } from "./contract-types/TutorialToken"; // import is correct
import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import "./Requestor.css";
import User from "../../../interfaces/User.interface";
import Letter from "../../../interfaces/Letter.interface";
import SentLetter from "../../../interfaces/SentLetter.interface";

const Web3 = require("web3");
export let web3: typeof Web3;

// need to fix
// interface Dictionary<Letter> {
//   [key: number]: Letter;
// }

interface RequestorProps {
  user: User;
}

interface RequestorState {
  // need to change into dictionary
  letters: Letter[]; // letter table
  sentLetters: SentLetter[]; // letter-recipient table
  letterKey: number;
}

class Requestor extends React.Component<RequestorProps, RequestorState> {
  constructor(props: RequestorProps) {
    super(props);
    this.state = {
      letters: [],
      sentLetters: [],
      letterKey: -1,
    };
  }

  componentWillMount() {
    // api call to get letters
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
      ],
      sentLetters: [
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

  onViewClick(
    // event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    key: number
  ) {}

  render() {
    const { name, publicAddress } = this.props.user;
    const { letters, sentLetters, letterKey } = this.state;

    const lettersList = letters.map((l, key) => (
      <Row key={l.letter_id}>
        <div className="full-width">
          <span className="text-float-left">({l.letter_id})&nbsp;</span>
          <span className="text-float-left">From: {l.writer.name} </span>

          <Button
            style={{ marginLeft: "10px", float: "right" }}
            onClick={() => {}}
          >
            send
          </Button>
        </div>
      </Row>
    ));

    const sentLettersList = sentLetters.map((l, key) => (
      <Row key={l.letter_id + "x" + l.recipient.publicAddress}>
        <div className="full-width">
          <span className="text-float-left">({l.letter_id})&nbsp;</span>
          <span className="text-float-left">From: {l.writer.name}</span>

          <Button
            className="left-float-right-button"
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
        <div className="requestor">
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
            <Button
            className="left-float-right-button"
              onClick={() => {
              }}
            >
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
