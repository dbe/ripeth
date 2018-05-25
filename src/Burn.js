import React from 'react';

function Burn(props) {
  let amount = props.fromWei(props.burn.burntAmount, 'ether');
  return (
    <div className='burn'>
      <p>{'{' + props.burn.name + '}' } [{ amount }eth] {props.burn.message} </p>
    </div>
  );
}

export default Burn;
