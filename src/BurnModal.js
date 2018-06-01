import React from 'react';

import BurnForm from './BurnForm.js';

class BurnModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      confirmed: false
    }
  }

  render() {
    let [title, body] = this.getTitleAndBody();

    return (
      <div className="modal fade" id="burn-modal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title"> { title }</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              { body }
            </div>
          </div>
        </div>
      </div>
    );
  }

  getTitleAndBody() {
    if(!this.props.isMetaMask) {
      return [
        "Oops",
        this.renderNeedsMetamask()
      ];
    } else if(this.props.selectedAddress === undefined) {
      return [
        "Oops",
        this.renderNeedToLogin()
      ];
    } else if(this.props.networkVersion !== process.env.REACT_APP_TARGET_NETWORK) {
      return [
        "Oops",
        this.renderChangeNetwork()
      ]
    } else if(this.state.confirmed) {
      return [
        "time to burn",
        <BurnForm
          contract={this.props.contract}
          selectedAddress={this.props.selectedAddress}
          isMetaMask={this.props.isMetaMask}
          addBurn={this.props.addBurn}
          toWei={this.props.toWei}
        />
      ];
    } else {
      return [
        "Are you sure?",
        this.renderConfirmation()
      ];
    }
  }

  renderConfirmation() {
    return (
      <div>
        <p>Burning your ethereum means you will never get it back. You are quite literally throwing away your money. Check the <a href="#">source code</a></p>
        <button type='button' className='btn lime burn-button' data-toggle="modal" data-target="#burn-modal">close</button>
        <button type='button' className='btn lime burn-button' onClick={() => this.setState({confirmed: true})}>continue</button>
      </div>
    );
  }

  renderNeedsMetamask() {
    return (
      <div>
        <p className="modal-main-text">You will need to download <a href="https://metamask.io/" target="_">metamask</a> to burn ethereum</p>
        <button type='button' className='btn lime burn-button' data-toggle="modal" data-target="#burn-modal">ok</button>
      </div>
    );
  }

  renderNeedToLogin() {
    return (
      <div>
        <p className="modal-main-text">Login to Metamask and make sure you create at least one account.</p>
        <button type='button' className='btn lime burn-button' data-toggle="modal" data-target="#burn-modal">ok</button>
      </div>
    );
  }

  renderChangeNetwork() {
    return (
      <div>
        <p className="modal-main-text">you're not on the test network on metamask.</p>
        <p className="modal-main-text">Please select the Ropsten Test Network.</p>
        <button type='button' className='btn lime burn-button' data-toggle="modal" data-target="#burn-modal">ok</button>
      </div>
    );
  }
}

export default BurnModal;
