import logo from '../assets/signspeaklogo.svg'
import translations from '../translations'
import { Sun, Moon, LogOut, History } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Navbar({ theme, toggleTheme, lang, toggleLang, isAuthenticated, onLogout }) {
const t = translations[lang]
const navigate = useNavigate()
const username = localStorage.getItem('username') || 'User'

return (
    <div className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
    <div className="logo-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div className="logo-circle" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={logo} alt="SignSpeak" style={{ width: '20px', height: '20px' }} />
        </div>
        <span className="logo-text" style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', letterSpacing: '-0.01em' }}>{t.appName}</span>
    </div>

    <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isAuthenticated && (
        <div className="user-avatar" title={username} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>
            {username.charAt(0)}
        </div>
        )}
        
        <button className="nav-icon-btn" onClick={toggleLang}>
        {lang === 'en' ? 'FR' : 'EN'}
        </button>

        <button className="nav-icon-btn" onClick={toggleTheme}>
        {theme === 'dark' ? <Sun size={14}/> : <Moon size={14}/>}
        <span className="nav-btn-text">{theme === 'dark' ? t.light : t.dark}</span>
        </button>

        {isAuthenticated && (
        <button className="nav-icon-btn" onClick={onLogout} style={{ color: '#ef4444' }}>
            <LogOut size={14}/>
            <span className="nav-btn-text">{t.logout}</span>
        </button>
        )}
    </div>
    </div>
)
}

export default Navbar