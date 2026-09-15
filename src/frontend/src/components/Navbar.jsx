import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { Briefcase, Bell, User, Menu, X, LogIn, LogOut, ChevronDown, Building2, Globe, HeartHandshake } from 'lucide-react';
import NotificationsModal from './NotificationsModal';
import { getNotifications } from '../utils/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, switchLanguage } = useTranslation();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const checkNotifs = async () => {
      try {
        const uid = user?.id || 'cand_1';
        const data = await getNotifications(uid);
        if (data && data.unread_count !== undefined) {
          setUnreadCount(data.unread_count);
        }
      } catch (err) {
        // quiet fallback
      }
    };
    checkNotifs();
    const interval = setInterval(checkNotifs, 15000);
    return () => clearInterval(interval);
  }, [user, isAuthenticated]);

  const candidateNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'AI Dashboard', path: '/dashboard' },
    { name: 'Explore Internships', path: '/internships' },
    { name: 'Find Mentor', path: '/mentor' },
    { name: 'My Applications', path: '/applications' },
    { name: 'Certificates', path: '/certificates' },
  ];

  const recruiterNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Employer ATS & Verification', path: '/recruiter' },
    { name: 'Explore Internships', path: '/internships' },
  ];

  const publicNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore Internships', path: '/internships' },
  ];

  const navLinks = !isAuthenticated || !user
    ? publicNavLinks
    : user.role === 'recruiter'
      ? recruiterNavLinks
      : candidateNavLinks;

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/auth');
  };

  // Candidate-only dropdown links
  const candidateDropdownLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Find a Mentor', path: '/mentor' },
    { label: 'My Applications', path: '/applications' },
    { label: 'Credentials Portfolio', path: '/certificates' },
    { label: 'Settings', path: '/settings' },
  ];

  // Recruiter-only dropdown links
  const recruiterDropdownLinks = [
    { label: 'Employer Dashboard', path: '/recruiter' },
    { label: 'Settings', path: '/settings' },
  ];

  const dropdownLinks = user?.role === 'recruiter' ? recruiterDropdownLinks : candidateDropdownLinks;

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-40 bg-white/90 border-b border-gray-200/80 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Branding */}
            <Link to="/" className="flex items-center space-x-3 cursor-pointer group flex-shrink-0">
              <div className="bg-primary text-white p-2 rounded-xl group-hover:bg-primary-dark transition-colors shadow-md flex items-center justify-center">
                <Briefcase size={22} />
              </div>
              <div>
                <h1 className="text-xl font-heading font-extrabold text-primary leading-tight flex items-center">
                  CareerSetu<span className="text-secondary font-black ml-1">AI</span>
                </h1>
                <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">
                  PM Internship Scheme
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-bold transition-all py-1 px-2 rounded-lg ${
                    location.pathname === link.path
                      ? 'text-primary bg-primary/5 font-extrabold'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Controls & Auth */}
            <div className="hidden sm:flex items-center space-x-3">

              {/* Language Switcher Badge */}
              <button
                onClick={() => switchLanguage(lang === 'hi' ? 'en' : 'hi')}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-gray-700 hover:text-primary bg-gray-100 hover:bg-blue-50 rounded-full border border-gray-200 transition-colors"
                title="Switch Language / भाषा बदलें"
              >
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span>{lang === 'hi' ? 'हिन्दी (HI)' : 'English (EN)'}</span>
              </button>

              {/* Notification Bell — only when authenticated */}
              {isAuthenticated && user && (
                <button
                  onClick={() => setIsNotifOpen(true)}
                  className="text-gray-600 hover:text-primary p-2 rounded-xl hover:bg-gray-100 transition-colors relative"
                  title="Notifications"
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-secondary text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* User Menu / Sign In */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-xs font-bold text-gray-800 max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 bg-blue-50 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {user.role === 'recruiter' ? 'Employer' : 'Student'}
                        </span>
                      </div>

                      {dropdownLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          {link.label}
                        </Link>
                      ))}

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center space-x-1.5"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <LogIn size={14} />
                  <span>Sign In</span>
                </Link>
              )}

            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="lg:hidden flex items-center space-x-2">
              {isAuthenticated && user && (
                <button
                  onClick={() => setIsNotifOpen(true)}
                  className="text-gray-600 p-2 rounded-lg relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-secondary text-white text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2.5 px-3 rounded-xl text-xs font-bold ${
                    location.pathname === link.path ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2 bg-red-50 text-red-700 text-xs font-bold rounded-xl"
                >
                  Sign Out ({user?.name})
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 bg-primary text-white text-xs font-bold rounded-xl"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Notifications and Channel Preferences Drawer */}
      <NotificationsModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onNotificationCountChange={(cnt) => setUnreadCount(cnt)}
      />
    </>
  );
};

export default Navbar;
