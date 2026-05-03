import { createContext, useContext, useEffect, useState } from 'react'
import Papa from 'papaparse'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [summary, setSummary]   = useState(null)
  const [trades, setTrades]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [sum, csvText] = await Promise.all([
          fetch('/data/summary.json').then(r => r.json()),
          fetch('/data/orb_trades_full.csv').then(r => r.text()),
        ])
        const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true })
        // coerce numeric fields
        const parsed = data.map(row => ({
          ...row,
          entryPrice:   parseFloat(row.entryPrice),
          stopPrice:    parseFloat(row.stopPrice),
          tpPrice:      parseFloat(row.tpPrice),
          exitPrice:    parseFloat(row.exitPrice),
          stopPips:     parseFloat(row.stopPips),
          pnlPips:      parseFloat(row.pnlPips),
          pnlUsd:       parseFloat(row.pnlUsd),
          balanceAfter: parseFloat(row.balanceAfter),
          rangeHigh:    parseFloat(row.rangeHigh),
          rangeLow:     parseFloat(row.rangeLow),
        }))
        setSummary(sum)
        setTrades(parsed)
      } catch (e) {
        setError('Could not load data. Run the backtester and sync-data.ps1 first.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <DataContext.Provider value={{ summary, trades, loading, error }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
