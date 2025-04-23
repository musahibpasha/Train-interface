import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

document.addEventListener('DOMContentLoaded', () => {
  document.dispatchEvent(new Event('reactLoaded'));
  console.log('React application loaded successfully.');
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
   <BrowserRouter>
     <App />
   </BrowserRouter>
  </React.StrictMode>
);