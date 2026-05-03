import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import Dashboard from './pages/Dashboard'
import TradesLedger from './pages/TradesLedger'
import Diagnostics from './pages/Diagnostics'

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <div className="flex h-screen bg-[#080808] text-white overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <TopNav />
            <main className="flex-1 overflow-y-auto p-6">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard"    element={<Dashboard />} />
                <Route path="/trades"       element={<TradesLedger />} />
                <Route path="/diagnostics"  element={<Diagnostics />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </DataProvider>
  )
}
