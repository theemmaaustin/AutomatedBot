import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Search, RotateCcw } from 'lucide-react'
import { useData } from '../context/DataContext'

const GREEN = '#00d68f'
const RED   = '#ff3d71'
const PINK  = '#f72585'

function resultStyle(r) {
  if (r === 'WIN')     return 'text-[#00d68f] bg-[#00d68f]/10 border-[#00d68f]/20'
  if (r === 'LOSS')    return 'text-[#ff3d71] bg-[#ff3d71]/10 border-[#ff3d71]/20'
  return 'text-gray-500 bg-white/5 border-white/10'
}

function Dropdown({ label, value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-[#111] border border-[#1e1e1e] text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#f72585] transition-colors cursor-pointer"
    >
      <option value="All">{label}: All</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

export default function TradesLedger() {
  const { trades, summary, loading, error } = useData()
  const [search,    setSearch]    = useState('')
  const [session,   setSession]   = useState('All')
  const [direction, setDirection] = useState('All')
  const [result,    setResult]    = useState('All')
  const [page,      setPage]      = useState(0)
  const PAGE_SIZE = 10

  const filtered = useMemo(() => trades.filter(t => {
    if (session   !== 'All' && t.session   !== session)   return false
    if (direction !== 'All' && t.direction !== direction) return false
    if (result    !== 'All' && t.result    !== result)    return false
    if (search) {
      const q = search.toLowerCase()
      return t.date?.includes(q) || t.result?.toLowerCase().includes(q) ||
             t.direction?.toLowerCase().includes(q) || t.session?.toLowerCase().includes(q)
    }
    return true
  }), [trades, session, direction, result, search])

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const reset = () => { setSearch(''); setSession('All'); setDirection('All'); setResult('All'); setPage(0) }

  // Cumulative P&L bar data (group by month)
  const monthlyPnl = useMemo(() => {
    const map = {}
    trades.forEach(t => {
      const m = t.date?.slice(0, 7)
      if (!m) return
      map[m] = (map[m] ?? 0) + (t.pnlUsd || 0)
    })
    return Object.entries(map).sort().map(([month, pnl]) => ({
      month: month.slice(5) + '/' + month.slice(2, 4),
      pnl: parseFloat(pnl.toFixed(2)),
    }))
  }, [trades])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#f72585] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (error) return <p className="text-red-400 text-sm p-4 bg-red-400/10 rounded-lg">{error}</p>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trades Ledger</h1>
          <p className="text-gray-500 text-sm mt-0.5">Operational log of all strategy executions</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#f72585] font-mono font-bold text-lg">
            {summary?.winRate?.toFixed(1)}%
          </span>
          <span className="text-gray-400 font-mono">1:{summary?.avgRR?.toFixed(1)}</span>
          <span className={`font-mono font-bold ${(summary?.totalPnlUsd ?? 0) >= 0 ? 'text-[#00d68f]' : 'text-[#ff3d71]'}`}>
            {(summary?.totalPnlUsd ?? 0) >= 0 ? '+' : ''}${summary?.totalPnlUsd?.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="w-full bg-[#111] border border-[#1e1e1e] text-gray-300 text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-[#f72585] transition-colors placeholder-gray-600"
          />
        </div>
        <Dropdown label="Session"   value={session}   onChange={v => { setSession(v);   setPage(0) }} options={['NY', 'LONDON']} />
        <Dropdown label="Direction" value={direction} onChange={v => { setDirection(v); setPage(0) }} options={['BULL', 'BEAR']} />
        <Dropdown label="Result"    value={result}    onChange={v => { setResult(v);    setPage(0) }} options={['WIN', 'LOSS', 'SCRATCH']} />
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400 border border-[#1e1e1e] rounded-lg hover:border-[#f72585] hover:text-[#f72585] transition-colors"
        >
          <RotateCcw size={12} /> RESET
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] text-gray-600 uppercase tracking-wider border-b border-[#1a1a1a]">
                {['Date', 'Dir', 'Session', 'Entry', 'Stop', 'TP', 'Exit', 'Stop Pips', 'Result', 'P&L'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((t, i) => (
                <tr key={i} className="border-b border-[#0d0d0d] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-mono text-gray-300 whitespace-nowrap">{t.date}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold px-2 py-0.5 rounded border text-[10px] ${
                      t.direction === 'BULL'
                        ? 'text-[#00d68f] bg-[#00d68f]/10 border-[#00d68f]/20'
                        : 'text-[#f72585] bg-[#f72585]/10 border-[#f72585]/20'
                    }`}>
                      {t.direction === 'BULL' ? '↑ LONG' : '↓ SHORT'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{t.session}</td>
                  <td className="px-4 py-3 font-mono text-gray-300">{t.entryPrice?.toFixed(5)}</td>
                  <td className="px-4 py-3 font-mono text-gray-500">{t.stopPrice?.toFixed(5)}</td>
                  <td className="px-4 py-3 font-mono text-gray-500">{t.tpPrice?.toFixed(5)}</td>
                  <td className="px-4 py-3 font-mono text-gray-300">{t.exitPrice?.toFixed(5)}</td>
                  <td className="px-4 py-3 font-mono text-gray-400">{t.stopPips?.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${resultStyle(t.result)}`}>
                      {t.result}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-mono font-semibold ${
                    t.pnlUsd > 0 ? 'text-[#00d68f]' : t.pnlUsd < 0 ? 'text-[#ff3d71]' : 'text-gray-500'
                  }`}>
                    {t.pnlUsd >= 0 ? '+' : ''}${t.pnlUsd?.toFixed(2)}
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-600 text-xs">No trades match your filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-[#1a1a1a] flex items-center justify-between">
          <p className="text-[11px] text-gray-500">
            Showing {Math.min(filtered.length, page * PAGE_SIZE + 1)}–{Math.min(filtered.length, (page + 1) * PAGE_SIZE)} of {filtered.length} trades
          </p>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-7 h-7 rounded text-[11px] font-medium transition-colors ${
                  i === page
                    ? 'bg-[#f72585] text-white'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Cumulative P&L by Month</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyPnl} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#555', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 9 }} axisLine={false} tickLine={false} width={40} tickFormatter={v => '$' + v} />
              <Tooltip
                contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8 }}
                labelStyle={{ color: '#888', fontSize: 10 }}
                itemStyle={{ color: '#fff', fontSize: 11 }}
                formatter={v => ['$' + v.toFixed(2), 'P&L']}
              />
              <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                {monthlyPnl.map((e, i) => (
                  <Cell key={i} fill={e.pnl >= 0 ? GREEN : RED} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Session Efficiency</h3>
          <div className="space-y-3 mt-2">
            {['WIN', 'LOSS', 'SCRATCH'].map(r => {
              const count = trades.filter(t => t.result === r).length
              const pct   = trades.length ? (count / trades.length) * 100 : 0
              const color = r === 'WIN' ? GREEN : r === 'LOSS' ? RED : '#444'
              return (
                <div key={r}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-gray-400">{r}</span>
                    <span className="font-mono text-gray-300">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: pct + '%', background: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
