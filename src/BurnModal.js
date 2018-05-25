import React from 'react';

import BurnForm from './BurnForm.js';

class BurnModal extends React.Component {
  constructor(props) {
    super(props);
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
    } else {
      if(this.props.networkVersion !== process.env.REACT_APP_TARGET_NETWORK) {
        return [
          "Oops",
          this.renderChangeNetwork()
        ]
      } else {
        return [
          "time to burn",
          <BurnForm
            contract={this.props.contract}
            selectedAddress={this.props.selectedAddress}
            isMetaMask={this.props.isMetaMask}
            addBurn={this.props.addBurn}
          />
        ];
      }
    }
  }

  renderNeedsMetamask() {
    return (
      <div>
        <p className="modal-main-text">You will need to download <a href="https://metamask.io/" target="_">metamask</a> to burn ethereum</p>
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
