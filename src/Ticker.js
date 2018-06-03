import React from 'react';

class BurnForm extends React.Component {

  renderBurns() {
    return this.props.burns.map((burn,i) => {
      return (
        <span key={i}>
          <span>{`{${burn.name} [${this.props.fromWei(burn.burntAmount, 'ether')}eth] ~ ${burn.message}}`}</span>
          {i === this.props.burns.length - 1 ?
            null :
            <img id="coin-png" src="/coin.png" alt="coin"/>
          }
        </span>
      );
    });
  }

  render() {
    return (
      <div id="ticker" className="col-12">
        <p id="ticker-text">
          {this.renderBurns()}
        </p>
      </div>
    );
  }
}

export default BurnForm;
