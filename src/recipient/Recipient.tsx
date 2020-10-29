import React from "react";
import { Spinner, Row, Col } from "react-bootstrap";

import UserAuth from "../common/UserAuth.interface";
import User from "../common/User.interface";
import LetterDetails from "../common/LetterDetails.interface";
import RequestBody from "../common/RequestBody.interface";
import ResponseBody from "../common/ResponseBody.interface";
import CacheService from "../services/CacheService";

import RecipientLetterDisplay from "../RecipientLetterDisplay/RecipientLetterDisplay";
import RecipientUserDisplay from "../RecipientUserDisplay/RecipientUserDisplay";

import "./Recipient.css";
import LetterHistory from "../common/LetterHistory.interface";

interface RecipientProps {
  user: UserAuth;
}

interface RecipientState {
  requestors: User[];
  letters: LetterHistory[];
  numRecipients: Number[];
  loadingRequestors: boolean;
  loadingLetters: boolean;
  dualMode: boolean;
  selectedUser?: User;
}

class Recipient extends React.Component<RecipientProps, RecipientState> {
  private cacheService: CacheService<string, LetterHistory[]>;
  constructor(props: RecipientProps) {
    super(props);
    this.state = {
      requestors: [],
      letters: [],
      numRecipients: [],
      loadingRequestors: true,
      loadingLetters: false,
      dualMode: false,
    };
    this.cacheService = new CacheService(1);
  }

  componentWillMount() {
    const requestorFetchUrl = `/api/v1/letters/receivedRequestors`;
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
    fetch(`${process.env.REACT_APP_BACKEND_URL}${requestorFetchUrl}`, init)
      .then((response) => {
        response
          .json()
          .then((body: ResponseBody) => {
            const data: User[] = body.data;
            console.log(data);
            console.log(response);
            if (data.length === 0) {
              this.setState({
                requestors: data,
                loadingRequestors: false,
              });
            } else {
              this.setState({loadingRequestors: false});
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

  async toggleLetterModal(user: User) {
    const selectedUser = this.state.selectedUser;
    if (selectedUser && selectedUser.publicAddress === user.publicAddress) {
      this.setState({ selectedUser: undefined, dualMode: false });
    } else {
      this.setState({ selectedUser: user, dualMode: true, loadingLetters: true });
      this.loadLettersList(user.publicAddress);
    }
  }

  async loadLettersList(publicAddress: string) {
    const letterFetchUrl = `/api/v1/letters/received/${publicAddress}`;
    const lettersList = await this.cacheService.get(publicAddress);

    if (!lettersList) {
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
                this.cacheService.put(publicAddress, data);
                this.setState({
                  letters: data,
                  loadingLetters: false,
                  dualMode: true,
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
    } else {
      this.setState({ letters: lettersList, loadingLetters: false,  dualMode: true });
    }
  }

  render() {
    const { user } = this.props;
    const {
      requestors,
      letters,
      numRecipients,
      loadingRequestors,
      loadingLetters,
      dualMode,
      selectedUser,
    } = this.state;

    const requestorList = requestors.map((r, k) => (
      <RecipientUserDisplay
        user={user}
        requestor={r}
        selected={r.publicAddress === selectedUser?.publicAddress}
        onView={this.toggleLetterModal.bind(this)}
      />
    ));

    const lettersList = letters.map((l, k) => (
      <RecipientLetterDisplay
        user={user}
        letter={l}
        numRecipients={numRecipients[k]}
      />
    ));

    const recipientRequestors = (
      <div className="recipient-letters">
        <div className="recipient-header mb-3">
          <h3> Users </h3>
        </div>

        <div className="recipient-letterdisplay">
          <div>{requestorList}</div>
        </div>
      </div>
    );

    const recipientLetters = (
      <div className="recipient-letters">
        <div className="recipient-header mb-3">
          <h3> {selectedUser?.name} </h3>
        </div>

        <div className="recipient-letterdisplay">
          <div>{lettersList}</div>
        </div>
      </div>
    );

    const recipientFooter = (
      <div className="recipient-footer">
        <span> Product of Team Gas</span>
      </div>
    );

    return (
      <>
        {!loadingRequestors && !dualMode && (
          <Col className="recipient">
            <Row>{recipientRequestors}</Row>
            {/* <Row>{requestorFooter}</Row> */}
          </Col>
        )}

        {!loadingRequestors && dualMode && (
          <Col>
            <Row className="recipient-dual">
              <Col className="ml-5 mr-5">
                <Row>{recipientRequestors}</Row>
              </Col>
              <Col className="mr-5 ml-5">
                {!loadingLetters && <Row>{recipientLetters}</Row>}
                {loadingLetters && (
                  <Row>
                    <div className="d-flex justify-content-center absolute-center">
                      <Spinner
                        className=""
                        animation="border"
                        variant="secondary"
                      />
                    </div>
                  </Row>
                )}
              </Col>
            </Row>
            {/* <Row>{requestorFooter}</Row> */}
          </Col>
        )}

        {loadingRequestors && (
          <div className="d-flex justify-content-center absolute-center">
            <Spinner className="" animation="border" variant="secondary" />
          </div>
        )}
      </>
    );
  }
}
export default Recipient;
