import React from 'react';

class BurnForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.burn(this.message.value, this.amount.value);
  }

  burn(message, amount) {
    let burn = {
      message: message,
      burnerAddress: this.props.selectedAddress,
      burntAmount: amount
    };

    this.props.contract.methods.burn(burn.message).send({
      from: burn.burnerAddress,
      value: burn.burntAmount,
      gas: 200000
    }).on('transactionHash', hash => {
      this.props.addBurn(burn, hash);
    });
  }

  renderForm() {
    return (
      <form onSubmit={this.handleSubmit} >
        <div className="form-group">
          <input type="text" placeholder="amount of ethereum" ref={(input) => this.amount = input} />
        </div>
        <div className="form-group">
          <textarea type="text" placeholder="message" ref={(input) => this.message = input} />
        </div>
        <div className="form-group">
          <input className="burn-button lime" type="submit" value="burn it" />
        </div>
      </form>
    );
  }

  renderGetMetaMask() {
    return (
      <div>
        <p>Metamask is not installed</p>
      </div>
    );
  }

  renderNoAccounts() {
    return (
      <div>
        <p>You need to create an account in Metamask before continuing.</p>
      </div>
    );
  }

  render() {
    console.log("selectedAddress: ", this.props.selectedAddress);
    if(!this.props.isMetaMask) {
      return this.renderGetMetaMask();
    } else if(this.props.selectedAddress === undefined) {
      return this.renderNoAccounts();
    } else {
      return this.renderForm();
    }
  }
}

export default BurnForm;
