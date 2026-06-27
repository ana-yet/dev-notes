import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/global.css'
import SidePanel from './SidePanel'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SidePanel />
  </StrictMode>
)
