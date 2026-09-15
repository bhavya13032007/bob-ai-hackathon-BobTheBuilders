import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Search, MapPin, Brain } from 'lucide-react';

/**
 * MatchingLoadingPage — Skeleton loading state with reassuring copy.
 * Calls /recommend API and auto-transitions to /results when ready.
 */
const loadingSteps = [
  { icon: Brain, text: 'Analyzing your skills & education…', delay: 0 },
  { icon: MapPin, text: 'Calculating proximity to 500+ locations…', delay: 1.2 },
  { icon: Search, text: 'Scanning 30+ PM Scheme internships…', delay: 2.4 },
  { icon: Sparkles, text: 'Applying diversity re-ranking algorithm…', delay: 3.6 },
];

const SkeletonCard = ({ delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-200 rounded-full w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2 animate-pulse" />
      </div>
      <div className="w-14 h-14 rounded-2xl bg-gray-200 animate-pulse" />
    </div>
    <div className="flex space-x-2 mb-3">
      <div className="h-6 bg-gray-100 rounded-full w-20 animate-pulse" />
      <div className="h-6 bg-gray-100 rounded-full w-16 animate-pulse" />
      <div className="h-6 bg-gray-100 rounded-full w-24 animate-pulse" />
    </div>
    <div className="h-3 bg-gray-100 rounded-full w-full animate-pulse mt-2" />
    <div className="h-3 bg-gray-100 rounded-full w-2/3 animate-pulse mt-1.5" />
  </motion.div>
);

const MatchingLoadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);

  // Candidate data passed from wizard via location.state
  const candidateData = location.state?.candidateData;

  useEffect(() => {
    // Animate through loading steps
    const timer = setInterval(() => {
      setActiveStep(prev => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch recommendations
    const fetchRecommendations = async () => {
      try {
        const api = (await import('../utils/api')).default;
        const payload = candidateData || { candidate_id: 'cand_1' };
        const { data } = await api.post('/recommend', payload);

        // Minimum 4s loading for UX (let user see the cool animation)
        setTimeout(() => {
          navigate('/results', { state: { recommendations: data }, replace: true });
        }, Math.max(0, 4000));
      } catch (err) {
        console.error('Matching error:', err);
        setError('Something went wrong while finding matches. Please try again.');
      }
    };

    fetchRecommendations();
  }, [candidateData, navigate]);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Matching Engine Unavailable</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/wizard')}
            className="px-6 py-3 bg-primary text-white font-bold rounded-full shadow-md hover:bg-primary-dark transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50/50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold text-primary">AI Matching In Progress</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 mb-2">
            Finding Your Best <span className="text-gradient">PM Internship Matches</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Our hybrid algorithm is scoring internships across skills, location, sector interest, and diversity factors.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-10 max-w-sm mx-auto space-y-3">
          {loadingSteps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx <= activeStep;
            const isCurrent = idx === activeStep;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isActive ? 1 : 0.4, x: 0 }}
                transition={{ delay: step.delay * 0.3, duration: 0.4 }}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-blue-50 border border-blue-200 shadow-sm'
                    : isActive
                    ? 'bg-emerald-50/50'
                    : 'opacity-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isCurrent ? 'bg-primary text-white animate-pulse' : isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Icon size={16} />
                </div>
                <span className={`text-sm font-semibold ${isCurrent ? 'text-primary' : isActive ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {step.text}
                </span>
                {isActive && idx < activeStep && (
                  <span className="text-emerald-500 text-xs font-bold ml-auto">✓</span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Skeleton Cards */}
        <div className="space-y-4">
          {[0, 1, 2].map(i => (
            <SkeletonCard key={i} delay={0.5 + i * 0.3} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchingLoadingPage;
