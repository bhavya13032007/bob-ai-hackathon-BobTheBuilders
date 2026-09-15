import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Building, Smartphone, Mail, Lock, ArrowRight, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [userType, setUserType] = useState('candidate'); // 'candidate' or 'recruiter'
  
  // Login Form States
  const [identifier, setIdentifier] = useState('rahul.sharma@example.com');
  const [password, setPassword] = useState('••••••••');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  
  // Register Form States
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regEdu, setRegEdu] = useState('Graduate');
  const [regState, setRegState] = useState('Maharashtra');
  const [regDistrict, setRegDistrict] = useState('Mumbai');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleQuickDemoLogin = (profile) => {
    login(profile);
    if (profile.role === 'recruiter') {
      navigate('/recruiter');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (userType === 'recruiter') {
        login({
          id: 'comp_1',
          name: 'Tata Motors HR Team',
          email: identifier || 'recruiter@tatamotors.com',
          role: 'recruiter',
          company_id: 'comp_1',
          company_name: 'Tata Motors',
          avatar_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=128&auto=format&fit=crop&q=80'
        });
        navigate('/recruiter');
      } else {
        login({
          id: 'cand_1',
          name: 'Rahul Sharma',
          email: identifier || 'rahul.sharma@example.com',
          phone: '+91 98765 43210',
          role: 'candidate',
          education_level: 'Graduate',
          state: 'Maharashtra',
          district: 'Mumbai',
          remote_ok: true,
          skills: 'Data Analysis, SQL Basics, Python, MS Excel, Communication, Problem Solving',
          sector_interests: 'it, finance, manufacturing',
          experience_notes: 'B.Sc Computer Science graduate with data analytics skills.',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
          profile_strength: 85
        });
        navigate('/dashboard');
      }
    }, 600);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName || !regPhone) {
      setMessage("Please enter your name and mobile number.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newCand = {
        id: `cand_${Date.now().toString().slice(-4)}`,
        name: regName,
        email: regEmail || `${regName.toLowerCase().replace(/\s+/g, '')}@example.com`,
        phone: regPhone,
        role: 'candidate',
        education_level: regEdu,
        state: regState,
        district: regDistrict || 'Mumbai',
        remote_ok: true,
        skills: 'Communication, Problem Solving, Technical',
        sector_interests: 'it, manufacturing',
        experience_notes: 'Newly registered candidate.',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80',
        profile_strength: 65
      };

      login(newCand);
      navigate('/wizard'); // Route first time users directly to the smart matching wizard!
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#F7F9FB] to-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-4xl grid md:grid-cols-5 gap-8 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Left Side: Brand & Scheme Info */}
        <div className="md:col-span-2 bg-gradient-to-br from-primary via-primary-dark to-[#000433] text-white p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/15 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-bold mb-6 backdrop-blur-md">
              <Sparkles size={14} className="text-secondary" />
              <span>CareerSetu AI Platform</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-heading font-black leading-tight mb-4">
              CareerSetu <span className="text-secondary">AI</span>
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              PM Internship Scheme AI Matching & Verification Hub for Students and Corporates.
            </p>

            <div className="space-y-3 text-xs text-blue-100 font-medium">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-secondary flex-shrink-0" />
                <span>100,000+ PM Scheme Internships</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-secondary flex-shrink-0" />
                <span>₹20,000 - ₹35,000 Monthly Stipend</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-secondary flex-shrink-0" />
                <span>Verified Employer Credential Wallet</span>
              </div>
            </div>
          </div>

          {/* Quick Switch Demo Buttons */}
          <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
            <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block mb-2">
              ⚡ 1-Click Demo Profiles:
            </span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin({
                  id: 'cand_1',
                  name: 'Rahul Sharma',
                  email: 'rahul.sharma@example.com',
                  phone: '+91 98765 43210',
                  role: 'candidate',
                  education_level: 'Graduate',
                  state: 'Maharashtra',
                  district: 'Mumbai',
                  remote_ok: true,
                  skills: 'Data Analysis, SQL Basics, Python, MS Excel, Communication, Problem Solving',
                  sector_interests: 'it, finance, manufacturing',
                  profile_strength: 85
                })}
                className="w-full text-left text-xs bg-white/10 hover:bg-white/20 border border-white/15 p-2 rounded-xl text-white font-semibold transition-colors flex items-center justify-between"
              >
                <span>👤 Rahul S. (Tech Graduate)</span>
                <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded font-black text-primary">Candidate</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin({
                  id: 'cand_2',
                  name: 'Ananya Kapoor',
                  email: 'ananya.kapoor@example.com',
                  phone: '+91 98234 56789',
                  role: 'candidate',
                  education_level: 'Post Graduate',
                  state: 'Maharashtra',
                  district: 'Pune',
                  remote_ok: true,
                  skills: 'Financial Modeling, GST & Taxation, Tally ERP / Prime, MS Excel',
                  sector_interests: 'finance, education',
                  profile_strength: 90
                })}
                className="w-full text-left text-xs bg-white/10 hover:bg-white/20 border border-white/15 p-2 rounded-xl text-white font-semibold transition-colors flex items-center justify-between"
              >
                <span>👤 Ananya K. (Finance PG)</span>
                <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded font-black text-primary">Candidate</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin({
                  id: 'comp_1',
                  name: 'Tata Motors HR',
                  email: 'recruiter@tatamotors.com',
                  role: 'recruiter',
                  company_id: 'comp_1',
                  company_name: 'Tata Motors'
                })}
                className="w-full text-left text-xs bg-white/10 hover:bg-white/20 border border-white/15 p-2 rounded-xl text-white font-semibold transition-colors flex items-center justify-between"
              >
                <span>🏢 Tata Motors Recruiter</span>
                <span className="text-[10px] bg-emerald-400 px-1.5 py-0.5 rounded font-black text-gray-900">Employer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="md:col-span-3 p-8 sm:p-10 flex flex-col justify-center">
          
          {/* Top Toggle: Login vs Register */}
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                authMode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Sign In (Existing User)
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                authMode === 'register' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              New Registration (First Time)
            </button>
          </div>

          {/* User Type Switcher */}
          <div className="flex items-center space-x-3 mb-6">
            <button
              type="button"
              onClick={() => setUserType('candidate')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                userType === 'candidate'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User size={16} />
              <span>Candidate / Student</span>
            </button>
            <button
              type="button"
              onClick={() => setUserType('recruiter')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                userType === 'recruiter'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Building size={16} />
              <span>Employer / Company</span>
            </button>
          </div>

          {message && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center space-x-2">
              <AlertCircle size={16} />
              <span>{message}</span>
            </div>
          )}

          {authMode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {userType === 'candidate' ? 'Mobile Number / Email' : 'Company Corporate Email / CIN'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={userType === 'candidate' ? 'Enter 10-digit mobile or email' : 'hr@company.com'}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-gray-700">Password / OTP</label>
                  <button
                    type="button"
                    onClick={() => setOtpSent(true)}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    {otpSent ? '✓ OTP Sent to Mobile' : 'Login with OTP'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password or OTP"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4" />
                  <span>Remember this device</span>
                </label>
                <a href="#" className="text-xs text-gray-500 hover:text-primary font-semibold">Forgot PIN?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2 text-sm mt-4"
              >
                <span>{loading ? 'Authenticating...' : `Sign In as ${userType === 'candidate' ? 'Candidate' : 'Employer'}`}</span>
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          ) : (
            /* Register Form (First Time Users) */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Kumar"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Highest Qualification</label>
                  <select
                    value={regEdu}
                    onChange={(e) => setRegEdu(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="10th Grade">10th Grade</option>
                    <option value="12th Grade">12th Grade</option>
                    <option value="ITI / Diploma">ITI / Diploma</option>
                    <option value="Graduate">Graduate (BA/BSc/BCom/BTech)</option>
                    <option value="Post Graduate">Post Graduate (MA/MSc/MBA)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Home State</label>
                  <select
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Delhi">Delhi NCR</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">District / City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune, Nagpur, Patna"
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-secondary hover:bg-[#e68a00] text-primary font-black rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2 text-sm mt-4"
              >
                <Sparkles size={18} />
                <span>{loading ? 'Creating Profile...' : 'Complete & Start AI Match Wizard'}</span>
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default AuthPage;
