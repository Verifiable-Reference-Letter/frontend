import React from "react";
import {
  Button,
  Row,
  Col,
  Spinner,
  Card,
  Collapse,
  Form,
} from "react-bootstrap";
import UserAuth from "../../common/UserAuth.interface";
import UserKey from "../../common/UserKey.interface";
import FileData from "../../common/FileData.interface";
import Letter from "../../common/LetterDetails.interface";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import CryptService from "../../services/CryptService";

import "./Send.css";

interface SendProps {
  user: UserAuth;
  letter: Letter;
  unsentRecipientKeys: UserKey[];
  onClose: () => void;
}
interface SendState {
  loadingContents: boolean;
  sending: boolean;
  encrypted: boolean[];
  encryptedLetter?: FileData;
}

class Send extends React.Component<SendProps, SendState> {
  private cryptService: CryptService;
  constructor(props: SendProps) {
    super(props);

    let e = [];
    const keys = this.props.unsentRecipientKeys;
    if (keys) {
      for (let i = 0; i < keys.length; i++) {
        e.push(false);
      }
    }
    console.log(e);
    console.log(keys);

    this.state = {
      loadingContents: true,
      sending: false,
      encrypted: e,
    };
    this.cryptService = new CryptService();
  }

  async componentDidMount() {
    let fetchUrl = `/api/v1/letters/${this.props.letter.letterId}/contents/writer`;
    let url = await this.getLetterContents(
      this.props.letter.letterId,
      fetchUrl
    );
  }

  async encryptAndUpload(key: number, userKey: UserKey) {
    console.log("Pub key is: " + userKey.publicKey);
    console.log("State url: " + this.state.encryptedLetter);

    if (!this.state.encryptedLetter) return;
    let encryptedLetter = await this.cryptService.encryptSend(
      this.state.encryptedLetter,
      userKey.publicKey
    );
    console.log("Encrypted letter: " + encryptedLetter);

    let signedLetter = await this.cryptService.signLetter(
      encryptedLetter,
      this.props.user.publicAddress
    );
    console.log("Signed letter: " + signedLetter);

    const encryptedLetterForm: {
      letterContents: string;
      letterSignature: string;
      letterRecipient: string;
    } = {
      letterContents: encryptedLetter,
      letterSignature: signedLetter,
      letterRecipient: userKey.publicAddress,
    };

    this.setState({ sending: true });

    const fetchUrl = `/api/v1/letters/${this.props.letter.letterId}/recipientContents/update`;
    const success = await this.uploadEncryptedLetterForm(
      fetchUrl,
      encryptedLetterForm
    );
    // const success = true;
    if (success) {
      let encrypted = [...this.state.encrypted];
      encrypted[key] = true;
      this.setState({ encrypted: encrypted, sending: false });
    }
  }

  async uploadEncryptedLetterForm(
    fetchUrl: string,
    encryptedLetterForm: {
      letterContents: string;
      letterSignature: string;
    }
  ) {
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
        data: encryptedLetterForm,
      }),
    };

    try {
      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}${fetchUrl}`,
        init
      );
      if (response.status === 400) {
        console.log(response.status);
        return false;
      } else {
        // let body = await response.json();
        return true;
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async getLetterContents(id: string, fetchUrl: string) {
    console.log("Letter Id: " + id);
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
    const letterId = id;
    // get letter from server
    fetch(`${process.env.REACT_APP_BACKEND_URL}${fetchUrl}`, init)
      .then((response) => {
        return response.json();
      })
      .then((body) => {
        const encryptedLetter: string = body.data;
        if (encryptedLetter) {
          //return encryptedLetter;
          this.cryptService
            .decrypt(encryptedLetter, this.props.user.publicAddress)
            .then((fileData) => {
              if (fileData) {
                this.setState({
                  encryptedLetter: fileData,
                  loadingContents: false,
                });
              }
            });
        } else {
          console.log("Letter retrieval in send failed");
        }
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }

  render() {
    const { user, letter, unsentRecipientKeys } = this.props;
    const { loadingContents, sending, encrypted } = this.state;

    let recipientList = [];
    if (unsentRecipientKeys) {
      for (let i = 0; i < unsentRecipientKeys.length; i += 2) {
        recipientList.push(
          <Row>
            <Col>
              <Card className="full-width opacity-0 mt-3">
                <div className="d-flex justify-content-between">
                  <Card.Header
                    className="flex-fill send-entry"
                    onClick={() => {
                      if (!encrypted[i]) {
                        this.encryptAndUpload(i, unsentRecipientKeys[i]);
                      }
                    }}
                  >
                    {unsentRecipientKeys[i].name}
                  </Card.Header>

                  {encrypted[i] && (
                    <FontAwesomeIcon
                      icon={faCheckSquare}
                      size="lg"
                      className="send-check-square"
                    />
                  )}
                  {!encrypted[i] && !sending && (
                    <div className="send-check-square-placeholder"></div>
                  )}
                </div>
              </Card>
            </Col>
            {i + 1 < unsentRecipientKeys.length && (
              <Col>
                <Card className="full-width opacity-0 mt-3">
                  <div className="d-flex justify-content-between">
                    <Card.Header
                      className="flex-fill send-entry"
                      onClick={() => {
                        if (!encrypted[i + 1]) {
                          this.encryptAndUpload(
                            i + 1,
                            unsentRecipientKeys[i + 1]
                          );
                        }
                      }}
                    >
                      {unsentRecipientKeys[i + 1].name}
                    </Card.Header>
                    {encrypted[i + 1] && (
                      <FontAwesomeIcon
                        icon={faCheckSquare}
                        size="lg"
                        className="send-check-square"
                      />
                    )}
                    {!encrypted[i + 1] && (
                      <div className="send-check-square-placeholder"></div>
                    )}
                  </div>
                </Card>
              </Col>
            )}

            {i + 1 >= unsentRecipientKeys.length && (
              <Col>
                <Card className="full-width opacity-0 mt-3">
                  <div className="send-placeholder"></div>
                </Card>
              </Col>
            )}
          </Row>
        );
      }
    }

    return (
      <>
        {!loadingContents && (
          <Col>
            {unsentRecipientKeys && (
              <Row>
                <Col>{recipientList}</Col>
              </Row>
            )}
            {(!unsentRecipientKeys || unsentRecipientKeys.length === 0) && (
              <Row className="d-flex justify-content-center">
                <Spinner
                  className="float-right mt-4 mr-3"
                  animation="border"
                  variant="secondary"
                />
              </Row>
            )}
            <Row className="d-flex justify-content-end">
              <div className="mt-3 mr-3">
                {sending && <Spinner animation="border" variant="secondary" />}
              </div>
              <Button
                className="mt-3 flex-shrink-1"
                onClick={(e: any) => {
                  this.props.onClose();
                }}
              >
                Close
              </Button>
            </Row>
          </Col>
        )}

        {loadingContents && (
          <div className="d-flex justify-content-center mb-3">
            <Spinner className="mb-3" animation="border" variant="secondary" />
          </div>
        )}
      </>
    );
  }
}
export default Send;
