var BurnContract = artifacts.require("./BurnContract.sol");

module.exports = function(deployer) {
  deployer.deploy(BurnContract);
};
