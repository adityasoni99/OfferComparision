'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Offer, WORK_TYPES, EMPLOYMENT_TYPES, DOMAINS, BENEFITS_GRADES } from '@/types'
import FileUpload from './FileUpload'
import Slider from './Slider'

interface AdvancedOfferFormProps {
  onSubmit: (offer: Offer) => void
  onClose: () => void
  editOffer?: Offer
}

export default function AdvancedOfferForm({ onSubmit, onClose, editOffer }: AdvancedOfferFormProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual')
  const [formData, setFormData] = useState<Partial<Offer>>({
    company: editOffer?.company || '',
    position: editOffer?.position || '',
    location: editOffer?.location || '',
    base_salary: editOffer?.base_salary || 0,
    equity: editOffer?.equity || 0,
    bonus: editOffer?.bonus || 0,
    signing_bonus: editOffer?.signing_bonus || 0,
    work_type: editOffer?.work_type || 'hybrid',
    employment_type: editOffer?.employment_type || 'full-time',
    domain: editOffer?.domain || '',
    benefits_grade: editOffer?.benefits_grade || 'B',
    wlb_score: editOffer?.wlb_score || 7,
    growth_score: editOffer?.growth_score || 7,
    role_fit: editOffer?.role_fit || 7,
    job_description: editOffer?.job_description || '',
    relocation_support: editOffer?.relocation_support || false,
    other_perks: editOffer?.other_perks || ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUploading, setIsUploading] = useState(false)

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.company?.trim()) newErrors.company = 'Company is required'
    if (!formData.position?.trim()) newErrors.position = 'Position is required'
    if (!formData.location?.trim()) newErrors.location = 'Location is required'
    if (!formData.base_salary || formData.base_salary <= 0) newErrors.base_salary = 'Valid base salary is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const totalCompensation = (formData.base_salary || 0) + (formData.equity || 0) + (formData.bonus || 0)
    
    const offer: Offer = {
      id: editOffer?.id || Date.now().toString(),
      company: formData.company!,
      position: formData.position!,
      location: formData.location!,
      base_salary: formData.base_salary!,
      equity: formData.equity || 0,
      bonus: formData.bonus || 0,
      signing_bonus: formData.signing_bonus || 0,
      work_type: formData.work_type!,
      employment_type: formData.employment_type!,
      domain: formData.domain,
      benefits_grade: formData.benefits_grade!,
      wlb_score: formData.wlb_score!,
      growth_score: formData.growth_score!,
      role_fit: formData.role_fit!,
      job_description: formData.job_description,
      relocation_support: formData.relocation_support,
      other_perks: formData.other_perks,
      total_compensation: totalCompensation
    }
    
    onSubmit(offer)
  }, [formData, validateForm, onSubmit, editOffer])

  const handleInputChange = useCallback((field: keyof Offer, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true)
    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock extracted data
      const extractedData = {
        company: 'Google',
        position: 'Senior Software Engineer',
        location: 'Mountain View, CA',
        base_salary: 180000,
        equity: 150000,
        bonus: 25000,
        signing_bonus: 50000,
        benefits_grade: 'A+' as const,
        job_description: 'Leading backend development for search infrastructure...'
      }
      
      setFormData(prev => ({ ...prev, ...extractedData }))
      setActiveTab('manual')
    } catch (error) {
      console.error('File upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const totalCompensation = (formData.base_salary || 0) + (formData.equity || 0) + (formData.bonus || 0)

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
          <h3 className="text-xl font-semibold text-gray-900">
            {editOffer ? 'Edit Offer' : 'Add New Offer'}
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
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'manual'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upload Offer Letter
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {activeTab === 'upload' ? (
            <div className="p-6">
              <FileUpload
                onFileUpload={handleFileUpload}
                acceptedTypes={['application/pdf', '.doc', '.docx']}
                maxSize={10 * 1024 * 1024} // 10MB
                placeholder="Drag & drop your offer letter here"
                isProcessing={isUploading}
              />
              
              {isUploading && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-700">Processing your offer letter...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={formData.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.company ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Google, Microsoft, Apple"
                  />
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {errors.company}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position *
                  </label>
                  <input
                    type="text"
                    value={formData.position || ''}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.position ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Senior Software Engineer"
                  />
                  {errors.position && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {errors.position}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., San Francisco, CA"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {errors.location}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain/Technology
                  </label>
                  <select
                    value={formData.domain || ''}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select domain...</option>
                    {DOMAINS.map((domain) => (
                      <option key={domain.value} value={domain.value}>
                        {domain.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Compensation */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Compensation Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Salary ($) *
                    </label>
                    <input
                      type="number"
                      value={formData.base_salary || ''}
                      onChange={(e) => handleInputChange('base_salary', parseInt(e.target.value) || 0)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.base_salary ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="150000"
                    />
                    {errors.base_salary && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {errors.base_salary}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equity/Stock Value ($)
                    </label>
                    <input
                      type="number"
                      value={formData.equity || ''}
                      onChange={(e) => handleInputChange('equity', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="50000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Bonus ($)
                    </label>
                    <input
                      type="number"
                      value={formData.bonus || ''}
                      onChange={(e) => handleInputChange('bonus', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="25000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Signing Bonus ($)
                    </label>
                    <input
                      type="number"
                      value={formData.signing_bonus || ''}
                      onChange={(e) => handleInputChange('signing_bonus', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="15000"
                    />
                  </div>
                </div>

                {totalCompensation > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      Total Compensation: ${totalCompensation.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Work Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Type
                  </label>
                  <select
                    value={formData.work_type || 'hybrid'}
                    onChange={(e) => handleInputChange('work_type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    {WORK_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type
                  </label>
                  <select
                    value={formData.employment_type || 'full-time'}
                    onChange={(e) => handleInputChange('employment_type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits Grade
                  </label>
                  <select
                    value={formData.benefits_grade || 'B'}
                    onChange={(e) => handleInputChange('benefits_grade', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    {BENEFITS_GRADES.map((grade) => (
                      <option key={grade.value} value={grade.value} title={grade.description}>
                        {grade.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subjective Scores */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Subjective Ratings</h4>
                <div className="space-y-6">
                  <Slider
                    label="Work-Life Balance"
                    value={formData.wlb_score || 7}
                    onChange={(value) => handleInputChange('wlb_score', value)}
                    min={1}
                    max={10}
                    description="1=Very demanding, 10=Excellent balance"
                  />

                  <Slider
                    label="Growth Opportunity"
                    value={formData.growth_score || 7}
                    onChange={(value) => handleInputChange('growth_score', value)}
                    min={1}
                    max={10}
                    description="1=Limited growth, 10=Excellent opportunities"
                  />

                  <Slider
                    label="Role Fit"
                    value={formData.role_fit || 7}
                    onChange={(value) => handleInputChange('role_fit', value)}
                    min={1}
                    max={10}
                    description="1=Poor fit, 10=Perfect match for your skills/interests"
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={formData.job_description || ''}
                    onChange={(e) => handleInputChange('job_description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Used to calculate Role Fit based on your profile"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="relocation_support"
                    checked={formData.relocation_support || false}
                    onChange={(e) => handleInputChange('relocation_support', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="relocation_support" className="ml-2 block text-sm text-gray-700">
                    Relocation Support Provided
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Perks & Notes
                  </label>
                  <textarea
                    value={formData.other_perks || ''}
                    onChange={(e) => handleInputChange('other_perks', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Free meals, gym membership, learning budget, etc."
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all"
                >
                  {editOffer ? 'Update Offer' : 'Save Offer'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
