import React from "react";
import {
  Button,
  InputGroup,
  FormControl,
  Form,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import UserAuth from "../common/UserAuth.interface";
import "./Login.css";
import CryptService from "../services/CryptService";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import RequestBody from "../common/RequestBody.interface";
import ResponseBody from "../common/ResponseBody.interface";

import { web3 } from "../App";

import MContext from "../MessageSender";

interface LoginProps {
  user: UserAuth;
  callback: (u: UserAuth) => void;
}

interface LoginState {
  signingUp: boolean;
  failedKey: boolean;
  invalidEmail: boolean;
  invalidName: boolean;
  signUpSuccess: boolean;
  alreadySignedUp: boolean;
  noAccount: boolean;
  failedSigning: boolean;
  inputEmail: string;
  inputName: string;
  // displayMessage: string;
  loginMode: boolean;
}

class Login extends React.Component<LoginProps, LoginState> {
  private cryptService: CryptService;

  constructor(props: LoginProps) {
    super(props);
    this.state = {
      signingUp: false,
      failedKey: false,
      invalidEmail: false,
      invalidName: false,
      signUpSuccess: false,
      alreadySignedUp: false,
      noAccount: false,
      failedSigning: false,
      inputEmail: "",
      inputName: "",
      // displayMessage: "",
      loginMode: true,
    };
    this.cryptService = new CryptService();

    this.handleInputNameChange = this.handleInputNameChange.bind(this);
    this.handleInputEmailChange = this.handleInputEmailChange.bind(this);

    this.onLoginClick = this.onLoginClick.bind(this);
    this.signMessage = this.signMessage.bind(this);
    this.authenticate = this.authenticate.bind(this);
  }

  onSignupClick(/*event: React.MouseEvent<HTMLInputElement, MouseEvent>*/) {
    const publicAddress = this.props.user.publicAddress;

    // delete after implement router in which login will not be displayed unless connected to metamask
    if (publicAddress === "") {
      // comment out conditional for testing signup
      console.log("Invalid public address. Connect to Metamask.");
      // this.setState({ displayMessage: "Connect to Metamask." });
      // alert("Connect to Metamask");
      return;
    }
    const re: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    console.log(re.test(this.state.inputEmail.toLowerCase()));
    console.log(this.state.inputEmail);
    if (
      this.state.inputEmail.length <= 1 ||
      !re.test(this.state.inputEmail.toLowerCase())
    ) {
      console.log(this.state.inputName);
      console.log("Enter your email.");
      // alert("Please enter your email");
      this.setState({
        signingUp: false,
        failedKey: false,
        invalidEmail: true,
        invalidName: false,
        signUpSuccess: false,
        alreadySignedUp: false,
        noAccount: false,
        failedSigning: false,
      });
      return;
    } else if (this.state.inputName.length <= 1) {
      console.log(this.state.inputName);
      console.log("Enter your name.");
      // alert("Please enter your name.");
      this.setState({
        signingUp: false,
        failedKey: false,
        invalidEmail: false,
        invalidName: true,
        signUpSuccess: false,
        alreadySignedUp: false,
        noAccount: false,
        failedSigning: false,
      });
      // this.setState({ displayMessage: "Enter Your Name." });
      return;
    }

    this.signup({
      publicAddress: publicAddress,
      email: this.state.inputEmail,
      inputName: this.state.inputName,
    }).catch((e: Error) => {
      console.log(e);
    });
    // // metamask popup to sign
    // .then(this.signMessage)
    // // send signature to backend
    // .then(this.authenticate)
    // .catch((err: Error) => {
    // console.log(err);
    // this.setState({ displayMessage: "Error. Please Try Again Later." });
    // alert("Error. Please Try Again Later.");
    // });

    return;
  }

  onLoginClick(/*event: React.MouseEvent<HTMLInputElement, MouseEvent>*/) {
    console.log("login clicked.");
    // event.preventDefault();

    const publicAddress = this.props.user.publicAddress; // comment out for testing signup
    // const publicAddress = "newAddress"; // uncomment for testing signup

    // delete after implement router in which login will not be displayed unless connected to metamask
    if (publicAddress === "") {
      // shouldn't happen in theory
      console.log("Invalid public address. Connect to Metamask.");
      // alert("Please Connect to Metamask");
      // this.setState({ displayMessage: "Please Connect to Metamask." });
      return;
    }

    console.log("public address:", publicAddress);

    const init: RequestInit = {
      method: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    };

    fetch(
      `${process.env.REACT_APP_BACKEND_URL}/auth/users/${publicAddress}`,
      init
    )
      .then((response) => {
        console.log("logging nonce fetch response");
        console.log(response);
        return response.json();
      })
      .then((users) => {
        console.log(users);

        if (users[0] == null) {
          console.log("need to signup.");
          // this.setState({
          //   displayMessage: "No Existing Account. Sign Up Instead.",
          // });
          // alert("No Existing Account. Sign Up Instead.");
          this.setState({
            signingUp: false,
            failedKey: false,
            invalidEmail: false,
            invalidName: true,
            signUpSuccess: false,
            alreadySignedUp: false,
            noAccount: true,
            failedSigning: false,
          });
          return Promise.reject("no existing account");
        }
        return users[0];
      })
      // metamask popup to sign
      .then(this.signMessage)
      // send signature to backend
      .then(this.authenticate)
      //.then(this.doStuffWithToken) // after receiving the token
      .catch((err: Error) => {
        console.log(err);
        // this.setState({ displayMessage: "Login Failed. Try Again Later." });
        // alert("Login Failed.");
      });

    return;
  }

  async signup({
    publicAddress,
    email,
    inputName,
  }: {
    publicAddress: string;
    email: string;
    inputName: string;
  }) {
    console.log(
      "publicAddress:",
      publicAddress,
      "email",
      email,
      "name:",
      inputName
    );
    // this.setState({ displayMessage: "Signing You Up . . ." });

    this.setState({
      signingUp: true,
      failedKey: false,
      invalidEmail: false,
      invalidName: false,
      signUpSuccess: false,
      alreadySignedUp: false,
      noAccount: false,
      failedSigning: false,
    });
    const publicKey = await this.cryptService.getPublicKey(publicAddress);
    console.log(publicKey);

    if (!publicKey) {
      // alert("Failed to Get Public Key . . .");
      this.setState({
        signingUp: false,
        failedKey: true,
        invalidEmail: false,
        invalidName: false,
        signUpSuccess: false,
        alreadySignedUp: false,
        noAccount: false,
        failedSigning: false,
      });
      return Promise.reject("failed to get public key");
    }

    this.setState({ signingUp: false });

    return await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/auth/users/create`,
      {
        body: JSON.stringify({
          publicAddress: publicAddress,
          name: inputName,
          email: email,
          publicKey: publicKey,
        }),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        method: "POST",
      }
    )
      .then((response) => {
        console.log("logging signup response");
        console.log(response);
        return response.json();
      })
      .then((users) => {
        console.log(users);
        console.log("signup finish");
        if (!users || users.length === 0) {
          // alert("Please Login Instead . . .");
          this.setState({
            signingUp: false,
            failedKey: false,
            invalidEmail: false,
            invalidName: false,
            signUpSuccess: false,
            alreadySignedUp: true,
            noAccount: false,
            failedSigning: false,
          });
        } else {
          // alert("You're Signed Up. Please Login . . . ");
          this.setState({
            signingUp: false,
            failedKey: false,
            invalidEmail: false,
            invalidName: false,
            signUpSuccess: true,
            alreadySignedUp: false,
            noAccount: false,
            failedSigning: false,
          });
          return users[0];
        }
      })
      // .then((response) => response.json()) // needs to handle response in which user has existing account
      .catch((err: Error) => console.log(err));
  }

  async signMessage({
    publicAddress,
    nonce,
  }: {
    publicAddress: string;
    nonce: string;
  }): Promise<{ publicAddress: string; signature: string }> {
    // this.setState({displayMessage: "Sign the Message to Confirm Public Address."})
    console.log("signing the nonce");
    console.log(nonce);
    // const prefix = '\x19Ethereum Signed Message:\n' + String.fromCharCode(nonce.length);
    // const message = web3.utils.keccak256(prefix + nonce);
    const message = nonce;
    // const message = web3.utils.keccak256(nonce);
    console.log(message);
    console.log(web3.utils.utf8ToHex(`${message}`));
    console.log(publicAddress);
    return new Promise((resolve, reject) => {
      // web3.eth.sign doesn't seem to work (never finishes)
      web3.eth.personal
        .sign(
          message,
          // web3.utils.utf8ToHex(`${message}`),
          publicAddress,
          "",
          (err, signature) => {
            //console.log(web3.eth.accounts.recover(web3.utils.keccak256(nonce), signature));
            //web3.eth.personal.ecRecover(message, signature).then((v) => console.log(v));
            if (err) {
              console.log("error when signing");
              // alert("Signing Failed . . .");
              this.setState({
                signingUp: false,
                failedKey: false,
                invalidEmail: false,
                invalidName: false,
                signUpSuccess: false,
                alreadySignedUp: false,
                noAccount: false,
                failedSigning: true,
              });
              return reject(err);
            }
            console.log("message signed");
            return resolve({ publicAddress, signature });
          }
        )
        .then(console.log)
        .catch((err: Error) => {
          console.log();
        });
    });
  }

  async authenticate({
    publicAddress,
    signature,
  }: {
    publicAddress: string;
    signature: string;
  }) {
    console.log("authenticating");
    // this.setState({
    //   displayMessage: this.state.loginMode
    //     ? "Logging You In . . ."
    //     : "Signing You Up . . .",
    // });
    return fetch(`${process.env.REACT_APP_BACKEND_URL}/auth`, {
      body: JSON.stringify({ publicAddress, signature }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      method: "POST",
    })
      .then((response) => {
        console.log("received response");
        console.log(response);

        response
          .json()
          .then((body: ResponseBody) => {
            console.log(body);
            const data = body.data;
            const j = data.jwtToken;
            console.log("jwtToken", j);
            let jwtToken = j ? j : undefined;
            if (jwtToken) {
              console.log(jwtToken);
              this.props.callback({
                publicAddress: this.props.user.publicAddress,
                name: this.props.user.name,
                jwtToken: jwtToken,
              });
            } else {
              console.log("error with jwtToken");
            }
          })
          .catch((err: Error) => {
            console.log(err);
          });
      })
      .catch((err: Error) => {
        console.log(err);
      });
  }

  handleInputNameChange(event: any) {
    console.log(event.target.value);
    this.setState({ inputName: event.target.value });
  }

  handleInputEmailChange(event: any) {
    console.log(event.target.value);
    this.setState({ inputEmail: event.target.value });
  }

  toggleMode() {
    this.setState({
      loginMode: !this.state.loginMode,
      signingUp: false,
      failedKey: false,
      invalidEmail: false,
      invalidName: false,
      signUpSuccess: false,
      alreadySignedUp: false,
      noAccount: false,
      failedSigning: false,
    });
  }

  render() {
    const loginDisplay = (
      <div className="button-blur d-flex justify-content-between">
        <MContext.Consumer>
          {(context: { setMessage: (arg0: boolean) => null; })=> {<Button
            variant="outline-light"
            className="mr-3 flex-shrink-1"
            onClick={() => {     
              this.toggleMode();           
                context.setMessage(loginMode);
            }}
            >
            Sign Up
          </Button>
          }}
        </MContext.Consumer>
        <Button
          variant="outline-light"
          className="flex-fill"
          onClick={() => {
            this.onLoginClick();
          }}
        >
          Login
        </Button>
      </div>
    );

    const signupDisplay = (
      <form className="justify-content-between">
        <InputGroup className="label-top border-radius">
          <Form.Group controlId="formEmail">
            {/* <Form.Label>Email address</Form.Label> */}
            <Form.Control
              type="email"
              className="w-100 mb-3"
              placeholder="Email"
              onChange={this.handleInputEmailChange}
            />
            {/* <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text> */}
          </Form.Group>
          {/* <InputGroup.Prepend className="m-2 flex-shrink-1">
              Sign Up
            </InputGroup.Prepend> */}
          <FormControl
            type="text"
            className="w-100"
            placeholder="Name"
            value={this.state.inputName}
            onChange={this.handleInputNameChange}
          />
        </InputGroup>
        <div className="d-flex button-blur">
          <Button
            variant="outline-light"
            className="float-right flex-fill"
            onClick={() => {
              this.onSignupClick();
            }}
          >
            Sign Up
          </Button>
          <Button
            variant="outline-light"
            className="float-right flex-fill ml-3"
            onClick={() => {
              this.toggleMode();
              this.setState({ inputName: "" });
            }}
          >
            Back
          </Button>
        </div>
      </form>
    );

    const { user } = this.props;
    const {
      signingUp,
      failedKey,
      invalidEmail,
      invalidName,
      signUpSuccess,
      alreadySignedUp,
      noAccount,
      failedSigning,
      loginMode,
    } = this.state;

    return (
      <div className="login">
        <div className="login-form">
          <div>{loginMode ? loginDisplay : signupDisplay}</div>
          <div className="mt-3 d-flex justify-content-between">
            {/* <FontAwesomeIcon icon={faInfoCircle} size="lg" className="ml-3" /> */}
            {(signingUp ||
              failedKey ||
              invalidEmail ||
              invalidName ||
              signUpSuccess ||
              alreadySignedUp ||
              failedSigning) && (
                <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="learn-more">
                  <>
                    {signingUp && (
                      <div>
                        We ask you to provide your <b>Public Key</b> so that you
                        can <b>1.</b> keep your letters <b>secure</b> with
                        end-to-end encryption <b>2.</b> allow other users to
                        send you letters.
                      </div>
                    )}
                    {failedKey && (
                      <div>
                        Please click <em>Provide</em> on Metamask to sign up. We
                        need your <b>Public Key</b> to 1. keep your letters
                        secure 2. Allow other users to send letters to you.
                        Learn more about <b>End-to-End Encryption</b> in the
                        FAQs.
                      </div>
                    )}
                    {invalidEmail && (
                      <div>
                        Please enter a valid email. You will need to verify your
                        email to complete the sign up process. Ex:{" "}
                        <b>placeholder@lehigh.edu</b>
                      </div>
                    )}
                    {invalidName && (
                      <div>
                        Please enter a valid name. This name will be{" "}
                        <b>publicly visible</b> to other users.
                      </div>
                    )}
                    {user.publicAddress === "" && (
                      <div>
                        Please connect to metamask. You may need to check the
                        Metamask extension. For Metamask troubleshooting, check
                        out the FAQs.
                      </div>
                    )}
                    {signUpSuccess && (
                      <div>
                        You've successfully signed up. Please check your{" "}
                        <b>Email</b>
                        to verify your identity!{" "}
                      </div>
                    )}
                    {alreadySignedUp && (
                      <div>
                        You already have an account. Please click <b>Login</b>{" "}
                        to authenticate. For troubleshooting, check out the
                        FAQs.
                      </div>
                    )}
                    {noAccount && (
                      <div>
                        No account found. Please click <b>Sign Up</b> to create
                        an account. For troubleshooting, check out the FAQs.
                      </div>
                    )}
                    {failedSigning && (
                      <div className="text-warning">
                        Please click <em>Sign</em> on Metamask to <b>Login</b>.
                        We need your signature to verify your identity. Learn
                        more about <b>Signing / Verification</b> in the FAQs.
                      </div>
                    )}
                    {/* {!signingUp &&
                      !failedKey &&
                      !invalidEmail &&
                      !invalidName &&
                      !signUpSuccess &&
                      !alreadySignedUp &&
                      !failedSigning && (
                        <>
                          {loginMode && (
                            <div>
                              We're excited that you're with us. Please{" "}
                              <b>Login</b> to send, upload, or receive
                              verifiable letters!
                            </div>
                          )}
                          {!loginMode && (
                            <div>
                              We're excited that you're with us. Please fill out
                              the form and <b>Sign Up</b> to send, upload, or
                              receive verifiable letters!
                            </div>
                          )}
                        </>
                      )} */}
                  </>
                </Tooltip>
              }
            >
              <FontAwesomeIcon
                icon={
                  (signingUp ||
                  signUpSuccess)
                    ? faInfoCircle
                    : faExclamationTriangle
                }
                size="lg"
                className="mr-3"
              />
            </OverlayTrigger>)}
            {signingUp && <div className="mt-1">See Metamask to signup</div>}
            {failedKey && <div className="mt-1">Error in signup process</div>}
            {invalidEmail && (
              <div className="mt-1">Please enter a valid email</div>
            )}
            {invalidName && (
              <div className="mt-1">Please enter a valid name</div>
            )}
            {user.publicAddress === "" && (
              <div className="mt-1">Please connect to Metamask</div>
            )}
            {signUpSuccess && (
              <div className="mt-1">Success. Please verify your email</div>
            )}
            {alreadySignedUp && (
              <div className="mt-1">Please login instead</div>
            )}
            {noAccount && <div className="mt-1">Please signup instead</div>}
            {failedSigning && <div className="mt-1">Failed to login</div>}
            {/* {!signingUp &&
              !failedKey &&
              !invalidEmail &&
              !invalidName &&
              !signUpSuccess &&
              !alreadySignedUp &&
              !failedSigning && (
                <div className="mt-1">
                  {loginMode ? "" : "Fill out the form to signup"}
                </div>
              )} */}
            <div className="flex-fill"></div>
          </div>

          {/* <div className="alert"> {this.state.displayMessage}</div> */}
        </div>
      </div>
    );
  }
}
export default Login;
