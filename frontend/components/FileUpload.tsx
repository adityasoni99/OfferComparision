'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudArrowUpIcon, DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface FileUploadProps {
  onFileUpload: (file: File) => void
  acceptedTypes: string[]
  maxSize: number
  placeholder: string
  isProcessing?: boolean
}

export default function FileUpload({ 
  onFileUpload, 
  acceptedTypes, 
  maxSize, 
  placeholder,
  isProcessing = false 
}: FileUploadProps) {
  const [error, setError] = useState<string>('')

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError('')
    
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`)
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload a PDF, DOC, or DOCX file')
      } else {
        setError('Invalid file. Please try again')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0])
    }
  }, [onFileUpload, maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: false,
    disabled: isProcessing
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : error 
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {isProcessing ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          ) : (
            <CloudArrowUpIcon className={`h-12 w-12 mx-auto ${error ? 'text-red-400' : 'text-gray-400'}`} />
          )}
          
          <div>
            <p className={`text-lg font-medium ${error ? 'text-red-600' : 'text-gray-700'}`}>
              {isProcessing ? 'Processing...' : placeholder}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Or click to browse files
            </p>
          </div>
          
          <div className="text-xs text-gray-400">
            <p>Supports PDF, DOC, DOCX files</p>
            <p>Maximum size: {Math.round(maxSize / 1024 / 1024)}MB</p>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
