import React, { Component } from 'react';
import Web3 from 'web3';
import { BigNumber } from 'bignumber.js';

import './App.css';
import Burn from './Burn.js';
import BurnContract from './eth/build/contracts/BurnContract.json';
import BurnModal from './BurnModal';
import Ticker from './Ticker';

class App extends Component {
  constructor(props) {
    super(props);

    this.buildBurn = this.buildBurn.bind(this);
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
    const promises = [];
    let that = this;

    this.contract.methods.burnCount().call().then(count => {
      for(let i = 0; i < count; i++) {
        promises.push(this.contract.methods.burns(i).call())
      }

      Promise.all(promises).then(rawBurns => {
        let burns = rawBurns.map(that.buildBurn);
        that.setState({burns});
      });
    });
  }

  //Takes a burn result from web3, parses the name, and stores the minimal amount of info required.
  buildBurn(rawBurn) {
    const [message, name] = this.parseBurnMessage(rawBurn.message);

    return {
      message: message,
      name: name,
      burnerAddress: rawBurn.burnerAddress,
      burntAmount: rawBurn.burntAmount
    };
  }

  //Include transactionHash if you are adding burn due to a user triggered burn.
  //This will ensure the element is not rendered again when picked up from the event feed.
  addBurn(rawBurn, transactionHash) {
    if(transactionHash !== undefined) {
      this.alreadyRendered[transactionHash] = true;
    }

    let newBurn = this.buildBurn(rawBurn);

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
    if(!data) {
      return;
    }

    if(this.alreadyRendered[data.transactionHash]) {
      this.alreadyRendered[data.transactionHash] = undefined;
    } else {
      this.addBurn(data.returnValues);
    }
  }

  burns() {
    return this.state.burns.slice().reverse().map((burn, i) => {
      return (
        <div className="col-contents" key={i}>
          <Burn burn={burn} fromWei={this.web3.utils.fromWei}/>
        </div>
      );
    });
  }

  topBurns() {
    let burns = this.state.burns.slice();
    burns.sort((a, b) => b.burntAmount - a.burntAmount);
    return burns.slice(0, 5);
  }

  totalBurnt() {
    let wei = this.state.burns.reduce(function(sum, burn) {
      return sum.plus(burn.burntAmount);
    }, new BigNumber(0));

    return this.web3.utils.fromWei(wei.toString(), 'ether');
  }

  renderAbout() {
    return (
      <div>
        <div className="col-title">
          <h1>ABOUT</h1>
        </div>
        <div className="inner">
          <div className="col-contents q-n-a">
            <p className="question">What in the hell am I looking at?</p>
            <p className="answer">This is a fire pit, designed for one purpose: To burn your money.</p>
            <p className="question">And why would I want to do that?</p>
            <p className="answer">Why not? You at least get to attach a message to forever memorialize your great deed.</p>
            <p className="question">So, I send you money and you just steal it?</p>
            <p className="answer">Nope, using smart contracts, the money is locked up forever. No one can get it no matter how badly they want to. Not you, not me, not the government. No one.</p>
            <p className="answer">
              {'In fact, please go verify this for yourself, we need more healthy skepticism in the crypto world: '}
              <a href="https://ropsten.etherscan.io/address/0x401c415c843681de15c0909e225b14e545762fcb#code" target="_">Source Code</a>
            </p>

          </div>

          <div className="col-contents last">
            <p>
              Made by dream
            </p>
          </div>
        </div>
      </div>
    );
  }

  renderFire() {
    return (
      <div id="center-inner" className="inner">
        <div className="col-title" id="eth-rip-title">
          <h1>ETH.RIP/ </h1>
          <div id="total-burnt-div">
            <p>total burnt:</p>
            <p>{this.totalBurnt()} eth</p>
          </div>
        </div>
        <div className="col-contents last">
          <button type='button' id="burn-eth-button" className='btn lime burn-button' data-toggle="modal" data-target="#burn-modal">burn eth</button>
        </div>
        <div id="fire-wrapper">
          <img id="fire-gif" src="/fire.gif" alt="fire"/>
          <img id="coin-pile-png" src="/coin-pile.png" alt="coin-pile" />
        </div>
      </div>
    );
  }

  renderComments() {
    let content = (this.state.isMetaMask && (this.state.networkVersion !== process.env.REACT_APP_TARGET_NETWORK)) ?
      <p>Please connect to the Ropsten Test Network to load burns</p> :
      this.burns();

    return (
      <div>
        <div className="col-title">
          <h1>COMMENTS</h1>
        </div>
        <div className="inner">
          <div className="col-contents last">
            {content}
          </div>
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
          <Ticker burns={this.topBurns()} fromWei={this.web3.utils.fromWei} />
        </div>
        <div className="row" id="main-content">

          <div className="col-lg-3 order-2 order-lg-1">
            { this.renderAbout() }
          </div>

          <div className="col-lg-6 order-1 order-lg-2">
            { this.renderFire() }
          </div>

          <div className="col-lg-3 order-last">
            { this.renderComments() }
          </div>

          { this.renderModal() }
        </div>
      </div>
    );
  }
}

export default App;
