import { BigNumber } from "bignumber.js";
import { TutorialToken } from "./contract-types/TutorialToken"; // import is correct
import React from 'react';
import TutorialTokenContractData from './contract-data/TutorialToken.json';

const Web3 = require('web3');
export let web3: typeof Web3;

export const GAS_LIMIT_STANDARD = 6000000;
export let accounts: string[];
let web3Provider;

export async function deployContract<T>(contractName: string, abi:any, code:any, ...args: any[]): Promise<T> {
  
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
    return deployContract<TutorialToken>("TutorialToken", TutorialTokenContractData.abi, TutorialTokenContractData.bytecode, 0);
}


class App extends React.Component {
  render() {
    if (typeof web3 !== 'undefined') {
      web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      web3Provider = new Web3.providers.HttpProvider('https://services.jade.builders/core-geth/kotti/1.11.2');
      web3 = new Web3(web3Provider);
    }
    console.log(web3.currentProvider);

    const contract = deployTutorialToken();
    console.log("Contract2: ");
    console.log(contract);
    return (
    	<div>
        <h1><b><i>Send ETC for Tutorial Token</i></b></h1>
	  		<p>Amount ETC <input /></p>
	  		<button>Purchase</button>
	  	</div>
    );
  }
}
export default App;


