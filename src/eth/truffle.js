var HDWalletProvider = require("truffle-hdwallet-provider");
var prompt = require('prompt-sync')();
let mnemonic;
let infura_apikey;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    ropsten: {
      provider: function() {
        mnemonic = mnemonic || prompt("Enter your mnemonic for the ropsten test net");
        infura_apikey = infura_apikey || prompt("Enter your infura api key for the ropsten test net");

        console.log("Using mnemonic: ", mnemonic);
        console.log("Using infura_apikey: ", infura_apikey);
        
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infura_apikey);
      },
      network_id: 3,
      gas: 4600000
    }
  }
};
