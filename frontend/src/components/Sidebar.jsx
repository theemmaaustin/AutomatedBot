import { NavLink } from 'react-router-dom'
import { LayoutDashboard, LineChart, Settings2, BarChart2, ScrollText } from 'lucide-react'
import { useData } from '../context/DataContext'

const nav = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/trades',      icon: LineChart,        label: 'Market Data' },
  { to: '/diagnostics', icon: Settings2,        label: 'Algorithm Config' },
  { to: '/strategy',    icon: BarChart2,        label: 'Strategy' },
  { to: '/logs',        icon: ScrollText,       label: 'System Logs' },
]

export default function Sidebar() {
  const { signOut, authSession } = useData()

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-[#070707] border-r border-[#181818]">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#181818]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#f72585]"
            style={{ boxShadow: '0 0 22px rgba(247,37,133,0.35)' }}
          >
            <span className="text-white font-black text-base leading-none">A</span>
          </div>
          <div>
            <p className="text-[9px] text-[#f72585] font-bold tracking-widest uppercase">AEVA</p>
            <p className="text-white font-bold text-sm leading-none tracking-wide">OS</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 relative ${
                isActive
                  ? 'bg-[#f72585]/10 text-[#f72585]'
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#f72585] rounded-r-full" />
                )}
                <Icon size={14} className="shrink-0" />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-[#181818]">
        <button
          onClick={signOut}
          className="w-full py-2.5 px-4 bg-[#f72585] hover:bg-[#d91e73] text-white text-xs font-bold rounded-lg tracking-wider transition-all"
          style={{ boxShadow: '0 0 18px rgba(247,37,133,0.22)' }}
        >
          SIGN OUT
        </button>
        {authSession && (
          <p className="text-center text-[10px] text-gray-700 truncate mt-2">{authSession.user.email}</p>
        )}
        <p className="text-center text-[10px] text-gray-800 mt-1">v2.0 · Live Mode</p>
      </div>
    </aside>
  )
}
