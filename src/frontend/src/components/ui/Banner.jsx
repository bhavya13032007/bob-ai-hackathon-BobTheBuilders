import React from 'react';
import { Info, Wifi, WifiOff, AlertTriangle, Lightbulb, X } from 'lucide-react';

/**
 * Banner — Contextual banner for guidance, offline mode, alerts.
 *
 * @param {string} variant - 'info' | 'offline' | 'warning' | 'tip' | 'success'
 * @param {string} title - Bold heading
 * @param {string} message - Body text
 * @param {boolean} dismissible - Show X button
 * @param {function} onDismiss - Callback when dismissed
 * @param {React.ReactNode} action - Optional action button/link
 */
const variantConfig = {
  info: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    icon: Info,
    iconColor: 'text-blue-500',
  },
  offline: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    icon: WifiOff,
    iconColor: 'text-amber-500',
  },
  warning: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
  },
  tip: {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-800',
    icon: Lightbulb,
    iconColor: 'text-emerald-500',
  },
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-800',
    icon: Lightbulb,
    iconColor: 'text-emerald-500',
  },
};

const Banner = ({
  variant = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  action,
  className = '',
}) => {
  const config = variantConfig[variant] || variantConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`
        flex items-start space-x-3 p-4 rounded-xl border
        ${config.bg} ${config.text}
        ${className}
      `}
      role="alert"
    >
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        {title && <p className="font-bold text-sm">{title}</p>}
        {message && <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{message}</p>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Banner;
