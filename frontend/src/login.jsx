import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import LoginPage from './components/LoginPage'
import { readSession, saveSession } from './authSession'
import './index.css'

if (readSession()) {
  window.location.replace('/dashboard.html')
} else {
  function handleLogin(session) {
    try {
      saveSession(session)
      window.location.assign('/dashboard.html')
      return true
    } catch {
      return false
    }
  }

  const initialError = new URLSearchParams(window.location.search).has('expired')
    ? 'Your session has expired. Please sign in again.'
    : ''

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <LoginPage initialError={initialError} onLogin={handleLogin} />
    </StrictMode>,
  )
}
