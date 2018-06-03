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
    let form = $("#burn-form")[0];

    if(!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    let burn = {
      message: message + ":" + name,
      burnerAddress: this.props.selectedAddress,
      burntAmount: this.props.toWei(amount, 'ether')
    };

    let transaction = this.props.contract.methods.burn(burn.message)
    transaction.estimateGas({
      from: burn.burnerAddress,
      value: burn.burntAmount
    }).then(gasEstimate => {
      transaction.send({
        from: burn.burnerAddress,
        value: burn.burntAmount,
        gas: gasEstimate
      }).on('transactionHash', hash => {
        this.props.addBurn(burn, hash);
        form.reset();
        $('#close-modal').click();
      });
    });
  }

  renderForm() {
    return (
      <form id="burn-form" onSubmit={this.handleSubmit} class="needs-validation" noValidate>
        <div className="form-group">
          <input type="text" id="eth-amount" className="form-control" placeholder="amount of ethereum" ref={(input) => this.amount = input} required pattern="^-?[0-9.]+"/>
          <div class="invalid-feedback">
            Please enter a number
          </div>
        </div>
        <div className="form-group">
          <input type="text" className="form-control" placeholder="name..." ref={(input) => this.name = input} />
        </div>
        <div className="form-group">
          <textarea type="text" className="form-control" placeholder="message..." ref={(input) => this.message = input} required />
          <div class="invalid-feedback">
            A message is required
          </div>
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
