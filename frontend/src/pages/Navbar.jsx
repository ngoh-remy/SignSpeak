import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Globe, Sun, Moon } from 'lucide-react'
import translations from '../translations'
import logoAsset from '../assets/signspeaklogo.svg'

function Navbar({ theme, toggleTheme, lang, toggleLang, onLogout }) {
  const navigate      = useNavigate()
  const token         = localStorage.getItem('token')
  const username      = localStorage.getItem('username') || 'R'
  const initialLetter = username.charAt(0).toUpperCase()
  const t             = translations[lang] || translations['en']

  // ✅ FIXED: Uses body class for theme — consistent with index.css
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }, [theme])

  const handleSignOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    if (onLogout) onLogout()
    navigate('/')
  }

  return (
    <header style={{ width: '100%', background: 'var(--bg-darker)', borderBottom: '1px solid var(--border-color)', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <img src={logoAsset} alt="SignSpeak" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>SignSpeak</span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

          {/* Language toggle */}
          <button className="nav-pill-btn" onClick={toggleLang}>
            <Globe size={14} />
            <span style={{ textTransform: 'uppercase', fontWeight: '700' }}>{lang}</span>
          </button>

          {/* Theme toggle — ✅ FIXED: translated text */}
          <button className="nav-pill-btn" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            <span>
              {theme === 'light'
                ? (lang === 'fr' ? 'Sombre' : 'Dark')
                : (lang === 'fr' ? 'Clair'  : 'Light')}
            </span>
          </button>

          {/* Auth section */}
          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem' }}>
                {initialLetter}
              </div>
              <button className="nav-pill-btn nav-logout-btn" onClick={handleSignOut}>
                <LogOut size={14} />
                <span>{t.logout}</span>
              </button>
            </div>
          ) : (
            <button className="btn-base btn-purple" style={{ padding: '8px 18px', borderRadius: '99px', fontSize: '0.85rem' }} onClick={() => navigate('/login')}>
              {t.login}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar