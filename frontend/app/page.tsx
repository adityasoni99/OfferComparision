'use client'

import { useState } from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { Bar, Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  Tooltip,
  Legend
)

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runDemo = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${API_BASE}/api/demo`)
      setData(res.data)
    } catch (e: any) {
      setError(e?.message || 'Failed to run demo')
    } finally {
      setLoading(false)
    }
  }

  const radarData = data?.visualization_data?.radar_chart?.data
  const barData = data?.visualization_data?.overall_scores?.data

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
            OfferCompare Pro
          </h1>
          <p className="text-slate-400 mt-2">AI-powered job offer analysis and decision support</p>
        </div>
        <button
          onClick={runDemo}
          disabled={loading}
          className="rounded-lg px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition text-white font-medium shadow-lg"
        >
          {loading ? 'Running Demo...' : 'Run Demo'}
        </button>
      </header>

      {error && (
        <div className="glass rounded-lg p-4 text-red-300 mb-6">{error}</div>
      )}

      {!data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold">Compare Offers</h3>
            <p className="text-slate-400 mt-2">Analyze salary, equity, bonus, and more across multiple offers.</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold">Market Intelligence</h3>
            <p className="text-slate-400 mt-2">Benchmark against market data and cost-of-living adjustments.</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold">AI Recommendations</h3>
            <p className="text-slate-400 mt-2">Get personalized guidance and executive summaries.</p>
          </div>
        </div>
      )}

      {data && (
        <section className="space-y-8">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-3">Executive Summary</h2>
            <p className="whitespace-pre-wrap text-slate-300">
              {data.executive_summary || 'Summary unavailable'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Multi-Factor Radar</h3>
              {radarData ? (
                <Radar data={radarData} />
              ) : (
                <div className="text-slate-400">Radar chart unavailable</div>
              )}
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Overall Scores</h3>
              {barData ? (
                <Bar data={barData} />
              ) : (
                <div className="text-slate-400">Bar chart unavailable</div>
              )}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Top Recommendation</h3>
            <div className="text-slate-300">
              {data?.final_report?.top_recommendation || '—'}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}


