//export {}; // Gets rid of `Cannot redeclare block-scoped variable` errors

const Assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3New= new Web3(ganache.provider());
const json = require("./../build/contracts/TutorialToken.json");

let accounts: any;
let exampleToken: any;
let manager: any;
const inter = json["abi"];
const bytecode = json["bytecode"];

/*
If you wanted to not keep the unit test idempotent then you could use a single deploy on the contract in
tests unit tests that point to new smart contracts is actually preferable for testing because you have clean contract state
beforeAll(async () => {
	// This function is not being recognized when I try it
})
*/

beforeEach(async () => {
  accounts = await web3New.eth.getAccounts();
  manager = accounts[0];
  exampleToken = await new web3New.eth.Contract(inter)
    .deploy({ data: bytecode })
    .send({ from: manager, gas: "4000000" });
});

describe("ExampleToken", () => {

  it("deploys a contract", async () => {
    // just a note this would now be owner
    const exampleTokenManager = await exampleToken.methods.wallet.call();
    assert.equal(
      manager,
      exampleTokenManager,
      "The manager is the one who launches the smart contract."
    );
  });

  it("can exchange token for ETC", async () => {
    let buyer = accounts[1];
    // this can probably be simplified to just rate.call()
    let startingRate = await exampleToken.rate.call();
    // NOTE the methods might have changed due to the upstream refactor
    await exampleToken.methods
      .buyExampleToken(buyer)
      .send({ value: web3New.utils.toWei("3", "ether") });

    // weiraised replaced with balance
    //weiRaisedByContract = await exampleToken.weiRaised.call();

    // assert.equal(
    //   weiRaisedByContract,
    //   web3.utils.toWei("3", "ether"),
    //   "The correct amount is transferred to the wallet manager."
    // );
    let endingRate = await exampleToken.methods.rate.call();
    let endingSupply = await exampleToken.methods.totalSupply().call();
    assert.equal(
      endingRate,
      startingRate * endingSupply,
      "The new exchange rate for the example token is correctly reflected."
    );
  });
});