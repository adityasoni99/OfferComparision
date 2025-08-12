'use client'

import { motion } from 'framer-motion'
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Offer } from '@/types'

interface OfferCardsProps {
  offers: Offer[]
  selectedOffers: string[]
  onToggleSelection: (offerId: string) => void
  onRemoveOffer: (offerId: string) => void
}

export default function OfferCards({ 
  offers, 
  selectedOffers, 
  onToggleSelection, 
  onRemoveOffer 
}: OfferCardsProps) {
  const getWorkTypeColor = (workType: string) => {
    switch (workType) {
      case 'remote': return 'bg-green-900/50 text-green-300 border border-green-800'
      case 'onsite': return 'bg-blue-900/50 text-blue-300 border border-blue-800'
      case 'hybrid': return 'bg-purple-900/50 text-purple-300 border border-purple-800'
      default: return 'bg-slate-700/50 text-slate-300 border border-slate-600'
    }
  }

  const getBenefitsGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-emerald-900/50 text-emerald-300 border border-emerald-800'
      case 'A': return 'bg-green-900/50 text-green-300 border border-green-800'
      case 'B+': return 'bg-blue-900/50 text-blue-300 border border-blue-800'
      case 'B': return 'bg-yellow-900/50 text-yellow-300 border border-yellow-800'
      case 'C+': return 'bg-orange-900/50 text-orange-300 border border-orange-800'
      case 'C': return 'bg-red-900/50 text-red-300 border border-red-800'
      default: return 'bg-slate-700/50 text-slate-300 border border-slate-600'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {offers.map((offer, index) => (
        <motion.div
          key={offer.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative bg-slate-800/80 border-2 rounded-xl p-5 transition-all cursor-pointer hover:shadow-xl backdrop-blur-sm ${
            selectedOffers.includes(offer.id)
              ? 'border-blue-500 bg-blue-900/30 shadow-lg shadow-blue-500/20'
              : 'border-slate-600 hover:border-slate-500'
          }`}
          onClick={() => onToggleSelection(offer.id)}
        >
          {/* Selection Indicator */}
          {selectedOffers.includes(offer.id) && (
            <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-1">
              <CheckCircleIcon className="h-5 w-5 text-white" />
            </div>
          )}

          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemoveOffer(offer.id)
            }}
            className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-400 transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>

          {/* Company Header */}
          <div className="flex items-start space-x-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <BuildingOfficeIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{offer.company}</h3>
              <p className="text-sm text-slate-300 truncate">{offer.position}</p>
            </div>
          </div>

          {/* Location & Work Type */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-sm text-slate-300">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span className="truncate">{offer.location}</span>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getWorkTypeColor(offer.work_type)}`}>
              {offer.work_type}
            </span>
          </div>

          {/* Compensation */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Base Salary</span>
              <span className="font-semibold text-white">
                ${offer.base_salary.toLocaleString()}
              </span>
            </div>
            
            {offer.equity > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Equity</span>
                <span className="font-medium text-slate-200">
                  ${offer.equity.toLocaleString()}
                </span>
              </div>
            )}
            
            {offer.bonus > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Bonus</span>
                <span className="font-medium text-slate-200">
                  ${offer.bonus.toLocaleString()}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2 border-t border-slate-600">
              <span className="text-sm font-medium text-slate-300">Total</span>
              <span className="font-bold text-green-400">
                ${(offer.total_compensation || offer.base_salary + offer.equity + offer.bonus).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Ratings */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center">
              <div className="text-sm font-medium text-white">{offer.wlb_score}/10</div>
              <div className="text-xs text-slate-400">Work-Life</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-white">{offer.growth_score}/10</div>
              <div className="text-xs text-slate-400">Growth</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-white">{offer.role_fit}/10</div>
              <div className="text-xs text-slate-400">Role Fit</div>
            </div>
          </div>

          {/* Benefits Grade */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Benefits</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBenefitsGradeColor(offer.benefits_grade)}`}>
              {offer.benefits_grade}
            </span>
          </div>

          {/* Analysis Results (if available) */}
          {offer.total_score && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall Score</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                      style={{ width: `${(offer.total_score / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {offer.total_score.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
