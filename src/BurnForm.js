import React from 'react';

class BurnForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      isMetaMask: this.props.web3.currentProvider.isMetaMask
    }

    if(this.state.isMetaMask) {
      let configStore = this.props.web3.currentProvider.publicConfigStore;
      configStore.on('update', this.updateState.bind(this));

      let configState = configStore.getState();
      this.state.selectedAddress = configState.selectedAddress;
      this.state.networkVersion = configState.networkVersion;
    }
  }

  updateState(config) {
    this.setState({
      selectedAddress: config.selectedAddress,
      networkVersion: config.networkVersion
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.burn(this.message.value, this.amount.value);
  }

  burn(message, amount) {
    this.props.contract.methods.burn(message).send({
      from: this.state.selectedAccount,
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
    if(this.state.isMetaMask) {
      if(this.state.selectedAddress === undefined) {
        return this.renderNoAccounts();
      } else {
        return this.renderForm();
      }
    } else {
      return this.renderGetMetaMask();
    }
  }
}

export default BurnForm;
