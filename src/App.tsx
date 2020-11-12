import { TutorialToken } from "./contract-types/TutorialToken"; // import is correct
import React, { FunctionComponent } from "react";
//import { RouteComponentProps } from "@reach/router";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  Switch,
  RouteComponentProps,
  withRouter,
} from "react-router-dom";
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
import "./App.css";
import * as ROUTES from "./routes";

import Web3 from "web3";
export let web3: Web3;
export let ethereum: any;

enum AuthRoutes {
  dashboard = "/dashboard",
  requestor = "/requestor",
  writer = "/writer",
  recipient = "/recipient",
}

enum NonAuthRoutes {
  home = "/",
  login = "/login",
}

interface Props {
  Component: React.FC<RouteComponentProps>;
  path: string;
  exact?: boolean;
  authed: boolean;
}

const AuthRoute = ({
  Component,
  path,
  exact = false,
  authed,
}: Props): JSX.Element => {
  const isAuthed = authed;
  const message = "Login to view this page";
  return (
    <Route
      exact={exact}
      path={path}
      render={(props: RouteComponentProps) =>
        isAuthed ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: NonAuthRoutes.login,
            }}
          />
        )
      }
    />
  );
};

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

type MyProps = {} & RouteComponentProps;
type MyState = {
  windowEthereum: boolean;
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
      windowEthereum: true,
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

  componentWillMount() {
    this.onConnect();
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
    console.log("onConnect");
    const ethereum = (window as any).ethereum;
    if (ethereum) {
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

      let u = window.localStorage.getItem("dappUser");
      let user = { publicAddress: accounts[0], name: "", jwtToken: "" };

      if (u != null) {
        let t = JSON.parse(u);

        // need to check if different account, else do not set JWT
        if (user.publicAddress === t.publicAddress) {
          user = {
            publicAddress: t.publicAddress,
            name: t.name,
            jwtToken: t.jwtToken,
          };
        }
      }

      console.log("User from storage: " + user.publicAddress);
      this.setState({
        contract,
        connectedTo: true,
        user: user,
        // loggedIn: true, // testing purposes only
      });
      
    } else {
      alert(
        "Please download the Metamask browser extension (supported on Chrome & Firefox)"
      );
      this.setState({ windowEthereum: false });
      this.props.history.push(ROUTES.METAMASK_TUTORIAL);
    }
  }

  onLogin(u: UserAuth) {
    console.log("login complete");
    this.setState({ user: u, loggedIn: true });
    this.props.history.push(ROUTES.DASHBOARD);
    window.localStorage.setItem("dappUser", JSON.stringify(u));
  }

  render() {
    const { windowEthereum, connectedTo, loggedIn, user } = this.state;
    const home = <HomePage user={user} />;
    const login = <LoginPage callback={this.onLogin.bind(this)} user={user} />;
    const dashboard = <DashboardPage user={user} />;
    const requestor = <RequestorPage user={user} />;
    const writer = <WriterPage user={user} />;
    const recipient = <RecipientPage user={user} />;

    return (
      <div>
        <Nav
          user={user}
          connectedTo={connectedTo}
          onConnect={this.onConnect}
          loggedIn={loggedIn}
        />
        {/* {loggedIn ? <Redirect to={ROUTES.DASHBOARD} /> : null} */}
        {/* {!windowEthereum ? <Redirect to={ROUTES.METAMASK_TUTORIAL} /> : null} */}
        <div className="application-body">
          <Switch>
            <Route
              path={NonAuthRoutes.login}
              authed={loggedIn}
              component={() => login}
            />
            <Route
              exact
              path={NonAuthRoutes.home}
              authed={loggedIn}
              component={() => home}
            />
            <AuthRoute
              path={AuthRoutes.requestor}
              authed={loggedIn}
              Component={() => requestor}
            />
            <AuthRoute
              path={AuthRoutes.writer}
              authed={loggedIn}
              Component={() => writer}
            />
            <AuthRoute
              path={AuthRoutes.recipient}
              authed={loggedIn}
              Component={() => recipient}
            />
            <AuthRoute
              path={AuthRoutes.dashboard}
              authed={loggedIn}
              Component={() => dashboard}
            />
          </Switch>
        </div>
      </div>
    );
  }
}
export default withRouter(App);
