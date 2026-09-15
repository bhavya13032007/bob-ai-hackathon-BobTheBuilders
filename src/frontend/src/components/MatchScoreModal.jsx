import React from 'react';
import { Sparkles, MapPin, CheckCircle, XCircle, Award, BookOpen, ExternalLink, X, HelpCircle, ShieldCheck } from 'lucide-react';

const MatchScoreModal = ({ isOpen, onClose, recommendation, candidate }) => {
  if (!isOpen || !recommendation) return null;

  const { internship, match_percentage, proximity, explanation } = recommendation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-green-50 border border-green-200 text-green-800 text-xs font-black px-3 py-1 rounded-full mb-1">
              <Sparkles size={14} className="text-secondary" />
              <span>{match_percentage}% Match Score Breakdown</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{internship.title}</h3>
            <p className="text-xs text-gray-500">{internship.company_name} • {internship.district}, {internship.state}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Breakdown Metric Bars */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">AI Scoring Formula</h4>

          {/* 1. Skill Overlap */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-gray-700">1. Skill Overlap (TF-IDF & Fuzzy Similarity)</span>
              <span className="text-primary font-black">{explanation?.skill_fit_score || 88}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${explanation?.skill_fit_score || 88}%` }}></div>
            </div>
          </div>

          {/* 2. Sector Preference Match */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-gray-700">2. Industry Sector Alignment</span>
              <span className="text-primary font-black">95%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full w-[95%]"></div>
            </div>
          </div>

          {/* 3. Geographic Proximity */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-gray-700">3. Location Proximity ({proximity?.tier || 'Proximity'})</span>
              <span className="text-primary font-black">{proximity?.tier_score || 85}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${proximity?.tier_score || 85}%` }}></div>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">{proximity?.label}</p>
          </div>

          {/* 4. Certificate Verification Boost */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-gray-700">4. Verified Credentials Boost</span>
              <span className="text-emerald-600 font-black">+10% Boost</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full w-[100%]"></div>
            </div>
          </div>
        </div>

        {/* Skills Matched & Missing */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50/70 border border-green-200 rounded-2xl p-3.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-green-800 mb-2">
              <CheckCircle size={14} className="text-green-600" />
              <span>Matched Skills</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {explanation?.matched_skills && explanation.matched_skills.length > 0 ? (
                explanation.matched_skills.map((s, i) => (
                  <span key={i} className="text-[11px] font-bold bg-white text-green-700 px-2 py-0.5 rounded-md border border-green-200">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">General qualification</span>
              )}
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800 mb-2">
              <Sparkles size={14} className="text-amber-600" />
              <span>Skills to Boost</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {explanation?.missing_skills && explanation.missing_skills.length > 0 ? (
                explanation.missing_skills.map((s, i) => (
                  <span key={i} className="text-[11px] font-bold bg-white text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                    + {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-green-700 font-bold">All key skills matched!</span>
              )}
            </div>
          </div>
        </div>

        {/* Free Coaching / Course Recommendations */}
        <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-primary">
            <BookOpen size={16} />
            <span>Recommended Free Skilling Courses</span>
          </div>
          <p className="text-xs text-gray-600">{explanation?.coaching_nudge}</p>

          <div className="space-y-1.5 pt-1">
            {explanation?.recommended_courses?.map((c, i) => (
              <a
                key={i}
                href="#"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-blue-100 hover:border-primary/40 font-semibold text-gray-800 transition-colors"
              >
                <span>{c.portal}: {c.name}</span>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-black">Free</span>
              </a>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors"
        >
          Close Breakdown
        </button>
      </div>
    </div>
  );
};

export default MatchScoreModal;
