import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/base.css';
import './styles/chrome.css';
import './styles/home.css';
import './styles/pages.css';

// Pages arrive prerendered for crawlers. The live app renders fresh over that markup
// rather than hydrating it, since countdowns and "x hrs ago" labels differ from build time.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
