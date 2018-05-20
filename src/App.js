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
    window.web3 = this.web3;
    

    this.web3.eth.getAccounts().then(accounts => {
      this.web3.eth.defaultAccount = accounts[0]
    });

    console.log(process.env)
    const addr = process.env.REACT_APP_CONTRACT_ADDRESS;
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

  addBurn(burn) {
    const newBurn = {
      message: burn.message,
      burnerAddress: burn.burnerAddress,
      burntAmount: burn.burntAmount
    };

    const burns = this.state.burns.slice();
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

  totalBurnt() {
    return this.state.burns.reduce(function(sum, burn){ return sum + parseInt(burn.burntAmount)}, 0);
  }

  largestBurn() {
    return Math.max(...this.state.burns.map(burn => parseInt(burn.burntAmount)));
  }

  render() {
    return (
      <div className="App">
        <h1>Burns</h1>
        <div className="burn-stats">
          <p>Number of burns: {this.state.burns.length}</p>
          <p>Total Burnt: {this.totalBurnt()}</p>
          <p>Largest Burn: {this.largestBurn()}</p>
        </div>
        <ul>
          {this.burns()}
        </ul>
        <BurnForm contract={this.contract} web3={this.web3}/>
      </div>
    );
  }
}

export default App;
