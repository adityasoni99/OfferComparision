'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  SparklesIcon, 
  ChartBarIcon, 
  TableCellsIcon,
  ClockIcon,
  DocumentArrowDownIcon 
} from '@heroicons/react/24/outline'
import { Radar, Bar, Doughnut } from 'react-chartjs-2'
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
import ReactMarkdown from 'react-markdown'
import type { AnalysisResults } from '@/types'

// Register Chart.js components
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

interface AnalysisResultsProps {
  results: AnalysisResults
}

export default function AnalysisResults({ results }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'charts' | 'table' | 'timeline'>('ai')

  const tabs = [
    { id: 'ai', label: 'AI Recommendations', icon: SparklesIcon },
    { id: 'charts', label: 'Multi-Dimensional Analysis', icon: ChartBarIcon },
    { id: 'table', label: 'Detailed Comparison', icon: TableCellsIcon },
    { id: 'timeline', label: 'Decision Timeline', icon: ClockIcon }
  ]

  const exportToJSON = () => {
    const dataStr = JSON.stringify(results, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = 'offer-comparison-results.json'
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900">Comprehensive Offer Analysis</h3>
        <button
          onClick={exportToJSON}
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
        >
          <DocumentArrowDownIcon className="h-4 w-4" />
          <span>Export Results</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'ai' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Executive Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <SparklesIcon className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-blue-900">Executive Summary</h4>
              </div>
              <div className="text-blue-800 leading-relaxed">
                <ReactMarkdown 
                  components={{
                    p: ({children}) => <p className="mb-2">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="ml-2">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-blue-900">{children}</strong>,
                  }}
                >
                  {results.executive_summary}
                </ReactMarkdown>
              </div>
            </div>

            {/* AI Comprehensive Analysis */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Analysis</h4>
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown 
                  components={{
                    p: ({children}) => <p className="mb-3">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                    li: ({children}) => <li className="ml-2">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    h1: ({children}) => <h1 className="text-lg font-bold text-gray-900 mb-2">{children}</h1>,
                    h2: ({children}) => <h2 className="text-base font-semibold text-gray-900 mb-2">{children}</h2>,
                  }}
                >
                  {results.final_report?.detailed_analysis || 'No analysis available'}
                </ReactMarkdown>
              </div>
            </div>

            {/* Decision Framework */}
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <h4 className="text-lg font-semibold text-green-900 mb-4">📋 Decision Framework</h4>
              <div className="prose prose-sm max-w-none text-green-800">
                <ReactMarkdown 
                  components={{
                    p: ({children}) => <p className="mb-3">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="ml-2">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-green-900">{children}</strong>,
                    h1: ({children}) => <h1 className="text-lg font-bold text-green-900 mb-2">{children}</h1>,
                    h2: ({children}) => <h2 className="text-base font-semibold text-green-900 mb-2">{children}</h2>,
                  }}
                >
                  {results.final_report?.decision_framework || 'No decision framework available'}
                </ReactMarkdown>
              </div>
            </div>

            {/* Offer-Specific Recommendations */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">💡 Offer-Specific Recommendations</h4>
              {(results.final_report?.offer_rankings || []).map((offer: any, index: number) => (
                <motion.div
                  key={offer.offer_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                >
                  <h5 className="font-medium text-gray-900 mb-2">
                    {offer.company}
                  </h5>
                  <div className="text-sm text-gray-700">
                    <ReactMarkdown 
                      components={{
                        p: ({children}) => <p className="mb-1">{children}</p>,
                        ul: ({children}) => <ul className="list-disc list-inside mb-1 space-y-0.5">{children}</ul>,
                        li: ({children}) => <li className="ml-1 text-xs">{children}</li>,
                        strong: ({children}) => <strong className="font-medium text-gray-900">{children}</strong>,
                      }}
                    >
                      {offer.ai_recommendation || 'No specific recommendation available'}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'charts' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Radar Chart */}
            {results.visualization_data.radar_chart && 
             results.visualization_data.radar_chart.datasets && 
             Array.isArray(results.visualization_data.radar_chart.datasets) && (
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Multi-Dimensional Comparison</h4>
                <div className="h-96 flex items-center justify-center">
                  <Radar 
                    data={results.visualization_data.radar_chart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        r: {
                          beginAtZero: true,
                          max: 10
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Bar Chart */}
            {results.visualization_data.chart_data && 
             results.visualization_data.chart_data.datasets && 
             Array.isArray(results.visualization_data.chart_data.datasets) && (
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Cost-Adjusted Compensation</h4>
                <div className="h-80">
                  <Bar 
                    data={results.visualization_data.chart_data}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                        title: {
                          display: true,
                          text: 'Total Compensation (Cost of Living Adjusted)'
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Rankings Donut */}
            {results.comparison_results?.ranked_offers && 
             Array.isArray(results.comparison_results.ranked_offers) && 
             results.comparison_results.ranked_offers.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-purple-900 mb-4">Overall Rankings</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <Doughnut 
                    data={{
                      labels: results.comparison_results.ranked_offers.map(r => r.company || 'Unknown'),
                      datasets: [{
                        data: results.comparison_results.ranked_offers.map(r => r.total_score || 0),
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)',
                          'rgba(16, 185, 129, 0.8)',
                          'rgba(245, 101, 101, 0.8)',
                          'rgba(139, 92, 246, 0.8)',
                          'rgba(251, 191, 36, 0.8)'
                        ],
                        borderColor: [
                          'rgba(59, 130, 246, 1)',
                          'rgba(16, 185, 129, 1)',
                          'rgba(245, 101, 101, 1)',
                          'rgba(139, 92, 246, 1)',
                          'rgba(251, 191, 36, 1)'
                        ],
                        borderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right' as const,
                        }
                      }
                    }}
                  />
                </div>
                <div className="space-y-3">
                  {results.comparison_results?.ranked_offers?.map((ranking, index) => (
                    <div key={ranking.offer_id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                        }`}>
                          {ranking.rank}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{ranking.company}</p>
                          <p className="text-sm text-gray-600">{ranking.position}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">{ranking.total_score.toFixed(1)}</p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}
          </motion.div>
        )}

        {activeTab === 'table' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Metric</th>
                    {(results.comparison_results?.ranked_offers || []).map(ranking => (
                      <th key={ranking.offer_id} className="text-center py-3 px-4 font-semibold text-gray-900">
                        {ranking.company}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.visualization_data.comparison_table && 
                   Object.entries(results.visualization_data.comparison_table || {}).map(([metric, values]: [string, any]) => (
                    <tr key={metric} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-700 capitalize">
                        {metric.replace(/_/g, ' ')}
                      </td>
                      {(results.comparison_results?.ranked_offers || []).map(ranking => (
                        <td key={ranking.offer_id} className="text-center py-3 px-4 text-gray-600">
                          {(() => {
                            const value = values[ranking.offer_id];
                            if (value == null) return 'N/A';
                            if (typeof value === 'object') {
                              return JSON.stringify(value);
                            }
                            return String(value);
                          })()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'timeline' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center py-8">
              <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Decision Timeline</h4>
              <p className="text-gray-600 mb-6">Track your decision-making process and important milestones</p>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 max-w-md mx-auto">
                <p className="text-blue-800 text-sm">
                  🚧 Timeline feature coming soon! This will help you track offer deadlines, 
                  negotiation progress, and decision milestones.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
