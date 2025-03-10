import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { FlightProvider } from './context/FlightContext.jsx'


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <FlightProvider>
      <App />
  </FlightProvider>
  </BrowserRouter>
)
