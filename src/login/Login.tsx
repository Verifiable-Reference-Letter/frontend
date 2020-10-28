import React from "react";
import { Button, InputGroup, FormControl } from "react-bootstrap";
import UserAuth from "../common/UserAuth.interface";
import "./Login.css";
import CryptService from "../services/CryptService";

import RequestBody from "../common/RequestBody.interface";
import ResponseBody from "../common/ResponseBody.interface";

import { web3 } from "../App";

interface LoginProps {
  user: UserAuth;
  callback: (u: UserAuth) => void;
}
interface LoginState {
  inputName: string;
  // displayMessage: string;
  loginMode: boolean;
}

class Login extends React.Component<LoginProps, LoginState> {

  private cryptService: CryptService;

  constructor(props: LoginProps) {
    super(props);
    this.state = {
      inputName: "",
      // displayMessage: "",
      loginMode: true,
    };
    this.cryptService = new CryptService();

    this.handleInputChange = this.handleInputChange.bind(this);
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
      alert("Connect to Metamask");
      return;
    }

    if (this.state.inputName.length <= 1) {
      console.log(this.state.inputName);
      console.log("Enter a name.");
      alert("Please Enter Your Name");
      // this.setState({ displayMessage: "Enter Your Name." });
      return;
    }

    this.signup({
      publicAddress: publicAddress,
      inputName: this.state.inputName,
    })
      // metamask popup to sign
      .then(this.signMessage)
      // send signature to backend
      .then(this.authenticate)
      .catch((err: Error) => {
        console.log(err);
        // this.setState({ displayMessage: "Error. Please Try Again Later." });
        alert("Error. Please Try Again Later.");
      });

    return;
  }

  onLoginClick(/*event: React.MouseEvent<HTMLInputElement, MouseEvent>*/) {
    console.log("login clicked.");
    // event.preventDefault();

    const publicAddress = this.props.user.publicAddress; // comment out for testing signup
    // const publicAddress = "newAddress"; // uncomment for testing signup

    // delete after implement router in which login will not be displayed unless connected to metamask
    if (publicAddress === "") {
      // comment out conditional for testing signup
      console.log("Invalid public address. Connect to Metamask.");
      alert("Please Connect to Metamask");
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
          alert("No Existing Account. Sign Up Instead.");
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
        alert("Login Failed.");
      });

    return;
  }

  async signup({
    publicAddress,
    inputName,
  }: {
    publicAddress: string;
    inputName: string;
  }) {
    console.log("publicAddress:", publicAddress, "name:", inputName);
    // this.setState({ displayMessage: "Signing You Up . . ." });

    const publicKey = await this.cryptService.getPublicKey(publicAddress);
    if (!publicKey) Promise.reject();

    return await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/auth/users/create`,
      {
        body: JSON.stringify({
          publicAddress: publicAddress,
          name: inputName,
          email: "placeholder@lehigh.edu",
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
        return users[0];
      });
    // .then((response) => response.json()) // needs to handle response in which user has existing account
    // .catch((err: Error) => console.log(err));
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

  handleInputChange(event: any) {
    this.setState({ inputName: event.target.value });
  }

  toggleMode() {
    this.setState({
      loginMode: !this.state.loginMode,
    });
  }

  render() {
    const loginDisplay = (
      <div className="button-blur">
        <Button
          variant="outline-light"
          className="mr-3"
          onClick={() => {
            this.toggleMode();
          }}
        >
          Sign Up
        </Button>
        <Button
          variant="outline-light"
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
        <InputGroup className="label-top border-radius d-flex">
          {/* <InputGroup.Prepend className="m-2 flex-shrink-1">
              Sign Up
            </InputGroup.Prepend> */}
          <FormControl
            type="text"
            className="flex-fill"
            placeholder="Name"
            value={this.state.inputName}
            onChange={this.handleInputChange}
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

    return (
      <div className="login">
        <div className="login-form">
          <div>{this.state.loginMode ? loginDisplay : signupDisplay}</div>
          {/* <div className="alert"> {this.state.displayMessage}</div> */}
        </div>
      </div>
    );
  }
}
export default Login;
