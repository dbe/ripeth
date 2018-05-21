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
        <div className="col-contents">
          <Burn burn={burn} key={i}/>
        </div>
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
    if(process.env.NODE_ENV !== 'development' && this.state.isMetaMask && this.state.networkVersion !== "3") {
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
          <BurnForm
            contract={this.contract}
            selectedAddress={this.state.selectedAddress}
            isMetaMask={this.state.isMetaMask}
            addBurn={this.addBurn.bind(this)}
          />
        </div>
      );
    }
  }

  renderFake() {
    return (
      <div className="row">
        <div className="col-md-3">
          <div className="inner">
            <div className="col-title">
              <h1>
                About
              </h1>
            </div>
            <div className="col-contents">
              Made by dream.eth for the giggles.
            </div>
            <div className="col-contents last">
              <p>Go ahead and burn it. No one will get it. I promise.</p>
              <p>Find the source code here</p>
              <p>At the moment, Ethereum is nothing but a parlor trick. A toy (Vitalik said it not me) So sometimes, you throw away toys.</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="inner">
            <div className="col-title lime">
              <h1>ETH.RIP</h1>
            </div>
            <div className="col-contents">
            ethereum smart contracts. what can we do with it? make tons of money ICOing or just burn it. We dont make any profits, we just want anarchy
            </div>
            <div className="col-contents last">

              <button type='button' id="burn-eth-button" className='btn lime burn-button' data-toggle="modal" data-target="#burnModal">burn eth</button>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="inner">
            <div className="col-title">
              <h1>Comments</h1>
            </div>
            {this.burns()}
          </div>
        </div>

        <div class="modal fade" id="burnModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">time to burn</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <BurnForm
                  contract={this.contract}
                  selectedAddress={this.state.selectedAddress}
                  isMetaMask={this.state.isMetaMask}
                  addBurn={this.addBurn.bind(this)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="App container">
        {this.renderFake()}
      </div>
    );
  }
}

export default App;
