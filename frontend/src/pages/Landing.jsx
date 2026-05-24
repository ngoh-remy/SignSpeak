import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import translations from '../translations'

function Landing({ theme, toggleTheme, lang, toggleLang }) {
const navigate = useNavigate()
const t = translations[lang]
const hasToken = !!localStorage.getItem('token')

return (
    <div style={{ background: '#070a12', minHeight: '100vh', color: '#fff' }}>
    <Navbar 
        theme={theme} toggleTheme={toggleTheme} 
        lang={lang} toggleLang={toggleLang} 
        isAuthenticated={hasToken} 
        onLogout={() => { localStorage.clear(); navigate('/login'); }} 
    />
    
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px max(80px)' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', maxWidth: '800px', margin: '0 0 16px 0', lineHeight: '1.15', letterSpacing: '-0.02em' }}>
        Bridging the Gap Between <span style={{ background: 'linear-gradient(90deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sign Language</span> and Speech
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '580px', margin: '0 0 32px 0', lineHeight: '1.6' }}>
        An advanced real-time computer vision interpreter turning continuous gestures into spoken language seamlessly.
        </p>
        <button 
        onClick={() => navigate(hasToken ? '/dashboard' : '/login')}
        style={{ background: '#8b5cf6', color: '#fff', padding: '14px 32px', borderRadius: '99px', fontSize: '1rem', fontWeight: '600', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4)' }}
        >
        {hasToken ? "Go to Workspace Dashboard" : "Get Started Now"}
        </button>
    </div>
    </div>
)
}

export default Landing