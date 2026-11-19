import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import VehicleDashboard from './components/VehicleDashboard'
import { clearSession, readSession } from './authSession'
import './index.css'

const session = readSession()

function handleSignOut(message) {
  clearSession()
  window.location.replace(message ? '/login.html?expired=1' : '/login.html')
}

if (!session) {
  window.location.replace('/login.html')
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <VehicleDashboard session={session} onSignOut={handleSignOut} />
    </StrictMode>,
  )
}
