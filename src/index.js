import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import 'jquery/dist/jquery.min.js';
import 'popper.js/dist/umd/popper.min.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
