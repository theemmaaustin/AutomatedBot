import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ScrollText, Activity, Zap, Settings, BookOpen } from 'lucide-react'

const nav = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/trades',      icon: ScrollText,       label: 'Market Data' },
  { to: '/diagnostics', icon: Activity,         label: 'Diagnostics' },
  { to: '#',            icon: Settings,         label: 'Strategy' },
  { to: '#',            icon: BookOpen,         label: 'System Logs' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 flex flex-col bg-[#0a0a0a] border-r border-[#1e1e1e]">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#f72585] rounded-lg flex items-center justify-center glow-pink-strong shrink-0">
            <Zap size={15} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] text-[#f72585] font-semibold tracking-widest uppercase">Nova</p>
            <p className="text-white font-bold text-sm leading-none">Engine</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#f72585]/10 text-[#f72585] border border-[#f72585]/20'
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]'
              }`
            }
          >
            <Icon size={15} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Deploy bot */}
      <div className="p-4 border-t border-[#1e1e1e]">
        <button className="w-full py-2.5 px-4 bg-[#f72585] hover:bg-[#d91e73] text-white text-xs font-bold rounded-lg tracking-wider transition-colors glow-pink">
          DEPLOY BOT
        </button>
        <p className="text-center text-[10px] text-gray-600 mt-2">v1.0 · Paper Mode</p>
      </div>
    </aside>
  )
}
