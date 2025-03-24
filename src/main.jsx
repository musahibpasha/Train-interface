import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Signal to the HTML that React has loaded
document.addEventListener('DOMContentLoaded', () => {
  document.dispatchEvent(new Event('reactLoaded'));
  console.log('React application loaded successfully.');
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
