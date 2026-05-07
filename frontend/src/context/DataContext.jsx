import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'

const DataContext = createContext(null)

function normalizeSession(s) {
  if (!s) return ''
  const u = s.toUpperCase().trim()
  if (u === 'LONDON') return 'LONDON'
  if (u === 'NY' || u === 'NEW YORK') return 'NY'
  return u
}

function normalizeResult(r) {
  if (r === 'WIN') return 'WIN'
  if (r === 'LOSS') return 'LOSS'
  return 'SCRATCH'
}

function normalizeRow(row) {
  return {
    id:              row.id,
    date:            row.traded_at,
    session:         normalizeSession(row.session_name),
    direction:       row.side === 'Long' ? 'BULL' : 'BEAR',
    result:          normalizeResult(row.result),
    entryPrice:      parseFloat(row.entry_price)       || 0,
    stopPrice:       parseFloat(row.stop_price)        || 0,
    tpPrice:         parseFloat(row.take_profit_price) || 0,
    exitPrice:       parseFloat(row.exit_price)        || 0,
    stopPips:        parseFloat(row.stop_pips)         || 0,
    pnlUsd:          parseFloat(row.pnl)               || 0,
    rrAchieved:      row.rr_achieved != null ? parseFloat(row.rr_achieved) : null,
    regime:          row.regime          ?? '',
    dailyBias:       row.daily_bias      ?? '',
    sessionBias:     row.session_bias    ?? '',
    combinedBias:    row.combined_bias   ?? '',
    pdType:          row.pd_type         ?? '',
    timeframe:       row.timeframe       ?? '',
    signalTime:      row.signal_detected_time,
    fillTime:        row.fill_time,
    exitTime:        row.exit_time,
    durationMinutes: row.duration_minutes,
    notes:           row.notes           ?? '',
    oandaOrderId:    row.oanda_order_id,
    oandaTradeId:    row.oanda_trade_id,
  }
}

function computeSummary(trades) {
  const wins      = trades.filter(t => t.result === 'WIN')
  const losses    = trades.filter(t => t.result === 'LOSS')
  const scratches = trades.filter(t => t.result === 'SCRATCH')
  const decisive  = wins.length + losses.length

  const totalPnlUsd = trades.reduce((s, t) => s + t.pnlUsd, 0)

  const rrTrades = trades.filter(t => t.rrAchieved != null && (t.result === 'WIN' || t.result === 'LOSS'))
  const avgRR = rrTrades.length
    ? rrTrades.reduce((s, t) => s + t.rrAchieved, 0) / rrTrades.length
    : 0

  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date))
  let cum = 0
  const equityCurve = sorted.map(t => {
    cum += t.pnlUsd
    return { date: t.date, balance: parseFloat(cum.toFixed(2)) }
  })

  const dailyMap = {}
  sorted.forEach(t => { dailyMap[t.date] = (dailyMap[t.date] ?? 0) + t.pnlUsd })
  const dailyReturns = Object.values(dailyMap)
  let sharpeRatio = 0
  if (dailyReturns.length > 1) {
    const mean = dailyReturns.reduce((s, r) => s + r, 0) / dailyReturns.length
    const variance = dailyReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / dailyReturns.length
    const std = Math.sqrt(variance)
    sharpeRatio = std ? (mean / std) * Math.sqrt(252) : 0
  }

  return {
    totalTrades:     trades.length,
    wins:            wins.length,
    losses:          losses.length,
    scratches:       scratches.length,
    winRate:         decisive ? (wins.length / decisive) * 100 : 0,
    totalPnlUsd:     parseFloat(totalPnlUsd.toFixed(2)),
    totalReturn:     null,
    avgRR:           parseFloat(avgRR.toFixed(2)),
    sharpeRatio:     parseFloat(sharpeRatio.toFixed(2)),
    equityCurve,
    startingBalance: 0,
    finalBalance:    parseFloat(totalPnlUsd.toFixed(2)),
  }
}

export function DataProvider({ children }) {
  const [authSession, setAuthSession] = useState(null)
  const [authReady,   setAuthReady]   = useState(false)
  const [rawTrades,   setRawTrades]   = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [heartbeat,   setHeartbeat]   = useState(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setAuthSession(data.session ?? null)
      setAuthReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      setAuthSession(next)
      setAuthReady(true)
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    if (!authSession?.user) { setRawTrades([]); setLoading(false); return }
    let active = true
    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('trades')
        .select('*')
        .not('result', 'in', '("NO_SIGNAL","PENDING","PENDING_FILL")')
        .order('traded_at', { ascending: true })
        .order('created_at', { ascending: true })
      if (!active) return
      if (err) { setError(err.message); setLoading(false); return }
      setRawTrades(data ?? [])
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [authSession?.user?.id])

  useEffect(() => {
    if (!authSession?.user) return
    async function fetchHb() {
      const { data } = await supabase.from('bot_heartbeat').select('*').eq('id', 1).single()
      if (data) setHeartbeat(data)
    }
    fetchHb()
    const interval = setInterval(fetchHb, 30000)
    return () => clearInterval(interval)
  }, [authSession?.user?.id])

  const trades  = useMemo(() => rawTrades.map(normalizeRow), [rawTrades])
  const summary = useMemo(() => trades.length ? computeSummary(trades) : null, [trades])

  async function signIn(email, password) {
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    return err?.message ?? null
  }
  async function signOut() { await supabase.auth.signOut() }

  return (
    <DataContext.Provider value={{ trades, summary, loading, error, authSession, authReady, heartbeat, signIn, signOut }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
