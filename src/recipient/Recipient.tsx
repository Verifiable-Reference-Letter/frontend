import React from "react";
import { Spinner } from "react-bootstrap";

import UserAuth from "../common/UserAuth.interface";
import LetterDetails from "../common/LetterDetails.interface";
import RequestBody from "../common/RequestBody.interface";
import ResponseBody from "../common/ResponseBody.interface";

import RecipientLetterDisplay from "../RecipientLetterDisplay/RecipientLetterDisplay";

import "./Recipient.css";
import LetterHistory from "../common/LetterHistory.interface";

interface RecipientProps {
  user: UserAuth;
}

interface RecipientState {
  letters: LetterHistory[];
  numRecipients: Number[];
  loadingLetters: boolean;
}

class Recipient extends React.Component<RecipientProps, RecipientState> {
  constructor(props: RecipientProps) {
    super(props);
    this.state = {
      letters: [],
      numRecipients: [],
      loadingLetters: true,
    };
  }

  componentWillMount() {
    // api call to get letters
    const letterFetchUrl = `/api/v1/letters/received`;
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
            const data: LetterHistory[] = body.data;

            console.log(response);
            if (data) {
              this.setState({
                letters: data,
                loadingLetters: false,
              });
            } else {
              console.log("problem with response data for recipient");
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
    const { letters, numRecipients, loadingLetters } = this.state;

    const lettersList = letters.map((l, k) => (
      <RecipientLetterDisplay
        user={user}
        letter={l}
        numRecipients={numRecipients[k]}
      />
    ));

    return (
      <>
        {!loadingLetters && (
          <div id="recipient" className="recipient">
            <div className="recipient-header mb-3">
              <h3> Letters </h3>
            </div>

            <div className="recipient-letters">
              <div>{lettersList}</div>
            </div>

            <div className="recipient-footer">
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
export default Recipient;
