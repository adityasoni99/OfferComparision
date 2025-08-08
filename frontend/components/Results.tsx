'use client'

import { Bar, Radar } from 'react-chartjs-2'
import { motion } from 'framer-motion'

export default function Results({ data }: { data: any }) {
  const radarData = data?.visualization_data?.radar_chart?.data
  const barData = data?.visualization_data?.overall_scores?.data

  const ranked = data?.comparison_results?.ranked_offers || []

  return (
    <section className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-3">Executive Summary</h2>
        <p className="whitespace-pre-wrap text-slate-300">{data?.executive_summary || 'Summary unavailable'}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Multi-Factor Radar</h3>
          {radarData ? <Radar data={radarData} /> : <div className="text-slate-400">Radar chart unavailable</div>}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Overall Scores</h3>
          {barData ? <Bar data={barData} /> : <div className="text-slate-400">Bar chart unavailable</div>}
        </motion.div>
      </div>

      {/* Results timeline */}
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
    </section>
  )
}


