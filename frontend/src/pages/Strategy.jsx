import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useData } from '../context/DataContext'

const GREEN = '#00d68f'
const RED   = '#ff3d71'
const PINK  = '#f72585'
const AMBER = '#c9933a'
const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const SESSIONS = ['LONDON', 'NY']

function MiniStat({ label, value, color = 'text-white', sub }) {
  return (
    <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-5 flex flex-col gap-2">
      <span className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase">{label}</span>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
    </div>
  )
}

function HBar({ data, color = PINK }) {
  if (!data.length) return <p className="text-gray-600 text-xs py-4">No data yet.</p>
  return (
    <ResponsiveContainer width="100%" height={Math.max(100, data.length * 44)}>
      <BarChart layout="vertical" data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#555', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => v + '%'} />
        <YAxis dataKey="name" type="category" tick={{ fill: '#555', fontSize: 10 }} width={80} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8 }}
          formatter={(v, _, p) => [`${v}% (${p.payload.wins}/${p.payload.total})`, 'Win Rate']}
          labelStyle={{ color: '#888', fontSize: 10 }}
        />
        <Bar dataKey="wr" fill={color} radius={[0, 4, 4, 0]} fillOpacity={0.85} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function resultStyle(r) {
  if (r === 'WIN')  return 'text-[#00d68f] bg-[#00d68f]/10 border-[#00d68f]/20'
  if (r === 'LOSS') return 'text-[#ff3d71] bg-[#ff3d71]/10 border-[#ff3d71]/20'
  return 'text-gray-500 bg-white/5 border-white/10'
}

export default function Strategy() {
  const { trades, heartbeat, loading, error } = useData()

  const botTrades = useMemo(() =>
    trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'SCRATCH'),
    [trades]
  )

  const metrics = useMemo(() => {
    if (!botTrades.length) return null

    const wins    = botTrades.filter(t => t.result === 'WIN').length
    const losses  = botTrades.filter(t => t.result === 'LOSS').length
    const decisive = wins + losses
    const totalPnl = botTrades.reduce((s, t) => s + t.pnlUsd, 0)

    const rrTrades = botTrades.filter(t => t.rrAchieved != null && (t.result === 'WIN' || t.result === 'LOSS'))
    const avgRR = rrTrades.length
      ? rrTrades.reduce((s, t) => s + t.rrAchieved, 0) / rrTrades.length
      : 0
    const winRate = decisive ? (wins / decisive) * 100 : 0

    const sorted = [...botTrades].sort((a, b) => a.date.localeCompare(b.date))
    let cum = 0
    const equityCurve = sorted.map(t => {
      cum += t.pnlUsd
      return { date: t.date, pnl: parseFloat(cum.toFixed(2)) }
    })

    const dailyMap = {}
    sorted.forEach(t => { dailyMap[t.date] = (dailyMap[t.date] ?? 0) + t.pnlUsd })
    const dailyPnl = Object.entries(dailyMap).map(([date, pnl]) => ({
      date: date.slice(5),
      pnl:  parseFloat(pnl.toFixed(2)),
    }))

    function buildBreakdown(decisive, keyFn) {
      const map = {}
      decisive.forEach(t => {
        const k = keyFn(t)
        if (!k) return
        map[k] = map[k] ?? { wins: 0, total: 0 }
        map[k].total++
        if (t.result === 'WIN') map[k].wins++
      })
      return Object.entries(map).map(([name, s]) => ({
        name, wins: s.wins, total: s.total,
        wr: s.total ? parseFloat(((s.wins / s.total) * 100).toFixed(1)) : 0,
      }))
    }

    const decisiveTrades = botTrades.filter(t => t.result === 'WIN' || t.result === 'LOSS')
    const bySession = buildBreakdown(decisiveTrades, t => t.session)
    const byRegime  = buildBreakdown(decisiveTrades, t => t.regime)
    const byPdType  = buildBreakdown(decisiveTrades, t => t.pdType)

    const heatmap = {}
    decisiveTrades.forEach(t => {
      if (!t.date) return
      const dow  = new Date(t.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })
      const sess = t.session
      const key  = `${dow}-${sess}`
      heatmap[key] = heatmap[key] ?? { wins: 0, total: 0 }
      heatmap[key].total++
      if (t.result === 'WIN') heatmap[key].wins++
    })

    const recent = [...botTrades]
      .sort((a, b) => (b.signalTime ?? b.date ?? '').localeCompare(a.signalTime ?? a.date ?? ''))
      .slice(0, 6)

    return { wins, losses, totalPnl, avgRR, winRate, equityCurve, dailyPnl, bySession, byRegime, byPdType, heatmap, recent }
  }, [botTrades])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#f72585] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (error) return <p className="text-red-400 text-sm p-4 bg-red-400/10 rounded-lg">{error}</p>

  const lastSeen = heartbeat?.last_seen ? new Date(heartbeat.last_seen) : null
  const diffMin  = lastSeen ? (Date.now() - lastSeen.getTime()) / 60000 : Infinity
  const isActive = diffMin < 10

  const fmtUsd  = n => (n >= 0 ? '+$' : '-$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fmtDate = s => s ? new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Strategy</h1>
          <p className="text-gray-500 text-sm mt-0.5">Live EURUSD SMC bot — OANDA practice account</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
          isActive
            ? 'border-[#00d68f]/30 text-[#00d68f] bg-[#00d68f]/10'
            : 'border-[#1e1e1e] text-gray-500 bg-white/[0.02]'
        }`}>
          <span className="relative flex h-1.5 w-1.5">
            {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d68f] opacity-75" />}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isActive ? 'bg-[#00d68f]' : 'bg-gray-600'}`} />
          </span>
          {isActive
            ? `ACTIVE · ${Math.floor(diffMin)}m ago${heartbeat?.session_name ? ' · ' + heartbeat.session_name : ''}`
            : 'OFFLINE'
          }
        </div>
      </div>

      {metrics ? (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            <MiniStat
              label="Strategy P&L"
              value={fmtUsd(metrics.totalPnl)}
              color={metrics.totalPnl >= 0 ? 'text-[#00d68f]' : 'text-[#ff3d71]'}
            />
            <MiniStat
              label="Win Rate"
              value={metrics.winRate.toFixed(1) + '%'}
              color="text-[#f72585]"
              sub={`${metrics.wins}W · ${metrics.losses}L`}
            />
            <MiniStat
              label="Avg RR"
              value={metrics.avgRR ? '1:' + metrics.avgRR.toFixed(2) : '—'}
              sub="completed trades"
            />
          </div>

          {/* Equity curve */}
          <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Cumulative P&L</h3>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                metrics.totalPnl >= 0
                  ? 'text-[#00d68f] bg-[#00d68f]/10 border-[#00d68f]/20'
                  : 'text-[#ff3d71] bg-[#ff3d71]/10 border-[#ff3d71]/20'
              }`}>
                {fmtUsd(metrics.totalPnl)}
              </span>
            </div>
            {metrics.equityCurve.length > 1 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={metrics.equityCurve} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                  <defs>
                    <linearGradient id="stratGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={PINK} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={PINK} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#555', fontSize: 9 }}
                    axisLine={false} tickLine={false}
                    interval={Math.max(0, Math.floor(metrics.equityCurve.length / 6))}
                  />
                  <YAxis
                    tick={{ fill: '#555', fontSize: 9 }}
                    axisLine={false} tickLine={false}
                    width={60}
                    tickFormatter={v => '$' + v.toFixed(0)}
                  />
                  <Tooltip
                    contentStyle={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 8 }}
                    formatter={v => ['$' + v.toFixed(2), 'Cumul. P&L']}
                    labelStyle={{ color: '#888', fontSize: 10 }}
                  />
                  <Area type="monotone" dataKey="pnl" stroke={PINK} strokeWidth={2} fill="url(#stratGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 text-xs text-center py-10">Not enough data yet.</p>
            )}
          </div>

          {/* Daily PnL */}
          <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-5">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Daily P&L</h3>
            {metrics.dailyPnl.length ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={metrics.dailyPnl} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#555', fontSize: 9 }} axisLine={false} tickLine={false} width={40} tickFormatter={v => '$' + v} />
                  <Tooltip
                    contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8 }}
                    formatter={v => ['$' + v.toFixed(2), 'P&L']}
                    labelStyle={{ color: '#888', fontSize: 10 }}
                  />
                  <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                    {metrics.dailyPnl.map((e, i) => (
                      <Cell key={i} fill={e.pnl >= 0 ? GREEN : RED} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 text-xs text-center py-6">No data.</p>
            )}
          </div>

          {/* Session + Regime */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-5">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Session Win Rate</h3>
              <HBar data={metrics.bySession} color={PINK} />
            </div>
            <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-5">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Regime Win Rate</h3>
              <HBar data={metrics.byRegime} color={GREEN} />
            </div>
          </div>

          {/* PD Array breakdown */}
          {metrics.byPdType.length > 0 && (
            <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-5">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Setup (PD Array) Win Rate</h3>
              <HBar data={metrics.byPdType} color={AMBER} />
            </div>
          )}

          {/* Heatmap */}
          <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-5">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Heatmap — Day × Session</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="w-16" />
                    {DAYS.map(d => (
                      <th key={d} className="text-[10px] text-gray-600 font-semibold tracking-wider pb-2 text-center">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SESSIONS.map(sess => (
                    <tr key={sess}>
                      <td className="text-[10px] text-gray-600 font-semibold tracking-wider pr-3 py-1.5 whitespace-nowrap">{sess}</td>
                      {DAYS.map(day => {
                        const cell = metrics.heatmap[`${day}-${sess}`]
                        const rate = cell?.total ? cell.wins / cell.total : null
                        const bg = rate === null ? 'transparent'
                          : rate >= 0.6 ? `rgba(0,214,143,${0.15 + rate * 0.35})`
                          : rate >= 0.4 ? 'rgba(201,147,58,0.25)'
                          : `rgba(255,61,113,${0.15 + (1 - rate) * 0.3})`
                        return (
                          <td key={day} className="py-1 px-1">
                            <div
                              className="rounded-lg p-2 text-center border border-[#1a1a1a] min-w-[52px]"
                              style={{ background: bg }}
                              title={cell ? `${cell.wins}/${cell.total}` : 'No trades'}
                            >
                              <p className="font-mono font-bold text-sm text-white">
                                {cell ? Math.round(rate * 100) + '%' : '—'}
                              </p>
                              <p className="text-[9px] text-gray-600">{cell ? `${cell.wins}/${cell.total}` : ''}</p>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1e1e1e]">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Recent Sessions</h3>
            </div>
            <div className="divide-y divide-[#111]">
              {metrics.recent.map(t => (
                <div key={t.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-gray-300 font-mono">{fmtDate(t.date)}</p>
                      <p className="text-[10px] text-gray-600">{t.session}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t.pdType || '—'}</p>
                      <p className="text-[10px] text-gray-600">{t.timeframe}{t.regime ? ' · ' + t.regime : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${resultStyle(t.result)}`}>
                      {t.result}{t.rrAchieved != null ? ` · ${t.rrAchieved}R` : ''}
                    </span>
                    <span className={`font-mono font-semibold text-sm ${t.pnlUsd >= 0 ? 'text-[#00d68f]' : 'text-[#ff3d71]'}`}>
                      {t.pnlUsd >= 0 ? '+' : ''}${t.pnlUsd.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              {!metrics.recent.length && (
                <p className="px-5 py-8 text-center text-gray-600 text-xs">No sessions yet.</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-12 text-center">
          <p className="text-gray-500 text-sm">No completed trades yet. The bot will populate data as sessions run.</p>
        </div>
      )}
    </div>
  )
}
