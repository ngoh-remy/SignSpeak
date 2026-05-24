import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Globe, Sun, Moon } from 'lucide-react'
import translations from '../translations'
import logoAsset from '../assets/signspeaklogo.svg' // Fixed path: going up to src, then into assets

function Navbar({ theme, toggleTheme, lang, toggleLang, onLogout }) {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const username = localStorage.getItem('username') || 'R'
  const initialLetter = username.charAt(0).toUpperCase()
  const t = translations[lang] || translations['en']

  // Manages the DOM classes instantly so body styles respond to the toggle
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
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand/Identity Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src={logoAsset} alt="SignSpeak Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'contain' }} />
          <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>SignSpeak</span>
        </div>

        {/* Dynamic Controls Cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Language Selector */}
          <button className="nav-pill-btn" onClick={toggleLang}>
            <Globe size={14} />
            <span style={{ textTransform: 'uppercase' }}>{lang}</span>
          </button>

          {/* Theme Switcher */}
          <button className="nav-pill-btn" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>

          {/* Secure User Authentication Sub-menu */}
          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem' }}>
                {initialLetter}
              </div>
              <button className="nav-pill-btn nav-logout-btn" onClick={handleSignOut}>
                <LogOut size={14} />
                <span>{t.logout || 'Log Out'}</span>
              </button>
            </div>
          ) : (
            <button className="btn-base btn-purple" style={{ padding: '8px 18px', borderRadius: '99px', fontSize: '0.85rem' }} onClick={() => navigate('/login')}>
              {t.login || 'Sign In'}
            </button>
          )}

        </div>
      </div>
    </header>
  )
}

export default Navbar