import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Phone, Mail, Globe, Heart, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#000428] text-white border-t border-white/10 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white p-2 rounded-xl border border-white/20 shadow-md">
                <Briefcase size={22} />
              </div>
              <div>
                <h2 className="text-xl font-heading font-extrabold text-white leading-tight">
                  CareerSetu<span className="text-secondary font-black ml-1">AI</span>
                </h2>
                <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">
                  PM Internship Scheme
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed pr-6">
              AI-powered Recommendation and Credential Verification Engine built for the PM Internship Scheme. Bridging ambitious Indian youth with leading national enterprises across 700+ districts.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">Quick Navigation</h3>
            <ul className="space-y-2 text-xs text-gray-300 font-medium">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/wizard" className="hover:text-white transition-colors">Find My Match (Wizard)</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Student Dashboard</Link></li>
              <li><Link to="/internships" className="hover:text-white transition-colors">Explore All Internships</Link></li>
              <li><Link to="/certificates" className="hover:text-white transition-colors">My Verified Credentials</Link></li>
              <li><Link to="/recruiter" className="hover:text-white transition-colors">Employer Portal</Link></li>
            </ul>
          </div>

          {/* Sectors */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">Industry Sectors</h3>
            <ul className="space-y-2 text-xs text-gray-300 font-medium">
              <li><Link to="/internships?sector=manufacturing" className="hover:text-white transition-colors">Automotive & Manufacturing</Link></li>
              <li><Link to="/internships?sector=it" className="hover:text-white transition-colors">IT, AI & Software</Link></li>
              <li><Link to="/internships?sector=finance" className="hover:text-white transition-colors">Banking, Financial Services & Insurance</Link></li>
              <li><Link to="/internships?sector=agriculture" className="hover:text-white transition-colors">Agri-Tech & Rural Development</Link></li>
              <li><Link to="/internships?sector=healthcare" className="hover:text-white transition-colors">Healthcare & Pharmaceuticals</Link></li>
              <li><Link to="/internships?sector=manufacturing" className="hover:text-white transition-colors">Green Energy & Solar Power</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary">Support & Help</h3>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center space-x-2">
                <Mail size={14} className="text-secondary" />
                <span>support@careersetu.ai</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe size={14} className="text-secondary" />
                <span className="text-blue-300">www.careersetu.ai</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 font-medium gap-4">
          <div>
            © 2026 CareerSetu AI — Built for PM Internship Scheme. All Rights Reserved.
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Help Center</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility Statement</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
