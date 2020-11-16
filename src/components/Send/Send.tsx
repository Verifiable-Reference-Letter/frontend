import React from "react";
import {
  Button,
  Row,
  Col,
  Spinner,
  Card,
  Collapse,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import UserAuth from "../../common/UserAuth.interface";
import UserKey from "../../common/UserKey.interface";
import FileData from "../../common/FileData.interface";
import Letter from "../../common/LetterDetails.interface";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { faInfoCircle, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

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
  failedLoad: boolean;
  signingLetter: boolean;
  failedSigning: boolean;
  sending: boolean;
  sendSuccess: boolean;
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
      failedLoad: false,
      signingLetter: false,
      failedSigning: false,
      sending: false,
      sendSuccess: false,
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

  async encryptSignAndUpload(key: number, userKey: UserKey) {
    this.setState({ failedLoad: false, failedSigning: false, sendSuccess: false, });
    try {
      console.log("Pub key is: " + userKey.publicKey);
      console.log("State url: " + this.state.encryptedLetter);

      if (!this.state.encryptedLetter) return;

      // this does not prompt the user with metamask
      let encryptedLetter = await this.cryptService.encryptSend(
        this.state.encryptedLetter,
        userKey.publicKey
      );
      console.log("Encrypted letter: " + encryptedLetter);

      this.setState({ signingLetter: true });

      // this padding is necessary for correct signature and verification of encrypted recipient letters
      // the first 10 characters are 'encrypted:'
      let signedLetter = await this.cryptService.signLetter(
        "encrypted:" + encryptedLetter,
        this.props.user.publicAddress
      );
      this.setState({ signingLetter: false });
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
      // check if letter sent successfully
      if (success) {
        let encrypted = [...this.state.encrypted];
        encrypted[key] = true;
        this.setState({
          encrypted: encrypted,
          sending: false,
          sendSuccess: true,
        });
      } else {
        this.setState({
          sending: false,
        });
      }
    } catch (e) {
      if (this.state.signingLetter) {
        // user likely canceled the metamask signing transaction
        console.log("failed signing");
        this.setState({
          signingLetter: false,
          sending: false,
          failedSigning: true,
        });
      } else if (this.state.sending) {
        // possible network error?
        console.log("failed upload");
        this.setState({
          signingLetter: false,
          sending: false,
        });
      } else {
        // maybe something wrong with the key (yikes)
        console.log("failed encryption or other");
        this.setState({
          signingLetter: false,
          sending: false,
        });
      }
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
            })
            .catch((e: Error) => {
              console.log("failed to decrypt letter");
              this.setState({
                loadingContents: false,
                failedLoad: true,
              });
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
    const {
      loadingContents,
      failedLoad,
      signingLetter,
      failedSigning,
      sending,
      sendSuccess,
      encrypted,
    } = this.state;

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
                        this.encryptSignAndUpload(i, unsentRecipientKeys[i]);
                      }
                    }}
                  >
                    {unsentRecipientKeys[i].name}
                  </Card.Header>

                  {encrypted[i] && (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id="learn-more">
                          <div>Letter has been sent!</div>
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon
                        icon={faCheckSquare}
                        size="lg"
                        className="send-check-square"
                      />
                    </OverlayTrigger>
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
                          this.encryptSignAndUpload(
                            i + 1,
                            unsentRecipientKeys[i + 1]
                          );
                        }
                      }}
                    >
                      {unsentRecipientKeys[i + 1].name}
                    </Card.Header>
                    {encrypted[i + 1] && (
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip id="learn-more">
                            <div>Letter has been sent!</div>
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon
                          icon={faCheckSquare}
                          size="lg"
                          className="send-check-square"
                        />
                      </OverlayTrigger>
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
        {!loadingContents && failedLoad && (
          <div className="d-flex justify-content-center mb-3">
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="learn-more">
                  <div>
                    Please click <em>Decrypt</em> on Metamask to retrieve your
                    encrypted letter. This is because we use Metamask to keep
                    your letters <b>secure</b> and need to decrypt it before we
                    can send it. This is step 1 of 3-step process. Learn more in
                    the FAQs.
                  </div>
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />
            </OverlayTrigger>
            <div className="ml-3">Failed to Retrieve Your Letter</div>
          </div>
        )}
        {!loadingContents && !failedLoad && (
          <Col>
            {unsentRecipientKeys && (
              <>
                {/* <Row className="mb-2">Select a Recipient:</Row> */}
                <Row>
                  <Col>{recipientList}</Col>
                </Row>
              </>
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
            <Row className="d-flex justify-content-between">
              <div className="d-flex justify-content-between mt-4 ml-4 text-info float-left flex-fill">
                {signingLetter && !sending && (
                  <div className="d-flex justify-content-between">
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id="learn-more">
                          <div>
                            We ask you to <b>sign</b> your letter as{" "}
                            <b>proof</b> that this letter is from you. Your{" "}
                            <b>signature</b> will give the recipient confidence
                            that the letter is authentic. Learn more about{" "}
                            <b>Signing / Verification</b> in the FAQS.
                          </div>
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        size="lg"
                        className="mr-3"
                      />
                    </OverlayTrigger>
                    <div>See Metamask to Sign Your Letter</div>
                  </div>
                )}
                {failedSigning && !sending && !signingLetter && (
                  <div className="d-flex justify-content-between">
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id="learn-more">
                          <div>
                            Please click <em>Sign</em> on Metamask to sign your
                            letter. Your <b>signature</b> will give the
                            recipient confidence that the letter is authentic.
                            Learn more about <b>Signing / Verification</b> in
                            the FAQS.
                          </div>
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon icon={faInfoCircle} size="lg" />
                    </OverlayTrigger>
                    <div className="ml-3">Failed to Sign Your Letter</div>
                  </div>
                )}

                {sending && !signingLetter && (
                  <div className="d-flex justify-content-between">
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id="learn-more">
                          <div>
                            Verifying your encrypted letter and the signature.
                            Your <b>signature</b> will give the recipient
                            confidence that the letter is authentic. Learn more
                            about <b>Signing / Verification</b> in the FAQS.
                          </div>
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        size="lg"
                        className="mr-3"
                      />
                    </OverlayTrigger>
                    <div> Sending Your Letter . . . </div>
                  </div>
                )}
                {sendSuccess && !sending && !signingLetter && (
                  <div className="d-flex justify-content-between">
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id="learn-more">
                          <div>
                            Your letter has been sent! You can continue to send
                            letters to recipients or click <b>Close</b> to
                            finish the session. Learn more in the FAQS.
                          </div>
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        size="lg"
                        className="mr-3"
                      />
                    </OverlayTrigger>
                    <div>Your letter has been sent!</div>
                  </div>
                )}
              </div>
              <div className="mt-3 mr-3 flex-shrink-1">
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
          <>
            {/* <div className="d-flex justify-content-center mb-3">
              <Spinner
                className="mb-3"
                animation="border"
                variant="secondary"
              />
            </div> */}
            <div className="d-flex justify-content-center mb-3">
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="learn-more">
                    <div>
                      We use Metamask to keep your letters <b>secure</b> and{" "}
                      <b>verifiable</b>. To send your letter, we must 1.
                      Retrieve and Decrypt your letter. 2. Encrypt your letter (
                      <em>w/ the Recipient's key</em>) 3. Sign the Letter. Learn
                      more about this proces in the FAQs.
                    </div>
                  </Tooltip>
                }
              >
                <FontAwesomeIcon icon={faInfoCircle} size="lg" />
              </OverlayTrigger>
              <div className="ml-3">See Metamask to start sending</div>
            </div>
          </>
        )}
      </>
    );
  }
}
export default Send;
