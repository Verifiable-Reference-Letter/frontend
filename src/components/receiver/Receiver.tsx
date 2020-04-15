//import { BigNumber } from "bignumber.js";
// import { TutorialToken } from "./contract-types/TutorialToken"; // import is correct
import React from 'react';
import './Receiver.css';


const Web3 = require('web3');
export let web3: typeof Web3;



class Receiver extends React.Component {
  render() {
    return (
    	<div className="receiver-wrap">
        This is the component for the person writing the letter
	  	</div>
    );
  }
}
export default Receiver;