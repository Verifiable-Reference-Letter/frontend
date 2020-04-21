//import { BigNumber } from "bignumber.js";
// import { TutorialToken } from "./contract-types/TutorialToken"; // import is correct
import React from 'react';
import './Requestor.css';
import User from "../../interfaces/User.interface";
import Letter from "../../interfaces/Letter.interface";
import SentLetter from "../../interfaces/SentLetter.interface";


const Web3 = require("web3");
export let web3: typeof Web3;

// need to fix
// interface Dictionary<Letter> {
//   [key: number]: Letter;
// }

interface RequestorState {
  // need to change into dictionary
  letters: Letter[]; // letter table
  sentLetters: SentLetter[]; // letter-recipient table
  letterKey: number;
}


class Requestor extends React.Component<User, RequestorState> {
  constructor(props: User) {
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
            user_id: 101,
            name: "Mary Poppins",
            public_key: "0x314159265358979323",
          },
          requester: {
            user_id: 102,
            name: "Simba",
            public_key: "0xabcdefghijklmnop",
          },
          letter_uploaded: false,
        },
      ],
      sentLetters: [
        {
          letter_id: 2,
          writer: {
            user_id: 1,
            name: "Mary Poppins",
            public_key: "0x314159265358979323",
          },
          requester: {
            user_id: 103,
            name: "Curious George",
            public_key: "0x142857142857142857",
          },
          recipient: {
            user_id: 104,
            name: "Elton John",
            public_key: "0x101100101001101110100",
          },
        },
        {
          letter_id: 2,
          writer: {
            user_id: 1,
            name: "Mary Poppins",
            public_key: "0x314159265358979323",
          },
          requester: {
            user_id: 102,
            name: "Simba",
            public_key: "0xabcdefghijklmnop",
          },
          recipient: {
            user_id: 103,
            name: "Curious George",
            public_key: "0x142857142857142857",
          },
        },
      ],
    });
  }

  onViewClick(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    key: number
  ) {}

  render() {
    const { name, public_key, user_id } = this.props;
    const { letters, sentLetters, letterKey } = this.state;

    const lettersList = letters.map((l, key) => (
      <div key={l.letter_id}>
        <p>
          <span>({l.letter_id})&nbsp;</span>
          <span>From: {l.writer.name} </span>

          <button
            style={{ marginLeft: "10px", float: "right" }}
            onClick={(e) => {
              //this.onUploadClick(e, l.letter_id);
            }}
          >
            send
          </button>

        </p>
      </div>
    ));

    const sentLettersList = sentLetters.map((l, key) => (
      <div key={l.letter_id + "x" + l.recipient.user_id}>
        <p>
          <span>({l.letter_id})&nbsp;</span>
          <span>From: {l.writer.name}</span>

          <button
            style={{ marginLeft: "10px", float: "right" }}
            onClick={(e) => {
              this.onViewClick(e, l.letter_id);
            }}
          >
            view
          </button>
          <span style={{ float: "right" }}>To: {l.recipient.name}</span>
        </p>
      </div>
    ));

    return (
    	<div className="requestor-wrap">
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
          <button
              style={{ marginLeft: "10px", float: "right" }}
              onClick={(e) => {
                //this.onViewClick(e, l.letter_id);
              }}
            >
              request
          </button>
          <hr></hr>
        </div>

        <div className="letters">
          <h3> Received Letters </h3>
          <div>{lettersList}</div>
          <hr></hr>
        </div>

        <div className="letters">
          <h3> Pending Letters </h3>
          <div></div>
          <hr></hr>
        </div>

        <div className="sentLetters">
          <h3> History </h3>
          <div>{sentLettersList}</div>
          <hr></hr>
        </div>

        <div className="requestor-footer">
          <p> Product of Team Gas</p>
        </div>
      </div>
	  	</div>
    );
  }
}
export default Requestor;