import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ResumeRoaster from './ResumeRoaster.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ResumeRoaster />
  </StrictMode>,
)
