import { TutorialToken } from "./contract-types/TutorialToken"; // import is correct
import React from "react";
import { Route, Redirect } from "react-router-dom";
import TutorialTokenContractData from "./contract-data/TutorialToken.json";
import BN from "bn.js";

import Nav from "./nav/Nav";
import HomePage from "./home/Home";
import WriterPage from "./writer/Writer";
import RequestorPage from "./requestor/Requestor";
import RecipientPage from "./recipient/Recipient";
import LoginPage from "./login/Login";
import DashboardPage from "./dashboard/Dashboard";

import UserAuth from "./common/UserAuth.interface";

import * as ROUTES from "./routes";

import Web3 from "web3";
export let web3: Web3;
export let ethereum: any;

export const GAS_LIMIT_STANDARD = 6000000;
export let accounts: string[];
let web3Provider;

let contract: any;
const ERC20_NETWORK = "https://services.jade.builders/core-geth/kotti/1.11.2";
export async function deployContract<T>(
  contractName: string,
  abi: any,
  code: any,
  ...args: any[]
): Promise<T> {
  const Contract = new web3.eth.Contract(abi);
  const contractResult = await Contract.deploy({ data: code }).send({
    from: accounts[0],
  });
  return contractResult as any;
}

export async function deployTutorialToken(): Promise<TutorialToken> {
  console.log("Deploying Contract from innner deploy tutorial token method: ");
  var contract = await deployContract<TutorialToken>(
    "TutorialToken",
    TutorialTokenContractData.abi,
    TutorialTokenContractData.bytecode,
    0
  );
  console.log("Contract from innner deploy tutorial token method: " + contract);
  return contract;
}

type MyProps = {};
type MyState = {
  numErcBeingTraded: number;
  contract: TutorialToken;
  connectedTo: boolean; // metamask
  loggedIn: boolean; // our app
  user: UserAuth;
};

class App extends React.Component<MyProps, MyState> {
  constructor(props: any) {
    super(props);
    this.state = {
      numErcBeingTraded: 0,
      contract: {} as TutorialToken,
      connectedTo: false,
      loggedIn: false,
      user: { publicAddress: "", name: "", jwtToken: "" },
    };
    this.onConnect = this.onConnect.bind(this);
    this.onLogin = this.onLogin.bind(this);
    //this.handleErcInputChange = this.handleErcInputChange.bind(this);
  }

  handleErcInputChange(event: any) {
    this.setState({
      numErcBeingTraded: event.target.value,
    });
    console.log("Num of ERC wanted to trade: " + this.state.numErcBeingTraded);
    var rate = this.state.contract.methods.rate().call();
    var numErc = new BN(this.state.numErcBeingTraded);
    //var numTokens = rate.mul(numErc);
    //console.log("Num of Tutorial Tokens you can receive: " + numTokens.toString());
  }

  async onConnect() {
    const ethereum = (window as any).ethereum;
    await ethereum.enable();
    web3Provider = (window as any).web3.currentProvider;
    // NOTE you might need this
    //await ethereum.send('eth_requestAccounts')

    web3 = new Web3(web3Provider);
    accounts = await ethereum.request({ method: "eth_accounts" });
    // contract = await deployTutorialToken(); // temporary disable
    console.log(accounts);
    // ethereum
    //       .request({
    //         method: "eth_getEncryptionPublicKey",
    //         params: [accounts[0]], // you must have access to the specified account
    //       })
    //       .then((publicKey: string) => {
    //         console.log(publicKey);
    //       });

    this.setState({
      contract,
      connectedTo: true,
      user: { publicAddress: accounts[0], name: "", jwtToken: "" },
      // loggedIn: true, // testing purposes only
    });
  }

  onLogin(u: UserAuth) {
    console.log("login complete");
    this.setState({ user: u, loggedIn: true });
  }

  render() {
    const home = <HomePage user={this.state.user} />;
    const login = (
      <LoginPage callback={this.onLogin.bind(this)} user={this.state.user} />
    );
    const dashboard = <DashboardPage user={this.state.user} />;
    const requestor = <RequestorPage user={this.state.user} />;
    const writer = <WriterPage user={this.state.user} />;
    const recipient = <RecipientPage user={this.state.user} />;

    return (
      <div>
        <Nav
          user={this.state.user}
          connectedTo={this.state.connectedTo}
          onConnect={this.onConnect}
          loggedIn={this.state.loggedIn}
        />
        {this.state.loggedIn ? <Redirect to="/dashboard" /> : null}
        <div>
          <Route exact path={ROUTES.HOME} render={() => home} />
          <Route exact path={ROUTES.LOGIN} render={() => login} />
          <Route exact path={ROUTES.DASHBOARD} render={() => dashboard} />
          <Route exact path={ROUTES.REQUESTOR} render={() => requestor} />
          <Route exact path={ROUTES.WRITER} render={() => writer} />
          <Route exact path={ROUTES.RECIPIENT} render={() => recipient} />
        </div>
      </div>
    );
  }
}
export default App;
