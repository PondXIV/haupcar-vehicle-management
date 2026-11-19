import { useState } from 'react'
import BrandMark from './BrandMark'
import './LoginPage.css'

const CURRENT_YEAR = new Date().getFullYear()

export default function LoginPage({ initialError = '', onLogin }) {
  const [username, setUsername] = useState(import.meta.env.DEV ? 'Somchai' : '')
  const [password, setPassword] = useState(import.meta.env.DEV ? '1234' : '')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(initialError)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const result = await response.json()

      if (!response.ok || result.Status !== 200 || !result.Data?.token) {
        setError(result.Data?.error || 'Unable to sign in. Please try again.')
        return
      }

      const sessionSaved = onLogin({
        username: result.Data.user.username,
        token: result.Data.token,
        expiresIn: result.Data.expiresIn,
      })
      if (!sessionSaved) {
        setError('Unable to save your session. Check your browser settings and try again.')
        return
      }
      setPassword('')
    } catch {
      setError('Cannot reach the server. Check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <main className="login-page">
      <section className="login-panel" aria-label="Haupcar sign in">
        <div className="login-content">
          <a className="brand" href="/" aria-label="Haupcar home">
            <BrandMark />
            <span>HAUP<span className="brand-light">CAR</span></span>
          </a>

          <div className="heading-block">
                <p className="eyebrow">VEHICLE MANAGEMENT</p>
                <h1>Welcome back.</h1>
                <p className="form-description">
                  Sign in to manage your fleet and keep everything moving.
                </p>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 20c.7-3.1 3.2-5 7-5s6.3 1.9 7 5" />
                  </svg>
                  <input
                    autoComplete="username"
                    id="username"
                    name="username"
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Enter your username"
                    required
                    value={username}
                  />
                </div>

                <div className="password-label-row">
                  <label htmlFor="password">Password</label>
                </div>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="4.5" y="10" width="15" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v2.5" />
                  </svg>
                  <input
                    autoComplete="current-password"
                    id="password"
                    name="password"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                  />
                  <button
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="visibility-button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    type="button"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                {error && (
                  <p className="error-message" role="alert">
                    <span aria-hidden="true">!</span>
                    {error}
                  </p>
                )}

                <button className="submit-button" disabled={isLoading} type="submit">
                  {isLoading ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <span aria-hidden="true">→</span>
                    </>
                  )}
                </button>
              </form>

              <p className="secure-note">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M10 2.5 4 5v4.3c0 3.6 2.4 6.8 6 8.2 3.6-1.4 6-4.6 6-8.2V5l-6-2.5Z" />
                  <path d="m7.5 9.8 1.7 1.7 3.5-3.7" />
                </svg>
                Your connection is protected and encrypted
              </p>

          <footer className="login-footer">
            <span>© {CURRENT_YEAR} Haupcar</span>
            <span>Fleet operations, simplified.</span>
          </footer>
        </div>
      </section>

      <aside className="visual-panel" aria-label="Fleet management">
        <div className="visual-glow visual-glow-one" />
        <div className="visual-glow visual-glow-two" />
        <div className="visual-topline">
          <span className="status-dot" />
          <span>FLEET OPERATIONS PLATFORM</span>
        </div>
        <div className="visual-copy">
          <p>Every journey,</p>
          <h2>under control.</h2>
          <span>One clear view of your vehicles, your team, and the road ahead.</span>
        </div>
        <div className="vehicle-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="art-glow" />
          <svg className="car-illustration" viewBox="0 0 700 350" fill="none">
            <defs>
              <linearGradient id="carBody" x1="140" y1="170" x2="568" y2="290" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F4F7F6" />
                <stop offset=".48" stopColor="#BDD5D0" />
                <stop offset="1" stopColor="#769A94" />
              </linearGradient>
              <linearGradient id="glass" x1="264" y1="109" x2="430" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#70B7AC" stopOpacity=".76" />
                <stop offset="1" stopColor="#173C3A" />
              </linearGradient>
              <filter id="carShadow" x="75" y="78" width="550" height="260" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
                <feGaussianBlur stdDeviation="17" />
              </filter>
            </defs>
            <ellipse cx="357" cy="286" rx="236" ry="33" fill="#051A1A" fillOpacity=".56" filter="url(#carShadow)" />
            <path d="m143 205 35-18 49-73c11-16 29-25 48-25h130c21 0 40 9 53 25l49 61 48 18c16 6 27 21 27 39v27c0 11-9 20-20 20h-36a58 58 0 0 0-115 0H280a58 58 0 0 0-115 0h-28c-12 0-22-10-22-22v-23c0-12 10-24 28-29Z" fill="url(#carBody)" stroke="#D7E8E4" strokeWidth="3" />
            <path d="m241 179 36-54c5-8 14-13 24-13h102c12 0 24 6 32 16l40 51H241Z" fill="url(#glass)" stroke="#D7E8E4" strokeWidth="3" />
            <path d="m354 112 1 67M222 190h365" stroke="#71918C" strokeWidth="3" />
            <path d="M111 221h53M557 215l50 15" stroke="#FCBE79" strokeWidth="7" strokeLinecap="round" />
            <path d="M132 251h44M563 252h40" stroke="#294441" strokeWidth="4" strokeLinecap="round" />
            <circle cx="222" cy="260" r="43" fill="#101D1E" stroke="#BACDC8" strokeWidth="5" />
            <circle cx="222" cy="260" r="24" fill="#263A39" stroke="#77918C" strokeWidth="4" />
            <circle cx="222" cy="260" r="7" fill="#B5C9C4" />
            <circle cx="507" cy="260" r="43" fill="#101D1E" stroke="#BACDC8" strokeWidth="5" />
            <circle cx="507" cy="260" r="24" fill="#263A39" stroke="#77918C" strokeWidth="4" />
            <circle cx="507" cy="260" r="7" fill="#B5C9C4" />
            <path d="M277 126h22m-44 66h247" stroke="#E8F4F0" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div className="art-caption">
            <span className="caption-line" />
            <span>READY FOR THE ROAD</span>
          </div>
        </div>
        <div className="visual-bottom">
          <span>01 — 03</span>
          <div className="progress-track"><span /></div>
          <span>BUILT FOR WHAT&apos;S NEXT</span>
        </div>
      </aside>
    </main>
  )
}
