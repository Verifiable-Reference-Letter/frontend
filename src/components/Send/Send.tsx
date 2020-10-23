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
  sent: boolean;
  encrypted: boolean[];
  letterHash: string;
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

    this.state = {
      sent: false,
      encrypted: e,
      letterHash: ""
    };
    this.cryptService = new CryptService();
  }

  async componentDidMount() {
  	let hash = this.cryptService.hashFile(JSON.stringify(this.props.letter))
  	// Get letter contents
  	const fetchUrl = `/api/v1/letters/${this.props.letter.letterId}/contents`;
  	let contents = await this.getLetterContents(fetchUrl)
  	console.dir(contents)
  	this.setState({ letterHash: hash })
  }

  async encryptAndUpload(key: number, userKey: UserKey) {
  	let hash = this.state.letterHash
  	console.log("Letter hash is: " + hash)
  	// Sign hash
  	// get letter contents
  	// 
    //const encryptedLetterForm: { encryptedLetter: string, signedHash: string, hash: string } = await this.cryptService.encryptMethod(userKey.publicKey);
    // TODO: check successful encrypt, make fetch call to backend with signed hashed, hash, and encrypted letters
    const fetchUrl = `/api/v1/letters/${this.props.letter.letterId}/recipientLetterForm/update`;
    // const success = await this.uploadEncryptedLetterForm(fetchUrl, encryptedLetterForm);
    const success = true;
    if (success) {
      let encrypted = [...this.state.encrypted];
      encrypted[key] = true;
      this.setState({ encrypted: encrypted });
    }
  }

  async getLetterContents(fetchUrl: string) {
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
        }
      }),
    };
    try {
      let response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}${fetchUrl}`,
        init
      );
      if (response.status === 400) {
        console.log(response.status);
        return "";
      } else {
        // let body = await response.json();
        return response;
      }
    } catch (e) {
      console.log(e);
      return "";
    }

  }

  async uploadEncryptedLetterForm(
    fetchUrl: string,
    encryptedLetterForm: {
      encryptedLetter: string;
      signedHash: string;
      hash: string;
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

  render() {
    const { user, letter, unsentRecipientKeys } = this.props;
    const { sent, encrypted } = this.state;

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
                  {!encrypted[i] && (
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
                          this.encryptAndUpload(i + 1, unsentRecipientKeys[i + 1]);
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
        <Col>
          {unsentRecipientKeys && (
            <Row>
              <Col>{recipientList}</Col>
            </Row>
          )}
          {!unsentRecipientKeys && (
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
              {sent && <Spinner animation="border" variant="secondary" />}
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
      </>
    );
  }
}
export default Send;
