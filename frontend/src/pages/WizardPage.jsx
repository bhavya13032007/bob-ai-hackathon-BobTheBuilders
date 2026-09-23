import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  ChevronRight, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  CheckCircle, 
  Target, 
  Laptop, 
  Plus,
  Volume2,
  Sparkles
} from 'lucide-react';
import api, { updateCandidate } from '../utils/api';
import MicButton from '../components/ui/MicButton';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import QuizModal from '../components/QuizModal';

const WizardPage = () => {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizSkill, setQuizSkill] = useState(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  
  // Form State
  const [profile, setProfile] = useState({
    name: "New Candidate",
    education_level: "Graduate",
    skills: ["Communication", "MS Excel"],
    sector_interests: ["it"],
    state: "Maharashtra",
    district: "Mumbai",
    remote_ok: true,
  });

  const eduOptions = ["10th Grade", "12th Grade", "ITI / Diploma", "Graduate", "Post Graduate"];
  const sectorOptions = [
    { id: 'it', label: 'Tech & IT', icon: <Laptop size={24}/>, color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { id: 'manufacturing', label: 'Manufacturing', icon: <Briefcase size={24}/>, color: 'bg-gray-50 text-gray-700 border-gray-200' },
    { id: 'finance', label: 'Finance & Banking', icon: <Target size={24}/>, color: 'bg-green-50 text-green-600 border-green-200' },
    { id: 'agriculture', label: 'Agriculture & Rural Tech', icon: <MapPin size={24}/>, color: 'bg-yellow-50 text-yellow-600 border-yellow-200' }
  ];

  const indianStates = [
    "Maharashtra", "Uttar Pradesh", "Bihar", "Madhya Pradesh", 
    "Rajasthan", "Tamil Nadu", "Karnataka", "Gujarat", 
    "West Bengal", "Telangana", "Andhra Pradesh", "Delhi", 
    "Punjab", "Haryana", "Kerala", "Odisha", "Assam"
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const { data } = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.status === 'success') {
        const extracted = data.extracted_profile;
        setProfile(prev => ({
          ...prev,
          name: extracted.name || prev.name,
          education_level: extracted.education_level || prev.education_level,
          skills: extracted.skills?.length ? extracted.skills : prev.skills,
          sector_interests: extracted.sector_interests?.length ? extracted.sector_interests : prev.sector_interests,
          state: extracted.state || prev.state,
          district: extracted.district || prev.district,
        }));
        setStep(2); // Jump to skills confirmation
      }
    } catch (error) {
      console.error("Upload error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        const payload = {
          ...profile,
          id: "cand_1", // Using cand_1 as demo user
          skills: profile.skills.join(", "),
          sector_interests: profile.sector_interests.join(", ")
        };
        await updateCandidate(payload);
        navigate('/matching', {
          state: {
            candidateData: {
              candidate_id: "cand_1",
              name: profile.name,
              education_level: profile.education_level,
              skills: profile.skills,
              sector_interests: profile.sector_interests,
              state: profile.state,
              district: profile.district,
              remote_ok: profile.remote_ok,
            }
          }
        });
      } catch (error) {
        console.error("Save error", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleSelection = (list, item, field) => {
    const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    setProfile({ ...profile, [field]: newList });
  };

  const addCustomSkill = (skillText) => {
    const trimmed = skillText?.trim();
    if (trimmed && !profile.skills.includes(trimmed)) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setNewSkillInput('');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F7F9FB] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Progress Bar */}
        <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="text-sm font-semibold text-gray-600">
            {t('wizard.step_of', { step, total: 4 })}
          </div>
          <div className="flex space-x-2">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-2 rounded-full transition-all ${i <= step ? 'w-8 bg-primary' : 'w-4 bg-gray-200'}`}></div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                  {t('wizard.title_edu')}
                </h2>
                <p className="text-gray-600 text-sm">
                  {t('wizard.desc_edu')}
                </p>
              </div>

              <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center bg-blue-50/30 hover:bg-blue-50/50 transition-colors relative">
                <input 
                  type="file" 
                  accept=".pdf,.docx,.txt" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
                <Upload className="mx-auto h-12 w-12 text-primary mb-3" />
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  {loading ? t('wizard.processing') : t('wizard.upload_title')}
                </h3>
                <p className="text-xs text-gray-500">{t('wizard.upload_hint')}</p>
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  {t('wizard.or_select')}
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {eduOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setProfile({...profile, education_level: opt})}
                    className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${profile.education_level === opt ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gray-200 text-gray-700 hover:border-primary/30 hover:bg-gray-50'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                  {t('wizard.title_skills')}
                </h2>
                <p className="text-gray-600 text-sm">
                  {t('wizard.desc_skills')}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2.5">
                {Array.from(new Set(["Python", "Data Analysis", "Communication", "Problem Solving", "MS Excel", "ReactJS", "AutoCAD", "SQL Basics", "Accounting", "Customer Support", "Digital Marketing", ...profile.skills])).map(skill => {
                  const isSelected = profile.skills.includes(skill);
                  const verifications = profile.skill_verifications || {};
                  const status = verifications[skill.toLowerCase()] || "unverified";
                  
                  return (
                  <button
                    key={skill}
                    onClick={() => {
                      if (!isSelected) {
                        toggleSelection(profile.skills, skill, 'skills');
                      } else {
                        // If already selected, clicking it toggles it off, but wait, the original logic toggles it.
                        // Let's keep toggle behavior if it's already selected.
                        if (status === "unverified") {
                          setQuizSkill(skill);
                          setIsQuizOpen(true);
                        } else {
                          toggleSelection(profile.skills, skill, 'skills');
                        }
                      }
                    }}
                    className={`flex items-center space-x-2 py-2 px-3.5 rounded-full border text-xs font-medium transition-all ${isSelected ? 'bg-blue-50 border-primary text-primary font-semibold shadow-xs' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    {isSelected && status === 'verified' && <CheckCircle size={14} className="text-emerald-500" title="Verified via Quiz" />}
                    {isSelected && status === 'verified (fallback)' && <CheckCircle size={14} className="text-gray-400" title="Verified (No quiz available yet)" />}
                    {isSelected && status === 'unverified' && (
                      <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold leading-none tracking-wider shadow-sm border border-orange-200" title="Click to verify">
                        Unverified
                      </span>
                    )}
                    <span>{skill}</span>
                  </button>
                )})}
              </div>

              {/* Add custom skill via text or mic */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Add more skills (Type or speak)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomSkill(newSkillInput);
                      }
                    }}
                    placeholder="e.g. Tally, Electrician, Social Media..."
                    className="flex-1 text-sm rounded-xl border border-gray-300 px-3.5 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary/50"
                  />
                  <MicButton
                    onTranscript={(spoken) => addCustomSkill(spoken)}
                    lang={lang === 'hi' ? 'hi-IN' : 'en-IN'}
                    tooltip="Speak your skill"
                  />
                  <button
                    type="button"
                    onClick={() => addCustomSkill(newSkillInput)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                  {t('wizard.title_sector')}
                </h2>
                <p className="text-gray-600 text-sm">
                  {t('wizard.desc_sector')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sectorOptions.map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => toggleSelection(profile.sector_interests, sec.id, 'sector_interests')}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${profile.sector_interests.includes(sec.id) ? sec.color + ' border-current shadow-sm scale-[1.01]' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'}`}
                  >
                    <div className="mb-3 opacity-80">{sec.icon}</div>
                    <div className="font-bold text-sm">{sec.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                  {t('wizard.title_location')}
                </h2>
                <p className="text-gray-600 text-sm">
                  {t('wizard.desc_location')}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">State (राज्य)</label>
                  <select 
                    value={profile.state}
                    onChange={(e) => setProfile({...profile, state: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {indianStates.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      District / City (ज़िला या शहर)
                    </label>
                    <span className="text-[11px] text-gray-500">Tap mic to speak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      value={profile.district}
                      onChange={(e) => setProfile({...profile, district: e.target.value})}
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g. Pune, Varanasi, Jaipur, Indore..."
                    />
                    <MicButton
                      onTranscript={(districtSpoken) => setProfile(p => ({ ...p, district: districtSpoken }))}
                      lang={lang === 'hi' ? 'hi-IN' : 'en-IN'}
                      tooltip="Speak district name"
                    />
                  </div>
                </div>
                
                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={profile.remote_ok}
                    onChange={(e) => setProfile({...profile, remote_ok: e.target.checked})}
                    className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <div>
                    <div className="font-bold text-xs text-gray-900">{t('wizard.remote_label')}</div>
                    <div className="text-[11px] text-gray-500">{t('wizard.remote_desc')}</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between items-center pt-4 border-t border-gray-100">
            {step > 1 ? (
              <button 
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 text-gray-600 text-sm font-semibold hover:bg-gray-100 rounded-full transition-colors"
              >
                {t('wizard.btn_back')}
              </button>
            ) : <div></div>}
            
            <button 
              onClick={handleSaveAndContinue}
              disabled={loading}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-full shadow-md flex items-center space-x-2 transition-transform active:scale-95 disabled:opacity-50"
            >
              <span>
                {loading 
                  ? t('wizard.processing') 
                  : (step === 4 ? t('wizard.btn_match') : t('wizard.btn_continue'))
                }
              </span>
              {!loading && <ChevronRight size={18} />}
            </button>
          </div>

        </div>
      </div>

      <QuizModal 
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        skillName={quizSkill}
        candidateId={user?.id}
        onPassed={(skill) => {
          // Immediately update local state to reflect verified
          setProfile(prev => ({
            ...prev,
            skill_verifications: {
              ...prev.skill_verifications,
              [skill.toLowerCase()]: 'verified'
            }
          }));
        }}
      />
    </div>
  );
};

export default WizardPage;
