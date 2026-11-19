const SESSION_KEY = 'haupcar-session'

export function readSession() {
  const savedSession = sessionStorage.getItem(SESSION_KEY)
  if (!savedSession) return null

  try {
    const session = JSON.parse(savedSession)
    if (typeof session.username === 'string' && typeof session.token === 'string') {
      return session
    }
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }

  sessionStorage.removeItem(SESSION_KEY)
  return null
}

export function saveSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}
