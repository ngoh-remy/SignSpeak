import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Sun, Moon } from 'lucide-react'
import logo from '../assets/signspeaklogo.svg'
import translations from '../translations'
import { Eye, EyeOff } from 'lucide-react'

const API = 'https://motivated-achievement-production-46e4.up.railway.app'



function Signup({ theme, toggleTheme, lang, toggleLang }) {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate = useNavigate()
  const t = translations[lang]

  const handleSignup = async () => {
    if (!username || !email || !password) { setError(t.fillAllFields); return }
    setLoading(true); setError('')
    try {
      await axios.post(`${API}/register`, { username, email, password })
      setSuccess(t.accountCreated)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.error || t.registerFailed)
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-top">
        <button className="lang-toggle" onClick={toggleLang}>
          {lang === 'en' ? 'FR' : ' EN'}
        </button>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? <><Sun size={15}/> {t.light}</> : <><Moon size={15}/> {t.dark}</>}
        </button>
      </div>

      <div className="auth-card card">
        <div className="auth-logo">
          <div className="logo-wrapper">
            <div className="logo-circle">
              <img src={logo} alt="SignSpeak Logo" />
            </div>
            <span className="logo-text">{t.appName}</span>
          </div>
        </div>

        <div className="auth-title">{t.createAccount}</div>
        <div className="auth-subtitle">{t.joinToday}</div>

        {error   && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <input className="input-field" type="text"
          placeholder={t.usernamePlaceholder} value={username}
          onChange={e => setUsername(e.target.value)} />

        <input className="input-field" type="email"
          placeholder={t.emailPlaceholder} value={email}
          onChange={e => setEmail(e.target.value)} />

        <div style={{ position: 'relative', marginBottom: '1rem' }}>
  <input
    className="input-field"
    type={showPassword ? 'text' : 'password'}
    placeholder={t.passwordPlaceholder}
    value={password}
    onChange={e => setPassword(e.target.value)}
    onKeyDown={e => e.key === 'Enter' && handleLogin()}
    style={{ marginBottom: 0 }}
  />
  <button
    type="button"
    onClick={() => setShowPassword(prev => !prev)}
    style={{
      position: 'absolute', right: '12px', top: '50%',
      transform: 'translateY(-50%)',
      background: 'none', border: 'none',
      cursor: 'pointer', color: 'var(--text-secondary)',
      display: 'flex', alignItems: 'center'
    }}
  >
    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
  </button>
</div>

        <button className="btn-primary" onClick={handleSignup} disabled={loading}>
          {loading ? t.creatingAccount : t.signUpBtn}
        </button>

        <div className="auth-link">
          {t.alreadyAccount} <Link to="/login">{t.loginLink}</Link>
        </div>
      </div>
    </div>
  )
}

export default Signup