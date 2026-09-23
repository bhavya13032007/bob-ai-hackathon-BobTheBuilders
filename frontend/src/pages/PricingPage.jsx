import React from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  return (
    <div className="bg-background min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-heading font-black text-gray-900 mb-4"
          >
            Flexible <span className="text-primary">Employer</span> Plans
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            *Note: These are proposed pricing models for corporate partners hiring through the PM Internship Scheme. Candidate access is always 100% free.*
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
            <p className="text-gray-500 text-sm mb-6">For SMEs and local businesses.</p>
            <div className="text-4xl font-black text-gray-900 mb-6">₹0<span className="text-lg text-gray-500 font-normal">/mo</span></div>
            <ul className="space-y-3 mb-8 text-sm text-gray-700">
              <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Up to 3 active internship posts</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Basic semantic matching</li>
              <li className="flex items-center gap-2"><X size={16} className="text-gray-300" /> IBM Watsonx Explanations</li>
              <li className="flex items-center gap-2"><X size={16} className="text-gray-300" /> Bulk Candidate Export</li>
            </ul>
            <Link to="/auth" className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-center font-bold rounded-xl transition-colors">
              Get Started
            </Link>
          </motion.div>

          {/* Pro Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card rounded-3xl p-8 border-2 border-primary relative transform md:-translate-y-4 shadow-xl"
          >
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
              RECOMMENDED
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Pro ATS</h3>
            <p className="text-gray-600 text-sm mb-6">For mid-market enterprises.</p>
            <div className="text-4xl font-black text-gray-900 mb-6">₹4,999<span className="text-lg text-gray-500 font-normal">/mo</span></div>
            <ul className="space-y-3 mb-8 text-sm text-gray-700">
              <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Unlimited internship posts</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Advanced AI Matching Engine</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> IBM Watsonx Explanations</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Diversity MMR Re-ranking</li>
            </ul>
            <Link to="/auth" className="block w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white text-center font-bold rounded-xl transition-colors">
              Start Free Trial
            </Link>
          </motion.div>

          {/* Enterprise Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
            <p className="text-gray-500 text-sm mb-6">For Govt PSUs and large corporates.</p>
            <div className="text-4xl font-black text-gray-900 mb-6">Custom</div>
            <ul className="space-y-3 mb-8 text-sm text-gray-700">
              <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Everything in Pro</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Custom API Integrations</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Dedicated Account Manager</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> SLA & Priority Support</li>
            </ul>
            <a href="mailto:contact@loopin.in" className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-center font-bold rounded-xl transition-colors">
              Contact Sales
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
