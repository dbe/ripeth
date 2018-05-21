import React, { Component } from 'react';
import Web3 from 'web3';

import './App.css';
import Burn from './Burn.js';
import BurnForm from './BurnForm.js';
import BurnContract from './eth/build/contracts/BurnContract.json';

class App extends Component {
  constructor(props) {
    super(props);

    this.web3 = new Web3(Web3.givenProvider || process.env.REACT_APP_FALLBACK_PROVIDER);
    this.contract = new this.web3.eth.Contract(BurnContract.abi, process.env.REACT_APP_CONTRACT_ADDRESS);

    this.state = {
      isMetaMask: this.web3.currentProvider.isMetaMask,
      burns: []
    }

    if(this.state.isMetaMask) {
      let configStore = this.web3.currentProvider.publicConfigStore;
      configStore.on('update', this.updateMetaMaskState.bind(this));

      this.state.selectedAddress = configStore.getState().selectedAddress;
      this.state.networkVersion = configStore.getState().networkVersion;
    }


    this.setupEventListener();
    this.initBurns();
  }

  updateMetaMaskState(config) {
    this.setState({
      selectedAddress: config.selectedAddress,
      networkVersion: config.networkVersion
    });
  }

  setupEventListener() {
    let web3 = new Web3(process.env.REACT_APP_WS_ADDRESS);
    let contract = new web3.eth.Contract(BurnContract.abi, process.env.REACT_APP_CONTRACT_ADDRESS);
    contract.events.BurnEvent({}, this.handleBurnEvent.bind(this));
  }

  initBurns() {
    this.contract.methods.burnCount().call().then(count => {
      for(let i = 0; i < count; i++) {
        this.contract.methods.burns(i).call().then(data => {
          this.addBurn(data);
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
    if(data && data.returnValues) {
      this.addBurn(data.returnValues);
    }
  }

  burns() {
    return this.state.burns.map((burn, i) => {
      return (
        <Burn burn={burn} key={i}/>
      );
    });
  }

  totalBurnt() {
    return this.state.burns.reduce(function(sum, burn){ return sum + parseInt(burn.burntAmount, 10)}, 0);
  }

  largestBurn() {
    return Math.max(...this.state.burns.map(burn => parseInt(burn.burntAmount, 10)));
  }

  renderPage() {
    if(this.state.isMetaMask && this.state.networkVersion !== "3") {
      return (
        <p>Please switch to the testnet</p>
      );
    } else {
      return (
        <div>
          <h1>Burns</h1>
          <div className="burn-stats">
            <p>Number of burns: {this.state.burns.length}</p>
            <p>Total Burnt: {this.totalBurnt()}</p>
            <p>Largest Burn: {this.largestBurn()}</p>
          </div>
          <ul>
            {this.burns()}
          </ul>
          <BurnForm contract={this.contract} web3={this.web3} selectedAddress={this.state.selectedAddress} isMetaMask={this.state.isMetaMask} />
        </div>
      );
    }
  }

  render() {
    return (
      <div className="App">
        {this.renderPage()}
      </div>
    );
  }
}

export default App;
