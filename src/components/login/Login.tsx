import React from "react";
import Web3 from "web3";
import User from "../../interfaces/User.interface";
import detectEthereumProvider from "@metamask/detect-provider";

let web3: Web3;
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
    console.log("Login clicked.");
    
    const publicAddress = this.props.public_key;
    console.log(publicAddress);

    fetch(
      `${process.env.REACT_APP_BACKEND_URL}/users?publicAddress=${publicAddress}`
    )
      .then((response) => response.json())
      // If yes, retrieve it. If no, create it.
      .then((users) =>
        users.length ? users[0] : this.signup({ publicAddress })
      )
      // Popup MetaMask confirmation modal to sign message
      .then(this.signMessage)
      // Send signature to back end on the /auth route
      .then(this.authenticate);

    return 
  }

  signup({ publicAddress }: { publicAddress: string }) {
    return fetch(`${process.env.REACT_APP_BACKEND_URL}/users`, {
      body: JSON.stringify(this.state.publicAddress),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    }).then((response) => response.json());
  }

  signMessage({
    publicAddress,
    nonce,
  }: {
    publicAddress: string;
    nonce: string;
  }): Promise<{ publicAddress: string; signature: any }> {
    return new Promise((resolve, reject) => {
      web3.eth.sign(
        web3.utils.fromUtf8(`I am signing my one-time nonce: ${nonce}`),
        publicAddress,
        (err, signature) => {
          if (err) return reject(err);
          return resolve({ publicAddress, signature });
        }
      )
    });
  }

  authenticate({
    publicAddress,
    signature,
  }: {
    publicAddress: string;
    signature: any;
  }) {
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
