import React, { Component } from 'react';

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
      from: this.props.web3.eth.defaultAccount,
      value: amount,
      gas: 200000
    })
  }

  render() {
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
}

export default BurnForm;
