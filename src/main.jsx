import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { storage } from './lib/storage/index.js'
import './styles.css'

if (import.meta.env.DEV) {
  window.storage = storage
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
