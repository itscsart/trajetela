import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'

import './index.css'
import App from './App.jsx'

registerSW({
  immediate: true,
  onNeedRefresh() {
    window.location.reload()
  },
  onOfflineReady() {
    console.log('TrajetEla disponível offline')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)