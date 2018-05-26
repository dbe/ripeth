import React from 'react';
import $ from 'jquery';

class BurnForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.burn(this.amount.value, this.name.value, this.message.value);
  }

  burn(amount, name, message) {
    let burn = {
      message: message + ":" + name,
      burnerAddress: this.props.selectedAddress,
      burntAmount: this.props.toWei(amount, 'ether')
    };

    this.props.contract.methods.burn(burn.message).send({
      from: burn.burnerAddress,
      value: burn.burntAmount,
      gas: 200000
    }).on('transactionHash', hash => {
      this.props.addBurn(burn, hash);
      //TODO: Fix this
      // console.log($('#burn-form'))
      // $('#burn-form').modal('hide');
    });
  }

  renderForm() {
    return (
      <form id="burn-form" onSubmit={this.handleSubmit} >
        <div className="form-group">
          <input type="text" placeholder="amount of ethereum" ref={(input) => this.amount = input} />
        </div>
        <div className="form-group">
          <input type="text" placeholder="name..." ref={(input) => this.name = input} />
        </div>
        <div className="form-group">
          <textarea type="text" placeholder="message..." ref={(input) => this.message = input} />
        </div>
        <div className="form-group">
          <input className="burn-button lime" type="submit" value="burn it" />
        </div>
      </form>
    );
  }

  render() {
    return this.renderForm();
  }

}

export default BurnForm;
