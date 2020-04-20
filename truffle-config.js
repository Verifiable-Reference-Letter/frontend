const Web3 = require("web3");
// require("ts-node/register");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545, // was 7545 before
      network_id: "*", // Match any network id
    },
    kotti: {
      network_id: "*",
      provider: new Web3.providers.HttpProvider('https://services.jade.builders/core-geth/kotti/1.11.2')
    }
  },
  // Note adjustment here where we specify the contract build directory to output in source
  contracts_build_directory: "./src/contract-data",
  test_file_extension_regexp: /.*\.ts$/
};

