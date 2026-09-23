import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const loadingSteps = [
  "Analyzing your skills & education...",
  "Comparing your skills...",
  "Checking nearby opportunities...",
  "Applying diversity re-ranking...",
  "Finding your best matches..."
];

const SkeletonCard = ({ delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
    className="bg-white rounded-[1.5rem] border border-gray-100 p-5 shadow-sm mb-4"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-3 flex-1 mr-4">
        <div className="h-5 bg-gray-200 rounded-lg w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
      </div>
      <div className="w-14 h-14 rounded-2xl bg-gray-100 animate-pulse" />
    </div>
    <div className="flex space-x-2 mb-4">
      <div className="h-7 bg-gray-100 rounded-lg w-20 animate-pulse" />
      <div className="h-7 bg-gray-100 rounded-lg w-16 animate-pulse" />
      <div className="h-7 bg-gray-100 rounded-lg w-24 animate-pulse" />
    </div>
    <div className="h-4 bg-gray-100 rounded-lg w-full animate-pulse mt-2" />
    <div className="h-4 bg-gray-100 rounded-lg w-2/3 animate-pulse mt-2" />
  </motion.div>
);

const MatchingLoadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const candidateData = location.state?.candidateData;

  useEffect(() => {
    // Cycle through messages every 1.5 seconds
    const timer = setInterval(() => {
      setActiveStep(prev => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const api = (await import('../utils/api')).default;
        const payload = candidateData || { candidate_id: 'cand_1' };
        
        // Start request
        const startTime = Date.now();
        const { data } = await api.post('/recommend', payload);
        const elapsed = Date.now() - startTime;
        
        // Ensure at least 3 seconds of loading for premium feel
        const minLoadingTime = 2000;
        const remainingTime = Math.max(0, minLoadingTime - elapsed);
        
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            navigate('/results', { state: { recommendations: data }, replace: true });
          }, 600); // 600ms crossfade
        }, remainingTime);

      } catch (err) {
        console.error('Matching error:', err);
        setError('Something went wrong while finding matches. Please try again.');
      }
    };

    fetchRecommendations();
  }, [candidateData, navigate]);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-[#F7F9FB]">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Matching Engine Unavailable</h2>
          <p className="text-gray-600 text-sm mb-8">{error}</p>
          <button
            onClick={() => navigate('/wizard')}
            className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {!isFadingOut && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="min-h-[calc(100vh-64px)] bg-[#F7F9FB] py-12 px-4"
        >
          <div className="max-w-2xl mx-auto">
            {/* Header & Branded Animation */}
            <div className="text-center mb-12 flex flex-col items-center">
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 mb-6"
              >
                <span className="text-2xl font-heading font-black text-white">L</span>
              </motion.div>
              
              <h1 className="text-3xl font-heading font-black text-gray-900 mb-4">
                Finding Your Best Matches
              </h1>
              
              {/* Dynamic Status Text */}
              <div className="h-6 relative w-full flex justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-primary font-semibold text-sm absolute"
                  >
                    {loadingSteps[activeStep]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Skeleton Cards Preview */}
            <div className="relative">
              {/* Subtle fade out at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F7F9FB] to-transparent z-10 pointer-events-none" />
              
              <div className="space-y-4 px-2">
                {[0, 1, 2].map((i) => (
                  <SkeletonCard key={i} delay={0.2 + (i * 0.15)} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchingLoadingPage;
