import React from 'react';
import ReactDOM from 'react-dom/client';
import { LiveAnnouncer } from '@taylorvance/tv-shared-runtime';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LiveAnnouncer>
      <App />
    </LiveAnnouncer>
  </React.StrictMode>,
);
