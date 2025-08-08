'use client'

import { useMemo, useState, useEffect } from 'react'
import { Bar, Radar, Scatter, Doughnut } from 'react-chartjs-2'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
)

export default function Results({ data }: { data: any }) {
  const viz = data?.visualization_data || {}
  const radarData = viz?.radar_chart?.data
  const barData = viz?.overall_scores?.data
  const scatterData = viz?.market_position?.data
  const factorBar = viz?.factor_importance?.data
  const comparisonTable = viz?.comparison_table
  const compBreakdowns = viz?.compensation_breakdowns || {}

  const ranked = data?.comparison_results?.ranked_offers || []

  const tabs = useMemo(
    () => [
      { key: 'summary', label: 'Summary' },
      { key: 'charts', label: 'Charts' },
      { key: 'breakdowns', label: 'Compensation' },
      { key: 'table', label: 'Comparison Table' },
      { key: 'timeline', label: 'Timeline' },
    ],
    []
  )

  const [active, setActive] = useState<string>('summary')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const applyHash = () => {
      const urlHash = window.location.hash.replace('#', '')
      if (urlHash && tabs.some((t) => t.key === urlHash)) {
        setActive(urlHash)
      }
    }
    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [tabs])

  const onSave = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'offercompare_results.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActive(t.key)
                if (typeof window !== 'undefined') {
                  window.location.hash = t.key
                }
              }}
              className={`px-4 py-2 rounded-lg border ${active === t.key ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800/60 text-slate-200 border-slate-700 hover:bg-slate-700/60'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={onSave} className="rounded-lg px-4 py-2 bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700">Save JSON</button>
      </div>

      {active === 'summary' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-3">Executive Summary</h2>
          <p className="whitespace-pre-wrap text-slate-300">{data?.executive_summary || 'Summary unavailable'}</p>
        </motion.div>
      )}

      {active === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Multi-Factor Radar</h3>
            {radarData ? <Radar data={radarData} /> : <div className="text-slate-400">Radar chart unavailable</div>}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Overall Scores</h3>
            {barData ? <Bar data={barData} /> : <div className="text-slate-400">Bar chart unavailable</div>}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Market Position (Base vs Total Percentile)</h3>
            {scatterData ? <Scatter data={scatterData} /> : <div className="text-slate-400">Scatter chart unavailable</div>}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Factor Importance</h3>
            {factorBar ? <Bar data={factorBar} /> : <div className="text-slate-400">Importance chart unavailable</div>}
          </motion.div>
        </div>
      )}

      {active === 'breakdowns' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(compBreakdowns).map(([offerId, cfg]: any) => (
            <motion.div key={offerId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">{offerId}</h3>
              {cfg?.data ? <Doughnut data={cfg.data} /> : <div className="text-slate-400">Breakdown unavailable</div>}
            </motion.div>
          ))}
        </div>
      )}

      {active === 'table' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 overflow-auto">
          <h3 className="text-lg font-semibold mb-4">Detailed Comparison</h3>
          <table className="min-w-full text-sm">
            <thead className="text-slate-300">
              <tr>
                {comparisonTable?.headers?.map((h: string) => (
                  <th key={h} className="text-left px-3 py-2 border-b border-slate-700 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonTable?.rows?.map((row: any[], idx: number) => (
                <tr key={idx} className="hover:bg-white/5">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 border-b border-slate-800 text-slate-300">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {active === 'timeline' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Results Timeline</h3>
          <div className="relative border-l border-slate-700 pl-6 space-y-6">
            {ranked.map((r: any, idx: number) => (
              <div key={r.offer_id || idx} className="relative">
                <div className="absolute -left-3 top-1 size-2 rounded-full bg-blue-500"></div>
                <div className="text-slate-200 font-medium">{r.company}</div>
                <div className="text-slate-400 text-sm">Score: {r.total_score?.toFixed?.(1) ?? r.total_score}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  )
}


