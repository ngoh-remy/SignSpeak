import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login     from './pages/Login'
import Signup    from './pages/Signup'
import Dashboard from './pages/Dashboard'

function App() {
  const [theme, setTheme]   = useState('dark')
  const [lang,  setLang]    = useState('en')
  // 💡 lang state holds current language — 'en' or 'fr'
  //    Just like theme, we store it here so ALL pages share it

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  const toggleLang  = () => setLang(prev  => prev  === 'en'   ? 'fr'    : 'en')
  // 💡 toggleLang flips between English and French
  //    Same pattern as toggleTheme — simple and clean

  const props = { theme, toggleTheme, lang, toggleLang }
  // 💡 Bundle all shared props together — cleaner than repeating them

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Navigate to="/login" />} />
        <Route path="/login"     element={<Login     {...props} />} />
        <Route path="/signup"    element={<Signup    {...props} />} />
        <Route path="/dashboard" element={<Dashboard {...props} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App