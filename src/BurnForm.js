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

  async burn(message, amount) {
    let accounts = await this.props.web3.eth.getAccounts();

    this.props.contract.methods.burn(message).send({
      from: accounts[0],
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
