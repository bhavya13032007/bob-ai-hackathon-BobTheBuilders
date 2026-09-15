import React from 'react';
import { CheckCircle2, Clock, ArrowRight, Briefcase, Sparkles } from 'lucide-react';

/**
 * StatusTracker — Horizontal stepper for application status.
 * Applied → Under Review → Selected → Onboarding
 *
 * @param {string} currentStatus - One of: 'Applied', 'Under Review', 'Selected', 'Onboarding'
 * @param {string} size - 'sm' | 'md' (default 'sm')
 */
const STEPS = [
  { key: 'Applied', label: 'Applied', icon: CheckCircle2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { key: 'Under Review', label: 'Under Review', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { key: 'Selected', label: 'Selected', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { key: 'Onboarding', label: 'Onboarding', icon: Briefcase, color: 'text-purple-600 bg-purple-50 border-purple-200' },
];

const StatusTracker = ({ currentStatus = 'Applied', size = 'sm', className = '' }) => {
  const currentIdx = STEPS.findIndex(s => s.key === currentStatus);

  return (
    <div className={`flex items-center ${size === 'sm' ? 'space-x-1' : 'space-x-2'} ${className}`}>
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isActive = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        const isLast = idx === STEPS.length - 1;

        return (
          <React.Fragment key={step.key}>
            <div
              className={`
                flex items-center space-x-1 rounded-full border transition-all
                ${size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'}
                ${isActive ? step.color : 'bg-gray-50 text-gray-400 border-gray-200'}
                ${isCurrent ? 'ring-2 ring-offset-1 ring-current shadow-sm font-black' : 'font-semibold'}
              `}
            >
              <Icon size={size === 'sm' ? 12 : 14} />
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {!isLast && (
              <ArrowRight
                size={size === 'sm' ? 10 : 12}
                className={`flex-shrink-0 ${idx < currentIdx ? 'text-gray-400' : 'text-gray-200'}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StatusTracker;
