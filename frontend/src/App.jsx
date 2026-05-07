import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { DataProvider, useData } from './context/DataContext'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import Dashboard from './pages/Dashboard'
import TradesLedger from './pages/TradesLedger'
import Diagnostics from './pages/Diagnostics'
import Strategy from './pages/Strategy'

function SignIn() {
  const { signIn } = useData()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [err,      setErr]      = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setErr('')
    const msg = await signIn(email, password)
    if (msg) setErr(msg)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="w-full max-w-sm bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-[#f72585] rounded-lg flex items-center justify-center glow-pink-strong">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] text-[#f72585] font-semibold tracking-widest uppercase">Nova</p>
            <p className="text-white font-bold text-sm leading-none">Engine</p>
          </div>
        </div>
        <h2 className="text-lg font-bold mb-1">Sign in</h2>
        <p className="text-xs text-gray-500 mb-6">Connect to your live strategy dashboard.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-[#111] border border-[#1e1e1e] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#f72585] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-[#111] border border-[#1e1e1e] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#f72585] transition-colors"
            />
          </div>
          {err && <p className="text-[#ff3d71] text-xs">{err}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 bg-[#f72585] hover:bg-[#d91e73] text-white text-sm font-bold rounded-lg tracking-wider transition-colors glow-pink disabled:opacity-50"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  )
}

function AppShell() {
  const { authReady, authSession } = useData()

  if (!authReady) return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#f72585] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!authSession) return <SignIn />

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#080808] text-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/"            element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"   element={<Dashboard />} />
              <Route path="/trades"      element={<TradesLedger />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
              <Route path="/strategy"    element={<Strategy />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <DataProvider>
      <AppShell />
    </DataProvider>
  )
}
