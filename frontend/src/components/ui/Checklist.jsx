import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const Checklist = ({ items, onToggle }) => {
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onToggle && onToggle(idx)}
          className={`w-full flex items-center space-x-3 p-3 rounded-xl border text-left transition-all ${
            item.checked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100 hover:border-primary/30'
          }`}
        >
          {item.checked ? (
            <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
          ) : (
            <Circle size={18} className="text-gray-300 flex-shrink-0" />
          )}
          <span className={`text-sm ${item.checked ? 'text-emerald-900 font-semibold' : 'text-gray-600'}`}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Checklist;
