import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  MapPin, 
  Briefcase, 
  Award, 
  ArrowRight, 
  Edit3, 
  ShieldCheck, 
  CheckCircle2, 
  Bookmark, 
  ExternalLink, 
  HelpCircle, 
  BookOpen, 
  AlertCircle,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { getRecommendations, getCandidate, getCertificates, applyInternship } from '../utils/api';
import EditProfileModal from '../components/EditProfileModal';
import MatchScoreModal from '../components/MatchScoreModal';
import ProgressRing from '../components/ui/ProgressRing';
import StatusTracker from '../components/ui/StatusTracker';
import Card from '../components/ui/Card';
import Banner from '../components/ui/Banner';

const DashboardPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [candidateData, setCandidateData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [allInternships, setAllInternships] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedMatchScore, setSelectedMatchScore] = useState(null);
  const [appliedSet, setAppliedSet] = useState(new Set());
  const [savedSet, setSavedSet] = useState(new Set(['int_1', 'int_2']));
  const [activeTab, setActiveTab] = useState('recommended'); // 'recommended', 'saved'

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const candidateId = user?.id || 'cand_1';
      
      // 1. Fetch Candidate
      const candRes = await getCandidate(candidateId);
      setCandidateData(candRes);

      // 2. Fetch AI Recommendations
      const recRes = await getRecommendations(candidateId);
      setRecommendations(recRes.curated_recommendations || []);
      setAllInternships(recRes.all_options || []);

      // 3. Fetch Certificates
      const certRes = await getCertificates(candidateId);
      setCertificates(certRes.certificates || []);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (internshipId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await applyInternship(internshipId, user?.id || 'cand_1');
      setAppliedSet(prev => new Set(prev).add(internshipId));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSave = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedSet(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const profileBoost = candidateData?.stats?.profile_boost_percentage || 0;
  const profileStrengthRaw = candidateData?.stats?.profile_strength || user?.profile_strength || 82;
  const profileStrength = Math.min(100, profileStrengthRaw + profileBoost);
  const verifiedCertsCount = certificates.filter(c => c.verification_status === 'Verified').length;

  useEffect(() => {
    if (profileStrength === 100) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#002147', '#22C55E', '#F59E0B']
      });
    }
  }, [profileStrength]);

  // Filter list depending on active tab
  const displayedItems = activeTab === 'saved' 
    ? recommendations.filter(r => savedSet.has(r.internship.id))
    : recommendations;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-md flex-shrink-0">
            {user?.name?.charAt(0) || 'R'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 leading-tight">
                {t('dashboard.welcome', { name: user?.name || 'Candidate' })}
              </h1>
              <span className="hidden sm:inline bg-blue-50 text-primary border border-blue-100 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {t('dashboard.cand_id', { id: user?.id || 'cand_1' })}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-2">
              <span>{user?.education_level || 'Graduate'}</span>
              <span>•</span>
              <span className="flex items-center text-gray-700 font-semibold">
                <MapPin size={14} className="mr-0.5 text-primary" /> {user?.district || 'Mumbai'}, {user?.state || 'Maharashtra'}
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-bold flex items-center">
                <ShieldCheck size={14} className="mr-0.5" /> {verifiedCertsCount} {t('dashboard.verif_edu')}
                {profileBoost > 0 && (
                  <span className="ml-1.5 inline-flex items-center text-[10px] bg-emerald-100 text-emerald-800 px-1.5 rounded-full uppercase tracking-wider font-black shadow-sm animate-pulse">
                    +{profileBoost}% {t('dashboard.boost')}
                  </span>
                )}
              </span>
            </p>
          </div>
        </div>

        {/* Edit Profile Action Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-primary/40 text-gray-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm"
          >
            <Edit3 size={15} className="text-primary" />
            <span>{t('dashboard.edit_profile')}</span>
          </button>
          <Link
            to="/applications"
            className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 shadow-md"
          >
            <Briefcase size={15} />
            <span>{t('dashboard.my_apps')}</span>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Card, Application Tracker & AI Mentor */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Profile Strength Card with ProgressRing (P2 Feature) */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900">{t('dashboard.profile_ready')}</h3>
                <p className="text-xs text-gray-500">{t('dashboard.ai_score')}</p>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="text-xs text-primary font-bold hover:underline"
              >
                {t('dashboard.boost')}
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
              <div>
                <div className="text-2xl font-black text-gray-900">{profileStrength}%</div>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">{t('dashboard.high_prob')}</p>
              </div>
              
              {/* ProgressRing UI Component */}
              <ProgressRing 
                value={profileStrength} 
                size={68} 
                strokeWidth={6} 
                color="#002147"
              />
            </div>

            <div className="space-y-2 pt-1 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span>{t('dashboard.verif_edu')}</span>
                <CheckCircle2 size={15} className="text-emerald-600" />
              </div>
              <div className="flex items-center justify-between">
                <span>{t('dashboard.loc_set')}</span>
                <CheckCircle2 size={15} className="text-emerald-600" />
              </div>
              <div className="flex items-center justify-between">
                <span>{t('dashboard.aadhaar_bank')}</span>
                <CheckCircle2 size={15} className="text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Active Application Live Tracker Widget (P2 Feature) */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" /> Application Tracker
              </h3>
              <Link to="/applications" className="text-[11px] text-primary font-semibold hover:underline">
                View All
              </Link>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Tata Motors — EV Trainee</h4>
                  <p className="text-[10px] text-gray-500">Submitted 2 days ago • Ref: APP-8941</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  Under Review
                </span>
              </div>
              {/* StatusTracker Component */}
              <StatusTracker currentStatus="Under Review" size="sm" />
            </div>
          </div>

          {/* Community Mentor Banner */}
          <div className="bg-gradient-to-br from-primary to-[#0f3d6e] rounded-3xl p-6 text-white shadow-sm relative overflow-hidden">
            <div className="relative z-10 space-y-2.5">
              <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                <HeartHandshake className="w-3.5 h-3.5" /> CareerSetu Saathi
              </div>
              <h3 className="text-base font-bold leading-snug">
                Need Help with Corporate Interviews?
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                Connect with a verified peer mentor in your state who speaks your language. Free 15-min call or WhatsApp chat.
              </p>
              <Link
                to="/mentor"
                className="inline-block mt-2 px-4 py-2 bg-white text-primary text-xs font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
              >
                Request a Mentor →
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column: Recommendations & Explore */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs and Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200">
              <button
                onClick={() => setActiveTab('recommended')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'recommended'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('dashboard.recommended')} ({recommendations.length})
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'saved'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{t('dashboard.saved')} ({savedSet.size})</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to="/internships"
                className="text-xs text-primary font-bold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors inline-flex items-center space-x-1"
              >
                <span>View All Listings</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* List Display */}
          {loading ? (
            <div className="py-16 text-center text-gray-500 font-bold">Calculating personalized matches...</div>
          ) : displayedItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
              <Briefcase className="mx-auto text-gray-300" size={40} />
              <h3 className="text-base font-bold text-gray-800">
                {activeTab === 'saved' ? 'No Saved Bookmarks Yet' : 'No Direct Recommendations Found'}
              </h3>
              <p className="text-xs text-gray-500">
                {activeTab === 'saved'
                  ? 'Bookmark internships you like by clicking the bookmark icon on any card.'
                  : 'Update your skills or location preferences to see tailored matches.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedItems.map((rec, idx) => {
                const item = rec.internship;
                const isApplied = appliedSet.has(item.id);
                const isSaved = savedSet.has(item.id);

                return (
                  <Card
                    key={item.id || idx}
                    className="p-6 sm:p-7 group relative hover:border-primary/30"
                    animate={false}
                  >
                    {/* Top Match Score Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="bg-emerald-50 text-emerald-800 text-xs font-black px-3 py-1 rounded-xl border border-emerald-200 flex items-center space-x-1">
                          <Sparkles size={13} className="text-secondary" />
                          <span>{rec.match_percentage}% Match</span>
                        </span>
                        <button
                          onClick={() => setSelectedMatchScore(rec)}
                          className="text-[11px] text-primary font-bold hover:underline flex items-center space-x-0.5"
                        >
                          <HelpCircle size={12} />
                          <span>Why this score?</span>
                        </button>
                      </div>

                      <button
                        onClick={(e) => toggleSave(item.id, e)}
                        className={`p-2 rounded-xl transition-colors ${
                          isSaved ? 'bg-amber-50 text-secondary' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                        }`}
                        title={isSaved ? 'Remove Bookmark' : 'Save Internship'}
                      >
                        <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* Main Content */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="h-14 w-14 rounded-2xl bg-gray-50 border border-gray-100 p-2.5 flex items-center justify-center flex-shrink-0 shadow-sm">
                          {item.company_logo ? (
                            <img src={item.company_logo} alt="logo" className="h-full w-full object-contain rounded-lg" />
                          ) : (
                            <Briefcase className="text-gray-400" size={28} />
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <span>{item.company_name}</span>
                            {item.verified_employer && (
                              <CheckCircle2 size={13} className="ml-1 text-primary" />
                            )}
                          </p>

                          <div className="flex flex-wrap gap-2 items-center text-xs mt-3 font-semibold">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${rec.proximity?.badge_color || 'bg-gray-100 text-gray-700'}`}>
                              {rec.proximity?.label}
                            </span>
                            <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
                              {item.work_mode}
                            </span>
                            <span className="bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200">
                              {item.stipend}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex sm:flex-col gap-2 sm:w-36 flex-shrink-0 pt-2 sm:pt-0">
                        <Link
                          to={`/internships/${item.id}`}
                          className="flex-1 text-center py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
                        >
                          View Details
                        </Link>

                        <button
                          onClick={(e) => handleApply(item.id, e)}
                          disabled={isApplied}
                          className={`flex-1 py-2.5 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1 ${
                            isApplied
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-primary hover:bg-primary-dark text-white active:scale-95'
                          }`}
                        >
                          <span>{isApplied ? '✓ Applied' : 'Quick Apply'}</span>
                        </button>
                      </div>
                    </div>

                    {/* AI Explainability Snippet */}
                    {rec.explanation && (
                      <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-start text-xs text-gray-600">
                        <Sparkles size={14} className="text-secondary mr-2 flex-shrink-0 mt-0.5" />
                        <span>{rec.explanation.reasons?.[0] || 'Matches your core competencies.'}</span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onProfileUpdated={fetchDashboardData}
      />

      {/* Match Score Breakdown Modal */}
      <MatchScoreModal
        isOpen={!!selectedMatchScore}
        onClose={() => setSelectedMatchScore(null)}
        recommendation={selectedMatchScore}
        candidate={user}
      />

    </div>
  );
};

export default DashboardPage;
