import React from "react";
import { Spinner } from "react-bootstrap";

import UserAuth from "../common/UserAuth.interface";
import LetterDetails from "../common/LetterDetails.interface";
import RequestBody from "../common/RequestBody.interface";
import ResponseBody from "../common/ResponseBody.interface";

import WriterLetterDisplay from "../WriterLetterDisplay/WriterLetterDisplay";

import "./Writer.css";

interface WriterProps {
  user: UserAuth;
}

interface WriterState {
  letters: LetterDetails[];
  numRecipients: Number[];
  numUnsentRecipients: Number[];
  loadingLetters: boolean;
}

class Writer extends React.Component<WriterProps, WriterState> {
  constructor(props: WriterProps) {
    super(props);
    this.state = {
      letters: [],
      numRecipients: [],
      numUnsentRecipients: [],
      loadingLetters: true,
    };
  }

  componentWillMount() {
    // api call to get letters
    this.loadLetterList();
  }

  async loadLetterList() {
    const letterFetchUrl = `/api/v1/letters/written`;
    const init: RequestInit = {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth: {
          jwtToken: this.props.user.jwtToken,
          publicAddress: this.props.user.publicAddress,
        },
        data: {},
      }),
    };
    // get letters from server
    fetch(`${process.env.REACT_APP_BACKEND_URL}${letterFetchUrl}`, init)
      .then((response) => {
        response
          .json()
          .then((body: ResponseBody) => {
            const data: { letters: LetterDetails[], numRecipients: Number[], numUnsentRecipients: Number[] } =
              body.data;

            console.log(response);
            if (data && data.letters && data.numRecipients) {
              this.setState({
                letters: data.letters,
                numRecipients: data.numRecipients,
                numUnsentRecipients: data.numUnsentRecipients,
                loadingLetters: false,
              });
            } else {
              this.setState({loadingLetters: false});
            }
          })
          .catch((e: Error) => {
            console.log(e);
          });
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }

  render() {
    const { user } = this.props;
    const { letters, numRecipients, numUnsentRecipients, loadingLetters } = this.state;

    const lettersList = letters.map((l, k) => (
      <WriterLetterDisplay
        user={user}
        letter={l}
        numRecipients={numRecipients[k]}
        numUnsentRecipients={numUnsentRecipients[k]}
        onReload={this.loadLetterList.bind(this)}
      />
    ));

    return (
      <>
        {!loadingLetters && (
          <div id="writer" className="writer">
            <div className="writer-header mb-3">
              <h3> Letters </h3>
            </div>

            <div className="writer-letters">
              <div>{lettersList}</div>
            </div>

            <div className="writer-footer">
              <span> Product of Team Gas</span>
            </div>
          </div>
        )}

        {loadingLetters && (
          <div className="d-flex justify-content-center absolute-center">
            <Spinner className="" animation="border" variant="secondary" />
          </div>
        )}
      </>
    );
  }
}
export default Writer;
