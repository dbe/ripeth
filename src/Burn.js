import React, { Component } from 'react';

function Burn(props) {
  return (
    <div className='burn'>
      <p>Message: { props.burn.message }</p>
      <p>Addr: { props.burn.burnerAddress.substring(0, 7) + '...' }</p>
      <p>Amount Burnt: { props.burn.burntAmount }</p>
    </div>
  );
}

export default Burn;
