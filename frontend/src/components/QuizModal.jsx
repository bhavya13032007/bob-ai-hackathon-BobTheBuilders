import React, { useState, useEffect } from 'react';
import { X, Volume2, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../utils/api';

export default function QuizModal({ isOpen, onClose, skillName, candidateId, onPassed }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (isOpen && skillName) {
      setLoading(true);
      setError(null);
      setResult(null);
      setQuestions([]);
      setCurrentQIndex(0);
      setSelectedOptions({});
      
      api.get(`/quiz/${encodeURIComponent(skillName)}?lang=en`)
        .then(res => {
          setQuestions(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError("No quiz available for this skill. It might be auto-verified soon!");
          setLoading(false);
        });
    }
  }, [isOpen, skillName]);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedOptions(prev => ({
      ...prev,
      [questions[currentQIndex].id]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(`/quiz/${encodeURIComponent(skillName)}/submit`, {
        candidate_id: candidateId,
        answers: selectedOptions
      });
      setResult(res.data);
      if (res.data.passed) {
        onPassed(skillName);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 429) {
        setError("You are submitting too fast. Please wait a moment and try again.");
      } else {
        setError("Failed to submit quiz. Please try again.");
      }
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-heading font-bold text-lg">Verify Skill: {skillName}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error && !result ? (
            <div className="text-center py-4 text-orange-600 font-medium">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-orange-400" />
              {error}
            </div>
          ) : result ? (
            <div className="text-center py-6">
              {result.passed ? (
                <>
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Skill Verified!</h4>
                  <p className="text-gray-600 mb-6">You scored {Math.round(result.score)}% ({result.correct_count}/{result.total}). This skill will now boost your match scores.</p>
                  <button onClick={onClose} className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all">
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Keep Practicing</h4>
                  <p className="text-gray-600 mb-6">You scored {Math.round(result.score)}%. You need 60% to verify this skill. Don't worry, you can try again anytime!</p>
                  <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all">
                      Later
                    </button>
                    <button onClick={() => { setResult(null); setCurrentQIndex(0); setSelectedOptions({}); }} className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all">
                      Retry Now
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div>
              {/* Question UI */}
              <div className="flex justify-between items-center mb-4 text-sm font-medium text-gray-500">
                <span>Question {currentQIndex + 1} of {questions.length}</span>
                <button 
                  onClick={() => speak(questions[currentQIndex].question_text)}
                  className="flex items-center gap-1 text-primary hover:bg-blue-50 px-2 py-1 rounded-md transition-colors"
                >
                  <Volume2 size={16} /> Read Aloud
                </button>
              </div>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-6">
                {questions[currentQIndex].question_text}
              </h4>

              <div className="space-y-3 mb-8">
                {questions[currentQIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                      selectedOptions[questions[currentQIndex].id] === idx 
                        ? 'border-primary bg-blue-50/50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={selectedOptions[questions[currentQIndex].id] === undefined || submitting}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : currentQIndex === questions.length - 1 ? 'Submit Answers' : 'Next Question'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
