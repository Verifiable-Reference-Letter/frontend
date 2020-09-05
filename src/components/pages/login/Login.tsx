import React from "react";
import User from "../../../interfaces/User.interface";
import "./Login.css";

import { web3 } from "../../../App";
const headers = new Headers();
headers.set("Access-Control-Allow-Origin", "*");
headers.set("Content-Type", "application/json");

// let web3: Web3;
interface LoginProps {}
interface LoginState {
  inputName: string;
  displayMessage: string;
  loginMode: boolean;
}

class Login extends React.Component<User, LoginState> {
  constructor(props: User) {
    super(props);
    this.state = {
      inputName: "",
      displayMessage: "",
      loginMode: true,
    };

    this.handleChange = this.handleChange.bind(this);
    this.onLoginClick = this.onLoginClick.bind(this);
    this.signMessage = this.signMessage.bind(this);
    this.authenticate = this.authenticate.bind(this);
  }

  onSignupClick(event: React.MouseEvent<HTMLInputElement, MouseEvent>) {
    const publicAddress = this.props.publicAddress;

    // delete after implement router in which login will not be displayed unless connected to metamask
    if (publicAddress == "") {
      // comment out conditional for testing signup
      console.log("Invalid public address. Connect to Metamask.");
      this.setState({ displayMessage: "Please Connect to Metamask." });
      return;
    }

    if (this.state.inputName.length <= 1) {
      console.log(this.state.inputName);
      console.log("Please enter a name.");
      this.setState({ displayMessage: "Please Enter Your Name." });
      return;
    }

    this.signup({
      publicAddress: publicAddress,
      inputName: this.state.inputName,
    });
  }

  onLoginClick(event: React.MouseEvent<HTMLInputElement, MouseEvent>) {
    console.log("login clicked.");
    // event.preventDefault();

    const publicAddress = this.props.publicAddress; // comment out for testing signup
    // const publicAddress = "newAddress"; // uncomment for testing signup

    // delete after implement router in which login will not be displayed unless connected to metamask
    if (publicAddress == "") {
      // comment out conditional for testing signup
      console.log("Invalid public address. Connect to Metamask.");
      this.setState({ displayMessage: "Please Connect to Metamask." });
      return;
    }

    console.log("public address:", publicAddress);

    const init: RequestInit = {
      method: "GET",
      headers,
    };

    fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${publicAddress}`, init)
      .then((response) => {
        console.log("logging response");
        console.log(response);
        return response.json();
      })
      .then((users) => {
        console.log(users);

        if (users[0] == null) {
          console.log("need to signup.");
          this.setState({
            displayMessage: "No Existing Account. Sign Up Instead.",
            // loginMode: false // automatically redirect to signup form
          });
          // this.setState({loginMode: false}); // automatically redirect to signup form
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
    console.log(publicAddress, inputName);
    this.setState({displayMessage: "Signing You Up . . ."})
    return await fetch(`${process.env.REACT_APP_BACKEND_URL}/users`, {
      body: JSON.stringify({
        publicAddress: publicAddress,
        inputName: inputName,
      }),
      headers,
      method: "POST",
    })
      .then((response) => response.json()) // needs to handle response in which user has existing account
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
    return new Promise((resolve, reject) => {
      // web3.eth.sign doesn't seem to work (never finishes)
      web3.eth.personal
        .sign(
          web3.utils.utf8ToHex(`I am signing my one-time nonce: ${nonce}`),
          publicAddress,
          "",
          (err, signature) => {
            if (err) {
              console.log("error when signing");
              return reject(err);
            }
            console.log("message signed");
            return resolve({ publicAddress, signature });
          }
        )
        .then(console.log);
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
    this.setState({
      displayMessage: this.state.loginMode
        ? "Logging You In . . ."
        : "Signing You Up . . .",
    });
    return fetch(`${process.env.REACT_APP_BACKEND_URL}/auth`, {
      body: JSON.stringify({ publicAddress, signature }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    }).then((response) => response.json());
  }

  handleChange(event: any) {
    this.setState({ inputName: event.target.value });
  }

  toggleMode() {
    this.setState({ loginMode: !this.state.loginMode, displayMessage: "" });
  }

  render() {
    const loginDisplay = (
      <div>
        <input
          type="button"
          onClick={(e) => {
            this.toggleMode();
          }}
          value="Sign Up"
        />
        <input
          type="button"
          onClick={(e) => {
            this.onLoginClick(e);
          }}
          value="Login"
        />
      </div>
    );

    const signupDisplay = (
      <form>
        <label>
          Name &nbsp;
          <input
            type="text"
            placeholder="Not Yet Verified"
            value={this.state.inputName}
            onChange={this.handleChange}
          />
        </label>
        <input
          type="button"
          onClick={(e) => {
            this.onSignupClick(e);
          }}
          value="Sign Up"
        />
        {/* <input
          type="button"
          onClick={(e) => {
            this.onLoginClick(e);
          }}
          value="Login"
        /> */}
        <input
          type="button"
          onClick={(e) => {
            this.toggleMode();
          }}
          value="Back"
        />
      </form>
    );

    return (
      <div>
        <div className="login-wrapper">
          <div>{this.state.loginMode ? loginDisplay : signupDisplay}</div>
          <div className="alert"> {this.state.displayMessage}</div>
        </div>
      </div>
    );
  }
}
export default Login;
