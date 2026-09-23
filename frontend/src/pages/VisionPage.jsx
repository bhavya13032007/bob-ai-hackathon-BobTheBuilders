import React from 'react';
import { Target, Users, Zap, Building2, TrendingUp, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const VisionPage = () => {
  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block bg-blue-50 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4 border border-blue-100">
            Our Vision
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-gray-900 tracking-tight mb-6">
            Bridging the Gap Between <br className="hidden lg:block"/>
            <span className="text-gradient">Talent & Opportunity</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We built Loopin to democratize access to the PM Internship Scheme. By leveraging advanced Natural Language Processing and Geospatial Proximity, we ensure that every candidate, regardless of their background, finds a role that truly matches their potential.
          </p>
        </motion.div>
      </div>

      {/* The Problem & Solution */}
      <div className="bg-gray-50/50 py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 lg:gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-red-50 w-12 h-12 flex items-center justify-center rounded-xl text-red-600 mb-4">
              <Target size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Problem</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Traditional job portals rely on rigid keyword searches and boolean logic. A talented diploma holder from a tier-3 city might miss out on a perfect manufacturing role just because they didn't use the exact industry buzzwords in their resume.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Employers, meanwhile, are flooded with thousands of mismatched applications, making it impossible to find the right candidate efficiently.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-emerald-50 w-12 h-12 flex items-center justify-center rounded-xl text-emerald-600 mb-4">
              <Zap size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Solution</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Loopin uses a hybrid matching engine. We don't just look at keywords; we calculate semantic similarity using NLP, fuzzy string matching for typos, and Haversine distance for geospatial proximity.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We then use IBM Watsonx to generate explainable AI reasoning, telling the candidate exactly <em>why</em> they matched and what skills they need to improve.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Core Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-heading font-black text-gray-900 mb-4">Our Technology Pillars</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <Cpu />, title: "Hybrid AI Engine", desc: "Combining TF-IDF semantics with fuzzy token matching for robust skill alignment." },
            { icon: <Building2 />, title: "Geospatial Logic", desc: "Prioritizing home districts and remote capabilities using Haversine distance calculations." },
            { icon: <Users />, title: "MMR Diversity", desc: "Maximal Marginal Relevance ensures diverse sector recommendations, avoiding repetitive results." },
            { icon: <TrendingUp />, title: "Explainable AI", desc: "IBM Watsonx integration provides transparent, human-readable feedback to candidates." }
          ].map((pillar, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-primary mb-4 bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center">
                {pillar.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{pillar.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisionPage;
