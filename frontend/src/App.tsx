import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Logs from './pages/Logs'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <div className="header-container">
            <div className="logo">
              <span className="logo-icon">📱</span>
              <span className="logo-text">SNS 管理ツール</span>
            </div>
            <nav className="nav-menu">
              <Link to="/" className="nav-link">
                ダッシュボード
              </Link>
              <Link to="/settings" className="nav-link">
                設定
              </Link>
              <Link to="/logs" className="nav-link">
                ログ
              </Link>
            </nav>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/logs" element={<Logs />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>SNS 管理ツール © 2024</p>
        </footer>
      </div>
    </BrowserRouter>
  )
}
