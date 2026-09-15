import React from 'react';

/**
 * Chip — Pill-shaped tag element with icon support.
 * Used for skills, sectors, location badges, etc.
 *
 * @param {string} label - Display text
 * @param {React.ReactNode} icon - Optional leading icon
 * @param {string} variant - 'default' | 'success' | 'warning' | 'info' | 'danger' | 'outline'
 * @param {boolean} removable - Show X button
 * @param {function} onRemove - Callback when X clicked
 * @param {boolean} selected - Active/selected state
 * @param {function} onClick - Click handler (makes it a button)
 * @param {string} size - 'sm' | 'md' (default 'sm')
 */
const variantStyles = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  outline: 'bg-white text-gray-600 border-gray-300',
};

const Chip = ({
  label,
  icon,
  variant = 'default',
  removable = false,
  onRemove,
  selected = false,
  onClick,
  size = 'sm',
  className = '',
}) => {
  const base = variantStyles[variant] || variantStyles.default;
  const sizeClass = size === 'md' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';
  const selectedClass = selected
    ? 'ring-2 ring-blue-400 bg-blue-50 text-blue-700 border-blue-300'
    : '';

  const Tag = onClick ? 'button' : 'span';

  return (
    <Tag
      onClick={onClick}
      className={`
        inline-flex items-center space-x-1.5 border rounded-full font-semibold
        transition-all duration-150
        ${sizeClass} ${base} ${selectedClass}
        ${onClick ? 'cursor-pointer hover:shadow-sm active:scale-95' : ''}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0 opacity-80">{icon}</span>}
      <span>{label}</span>
      {removable && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
          className="ml-1 -mr-1 opacity-50 hover:opacity-100 transition-opacity"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </Tag>
  );
};

export default Chip;
