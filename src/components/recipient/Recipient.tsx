//import { BigNumber } from "bignumber.js";
// import { TutorialToken } from "./contract-types/TutorialToken"; // import is correct
import React from 'react';
import './Recipient.css';


const Web3 = require('web3');
export let web3: typeof Web3;



class Recipient extends React.Component {
  render() {
    return (
    	<div className="recipient-wrap">
        This is the component for the person receiving the letter
	  	</div>
    );
  }
}
export default Recipient;