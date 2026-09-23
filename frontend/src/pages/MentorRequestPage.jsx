import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CheckCircle2, 
  MessageSquare, 
  PhoneCall, 
  Globe, 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  HeartHandshake,
  Send
} from 'lucide-react';
import Chip from '../components/ui/Chip';
import Banner from '../components/ui/Banner';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

export default function MentorRequestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [selectedTopics, setSelectedTopics] = useState(['Application guidance']);
  const [preferredLanguage, setPreferredLanguage] = useState('Hindi');
  const [contactMode, setContactMode] = useState('WhatsApp');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const TOPICS = [
    'Application guidance',
    'Resume / Bio data help',
    'Interview preparation',
    'Hindi/Regional language support',
    'Document verification doubts',
    'Relocation & stipend questions',
    'First-time corporate guidance'
  ];

  const LANGUAGES = ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Bhojpuri', 'Other'];

  const MODES = [
    { id: 'WhatsApp', label: 'WhatsApp Chat', icon: MessageSquare, desc: 'Best for low bandwidth & quick answers' },
    { id: 'PhoneCall', label: '15-min Phone Call', icon: PhoneCall, desc: 'Voice guidance in your mother tongue' },
  ];

  const toggleTopic = (topic) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? (prev.length > 1 ? prev.filter(t => t !== topic) : prev)
        : [...prev, topic]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 900);
  };

  return (
    <div className="min-h-[85vh] bg-[#F7F9FB] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('common.back') || 'Back'}
        </button>

        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-primary to-[#0f3d6e] rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-sm mb-3">
              <Sparkles className="w-3.5 h-3.5 text-secondary" /> Loopin Saathi Program
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Request a Peer Mentor (मार्गदर्शक)
            </h1>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl">
              Feeling unsure or applying for your first corporate internship? Connect with verified senior interns and volunteers from your state who speak your language.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
            <HeartHandshake className="w-72 h-72" />
          </div>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100 text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mentor Request Received!</h2>
            <p className="text-gray-600 max-w-md mx-auto text-sm mb-6">
              A verified volunteer or senior PM Scheme intern matching your language (<strong>{preferredLanguage}</strong>) and topic choices has been assigned. You will receive an initial message within 24 hours.
            </p>

            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-left max-w-lg mx-auto mb-8 space-y-2 text-xs text-blue-900">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <ShieldCheck className="w-4 h-4" /> 100% Free & Government Verified
              </div>
              <p className="text-gray-700">
                Mentors never ask for payments or OTPs. All sessions are strictly guided by the PM Internship community code of conduct.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-opacity-95 shadow-sm transition-all"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-8">
            <Banner
              type="info"
              title="First-generation student friendly"
              message="No previous resume or computer skills needed. Our mentors guide you step-by-step from registration to your first day."
            />

            {/* Section 1: Topics */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                1. What do you need help with? <span className="text-xs text-gray-500 font-normal">(Select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {TOPICS.map((topic) => {
                  const active = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all border ${
                        active
                          ? 'bg-primary/10 border-primary text-primary font-semibold shadow-xs'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}{topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Preferred Language */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                2. Preferred language for guidance
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {LANGUAGES.map((langOption) => (
                  <label
                    key={langOption}
                    className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      preferredLanguage === langOption
                        ? 'border-primary bg-primary text-white font-semibold'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="preferredLanguage"
                      value={langOption}
                      checked={preferredLanguage === langOption}
                      onChange={() => setPreferredLanguage(langOption)}
                      className="sr-only"
                    />
                    {langOption}
                  </label>
                ))}
              </div>
            </div>

            {/* Section 3: Communication Mode */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                3. How would you like to connect?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MODES.map((m) => {
                  const Icon = m.icon;
                  const active = contactMode === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setContactMode(m.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        active
                          ? 'border-primary bg-blue-50/50 shadow-xs ring-1 ring-primary/30'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{m.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{m.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Optional question / note */}
            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-1.5">
                4. Any specific question or doubts? <span className="text-xs text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. I am from a rural district and don't know how to create a bank account for DBT stipend transfer..."
                className="w-full text-sm rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 p-3 border"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-4 h-4 text-primary" /> Average mentor response time: &lt; 24 hrs
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium text-sm rounded-xl hover:bg-opacity-95 shadow-sm transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>Connecting...</>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Mentor Request
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
