import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { bootContent } from './content/load';
import { setContent } from './content/store';
import './styles/base.css';
import './styles/chrome.css';
import './styles/home.css';
import './styles/pages.css';

// Pages arrive prerendered for crawlers and stay on screen while the latest content loads.
// The live app then renders fresh over that markup rather than hydrating it, since
// countdowns, "x hrs ago" labels and freshly edited content differ from build time.
bootContent()
  .catch(async () => setContent((await import('./data/defaults.js')).default))
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  });
