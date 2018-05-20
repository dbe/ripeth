var BurnContract = artifacts.require("./BurnContract.sol");

async function weiSpentOnGas(result) {
  const tx = await web3.eth.getTransaction(result.receipt.transactionHash);
  return result.receipt.gasUsed * tx.gasPrice;
}

contract('Burn', function(accounts) {
  it("Works", async function() {
    const acctStartingBalance = web3.eth.getBalance(accounts[0]);

    const instance = await BurnContract.deployed();
    const cStartingBalance = web3.eth.getBalance(instance.address);

    let burnEventResult;
    BurnEvent = instance.BurnEvent(null,{fromBlock: 0, toBlock: 'latest'}, (error, result) => {
      burnEventResult = result;
    });

    const result = await instance.burn("Fuck me! - Donald Trump", {from: accounts[0], value: 100});
    const spentOnGas = await weiSpentOnGas(result);

    const acctEndingBalance = web3.eth.getBalance(accounts[0]);
    const cEndingBalance = web3.eth.getBalance(instance.address);

    const burn = await instance.burns.call(0);
    const burnCount = await instance.burnCount.call();

    assert.equal(burn[0], accounts[0], "Correct account was not saved.");
    assert.equal(burn[1], "Fuck me! - Donald Trump", "Correct message was not saved.");
    assert.equal(burn[2], 100, "Correct wei amount was not recorded.");

    assert.equal(burnEventResult.args.burnerAddress, accounts[0], "Event fail")
    assert.equal(burnEventResult.args.message, "Fuck me! - Donald Trump", "Event fail")
    assert.equal(burnEventResult.args.burntAmount, 100, "Event fail")

    assert.equal(cEndingBalance - cStartingBalance, 100, "Correct amount was not actually saved in contract");
    assert.equal(acctStartingBalance.minus(acctEndingBalance), 100 + spentOnGas, "Total spent gas was not correct");

    BurnEvent.stopWatching();
  });
});
