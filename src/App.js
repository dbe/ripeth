import React, { Component } from 'react';
import './App.css';

import Nametag from './Nametag.js'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Nametag name="Brian" />
        <Nametag name="Oreo" />
        <Nametag name="What" />
      </div>
    );
  }
}

export default App;
