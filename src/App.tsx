import { BigNumber } from "bignumber.js";
import { TutorialToken } from "./contract-types/TutorialToken"; // import is correct
import React from 'react';
import TutorialTokenContractData from './contract-data/TutorialToken.json';
import BN from "bn.js";

const Web3 = require('web3');
export let web3: typeof Web3;

export const GAS_LIMIT_STANDARD = 6000000;
export let accounts: string[];
let web3Provider;
let contract: any;

export async function deployContract<T>(contractName: string, abi:any, code:any, ...args: any[]): Promise<T> {
  
  //const networkId = await web3.eth.net.getId();
  //const deployedAddress = abi.networks[networkId].address;
  const Contract = new web3.eth.Contract(abi);
  console.log("Contract1: ");
  console.log(Contract);
  const t =  await Contract.deploy({ data: code });

  const accounts = await web3.eth.getAccounts();

  console.log("Accounts: ");
  console.log(accounts);


  // return (await (t.send({
  //   from: accounts[0],
  //   gas: GAS_LIMIT_STANDARD,
  // }) as any)) as T;
  return t;
}

export function deployTutorialToken(): Promise<TutorialToken> {
    var contract = deployContract<TutorialToken>("TutorialToken", TutorialTokenContractData.abi, TutorialTokenContractData.bytecode, 0);
    console.log("Contract from innner deploy tutorial token method: " + contract);
    return contract;
}

type MyProps = {};
type MyState = {
  numErcBeingTraded: number
  //contract: object
};
class App extends React.Component<MyProps, MyState> {
  constructor(props: any) {
    super(props);
    this.state = {
      numErcBeingTraded: 0
      //contract: {}
    };

    //this.handleErcInputChange = this.handleErcInputChange.bind(this);
  }

  handleErcInputChange(event: any) {
    this.setState({ 
      numErcBeingTraded: event.target.value 
    });
    console.log("Num of ERC wanted to trade: " + this.state.numErcBeingTraded);
    //var rate = this.state.contract.rate().call();
    var numErc = new BN(this.state.numErcBeingTraded);
    //var numTokens = rate.mul(numErc);
    //console.log("Num of Tutorial Tokens you can receive: " + numTokens.toString());
  }

  async componentDidMount() {
    // TODO: Do all this stuff once onComponentDidMount
    // Same with all my async shit
    if (typeof web3 !== 'undefined') {
      web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      web3Provider = new Web3.providers.HttpProvider('https://services.jade.builders/core-geth/kotti/1.11.2');
      web3 = new Web3(web3Provider);
    }
    console.log(web3.currentProvider);

    contract = await deployTutorialToken();
    var contractMethods = contract._parent.methods;
    console.dir(contract);
    console.log("Contract deploy address: " + contract._parent.options.address);
    //console.log("Contract called from method: " + contract);
    //console.log("Contract calling methods.rate().call(): " + contract.methods.rate().call());
    //console.log("Contract calling .methods: " + contract.rate().call());
    console.log("Contract calling _parent methods: " + (await contract._parent.methods.rate().call()));
  }

  render() {  

    return (
    	<div>
        <h1><b><i>Send ETC for Tutorial Token</i></b></h1>
	  		<p>Amount ETC <input value={this.state.numErcBeingTraded} onChange={e => this.handleErcInputChange(e) }/></p>
	  		<button>Purchase</button>
	  	</div>
    );
  }
}
export default App;


