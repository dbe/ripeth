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
    this.props.contract.methods.burn(message).send({
      from: this.props.selectedAddress,
      value: amount,
      gas: 200000
    })
  }

  renderForm() {
    return (
      <form onSubmit={this.handleSubmit} >
        <label>Message:</label>
        <input type="text" ref={(input) => this.message = input} />

        <label>Amount:</label>
        <input type="text" ref={(input) => this.amount = input} />
        <input type="submit" value="Submit" />
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
