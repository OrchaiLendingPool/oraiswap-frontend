import React, { StrictMode } from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.scss';
import './libs/wasm';
import ScrollToTop from './layouts/ScrollToTop';
import Contract from './layouts/Contract';
import App from './layouts/App';

render(
  <StrictMode>
    <Contract>
      <Router>
        <ScrollToTop />
        <App />
      </Router>
    </Contract>
  </StrictMode>,
  document.getElementById('oraiswap')
);
