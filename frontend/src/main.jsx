import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>   
      <App />   
    </BrowserRouter>
  </StrictMode>,
)

// StrictMode prevents React from rendering twice in development mode
// BrowserRouter is used to enable routing in the app
// App is the root component of the app