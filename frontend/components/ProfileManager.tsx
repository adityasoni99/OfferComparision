'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon, UserIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import FileUpload from './FileUpload'

interface ProfileManagerProps {
  onClose: () => void
}

export default function ProfileManager({ onClose }: ProfileManagerProps) {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    experience_years: 0,
    current_location: '',
    skills: [] as string[],
    resume_text: ''
  })
  const [isUploading, setIsUploading] = useState(false)

  const handleResumeUpload = async (file: File) => {
    setIsUploading(true)
    try {
      // Simulate resume processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock extracted profile data
      const extractedProfile = {
        name: 'John Doe',
        email: 'john@example.com',
        experience_years: 5,
        current_location: 'San Francisco, CA',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
        resume_text: 'Senior Software Engineer with 5+ years of experience...'
      }
      
      setProfile(prev => ({ ...prev, ...extractedProfile }))
    } catch (error) {
      console.error('Resume upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = () => {
    // Save profile logic here
    console.log('Saving profile:', profile)
    onClose()
  }

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
        className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <UserIcon className="h-6 w-6 mr-2" />
            Your Profile
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {/* Resume Upload Section */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Upload Your Resume</h4>
            <FileUpload
              onFileUpload={handleResumeUpload}
              acceptedTypes={['application/pdf', '.doc', '.docx']}
              maxSize={10 * 1024 * 1024} // 10MB
              placeholder="Drag & drop your resume here"
              isProcessing={isUploading}
            />
            
            {isUploading && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-700">
                    Processing your resume... Extracting skills and experience.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900">Profile Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={profile.experience_years}
                  onChange={(e) => setProfile(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Location
                </label>
                <input
                  type="text"
                  value={profile.current_location}
                  onChange={(e) => setProfile(prev => ({ ...prev, current_location: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills & Technologies
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                  >
                    {skill}
                    <button
                      onClick={() => setProfile(prev => ({
                        ...prev,
                        skills: prev.skills.filter((_, i) => i !== index)
                      }))}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add skills (press Enter)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const value = e.currentTarget.value.trim()
                    if (value && !profile.skills.includes(value)) {
                      setProfile(prev => ({ ...prev, skills: [...prev.skills, value] }))
                      e.currentTarget.value = ''
                    }
                  }
                }}
              />
            </div>

            {/* Resume Text Preview */}
            {profile.resume_text && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Summary
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-700">{profile.resume_text}</p>
                </div>
              </div>
            )}
          </div>
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
            Save Profile
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
