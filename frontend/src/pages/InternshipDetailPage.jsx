import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  GraduationCap, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Share2,
  Volume2,
  VolumeX,
  ShieldCheck,
  CheckSquare,
  Square,
  MessageCircle,
  Copy,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { getInternshipDetail, applyInternship } from '../utils/api';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import QuizModal from '../components/QuizModal';

const InternshipDetailPage = () => {
  const { id } = useParams();
  const { lang } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyStatus, setApplyStatus] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const { user, updateUser } = useAuth();
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizSkill, setQuizSkill] = useState(null);

  // Readiness Checklist state
  const [checklist, setChecklist] = useState({
    eduVerified: true,
    bankAadhaar: true,
    skillsMatch: false,
    districtCommute: true
  });

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const result = await getInternshipDetail(id);
        setData(result);
      } catch (error) {
        console.error("Error fetching details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const toggleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await applyInternship(id, 'cand_1');
      if (res.status === 'success' || res.status === 'already_applied') {
        setApplyStatus(res);
      }
    } catch (err) {
      console.error(err);
      setApplyStatus({ status: 'error', message: 'Failed to apply' });
    } finally {
      setApplying(false);
    }
  };

  const handleAudioTrailer = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!data?.internship) return;
    const { title, stipend, district, education_required } = data.internship;
    const compName = data.company?.name || 'Verified Company';

    const text = lang === 'hi'
      ? `${compName} में ${title} की इंटर्नशिप का विवरण। यह इंटर्नशिप ${district} में है। इसमें ${stipend} का सरकारी मान्यता प्राप्त स्टाइपेंड मिलेगा। आवश्यक योग्यता ${education_required} है। आप नीचे दिए गए अप्लाई बटन से सीधे आवेदन कर सकते हैं।`
      : `Here is the audio summary for ${title} at ${compName}. Located in ${district} with a verified monthly stipend of ${stipend}. Education required is ${education_required}. You can apply directly with zero fees.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleShareFamily = (mode = 'whatsapp') => {
    if (!data?.internship) return;
    const { title, stipend, district } = data.internship;
    const compName = data.company?.name || 'PM Scheme Partner';
    const shareUrl = window.location.href;

    const message = `Namaste! Look at this verified PM Internship Scheme opportunity:\n💼 *${title}* at *${compName}*\n📍 Location: ${district}\n💰 Stipend: ${stipend}/month\n✅ Direct government benefit with zero fees.\nCheck details here: ${shareUrl}`;

    if (mode === 'whatsapp') {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
    } else {
      navigator.clipboard.writeText(message);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleQuizComplete = async (passed, score, attempt) => {
    setIsQuizOpen(false);
    if (passed && quizSkill && user) {
      const lowerSkill = quizSkill.toLowerCase();
      const currentVerifications = user.skill_verifications || {};
      await updateUser({
        skill_verifications: {
          ...currentVerifications,
          [lowerSkill]: "verified"
        }
      });
    }
  };

  if (loading) return <div className="p-8 text-center mt-20 font-bold text-gray-500">Loading details...</div>;
  if (!data) return <div className="p-8 text-center mt-20 text-red-500">Internship not found</div>;

  const { internship, company } = data;
  const completedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="bg-[#F7F9FB] min-h-[calc(100vh-64px)] pb-20">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary via-[#0f3d6e] to-primary pt-10 pb-20 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/internships" className="text-blue-100 hover:text-white text-xs sm:text-sm font-semibold mb-6 inline-flex items-center gap-1">
            ← Back to Internships
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="h-20 w-20 bg-white rounded-2xl p-2 shadow-lg flex-shrink-0 flex items-center justify-center">
                {company?.logo_url ? (
                  <img src={company.logo_url} alt="logo" className="w-full h-full object-contain rounded-xl" />
                ) : (
                  <Briefcase size={36} className="text-primary" />
                )}
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold backdrop-blur-sm mb-2">
                  <Sparkles className="w-3 h-3 text-secondary" /> PM Scheme Verified
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white mb-2 leading-tight">
                  {internship.title}
                </h1>
                <p className="text-blue-100 text-sm sm:text-base flex items-center">
                  {company?.name || 'Company Name'} 
                  {company?.verified_employer && (
                    <span className="inline-flex items-center gap-1 ml-2 text-secondary text-xs font-semibold">
                      <CheckCircle size={14} /> Verified Employer
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Quick Action Audio / Share */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAudioTrailer}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md border ${
                  isPlayingAudio 
                    ? 'bg-secondary text-white border-secondary animate-pulse' 
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
                title="Listen to 30-sec audio summary"
              >
                {isPlayingAudio ? <VolumeX size={15} /> : <Volume2 size={15} />}
                <span>{isPlayingAudio ? 'Stop Audio' : 'Audio Trailer (सुनो)'}</span>
              </button>

              <button
                onClick={() => handleShareFamily('whatsapp')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 shadow-sm"
                title="Share with Parents or Family on WhatsApp"
              >
                <MessageCircle size={15} />
                <span>Share with Family</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Key Info Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <MapPin className="text-primary mb-2" size={18}/>
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Location</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900">{internship.district}</div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <Briefcase className="text-secondary mb-2" size={18}/>
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Work Mode</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900">{internship.work_mode}</div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <Clock className="text-blue-500 mb-2" size={18}/>
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Duration</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900">{internship.duration}</div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <GraduationCap className="text-purple-500 mb-2" size={18}/>
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Eligibility</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900">{internship.education_required}</div>
              </div>
            </div>

            {/* Candidate Readiness Checklist (P2 Feature) */}
            <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/40 rounded-2xl p-6 border border-blue-100/90 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-sm text-gray-900">Application Readiness Checklist</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-white rounded-full text-primary border border-blue-200">
                  {completedCount} of 4 Ready
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                Verify these 4 essentials before sending your application for fastest employer shortlisting.
              </p>

              <div className="space-y-2.5">
                <div 
                  onClick={() => toggleCheck('eduVerified')}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200/80 cursor-pointer hover:border-primary/50 text-xs transition-colors"
                >
                  <span className="font-medium text-gray-800">
                    1. Education certificate matching <strong>{internship.education_required}</strong> uploaded
                  </span>
                  {checklist.eduVerified ? <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" /> : <Square className="w-4 h-4 text-gray-400 shrink-0" />}
                </div>

                <div 
                  onClick={() => toggleCheck('bankAadhaar')}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200/80 cursor-pointer hover:border-primary/50 text-xs transition-colors"
                >
                  <span className="font-medium text-gray-800">
                    2. Active Bank Account seeded with Aadhaar (Required for monthly ₹{internship.stipend} DBT)
                  </span>
                  {checklist.bankAadhaar ? <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" /> : <Square className="w-4 h-4 text-gray-400 shrink-0" />}
                </div>

                <div 
                  onClick={() => toggleCheck('skillsMatch')}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200/80 cursor-pointer hover:border-primary/50 text-xs transition-colors"
                >
                  <span className="font-medium text-gray-800">
                    3. Resume reflects skills: {internship.required_skills?.slice(0, 2).join(', ')}
                  </span>
                  {checklist.skillsMatch ? <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" /> : <Square className="w-4 h-4 text-gray-400 shrink-0" />}
                </div>

                <div 
                  onClick={() => toggleCheck('districtCommute')}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200/80 cursor-pointer hover:border-primary/50 text-xs transition-colors"
                >
                  <span className="font-medium text-gray-800">
                    4. Can commute or relocate to {internship.district} ({internship.work_mode})
                  </span>
                  {checklist.districtCommute ? <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" /> : <Square className="w-4 h-4 text-gray-400 shrink-0" />}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About the Role</h2>
              <p className="text-gray-700 leading-relaxed mb-8 text-sm sm:text-base">
                {internship.description}
              </p>

              <h3 className="font-bold text-gray-900 mb-3 text-base">Key Responsibilities</h3>
              <ul className="space-y-2.5 mb-8 text-sm">
                {internship.responsibilities?.map((req, i) => (
                  <li key={i} className="flex items-start text-gray-700">
                    <CheckCircle size={16} className="text-secondary mr-2.5 mt-0.5 flex-shrink-0"/>
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>

              <h3 className="font-bold text-gray-900 mb-3 text-base">Eligibility & Criteria</h3>
              <ul className="space-y-2.5 text-sm">
                {internship.eligibility?.map((req, i) => (
                  <li key={i} className="flex items-start text-gray-700">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 mr-2.5 flex-shrink-0"></div>
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Required Skills */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h3 className="font-bold text-gray-900 mb-3 text-base">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {internship.required_skills?.map((skill, i) => (
                  <span key={i} className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar (Desktop & Sticky) */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 sticky top-24 space-y-5">
              <div>
                <div className="text-2xl font-black text-gray-900">{internship.stipend}</div>
                <p className="text-xs text-gray-500 font-medium">Monthly DBT Stipend</p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-950">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Zero Application Fee
                </div>
                <p>Governed by MCA PM Internship Scheme norms. Directly deposited to Aadhaar account.</p>
              </div>
              
              {applyStatus ? (
                <div className="space-y-3">
                  <div className={`p-4 rounded-xl text-center text-xs font-bold border ${applyStatus.status === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                    {applyStatus.message}
                  </div>
                  {applyStatus.status === 'success' && internship.required_skills && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <h4 className="text-sm font-bold text-orange-900 flex items-center gap-1.5 mb-2">
                        <Sparkles className="w-4 h-4 text-orange-600" /> Boost Your Application
                      </h4>
                      <p className="text-xs text-orange-800 mb-3 leading-relaxed">
                        Stand out to the recruiter! Verify your skills required for this role by taking a quick 2-minute quiz.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {internship.required_skills.map((skill, i) => {
                          const status = (user?.skill_verifications || {})[skill.toLowerCase()] || "unverified";
                          if (status !== 'verified') {
                            return (
                              <button 
                                key={i}
                                onClick={() => { setQuizSkill(skill); setIsQuizOpen(true); }}
                                className="bg-white border-2 border-orange-200 text-orange-700 hover:bg-orange-100 hover:border-orange-300 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                              >
                                Take {skill} Quiz
                              </button>
                            );
                          }
                          return (
                            <span key={i} className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                              <CheckCircle size={14} /> {skill} Verified
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-md transition-transform active:scale-95 text-sm disabled:opacity-50"
                >
                  {applying ? 'Submitting Application...' : 'Apply Now (1-Click)'}
                </button>
              )}

              {/* Family & Guardian Share Action */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <p className="text-xs font-semibold text-gray-600">Family & Discussion</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleShareFamily('whatsapp')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold border border-emerald-200 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                  <button
                    onClick={() => handleShareFamily('copy')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-semibold border border-gray-200 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" /> {copiedShare ? 'Copied!' : 'Copy Info'}
                  </button>
                </div>
              </div>

              {/* Need help banner */}
              <div className="pt-2 text-center">
                <Link to="/mentor" className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1">
                  Need help applying? Request a free mentor →
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Quiz Modal */}
      {isQuizOpen && quizSkill && (
        <QuizModal 
          skillName={quizSkill} 
          onClose={() => setIsQuizOpen(false)} 
          onComplete={handleQuizComplete} 
        />
      )}
    </div>
  );
};

export default InternshipDetailPage;
