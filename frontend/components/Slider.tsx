'use client'

interface SliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  description?: string
  color?: 'blue' | 'green' | 'purple' | 'red'
}

export default function Slider({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step = 1, 
  description,
  color = 'blue' 
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100

  const colorClasses = {
    blue: {
      bg: 'bg-blue-600',
      thumb: 'bg-blue-600 border-blue-600',
      track: 'bg-blue-200'
    },
    green: {
      bg: 'bg-green-600',
      thumb: 'bg-green-600 border-green-600',
      track: 'bg-green-200'
    },
    purple: {
      bg: 'bg-purple-600',
      thumb: 'bg-purple-600 border-purple-600',
      track: 'bg-purple-200'
    },
    red: {
      bg: 'bg-red-600',
      thumb: 'bg-red-600 border-red-600',
      track: 'bg-red-200'
    }
  }

  const colors = colorClasses[color]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <span className={`text-sm font-semibold px-2 py-1 rounded ${colors.bg} text-white`}>
          {value}
        </span>
      </div>
      
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className={`h-2 rounded-full transition-all duration-200 ${colors.track}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
        
        <div 
          className={`absolute top-1/2 w-4 h-4 rounded-full border-2 shadow-sm transform -translate-y-1/2 -translate-x-1/2 transition-all duration-200 ${colors.thumb} bg-white`}
          style={{ left: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  )
}
