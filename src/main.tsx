import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={(import.meta as any).env.PROD ? '/sih-bis-portal' : undefined}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
