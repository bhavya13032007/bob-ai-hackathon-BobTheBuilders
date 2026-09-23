import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Upload, 
  Briefcase, 
  Zap, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Quote,
  MapPin,
  Building2,
  Award
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const LandingPage = () => {
  const { t, lang } = useTranslation();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);

  const stories = [
    {
      id: 1,
      name: "Anjali Verma",
      origin: "Jabalpur, Madhya Pradesh",
      company: "Bharat Electronics (BEL)",
      role: "Operations & Quality Intern",
      stipend: "₹24,000 / mo",
      avatar: "AV",
      avatarBg: "from-blue-500 to-indigo-600",
      quote: "Being from a tier-3 college, I had no corporate network. Loopin matched me with a government PSU right in my zone. The stipend directly credited via DBT changed my family's financial situation!",
      tag: "First-Gen Learner"
    },
    {
      id: 2,
      name: "Ravi Deshmukh",
      origin: "Nashik, Maharashtra",
      company: "Tata Motors",
      role: "EV Systems Trainee",
      stipend: "₹28,500 / mo",
      avatar: "RD",
      avatarBg: "from-amber-500 to-orange-600",
      quote: "The proximity scoring prioritized plants within 90 km of Nashik. The audio guide in Hindi made applying completely painless. I got selected after just one technical round.",
      tag: "Diploma / ITI Candidate"
    },
    {
      id: 3,
      name: "Sunita Meena",
      origin: "Alwar, Rajasthan",
      company: "HDFC Rural Banking",
      role: "Microfinance Digital Associate",
      stipend: "₹22,000 / mo",
      avatar: "SM",
      avatarBg: "from-emerald-500 to-teal-600",
      quote: "The mentor assigned through Loopin helped me practice my interview questions in Hindi. I felt confident for the first time in front of corporate recruiters.",
      tag: "Women in Tech & BFSI"
    }
  ];

  // Auto-advance carousel every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStoryIdx((prev) => (prev + 1) % stories.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [stories.length]);

  const handleListenGuide = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const messageText = lang === 'hi'
      ? "लूपिन एआई में आपका स्वागत है। पीएम इंटर्नशिप योजना के तहत आप 3 आसान चरणों में सबसे बेहतरीन इंटर्नशिप पा सकते हैं। पहला, अपना बायोडाटा अपलोड करें या शिक्षा चुनें। दूसरा, हमारा एआई आपके कौशल और जिले के अनुसार निकटतम कंपनियों को ढूंढेगा। तीसरा, बिना किसी शुल्क के एक क्लिक में आवेदन करें। शुरू करने के लिए फाइंड माय मैच पर क्लिक करें।"
      : "Welcome to Loopin, the PM Internship Scheme recommendation platform. You can find the best internship in 3 simple steps: First, upload your resume or select your education level. Second, our AI will match your skills and location with verified companies like Tata Motors and Infosys. Third, apply in one click with zero application fee. Click on Find My Match to begin.";
    
    const utterance = new SpeechSynthesisUtterance(messageText);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const currentStory = stories[activeStoryIdx];

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative pt-10 pb-20 lg:pt-16 lg:pb-24 overflow-hidden">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-secondary/10 blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-accent/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left z-10"
            >
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-xs sm:text-sm font-bold text-primary">
                  {t('landing.badge')}
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-gray-900 tracking-tight mb-6 leading-tight">
                {t('landing.hero_title')} <br className="hidden lg:block"/>
                <span className="text-gradient">{t('landing.hero_highlight')}</span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {t('landing.hero_desc')}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  to="/wizard" 
                  className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white text-base sm:text-lg font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                  <span>{t('landing.cta_match')}</span>
                  <Sparkles size={20} className="text-secondary" />
                </Link>
                
                <button
                  onClick={handleListenGuide}
                  className={`w-full sm:w-auto border text-sm sm:text-base font-bold py-4 px-7 rounded-full shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 ${
                    isPlayingAudio ? 'bg-amber-50 border-amber-300 text-amber-800 animate-pulse' : 'bg-white border-gray-200 hover:border-primary/40 text-gray-700'
                  }`}
                >
                  {isPlayingAudio ? <VolumeX size={20} className="text-amber-600" /> : <Volume2 size={20} className="text-primary" />}
                  <span>{isPlayingAudio ? 'Stop Audio' : t('landing.cta_listen')}</span>
                </button>
              </div>

              {/* Key Trust Badges */}
              <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap justify-center lg:justify-start gap-6 text-xs text-gray-500 font-semibold">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 size={16} className="text-accent" />
                  <span>{t('landing.trust_free')}</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck size={16} className="text-primary" />
                  <span>{t('landing.trust_verified')}</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <Zap size={16} className="text-secondary" />
                  <span>{t('landing.trust_stipend')}</span>
                </span>
              </div>
            </motion.div>
            
            {/* Right Interactive Glassmorphic Element */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto w-full max-w-lg lg:max-w-none h-[380px] sm:h-[460px]"
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-primary/15 to-transparent rounded-full blur-2xl"></div>
              
              {/* Floating Match Card 1 */}
              <div className="absolute top-6 right-4 sm:right-16 glass-card rounded-2xl p-5 shadow-xl border border-white/60 animate-float z-20 w-64">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-lg">98% Match</div>
                  <div className="bg-blue-50 p-2 rounded-xl text-primary"><Briefcase size={16}/></div>
                </div>
                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">Associate Product Trainee</h3>
                <p className="text-xs text-gray-500 mb-3">TechNova • Mumbai (Home Zone)</p>
                <div className="flex space-x-1.5">
                  <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded">Data Analytics</span>
                  <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded">SQL</span>
                </div>
              </div>

              {/* Floating Match Card 2 */}
              <div className="absolute bottom-12 left-4 sm:left-12 glass-card rounded-2xl p-5 shadow-xl border border-white/60 animate-float z-20 w-64" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-base shadow-md">
                    RS
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 leading-none">Rahul Sharma</h4>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center mt-1">
                      <CheckCircle2 size={10} className="mr-0.5"/> 2 Verified Certs
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-1.5 overflow-hidden">
                  <div className="bg-primary h-2 rounded-full w-[85%]"></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-500">
                  <span>Profile Strength</span>
                  <span>85%</span>
                </div>
              </div>

              {/* Connecting Curved Arc */}
              <svg className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 140 280 Q 220 180 300 130" fill="transparent" stroke="#FF9933" strokeWidth="2.5" strokeDasharray="6,6" className="animate-pulse" />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success Story Carousel Section */}
      <div className="bg-gradient-to-b from-white to-blue-50/40 py-16 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 text-primary text-xs font-bold mb-3">
              <Award className="w-3.5 h-3.5 text-secondary" /> Real Candidate Impact
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">
              Transforming Lives Across Bharat
            </h2>
            <p className="text-gray-600 text-sm max-w-lg mx-auto mt-2">
              Read how youth from tier-2 and rural districts landed government-stipended internships with top industry leaders.
            </p>
          </div>

          {/* Carousel Card */}
          <div className="relative bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-blue-100/80 max-w-4xl mx-auto overflow-hidden">
            <Quote className="absolute top-6 right-8 w-24 h-24 text-blue-50 pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStory.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 grid sm:grid-cols-12 gap-6 items-center"
              >
                {/* Avatar & Candidate info */}
                <div className="sm:col-span-4 text-center sm:text-left border-b sm:border-b-0 sm:border-r border-gray-100 pb-6 sm:pb-0 sm:pr-6">
                  <div className={`w-20 h-20 mx-auto sm:mx-0 rounded-2xl bg-gradient-to-tr ${currentStory.avatarBg} flex items-center justify-center text-white text-2xl font-black shadow-md mb-3`}>
                    {currentStory.avatar}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{currentStory.name}</h3>
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-gray-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{currentStory.origin}</span>
                  </div>
                  <span className="inline-block mt-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-primary border border-blue-100">
                    {currentStory.tag}
                  </span>
                </div>

                {/* Testimonial & Placement details */}
                <div className="sm:col-span-8 space-y-4">
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed italic">
                    "{currentStory.quote}"
                  </p>
                  
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-700">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span>{currentStory.company}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                      <Briefcase className="w-4 h-4 text-secondary" />
                      <span>{currentStory.role}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-100 font-bold">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      <span>{currentStory.stipend}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex gap-2">
                {stories.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStoryIdx(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      i === activeStoryIdx ? 'w-8 bg-primary' : 'w-2.5 bg-gray-200 hover:bg-gray-300'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveStoryIdx((prev) => (prev - 1 + stories.length) % stories.length)}
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                  aria-label="Previous story"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveStoryIdx((prev) => (prev + 1) % stories.length)}
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                  aria-label="Next story"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="bg-gray-50/80 py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-black text-gray-900 mb-3">
              {t('landing.how_title')}
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base">
              {t('landing.how_desc')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10 relative">
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center relative z-10 hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="mx-auto w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100 font-black text-xl">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t('landing.step1_title')}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Upload a PDF/DOCX or quickly tap your education (10th/12th/ITI/Degree). Our parser extracts skills instantly.
              </p>
            </motion.div>
            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center relative z-10 hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="mx-auto w-16 h-16 bg-amber-50 text-secondary rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-amber-100 font-black text-xl">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t('landing.step2_title')}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Our hybrid algorithm factors in district distance, skills taxonomy, and diversity across sectors for optimal results.
              </p>
            </motion.div>
            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center relative z-10 hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="mx-auto w-16 h-16 bg-emerald-50 text-accent rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-emerald-100 font-black text-xl">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t('landing.step3_title')}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Submit directly to verified employers. Receive live status updates via SMS, WhatsApp, and in-app alerts.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
