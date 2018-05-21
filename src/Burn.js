import React from 'react';

function Burn(props) {
  return (
    <div className='burn'>
      <p>[{ props.burn.burntAmount }wei] {props.burn.message} </p>
    </div>
  );
}

export default Burn;
