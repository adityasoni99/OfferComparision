'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

type Props = {
  onChange: (prefs: Record<string, any>) => void
}

const SCORING_FACTORS = [
  { key: 'base_salary', label: 'Base Salary', default: 0.20 },
  { key: 'total_compensation', label: 'Total Compensation', default: 0.15 },
  { key: 'equity_upside', label: 'Equity Upside', default: 0.15 },
  { key: 'work_life_balance', label: 'Work-Life Balance', default: 0.15 },
  { key: 'career_growth', label: 'Career Growth', default: 0.12 },
  { key: 'company_culture', label: 'Company Culture', default: 0.10 },
  { key: 'location_preference', label: 'Location Preference', default: 0.08 },
  { key: 'benefits_quality', label: 'Benefits Quality', default: 0.05 },
]

export default function PreferencesForm({ onChange }: Props) {
  const [focusMode, setFocusMode] = useState<string | null>(null)
  const [customWeights, setCustomWeights] = useState<Record<string, number>>({})
  const [showAdvanced, setShowAdvanced] = useState(false)

  function updateFocus(mode: string, enabled: boolean) {
    const newFocus = enabled ? mode : null
    setFocusMode(newFocus)
    
    // Clear other focus modes and send updated preferences
    const prefs: Record<string, any> = {
      salary_focused: newFocus === 'salary_focused',
      growth_focused: newFocus === 'growth_focused',
      balance_focused: newFocus === 'balance_focused',
    }
    
    if (Object.keys(customWeights).length > 0) {
      prefs.custom_weights = customWeights
    }
    
    onChange(prefs)
  }

  function updateWeight(factor: string, weight: number) {
    const newWeights = { ...customWeights, [factor]: weight / 100 }
    setCustomWeights(newWeights)
    
    const prefs: Record<string, any> = {
      salary_focused: focusMode === 'salary_focused',
      growth_focused: focusMode === 'growth_focused',
      balance_focused: focusMode === 'balance_focused',
      custom_weights: newWeights,
    }
    
    onChange(prefs)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">Your Priorities</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-slate-400 hover:text-slate-300"
        >
          {showAdvanced ? 'Simple' : 'Advanced'}
        </button>
      </div>

      {/* Quick Focus Modes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FocusToggle 
          label="💰 Salary Focused" 
          active={focusMode === 'salary_focused'} 
          onChange={(v) => updateFocus('salary_focused', v)} 
        />
        <FocusToggle 
          label="📈 Growth Focused" 
          active={focusMode === 'growth_focused'} 
          onChange={(v) => updateFocus('growth_focused', v)} 
        />
        <FocusToggle 
          label="⚖️ Balance Focused" 
          active={focusMode === 'balance_focused'} 
          onChange={(v) => updateFocus('balance_focused', v)} 
        />
      </div>

      {/* Advanced Weight Customization */}
      {showAdvanced && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="space-y-3 pt-4 border-t border-slate-700"
        >
          <p className="text-sm text-slate-400">Fine-tune importance of each factor (0-100%):</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SCORING_FACTORS.map((factor) => (
              <WeightSlider
                key={factor.key}
                label={factor.label}
                value={customWeights[factor.key] ? customWeights[factor.key] * 100 : factor.default * 100}
                onChange={(v) => updateWeight(factor.key, v)}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function FocusToggle({ label, active, onChange }: { label: string; active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`p-3 rounded-lg border transition ${
        active 
          ? 'bg-blue-600/20 border-blue-500 text-blue-300' 
          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/60'
      }`}
    >
      <div className="text-sm font-medium">{label}</div>
    </button>
  )
}

function WeightSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{value.toFixed(0)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="50"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  )
}


