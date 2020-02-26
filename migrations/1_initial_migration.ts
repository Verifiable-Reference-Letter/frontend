const Migrations = artifacts.require("Migrations");
const TutorialToken = artifacts.require("ERC20");
const CounterContract = artifacts.require("CounterContract");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(TutorialToken);
  deployer.deploy(CounterContract);
} as Truffle.Migration;

// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {};
