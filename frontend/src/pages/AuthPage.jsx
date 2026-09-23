import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Building, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const InputField = ({ icon: Icon, label, type, value, onChange, placeholder, required, isValid }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className="relative mb-4">
      <div
        className={`flex items-center px-4 py-3 bg-white border-2 rounded-2xl transition-all duration-300 ease-out ${
          isFocused ? 'border-primary shadow-[0_0_0_4px_rgba(11,29,81,0.1)]' : 'border-gray-200'
        }`}
      >
        <Icon size={18} className={`transition-colors duration-300 ${isFocused ? 'text-primary' : 'text-gray-400'}`} />
        <div className="flex-1 relative ml-3">
          <label
            className={`absolute left-0 transition-all duration-300 pointer-events-none ${
              isFocused || value ? '-top-3 text-[10px] font-bold text-primary' : 'top-0.5 text-sm font-medium text-gray-500'
            }`}
          >
            {label}
          </label>
          <input
            type={type}
            value={value}
            required={required}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isFocused ? placeholder : ''}
            className="w-full bg-transparent text-sm font-semibold text-gray-900 focus:outline-none pt-1"
          />
        </div>
        {isValid && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-2">
            <CheckCircle2 size={18} className="text-emerald-500" />
          </motion.div>
        )}
      </div>
    </div>
  );
};

const OtpInput = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
    if (newOtp.join("").length === length) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  return (
    <div className="flex justify-between gap-2 mb-6">
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          ref={(ref) => inputRefs.current[index] = ref}
          value={data}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-14 bg-white border-2 border-gray-200 rounded-xl text-center text-xl font-black text-primary focus:border-primary focus:shadow-[0_0_0_4px_rgba(11,29,81,0.1)] focus:outline-none transition-all"
        />
      ))}
    </div>
  );
};

const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [userType, setUserType] = useState('candidate');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEdu, setRegEdu] = useState('Graduate');
  const [regState, setRegState] = useState('Maharashtra');
  const [regDistrict, setRegDistrict] = useState('Mumbai');
  const [regConsent, setRegConsent] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [tempUid, setTempUid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [shake, setShake] = useState(false);

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const triggerError = (msg) => {
    setMessage(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleQuickDemoLogin = (profile) => {
    login(profile);
    navigate(profile.role === 'recruiter' ? '/recruiter' : '/dashboard');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
      const idToken = await userCredential.user.getIdToken();
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken })
      });
      if (!res.ok) throw new Error('Login failed on server');
      const mockProfile = {
        id: userCredential.user.uid,
        name: userCredential.user.email.split('@')[0],
        email: userCredential.user.email,
        role: userType,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80'
      };
      login(mockProfile);
      navigate(userType === 'recruiter' ? '/recruiter' : '/dashboard');
    } catch (err) {
      triggerError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage('');
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const idToken = await userCredential.user.getIdToken();
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken })
      });
      if (!res.ok) throw new Error('Google Login failed on server');
      const mockProfile = {
        id: userCredential.user.uid,
        name: userCredential.user.displayName || userCredential.user.email.split('@')[0],
        email: userCredential.user.email,
        role: userType,
        avatar_url: userCredential.user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80'
      };
      login(mockProfile);
      navigate(userType === 'recruiter' ? '/recruiter' : '/dashboard');
    } catch (err) {
      triggerError(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regConsent) return triggerError('You must agree to the Terms of Service and Privacy Policy.');
    if (!regEmail || !regPassword) return triggerError('Please provide email and password.');
    setLoading(true);
    setMessage('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      const uid = userCredential.user.uid;
      const res = await fetch(`${API_BASE}/auth/send-signup-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, email: regEmail })
      });
      if (!res.ok) throw new Error('Failed to send OTP.');
      setTempUid(uid);
      setShowOtpScreen(true);
      setMessage('');
    } catch (err) {
      triggerError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otpValue.length !== 6) return triggerError('Please enter the full 6-digit OTP.');
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/auth/verify-signup-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: tempUid, otp: otpValue })
      });
      if (!res.ok) throw new Error('Invalid OTP.');
      const mockProfile = { id: tempUid, name: regName, email: regEmail, role: 'candidate', profile_strength: 65 };
      login(mockProfile);
      navigate('/wizard');
    } catch (err) {
      triggerError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F7F9FB] flex">
      {/* Brand Side (Desktop) */}
      <div className="hidden lg:flex w-1/2 relative bg-primary overflow-hidden items-center justify-center flex-col p-12 text-center text-white">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(circle_at_50%_50%,_rgba(230,138,0,0.4),_transparent_70%)]" 
        />
        <div className="relative z-10 w-full max-w-md">
          <h1 className="text-5xl font-black font-heading mb-6 tracking-tight">Loopin</h1>
          <p className="text-xl font-medium text-blue-100/90 mb-12">
            The intelligent gateway to the PM Internship Scheme.
          </p>
          
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-left shadow-2xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4 flex items-center gap-2">
              <Zap size={16}/> 1-Click Demo Environments
            </h3>
            <div className="space-y-3">
              <button onClick={() => handleQuickDemoLogin({ id: 'cand_1', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'candidate', profile_strength: 85 })} className="w-full bg-white/5 hover:bg-white/15 border border-white/10 p-3 rounded-xl flex items-center justify-between transition-all">
                <span className="flex items-center text-sm font-semibold"><User size={16} className="mr-3" /> Rahul S. (Candidate)</span>
                <span className="text-[10px] bg-secondary text-primary px-2 py-0.5 rounded-full font-black">LOGIN</span>
              </button>
              <button onClick={() => handleQuickDemoLogin({ id: 'comp_1', name: 'Tata Motors HR', email: 'recruiter@tatamotors.com', role: 'recruiter' })} className="w-full bg-white/5 hover:bg-white/15 border border-white/10 p-3 rounded-xl flex items-center justify-between transition-all">
                <span className="flex items-center text-sm font-semibold"><Building size={16} className="mr-3" /> Tata Motors HR</span>
                <span className="text-[10px] bg-emerald-400 text-gray-900 px-2 py-0.5 rounded-full font-black">LOGIN</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div 
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}} 
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
        >
          {/* Mobile Brand */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-black font-heading text-primary">Loopin</h1>
          </div>

          <AnimatePresence mode="wait">
            {showOtpScreen ? (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={32} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                  <p className="text-sm text-gray-500">We've sent a 6-digit verification code to <br/><span className="font-bold text-gray-900">{regEmail}</span></p>
                </div>
                
                {message && (
                  <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} /> {message}
                  </div>
                )}

                <form onSubmit={handleOtpSubmit}>
                  <OtpInput length={6} onComplete={(val) => setOtpValue(val)} />
                  <button type="submit" disabled={loading || otpValue.length !== 6} className="w-full py-4 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                    {loading ? 'Verifying...' : 'Verify & Continue'} <ArrowRight size={18} />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {authMode === 'login' ? 'Welcome back' : 'Create an account'}
                </h2>
                <p className="text-sm text-gray-500 mb-8">
                  {authMode === 'login' ? 'Enter your details to access your dashboard.' : 'Start your journey with the PM Internship Scheme.'}
                </p>

                {/* Main Social Login */}
                <button onClick={handleGoogleLogin} disabled={loading} className="w-full py-3.5 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-sm mb-6">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px bg-gray-200 flex-1" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">or sign in with email</span>
                  <div className="h-px bg-gray-200 flex-1" />
                </div>

                {message && (
                  <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} /> {message}
                  </div>
                )}

                {/* Form Switcher */}
                <div className="flex p-1 bg-gray-100 rounded-2xl mb-6">
                  <button type="button" onClick={() => setAuthMode('login')} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${authMode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Log In</button>
                  <button type="button" onClick={() => setAuthMode('register')} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${authMode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Sign Up</button>
                </div>

                {authMode === 'login' ? (
                  <form onSubmit={handleLoginSubmit}>
                    <InputField icon={Mail} label="Email Address" type="email" value={identifier} onChange={e => setIdentifier(e.target.value)} required isValid={isEmailValid(identifier)} />
                    <InputField icon={Lock} label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    
                    <div className="flex justify-between items-center mb-6 px-1">
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                        Remember me
                      </label>
                      <a href="#" className="text-sm font-bold text-primary hover:underline">Forgot Password?</a>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                      {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit}>
                    <InputField icon={User} label="Full Name" type="text" value={regName} onChange={e => setRegName(e.target.value)} required />
                    <InputField icon={Mail} label="Email Address" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required isValid={isEmailValid(regEmail)} />
                    <InputField icon={Lock} label="Password" type="password" value={regPassword} onChange={e => setPassword(e.target.value)} required />
                    
                    <div className="flex items-start gap-2 mb-6 px-1">
                      <input type="checkbox" id="consent" checked={regConsent} onChange={e => setRegConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" />
                      <label htmlFor="consent" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                        By creating an account, you agree to Loopin's <a href="#" className="text-primary font-semibold hover:underline">Terms of Service</a> and <a href="#" className="text-primary font-semibold hover:underline">Privacy Policy</a>.
                      </label>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-4 bg-secondary hover:bg-[#e68a00] text-primary font-black rounded-2xl shadow-lg shadow-secondary/20 transition-all flex items-center justify-center gap-2">
                      {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
