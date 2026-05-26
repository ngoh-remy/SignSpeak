import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from './Navbar'
import translations from '../translations'

const API = 'https://motivated-achievement-production-46e4.up.railway.app'

function Signup({ theme, toggleTheme, lang, toggleLang }) {
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate = useNavigate()
  const t = translations[lang] || translations['en']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // ✅ FIXED: /signup → /register (matches Flask route)
      await axios.post(`${API}/register`, { username, email, password })
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.error
      setError(msg || (lang === 'fr' ? 'Inscription échouée. Cet utilisateur existe peut-être déjà.' : 'Registration failed. User may already exist.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <Navbar theme={theme} toggleTheme={toggleTheme} lang={lang} toggleLang={toggleLang} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '6px', textAlign: 'center' }}>
            {t.createAccount}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '24px', textAlign: 'center' }}>
            {lang === 'fr'
              ? 'Créez un compte pour accéder à votre historique et vos statistiques.'
              : 'Create an account to unlock history tracking and analytics.'}
          </p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="dark-input-group">
              <label>{t.usernameLabel}</label>
              <input type="text" className="dark-input" placeholder="John Doe" required
                value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="dark-input-group">
              <label>{t.emailLabel}</label>
              <input type="email" className="dark-input" placeholder="name@domain.com" required
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="dark-input-group">
              <label>{t.passwordLabel}</label>
              <input type="password" className="dark-input" placeholder="••••••••" required
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn-base btn-purple" style={{ width: '100%', padding: '12px', marginTop: '8px' }} disabled={loading}>
              {loading ? t.loading : t.signUpBtn}
            </button>
          </form>

          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '20px', textAlign: 'center' }}>
            {lang === 'fr' ? 'Déjà un compte ?' : 'Already have an account?'}{' '}
            <span style={{ color: '#8b5cf6', cursor: 'pointer' }} onClick={() => navigate('/login')}>
              {t.login}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup