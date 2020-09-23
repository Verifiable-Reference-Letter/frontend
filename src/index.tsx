import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/styles/app.scss";
import { BigNumber } from "bignumber.js";
//import * as TruffleContracts from ".";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";

// const Web3 = require('web3');

// let web3: typeof Web3
// let web3Provider;
//web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545')); // was 9545 before

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById("root")
);
