import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, MapPin, Briefcase, IndianRupee, Clock, ShieldCheck, ChevronDown, ChevronUp,
  BookOpen, Bookmark, BookmarkCheck, ArrowLeft, ExternalLink, CheckCircle2, AlertCircle,
  GraduationCap, Target, Volume2, VolumeX
} from 'lucide-react';
import ProgressRing from '../components/ui/ProgressRing';
import Chip from '../components/ui/Chip';
import Banner from '../components/ui/Banner';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

/**
 * RecommendationResultsPage — Displays AI-matched internships with:
 * - Match percentage ring
 * - Icon-chip row (education, stipend, location)
 * - "Why this internship?" expandable explainability panel
 * - Skill-gap coaching strip
 * - Bookmark, audio play, verified badge
 * - "See more options" collapsed list
 * - "Refine my answers" link
 */
const RecommendationResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(new Set());
  const [expandedCard, setExpandedCard] = useState(null);
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);

  // Data from matching loading page or direct API call
  const recommendations = location.state?.recommendations;
  const [data, setData] = useState(recommendations || null);
  const [loading, setLoading] = useState(!recommendations);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!recommendations) {
      // Direct visit — fetch recommendations for current user
      const fetchData = async () => {
        try {
          const api = (await import('../utils/api')).default;
          const candidateId = user?.id || 'cand_1';
          const { data: result } = await api.post('/recommend', { candidate_id: candidateId });
          setData(result);
        } catch (err) {
          setError('Unable to load recommendations. Please try the wizard again.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [recommendations, user]);

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cs_bookmarks') || '[]');
      setBookmarked(new Set(saved));
    } catch (e) { /* ignore */ }
  }, []);

  const toggleBookmark = (id) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem('cs_bookmarks', JSON.stringify([...next]));
      return next;
    });
  };

  const speakExplanation = (rec, idx) => {
    if (!('speechSynthesis' in window)) return;
    if (playingAudio === idx) {
      window.speechSynthesis.cancel();
      setPlayingAudio(null);
      return;
    }
    const exp = rec.explanation;
    const text = `${rec.internship.title} at ${rec.internship.company_name}. ${exp.reasons.join('. ')}. ${exp.coaching_nudge}`;
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.9;
    utt.onend = () => setPlayingAudio(null);
    utt.onerror = () => setPlayingAudio(null);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
    setPlayingAudio(idx);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading your matches…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Recommendations Found</h2>
          <p className="text-gray-600 text-sm mb-6">{error || 'Please complete the wizard first.'}</p>
          <Link to="/wizard" className="px-6 py-3 bg-primary text-white font-bold rounded-full shadow-md hover:bg-primary-dark transition-all inline-block">
            Start Wizard
          </Link>
        </div>
      </div>
    );
  }

  const curated = data.curated_recommendations || [];
  const allOptions = data.all_options || [];
  const candidateSummary = data.candidate_summary || {};
  const extraOptions = allOptions.filter(opt => !curated.find(c => c.internship.id === opt.internship.id));

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#F7F9FB] to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 mb-3">
                <Sparkles size={14} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">AI-Matched Results</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-gray-900">
                Your Top PM Internship Matches
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {candidateSummary.name ? `For ${candidateSummary.name}` : ''} • {candidateSummary.location || ''} • {candidateSummary.total_matched || curated.length} internships scored
              </p>
            </div>
            <Link
              to="/wizard"
              className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Refine My Answers</span>
            </Link>
          </div>
        </motion.div>

        {/* Curated Top Recommendations */}
        <div className="space-y-5 mb-8">
          {curated.map((rec, idx) => {
            const intern = rec.internship;
            const exp = rec.explanation || {};
            const isExpanded = expandedCard === idx;
            const isBookmarked = bookmarked.has(intern.id);

            return (
              <Card key={intern.id} delay={idx * 0.1}>
                <div className="p-5 sm:p-6">
                  {/* Top Row: Match Ring + Title + Actions */}
                  <div className="flex items-start gap-4">
                    <ProgressRing value={rec.match_percentage} size={64} strokeWidth={5} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link to={`/internships/${intern.id}`} className="text-lg font-bold text-gray-900 hover:text-primary transition-colors leading-tight">
                          {intern.title}
                        </Link>
                        {intern.verified_employer && (
                          <ShieldCheck size={16} className="text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {intern.company_name} • {intern.sector_label || intern.sector}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {/* Audio */}
                      <button
                        onClick={() => speakExplanation(rec, idx)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          playingAudio === idx
                            ? 'bg-amber-100 text-amber-700 animate-pulse'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title="Listen to match explanation"
                      >
                        {playingAudio === idx ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                      {/* Bookmark */}
                      <button
                        onClick={() => toggleBookmark(intern.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isBookmarked
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={isBookmarked ? 'Remove bookmark' : 'Save for later'}
                      >
                        {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Icon-Chip Row */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Chip icon={<GraduationCap size={12} />} label={intern.education_required || '12th+'} variant="info" />
                    <Chip icon={<IndianRupee size={12} />} label={intern.stipend || '₹25-35k/mo'} variant="success" />
                    <Chip icon={<MapPin size={12} />} label={exp.location_fit_label || `${intern.district}, ${intern.state}`} variant={exp.location_tier === 'Same District' || exp.location_tier === 'Remote OK' ? 'success' : 'default'} />
                    <Chip icon={<Clock size={12} />} label={intern.duration || '6 Months'} variant="default" />
                    {intern.work_mode === 'Remote' && <Chip label="🌐 Remote" variant="info" />}
                  </div>

                  {/* Skill Match Tags */}
                  {exp.matched_skills && exp.matched_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {exp.matched_skills.slice(0, 4).map(s => (
                        <span key={s} className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✅ {s}
                        </span>
                      ))}
                      {exp.missing_skills && exp.missing_skills.length > 0 && exp.missing_skills.slice(0, 2).map(s => (
                        <span key={s} className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          📚 {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expandable "Why this internship?" Panel */}
                  <button
                    onClick={() => setExpandedCard(isExpanded ? null : idx)}
                    className="mt-4 flex items-center space-x-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                  >
                    <Target size={14} />
                    <span>Why this internship?</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-3">
                          {/* Reasons */}
                          <div>
                            <p className="text-xs font-bold text-gray-700 mb-1.5">Match Factors:</p>
                            <ul className="space-y-1">
                              {(exp.reasons || []).map((reason, i) => (
                                <li key={i} className="flex items-start space-x-2 text-xs text-gray-600">
                                  <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Score Breakdown */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-white rounded-lg p-2 border border-gray-100">
                              <div className="text-lg font-black text-primary">{exp.skill_fit_score || 0}%</div>
                              <div className="text-[10px] text-gray-500 font-semibold">Skill Fit</div>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-gray-100">
                              <div className="text-lg font-black text-emerald-600">{exp.location_tier || '—'}</div>
                              <div className="text-[10px] text-gray-500 font-semibold">Location</div>
                            </div>
                            <div className="bg-white rounded-lg p-2 border border-gray-100">
                              <div className="text-lg font-black text-amber-600">{exp.distance_km != null ? `${exp.distance_km}km` : '—'}</div>
                              <div className="text-[10px] text-gray-500 font-semibold">Distance</div>
                            </div>
                          </div>

                          {/* Coaching Nudge */}
                          {exp.coaching_nudge && (
                            <div className="flex items-start space-x-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                              <BookOpen size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-bold text-amber-800 mb-1">Skill-Up Tip</p>
                                <p className="text-[11px] text-amber-700 leading-relaxed">{exp.coaching_nudge}</p>
                              </div>
                            </div>
                          )}

                          {/* Recommended Courses */}
                          {exp.recommended_courses && exp.recommended_courses.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-gray-700 mb-1.5">Free Courses to Boost Match:</p>
                              <div className="space-y-1.5">
                                {exp.recommended_courses.map((course, ci) => (
                                  <div key={ci} className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-100 text-xs">
                                    <div>
                                      <span className="font-semibold text-gray-800">{course.name}</span>
                                      <span className="text-gray-400 ml-1.5">{course.portal}</span>
                                    </div>
                                    {course.free && (
                                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">FREE</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bottom CTA */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      {!rec.is_eligible && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Education gap — still eligible with experience
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/internships/${intern.id}`}
                      className="px-5 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-full shadow-sm transition-all transform active:scale-95 flex items-center space-x-1.5"
                    >
                      <span>View Details</span>
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* See More Options */}
        {extraOptions.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowAllOptions(!showAllOptions)}
              className="w-full flex items-center justify-center space-x-2 py-3 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
            >
              <span>{showAllOptions ? 'Hide' : `See ${extraOptions.length} More Options`}</span>
              {showAllOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
              {showAllOptions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 space-y-3 overflow-hidden"
                >
                  {extraOptions.map((rec, idx) => (
                    <Link
                      key={rec.internship.id}
                      to={`/internships/${rec.internship.id}`}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <ProgressRing value={rec.match_percentage} size={40} strokeWidth={3} />
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{rec.internship.title}</h4>
                          <p className="text-xs text-gray-500">{rec.internship.company_name} • {rec.internship.district}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-gray-500">{rec.internship.stipend}</span>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Bottom Banner */}
        <Banner
          variant="tip"
          title="Not finding what you need?"
          message="Refine your skills, education level, or location in the wizard to get better-matched results."
          action={
            <Link to="/wizard" className="text-xs font-bold text-emerald-700 underline hover:no-underline">
              Update My Profile →
            </Link>
          }
        />
      </div>
    </div>
  );
};

export default RecommendationResultsPage;
