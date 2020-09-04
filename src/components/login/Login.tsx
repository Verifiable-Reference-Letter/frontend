import React from "react";
import User from "../../interfaces/User.interface";

import { web3 } from "../../App";
const headers = new Headers();
headers.set("Access-Control-Allow-Origin", "*");
headers.set("Content-Type", "application/json");

// let web3: Web3;
interface LoginProps {}
interface LoginState {
  publicAddress: string;
  nonce: string;
}

class Login extends React.Component<User, LoginState> {
  constructor(props: User) {
    super(props);
    this.state = {
      publicAddress: "",
      nonce: "",
    };
  }

  onLoginClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    console.log("login clicked.");

    const publicAddress = this.props.public_key;
    console.log(publicAddress);

    const init: RequestInit = {
      method: "GET",
      headers,
    };

    if (publicAddress == "") {
      console.log("Invalid public address. Connect to Metamask.")
      return;
    }

    fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${publicAddress}`, init)
      .then((response) => {
        console.log("logging response");
        console.log(response);
        return response.json();
      })
      .then((users) => {
        console.log(users);
        return users[0] != null ? users[0] : this.signup({ publicAddress });
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

  async signup({ publicAddress }: { publicAddress: string }) {
    return await fetch(`${process.env.REACT_APP_BACKEND_URL}/users`, {
      body: JSON.stringify(this.state.publicAddress),
      headers,
      method: "POST",
    }).then((response) => response.json());
  }

  async signMessage({
    publicAddress,
    nonce,
  }: {
    publicAddress: string;
    nonce: string;
  }): Promise<{ publicAddress: string; signature: string }> {

    const msgParams = [
      {
        type: 'string',      // Any valid solidity type
        name: 'Message',     // Any string label you want
        value: 'Hi, Alice!'  // The value to sign
     },
     {   
       type: 'uint32',
          name: 'A number',
          value: '1337'
      }
    ]   
    
    console.log("signing the nonce");
    console.log(nonce);
    return new Promise((resolve, reject) => {
      // web3.eth.sign doesn't seem to work (never finishes)
      web3.eth.personal.sign(
        web3.utils.utf8ToHex(`I am signing my one-time nonce: ${nonce}`),
        publicAddress, "",
        (err, signature) => {
          if (err) {
            console.log("error when signing");
            return reject(err);
          }
          console.log("message signed");
          return resolve({ publicAddress, signature });
        }
      ).then(console.log);
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
    return fetch(`${process.env.REACT_APP_BACKEND_URL}/auth`, {
      body: JSON.stringify({ publicAddress, signature }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    }).then((response) => response.json());
  }

  render() {
    return (
      <div>
        <button
          onClick={(e) => {
            this.onLoginClick(e);
          }}
        >
          Login
        </button>
      </div>
    );
  }
}
export default Login;
