'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { 
  PlusIcon, 
  DocumentTextIcon, 
  CogIcon, 
  ChartBarIcon,
  SparklesIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

import ProfileManager from '@/components/ProfileManager'
import AdvancedOfferForm from '@/components/AdvancedOfferForm'
import PreferencesPanel from '@/components/PreferencesPanel'
import OfferCards from '@/components/OfferCards'
import AnalysisResults from '@/components/AnalysisResults'
import { Offer, UserPreferences } from '@/types'

export default function OfferComparePage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [selectedOffers, setSelectedOffers] = useState<string[]>([])
  const [preferences, setPreferences] = useState<UserPreferences>({
    salary_weight: 0.30,
    equity_weight: 0.20,
    wlb_weight: 0.20,
    growth_weight: 0.15,
    culture_weight: 0.10,
    benefits_weight: 0.05
  })
  const [analysisResults, setAnalysisResults] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedOffers = localStorage.getItem('offercompare_offers')
    const savedPreferences = localStorage.getItem('offercompare_preferences')
    const savedSelectedOffers = localStorage.getItem('offercompare_selected_offers')
    
    if (savedOffers) {
      try {
        const parsedOffers = JSON.parse(savedOffers)
        if (Array.isArray(parsedOffers)) {
          setOffers(parsedOffers)
        }
      } catch (error) {
        console.error('Error loading saved offers:', error)
      }
    }
    
    if (savedPreferences) {
      try {
        const parsedPreferences = JSON.parse(savedPreferences)
        if (parsedPreferences && typeof parsedPreferences === 'object') {
          setPreferences(prevPrefs => ({ ...prevPrefs, ...parsedPreferences }))
        }
      } catch (error) {
        console.error('Error loading saved preferences:', error)
      }
    }
    
    if (savedSelectedOffers) {
      try {
        const parsedSelected = JSON.parse(savedSelectedOffers)
        if (Array.isArray(parsedSelected)) {
          setSelectedOffers(parsedSelected)
        }
      } catch (error) {
        console.error('Error loading saved selected offers:', error)
      }
    }
  }, [])

  // Save offers to localStorage whenever they change
  useEffect(() => {
    if (offers.length > 0) {
      localStorage.setItem('offercompare_offers', JSON.stringify(offers))
    }
  }, [offers])

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('offercompare_preferences', JSON.stringify(preferences))
  }, [preferences])

  // Save selected offers to localStorage whenever they change
  useEffect(() => {
    if (selectedOffers.length > 0) {
      localStorage.setItem('offercompare_selected_offers', JSON.stringify(selectedOffers))
    }
  }, [selectedOffers])

  const handleAddOffer = useCallback((newOffer: Offer) => {
    setOffers(prev => [...prev, { ...newOffer, id: Date.now().toString() }])
    setShowOfferModal(false)
  }, [])

  const handleRemoveOffer = useCallback((offerId: string) => {
    setOffers(prev => prev.filter(offer => offer.id !== offerId))
    setSelectedOffers(prev => prev.filter(id => id !== offerId))
  }, [])

  const handleToggleSelection = useCallback((offerId: string) => {
    setSelectedOffers(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    )
  }, [])

  const runAnalysis = async () => {
    if (selectedOffers.length < 2) {
      alert('Please select at least 2 offers to compare')
      return
    }

    setIsAnalyzing(true)
    try {
      const selectedOfferData = offers.filter(offer => selectedOffers.includes(offer.id))
      const response = await axios.post('http://localhost:8001/api/analyze', {
        offers: selectedOfferData,
        user_preferences: preferences
      })
      setAnalysisResults(response.data)
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClearAllData = useCallback(() => {
    if (confirm('Are you sure you want to clear all saved offers and preferences? This action cannot be undone.')) {
      localStorage.removeItem('offercompare_offers')
      localStorage.removeItem('offercompare_preferences')
      localStorage.removeItem('offercompare_selected_offers')
      setOffers([])
      setSelectedOffers([])
      setPreferences({
        salary_weight: 0.30,
        equity_weight: 0.20,
        wlb_weight: 0.20,
        growth_weight: 0.15,
        culture_weight: 0.10,
        benefits_weight: 0.05
      })
      setAnalysisResults(null)
      alert('All data cleared successfully!')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                OfferCompare Pro
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded-lg transition-colors backdrop-blur-sm"
              >
                <DocumentTextIcon className="h-4 w-4" />
                <span>Upload Resume</span>
              </button>
              
              <button
                onClick={() => setShowPreferencesModal(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-200 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded-lg transition-colors backdrop-blur-sm"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                <span>Preferences</span>
              </button>
              

            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        {offers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 mb-8 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl shadow-xl border border-slate-600 backdrop-blur-sm"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl inline-block mb-6">
              <SparklesIcon className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Make Smarter Career Decisions
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Compare job offers with advanced market analysis, cost of living adjustments, 
              personalized weighting, and AI-powered recommendations. Get real purchasing power 
              comparisons across different locations.
            </p>
            <button
              onClick={() => setShowOfferModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Start Comparing Offers
            </button>
          </motion.div>
        )}

        {/* Offers Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Offers */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-2xl shadow-xl border border-slate-600 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Your Job Offers</h3>
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add New Offer</span>
                </button>
              </div>

              {offers.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-600 rounded-xl">
                  <CloudArrowUpIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">No offers added yet</p>
                  <button
                    onClick={() => setShowOfferModal(true)}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Add your first offer
                  </button>
                </div>
              ) : (
                <>
                  <OfferCards 
                    offers={offers}
                    selectedOffers={selectedOffers}
                    onToggleSelection={handleToggleSelection}
                    onRemoveOffer={handleRemoveOffer}
                  />
                  
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      {selectedOffers.length === 0 ? '0 offers selected' : 
                       selectedOffers.length === 1 ? '1 offer selected' :
                       `${selectedOffers.length} offers selected`}
                      {selectedOffers.length < 2 && ' • Select 2+ offers to compare'}
                    </p>
                    
                    <button
                      onClick={runAnalysis}
                      disabled={selectedOffers.length < 2 || isAnalyzing}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:cursor-not-allowed"
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Compare Selected Offers'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-2xl shadow-xl border border-slate-600 p-6 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-white mb-4">👤 Your Profile</h4>
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-full text-left p-4 border-2 border-dashed border-slate-600 rounded-lg hover:border-blue-400 hover:bg-slate-700/50 transition-colors"
              >
                <DocumentTextIcon className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-200">Upload Your Resume</p>
                <p className="text-xs text-slate-400">Help us provide better recommendations</p>
              </button>
            </div>

            <div className="bg-slate-800/50 rounded-2xl shadow-xl border border-slate-600 p-6 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-white mb-4">⚙️ Preferences</h4>
              <button
                onClick={() => setShowPreferencesModal(true)}
                className="w-full text-left p-4 border border-slate-600 rounded-lg hover:border-blue-400 hover:bg-slate-700/50 transition-colors"
              >
                <CogIcon className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-200">Set Your Priorities</p>
                <p className="text-xs text-slate-400">Customize factor weightings</p>
              </button>
            </div>

            <div className="bg-slate-800/50 rounded-2xl shadow-xl border border-slate-600 p-6 backdrop-blur-sm">
              <h4 className="text-lg font-semibold text-white mb-4">💾 Data Management</h4>
              <div className="space-y-3">
                <button
                  onClick={handleClearAllData}
                  className="w-full text-left p-3 border border-red-600/50 rounded-lg hover:border-red-400 hover:bg-red-900/20 transition-colors"
                >
                  <p className="text-sm font-medium text-red-300">Clear All Data</p>
                  <p className="text-xs text-red-400">Reset offers and preferences</p>
                </button>
                
                <div className="text-center text-slate-400 text-xs">
                  💡 Your data is automatically saved in browser storage
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {analysisResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <AnalysisResults results={analysisResults} />
          </motion.div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showProfileModal && (
          <ProfileManager onClose={() => setShowProfileModal(false)} />
        )}
        
        {showPreferencesModal && (
          <PreferencesPanel 
            preferences={preferences}
            onSave={setPreferences}
            onClose={() => setShowPreferencesModal(false)}
          />
        )}
        
        {showOfferModal && (
          <AdvancedOfferForm 
            onSubmit={handleAddOffer}
            onClose={() => setShowOfferModal(false)}
          />
        )}


      </AnimatePresence>
    </div>
  )
}