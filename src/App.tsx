import { BigNumber } from "bignumber.js";
import { expect } from "chai";
import { join } from "path";
import { TutorialToken } from "./contract-types/TutorialToken"; // import is correct
import { readFileSync } from "fs";
import React from 'react';
import ReactDOM from 'react-dom';
import TutorialTokenContractData from './contract-data/TutorialToken.json';

const Web3 = require('web3');
export let web3: typeof Web3;

export const GAS_LIMIT_STANDARD = 6000000;
export let accounts: string[];
let web3Provider;

export async function deployContract<T>(contractName: string, abi:any, code:any, ...args: any[]): Promise<T> {
  
  const Contract = new web3.eth.Contract(abi);
  const t = Contract.deploy({ arguments: args, data: code });

  return (await (t.send({
    from: accounts[0],
    gas: GAS_LIMIT_STANDARD,
  }) as any)) as T;
}

export async function deployTutorialToken(): Promise<TutorialToken> {
    return deployContract<TutorialToken>("TutorialToken",TutorialTokenContractData.abi,TutorialContractData.bytecode, 0);
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
    console.log("Contract: ");
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


