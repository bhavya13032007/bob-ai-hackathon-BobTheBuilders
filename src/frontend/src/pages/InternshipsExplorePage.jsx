import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Briefcase, MapPin, Award, CheckCircle, ArrowRight, Sparkles, Building2, SlidersHorizontal } from 'lucide-react';
import { getInternships, getRecommendations, applyInternship } from '../utils/api';

const SECTORS = [
  { id: 'all', label: 'All Sectors' },
  { id: 'it', label: 'Information Tech' },
  { id: 'manufacturing', label: 'Manufacturing & Auto' },
  { id: 'finance', label: 'Banking & Finance' },
  { id: 'agriculture', label: 'Agri-Tech & Rural' },
  { id: 'healthcare', label: 'Healthcare & Pharma' },
  { id: 'education', label: 'Education & Skilling' }
];

const InternshipsExplorePage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const initialSector = searchParams.get('sector') || 'all';

  const [internships, setInternships] = useState([]);
  const [recommendationsMap, setRecommendationsMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState(initialSector);
  const [selectedWorkMode, setSelectedWorkMode] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [sortBy, setSortBy] = useState('match'); // 'match', 'stipend_high', 'latest'
  const [applyingId, setApplyingId] = useState(null);
  const [appliedSet, setAppliedSet] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all internships
      const allInts = await getInternships();
      setInternships(allInts || []);

      // 2. Fetch AI recommendation scores for active candidate
      if (user && user.id) {
        const recData = await getRecommendations(user.id);
        const map = {};
        if (recData && recData.all_options) {
          recData.all_options.forEach(opt => {
            map[opt.internship.id] = opt;
          });
        }
        setRecommendationsMap(map);
      }
    } catch (err) {
      console.error("Error fetching internships catalogue", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (internshipId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    setApplyingId(internshipId);
    try {
      await applyInternship(internshipId, user.id || 'cand_1');
      setAppliedSet(prev => new Set(prev).add(internshipId));
    } catch (err) {
      console.error(err);
    } finally {
      setApplyingId(null);
    }
  };

  // Filter & Sort Logic
  const filteredList = internships.filter(item => {
    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchCompany = item.company_name?.toLowerCase().includes(q);
      const matchSkills = item.required_skills?.some(s => s.toLowerCase().includes(q));
      const matchDistrict = item.district?.toLowerCase().includes(q);
      if (!matchTitle && !matchCompany && !matchSkills && !matchDistrict) return false;
    }

    // Sector Filter
    if (selectedSector !== 'all' && item.sector?.toLowerCase() !== selectedSector.toLowerCase()) {
      return false;
    }

    // Work Mode Filter
    if (selectedWorkMode !== 'all' && !item.work_mode?.toLowerCase().includes(selectedWorkMode.toLowerCase())) {
      return false;
    }

    // State Filter
    if (selectedState !== 'all' && item.state?.toLowerCase() !== selectedState.toLowerCase()) {
      return false;
    }

    return true;
  });

  // Sort
  filteredList.sort((a, b) => {
    const recA = recommendationsMap[a.id];
    const recB = recommendationsMap[b.id];
    const scoreA = recA ? recA.match_percentage : 70;
    const scoreB = recB ? recB.match_percentage : 70;

    if (sortBy === 'match') {
      return scoreB - scoreA;
    } else if (sortBy === 'stipend_high') {
      return (b.stipend_amount || 0) - (a.stipend_amount || 0);
    } else {
      return (b.id || '').localeCompare(a.id || '');
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-primary via-primary-dark to-[#000433] rounded-3xl p-8 sm:p-10 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/15 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-bold mb-3 backdrop-blur-md">
            <Sparkles size={14} className="text-secondary" />
            <span>PM Internship Scheme Catalogue</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black mb-3">Explore All Internships</h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            Browse verified enterprise opportunities across India. Match scores are calculated in real time against your skills profile and district coordinates.
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by role, company, skill (e.g. Python, CAD, GST), or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Work Mode Filter */}
          <select
            value={selectedWorkMode}
            onChange={(e) => setSelectedWorkMode(e.target.value)}
            className="w-full md:w-44 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All Work Modes</option>
            <option value="In-Office">In-Office Only</option>
            <option value="Remote">Remote Only</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full md:w-44 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Delhi">Delhi NCR</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Telangana">Telangana</option>
            <option value="Bihar">Bihar</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Jharkhand">Jharkhand</option>
            <option value="Odisha">Odisha</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full md:w-44 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="match">Highest AI Match</option>
            <option value="stipend_high">Highest Stipend</option>
            <option value="latest">Recently Added</option>
          </select>
        </div>

        {/* Sector Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {SECTORS.map(sec => (
            <button
              key={sec.id}
              onClick={() => setSelectedSector(sec.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedSector === sec.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          Showing {filteredList.length} PM Internship Opportunities
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          Personalized for: <strong>{user?.name || 'Candidate'}</strong> ({user?.district || 'Mumbai'})
        </span>
      </div>

      {/* Internships Grid */}
      {loading ? (
        <div className="py-16 text-center text-gray-500 font-bold">Loading internships catalogue...</div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
          <Briefcase className="mx-auto text-gray-300" size={48} />
          <h3 className="text-lg font-bold text-gray-800">No matching internships found</h3>
          <p className="text-xs text-gray-500">Try clearing some search terms or resetting sector filters.</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedSector('all'); setSelectedWorkMode('all'); setSelectedState('all'); }}
            className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item) => {
            const rec = recommendationsMap[item.id];
            const matchScore = rec ? rec.match_percentage : 78;
            const isApplied = appliedSet.has(item.id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Match Ribbon */}
                <div className="absolute top-0 right-0 bg-emerald-50 text-emerald-800 text-[11px] font-black px-3 py-1 rounded-bl-xl border-b border-l border-emerald-200 flex items-center space-x-1">
                  <Sparkles size={12} className="text-secondary" />
                  <span>{matchScore}% Match</span>
                </div>

                <div>
                  {/* Company Info */}
                  <div className="flex items-start space-x-3 mb-4 pr-16">
                    <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 p-2 flex items-center justify-center flex-shrink-0 shadow-sm">
                      {item.company_logo ? (
                        <img src={item.company_logo} alt="logo" className="h-full w-full object-contain rounded" />
                      ) : (
                        <Building2 className="text-gray-400" size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base group-hover:text-primary transition-colors leading-tight line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center mt-0.5">
                        <span>{item.company_name}</span>
                        {item.verified_employer && (
                          <CheckCircle size={12} className="ml-1 text-primary" />
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Key Stats Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4 text-xs font-semibold">
                    <span className="bg-blue-50 text-primary px-2.5 py-1 rounded-lg border border-blue-100 flex items-center">
                      <MapPin size={12} className="mr-1" /> {item.district}, {item.state}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                      {item.work_mode}
                    </span>
                    <span className="bg-amber-50 text-amber-800 px-2 py-1 rounded-lg border border-amber-200">
                      {item.duration}
                    </span>
                  </div>

                  {/* Stipend Callout */}
                  <div className="mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="text-[10px] uppercase font-bold text-gray-500">Monthly Allowance</div>
                    <div className="text-sm font-black text-gray-900">{item.stipend}</div>
                  </div>

                  {/* Required Skills */}
                  <div className="mb-6">
                    <div className="text-[11px] font-bold text-gray-500 mb-1.5">Key Skills:</div>
                    <div className="flex flex-wrap gap-1">
                      {item.required_skills?.slice(0, 3).map((sk, idx) => (
                        <span key={idx} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                          {sk}
                        </span>
                      ))}
                      {item.required_skills?.length > 3 && (
                        <span className="text-[10px] text-gray-400 font-bold self-center">
                          +{item.required_skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                  <Link
                    to={`/internships/${item.id}`}
                    className="flex-1 text-center py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
                  >
                    View Details
                  </Link>

                  <button
                    onClick={(e) => handleApply(item.id, e)}
                    disabled={isApplied || applyingId === item.id}
                    className={`py-2.5 px-4 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1 ${
                      isApplied
                        ? 'bg-green-100 text-green-800 border border-green-200 cursor-default'
                        : 'bg-primary hover:bg-primary-dark text-white active:scale-95'
                    }`}
                  >
                    {isApplied ? (
                      <span>✓ Applied</span>
                    ) : applyingId === item.id ? (
                      <span>Applying...</span>
                    ) : (
                      <span>Apply</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default InternshipsExplorePage;
