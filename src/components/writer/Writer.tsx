//import { BigNumber } from "bignumber.js";
// import { TutorialToken } from "./contract-types/TutorialToken"; // import is correct
import React from 'react';
import './Writer.css';


const Web3 = require('web3');
export let web3: typeof Web3;



class Writer extends React.Component {
  render() {
    return (
    	<div className="writer-wrap">
        This is the component for the person writing the letter
	  	</div>
    );
  }
}
export default Writer;


