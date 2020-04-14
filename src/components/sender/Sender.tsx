//import { BigNumber } from "bignumber.js";
// import { TutorialToken } from "./contract-types/TutorialToken"; // import is correct
import React from 'react';
import './Sender.css';


const Web3 = require('web3');
export let web3: typeof Web3;



class Sender extends React.Component {
  render() {
    return (
    	<div className="sender-wrap">
        This is the component for the person sending the letter
	  	</div>
    );
  }
}
export default Sender;