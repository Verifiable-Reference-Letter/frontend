//import { BigNumber } from "bignumber.js";
// import { TutorialToken } from "./contract-types/TutorialToken"; // import is correct
import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import User from "../../../interfaces/User.interface";
import Letter from "../../../interfaces/Letter.interface";
import "./Recipient.css";

const Web3 = require("web3");
export let web3: typeof Web3;

interface RecipientProps {
  user: User;
}
interface RecipientState {
  letters: Letter[];
}

class Recipient extends React.Component<RecipientProps, RecipientState> {
  componentWillMount() {
    // api call to get letters
    this.setState({
      letters: [
        {
          letter_id: 1,
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323"
          },
          requester: {
            name: "Simba",
            publicAddress: "0xabcdefghijklmnop"
          },
          letter_uploaded: false
        },
        {
          letter_id: 2,
          writer: {
            name: "Mary Poppins",
            publicAddress: "0x314159265358979323"
          },
          requester: {
            name: "Simba",
            publicAddress: "0xabcdefghijklmnop"
          },
          letter_uploaded: false
        }
      ]
    });
  }

  constructor(props: RecipientProps) {
    super(props);
    this.state = {
      letters: []
    };
  }

  render() {
    const { name, publicAddress } = this.props.user;
    const { letters } = this.state;

    const lettersList = letters.map((l, key) => (
      <Row key={l.letter_id}>
        <div className="full-width">
          <span className="text-float-left">({l.letter_id})&nbsp;</span>
          <span className="text-float-left">For: {l.requester.name}</span>
          <Button
            className="left-float-right-button"
            // style={{ marginLeft: "10px", float: "right" }}
            onClick={() => {
            }}
          >
            view
          </Button>
        </div>
      </Row>
    ));

    return (
      <div className="recipient">
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
