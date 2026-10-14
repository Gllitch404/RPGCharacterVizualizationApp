import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SoundboardProvider } from './context/SoundboardContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SoundboardProvider>
      <App />
    </SoundboardProvider>
  </React.StrictMode>,
);

