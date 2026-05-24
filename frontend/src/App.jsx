import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  const [theme, setTheme] = useState('dark')
  const [lang, setLang] = useState('en')

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  const toggleLang = () => setLang(prev => prev === 'en' ? 'fr' : 'en')

  return (
    <Router>
      <Routes>
        {/* Landing Page Context Route */}
        <Route path="/" element={
          <Landing theme={theme} toggleTheme={toggleTheme} lang={lang} toggleLang={toggleLang} />
        } />

        {/* Workspace Operations Dashboard Route */}
        <Route path="/dashboard" element={
          <Dashboard 
            theme={theme} toggleTheme={toggleTheme} 
            lang={lang} toggleLang={toggleLang}
          />
        } />

        {/* Security / Credentials Verification Routes */}
        <Route path="/login" element={
          <Login theme={theme} toggleTheme={toggleTheme} lang={lang} toggleLang={toggleLang} />
        } />
        <Route path="/signup" element={
          <Signup theme={theme} toggleTheme={toggleTheme} lang={lang} toggleLang={toggleLang} />
        } />

        {/* Fallback Core Interception */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App