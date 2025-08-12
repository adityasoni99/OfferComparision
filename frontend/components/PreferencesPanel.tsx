'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { UserPreferences } from '@/types'
import Slider from './Slider'

interface PreferencesPanelProps {
  preferences: UserPreferences
  onSave: (preferences: UserPreferences) => void
  onClose: () => void
}

const PREFERENCE_DEFINITIONS = [
  {
    key: 'salary_weight' as keyof UserPreferences,
    label: 'Base Salary',
    description: 'Weight of base salary in your decision',
    color: 'green' as const,
    icon: '💰'
  },
  {
    key: 'equity_weight' as keyof UserPreferences,
    label: 'Equity/Stock',
    description: 'Weight of equity value and potential',
    color: 'purple' as const,
    icon: '📈'
  },
  {
    key: 'wlb_weight' as keyof UserPreferences,
    label: 'Work-Life Balance',
    description: 'Weight of work-life balance quality',
    color: 'blue' as const,
    icon: '⚖️'
  },
  {
    key: 'growth_weight' as keyof UserPreferences,
    label: 'Growth Opportunity',
    description: 'Weight of career advancement potential',
    color: 'green' as const,
    icon: '🚀'
  },
  {
    key: 'culture_weight' as keyof UserPreferences,
    label: 'Company Culture',
    description: 'Weight of company culture and values',
    color: 'purple' as const,
    icon: '🏢'
  },
  {
    key: 'benefits_weight' as keyof UserPreferences,
    label: 'Benefits Package',
    description: 'Weight of health, PTO, and other benefits',
    color: 'blue' as const,
    icon: '🎁'
  }
]

const PRESET_PROFILES = [
  {
    name: 'Money Focused',
    description: 'Prioritizes compensation above all',
    icon: '💸',
    weights: {
      salary_weight: 0.50,
      equity_weight: 0.30,
      wlb_weight: 0.05,
      growth_weight: 0.10,
      culture_weight: 0.03,
      benefits_weight: 0.02
    }
  },
  {
    name: 'Growth Focused',
    description: 'Prioritizes learning and advancement',
    icon: '📚',
    weights: {
      salary_weight: 0.20,
      equity_weight: 0.15,
      wlb_weight: 0.15,
      growth_weight: 0.35,
      culture_weight: 0.10,
      benefits_weight: 0.05
    }
  },
  {
    name: 'Life Balance',
    description: 'Prioritizes work-life balance and wellness',
    icon: '🧘',
    weights: {
      salary_weight: 0.20,
      equity_weight: 0.10,
      wlb_weight: 0.40,
      growth_weight: 0.15,
      culture_weight: 0.10,
      benefits_weight: 0.05
    }
  },
  {
    name: 'Balanced',
    description: 'Equally weighted approach',
    icon: '⚖️',
    weights: {
      salary_weight: 0.30,
      equity_weight: 0.20,
      wlb_weight: 0.20,
      growth_weight: 0.15,
      culture_weight: 0.10,
      benefits_weight: 0.05
    }
  }
]

export default function PreferencesPanel({ preferences, onSave, onClose }: PreferencesPanelProps) {
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(preferences)
  const [activeTab, setActiveTab] = useState<'quick' | 'custom'>('quick')

  // Normalize weights to ensure they sum to 1.0
  const normalizeWeights = (weights: UserPreferences): UserPreferences => {
    const total = Object.values(weights).reduce((sum, value) => sum + value, 0)
    if (total === 0) return weights
    
    return Object.keys(weights).reduce((normalized, key) => {
      normalized[key as keyof UserPreferences] = weights[key as keyof UserPreferences] / total
      return normalized
    }, {} as UserPreferences)
  }

  useEffect(() => {
    setLocalPreferences(normalizeWeights(localPreferences))
  }, [localPreferences])

  const handleWeightChange = (key: keyof UserPreferences, value: number) => {
    const newWeights = { ...localPreferences, [key]: value / 100 }
    setLocalPreferences(normalizeWeights(newWeights))
  }

  const handlePresetSelect = (preset: typeof PRESET_PROFILES[0]) => {
    setLocalPreferences(preset.weights)
  }

  const handleSave = () => {
    onSave(normalizeWeights(localPreferences))
    onClose()
  }

  const totalWeight = Object.values(localPreferences).reduce((sum, value) => sum + value, 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <AdjustmentsHorizontalIcon className="h-6 w-6 mr-2" />
            Your Preferences
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'quick'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Quick Presets
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'custom'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Custom Weights
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {activeTab === 'quick' ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Choose Your Focus</h4>
                <p className="text-sm text-gray-600 mb-6">
                  Select a preset that matches your career priorities. You can always customize further.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRESET_PROFILES.map((preset) => (
                  <motion.button
                    key={preset.name}
                    onClick={() => handlePresetSelect(preset)}
                    className="text-left p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{preset.icon}</span>
                      <h5 className="text-lg font-semibold text-gray-900">{preset.name}</h5>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{preset.description}</p>
                    
                    <div className="space-y-2">
                      {PREFERENCE_DEFINITIONS.map((pref) => (
                        <div key={pref.key} className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{pref.label}</span>
                          <span className="text-xs font-medium text-gray-700">
                            {Math.round(preset.weights[pref.key] * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Custom Weight Assignment</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Adjust the importance of each factor in your decision-making process.
                </p>
                
                {totalWeight !== 1.0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <p className="text-sm text-yellow-800">
                      Weights will be automatically normalized to sum to 100%
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {PREFERENCE_DEFINITIONS.map((pref) => (
                  <div key={pref.key} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-xl">{pref.icon}</span>
                      <div>
                        <h5 className="font-medium text-gray-900">{pref.label}</h5>
                        <p className="text-sm text-gray-600">{pref.description}</p>
                      </div>
                    </div>
                    
                    <Slider
                      label=""
                      value={Math.round(localPreferences[pref.key] * 100)}
                      onChange={(value) => handleWeightChange(pref.key, value)}
                      min={0}
                      max={100}
                      color={pref.color}
                    />
                  </div>
                ))}
              </div>

              {/* Weight Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-3">Weight Distribution</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {PREFERENCE_DEFINITIONS.map((pref) => (
                    <div key={pref.key} className="flex items-center justify-between">
                      <span className="text-blue-700">{pref.label}</span>
                      <span className="font-medium text-blue-900">
                        {Math.round(localPreferences[pref.key] * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all"
          >
            Save Preferences
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
