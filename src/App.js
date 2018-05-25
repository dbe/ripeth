import React, { Component } from 'react';
import Web3 from 'web3';
import { BigNumber } from 'bignumber.js';

import './App.css';
import Burn from './Burn.js';
import BurnContract from './eth/build/contracts/BurnContract.json';
import BurnModal from './BurnModal';

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
    this.alreadyRendered = {};
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

  //Include transactionHash if you are adding burn due to a user triggered burn.
  //This will ensure the element is not rendered again when picked up from the event feed.
  addBurn(burn, transactionHash) {
    if(transactionHash !== undefined) {
      this.alreadyRendered[transactionHash] = true;
    }

    const [message, name] = this.parseBurnMessage(burn.message);

    const newBurn = {
      message: message,
      name: name,
      burnerAddress: burn.burnerAddress,
      burntAmount: burn.burntAmount
    };

    const burns = this.state.burns.slice();
    burns.push(newBurn);
    this.setState({burns});
  }

  //TODO: This is a bit messy as it handles multiple edge cases.
  // Try to simplify by fixing the data side of thigns, and potentially factor this out
  parseBurnMessage(message) {
    const i = message.lastIndexOf(':');

    if(i < 0) {
      return [message, "anon"];
    } else if(i === message.length - 1) {
      return [message.substring(0, i), "anon"];
    } else {
      return [message.substring(0, i), message.substring(i + 1)];
    }
  }

  handleBurnEvent(error, data) {
    if(data === undefined) {
      return;
    }

    if(this.alreadyRendered[data.transactionHash]) {
      this.alreadyRendered[data.transactionHash] = undefined;
    } else {
      this.addBurn(data.returnValues);
    }
  }

  burns() {
    return this.state.burns.reverse().map((burn, i) => {
      return (
        <div className="col-contents" key={i}>
          <Burn burn={burn} fromWei={this.web3.utils.fromWei}/>
        </div>
      );
    });
  }

  totalBurnt() {
    let wei = this.state.burns.reduce(function(sum, burn) {
      return sum.plus(burn.burntAmount);
    }, new BigNumber(0));

    return this.web3.utils.fromWei(wei.toString(), 'ether');
  }

  renderAbout() {
    return (
      <div className="inner">
        <div className="col-title">
          <h1>ABOUT</h1>
        </div>
        <div className="col-contents">
          <p>
            Made by dream.eth for the giggles.
          </p>
        </div>
        <div className="col-contents last">
          <p>Go ahead and burn it. No one will get it. I promise.</p>
          <p>At the moment, Ethereum is nothing but a parlor trick. A toy (Vitalik said it not me) So sometimes, you throw away toys.</p>
        </div>
      </div>
    );
  }

  renderFire() {
    return (
      <div className="inner">
        <div className="col-title" id="eth-rip-title">
          <h1>ETH.RIP //</h1>
        </div>
        <div className="col-contents">
          <p>
            ethereum smart contracts. what can we do with it? make tons of money ICOing or just burn it. We dont make any profits, we just want anarchy
          </p>
        </div>
        <div className="col-contents last">
          <p>
            Total Burnt: { this.totalBurnt() } eth
          </p>

          <button type='button' id="burn-eth-button" className='btn lime burn-button' data-toggle="modal" data-target="#burn-modal">burn eth</button>
        </div>
      </div>
    );
  }

  renderComments() {
    let content = (this.state.isMetaMask && (this.state.networkVersion !== process.env.REACT_APP_TARGET_NETWORK)) ?
      <p>Please connect to the Ropsten Test Network to load burns</p> :
      this.burns();

    return (
      <div className="inner">
        <div className="col-title">
          <h1>COMMENTS</h1>
        </div>
        <div className="col-contents last">
          {content}
        </div>
      </div>
    );
  }

  renderModal() {
    return (
      <BurnModal
        contract={this.contract}
        selectedAddress={this.state.selectedAddress}
        isMetaMask={this.state.isMetaMask}
        networkVersion={this.state.networkVersion}
        addBurn={this.addBurn.bind(this)}
        toWei={this.web3.utils.toWei}
      />
    );
  }

  render() {
    return (
      <div className="App container-fluid">
        <div className="row">

          <div className="col-md-3 order-2 order-md-1">
            { this.renderAbout() }
          </div>

          <div className="col-md-6 order-1 order-md-2">
            { this.renderFire() }
          </div>

          <div className="col-md-3 order-last">
            { this.renderComments() }
          </div>

          { this.renderModal() }
        </div>
      </div>
    );
  }
}

export default App;
