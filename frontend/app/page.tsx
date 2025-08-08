'use client'

import { useState } from 'react'
import axios from 'axios'
import OfferForm, { Offer } from '@/components/OfferForm'
import PreferencesForm from '@/components/PreferencesForm'
import Results from '@/components/Results'
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
  const [offers, setOffers] = useState<Offer[]>([])
  const [prefs, setPrefs] = useState<Record<string, any>>({})

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

  const analyze = async () => {
    try {
      setLoading(true)
      setError(null)
      const payload = { offers, user_preferences: prefs }
      const res = await axios.post(`${API_BASE}/api/analyze`, payload)
      setData(res.data)
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to analyze')
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
        <div className="space-y-6">
          <OfferForm onChange={setOffers} />
          <PreferencesForm onChange={(p) => setPrefs((prev) => ({ ...prev, ...p }))} />
          <div className="flex gap-3">
            <button
              onClick={analyze}
              disabled={loading}
              className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-500 transition text-white"
            >
              {loading ? 'Analyzing...' : 'Analyze Offers'}
            </button>
            <button
              onClick={runDemo}
              disabled={loading}
              className="rounded-lg px-4 py-2 bg-slate-800/70 hover:bg-slate-700/70 transition text-slate-100 border border-slate-700"
            >
              {loading ? 'Running Demo...' : 'Run Demo'}
            </button>
          </div>
        </div>
      )}

      {data && <Results data={data} />}
    </main>
  )
}


