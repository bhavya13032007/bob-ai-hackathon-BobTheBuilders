import React from 'react';

/**
 * ProgressRing — Circular SVG progress indicator.
 * Used for match percentages and profile strength.
 * 
 * @param {number} value - Percentage (0-100)
 * @param {number} size - Diameter in px (default 80)
 * @param {number} strokeWidth - Ring thickness (default 6)
 * @param {string} color - Stroke color class or hex
 * @param {string} label - Optional center label override
 * @param {boolean} showPercentage - Show value% in center (default true)
 */
const ProgressRing = ({ 
  value = 75, 
  size = 80, 
  strokeWidth = 6, 
  color,
  label,
  showPercentage = true,
  className = '' 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  // Dynamic color based on value
  const getColor = () => {
    if (color) return color;
    if (value >= 85) return '#10B981'; // emerald
    if (value >= 70) return '#3B82F6'; // blue
    if (value >= 50) return '#F59E0B'; // amber
    return '#EF4444'; // red
  };

  const strokeColor = getColor();

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center">
        {label ? (
          <span className="text-xs font-bold text-gray-700">{label}</span>
        ) : showPercentage ? (
          <span className="font-black text-gray-900" style={{ fontSize: size * 0.2 }}>
            {value}%
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default ProgressRing;
