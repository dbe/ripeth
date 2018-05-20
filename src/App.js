import React, { Component } from 'react';
import Web3 from 'web3';

import './App.css';
import Burn from './Burn.js';
import BurnForm from './BurnForm.js';
import BurnContract from './eth/build/contracts/BurnContract.json';

class App extends Component {
  constructor(props) {
    super(props);

    this.web3 = new Web3(Web3.givenProvider);

    this.web3.eth.getAccounts().then(accounts => {
      this.web3.eth.defaultAccount = accounts[0]
    });

    const addr = "0xAed626f1F5EA8D0784918b8734D9293fd7Df684d";
    this.contract = new this.web3.eth.Contract(BurnContract.abi, addr);
    window.contract = this.contract;

    let ganache = new Web3('ws://localhost:7545');
    let ganacheContract = new ganache.eth.Contract(BurnContract.abi, addr);
    ganacheContract.events.BurnEvent({}, this.handleBurnEvent.bind(this));

    this.initBurns();

    this.state = {
      burns: []
    };
  }

  initBurns() {
    this.contract.methods.burnCount().call().then(count => {
      for(let i = 0; i < count; i++) {
        this.contract.methods.burns(i).call().then(data => {
          this.addBurn(data);
          console.log(`data for i: ${i} is:`);
          console.log(data);
        });
      }
    });
  }

  addBurn(result) {
    let newBurn = {
      message: result.message,
      burnerAddress: result.burnerAddress,
      burntAmount: result.burntAmount
    };

    let burns = this.state.burns.slice();
    burns.push(newBurn);
    this.setState({burns});
  }

  handleBurnEvent(error, data) {
    this.addBurn(data.returnValues);
  }

  burns() {
    return this.state.burns.map(burn => {
      return (
        <Burn burn={burn} />
      );
    });
  }

  render() {
    return (
      <div className="App">
        <h1>Burns</h1>
        <ul>
          {this.burns()}
        </ul>
        <BurnForm contract={this.contract} web3={this.web3}/>
      </div>
    );
  }
}

export default App;
