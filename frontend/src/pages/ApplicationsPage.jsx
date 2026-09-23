import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Clock, Briefcase, MapPin, Building2, ChevronRight, FileText, Sparkles, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const ApplicationsPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // Query applications for current candidate
      // We can also query all internships to display rich cards
      const { data } = await api.get('/internships');
      
      // Sample mapped applications for cand_1 / active user
      const sampleApps = [
        {
          id: 'app_1',
          internship_id: 'int_1',
          internship: data.find(i => i.id === 'int_1') || {
            title: 'Associate Product Manager Intern',
            company_name: 'TechNova Solutions',
            district: 'Mumbai',
            state: 'Maharashtra',
            stipend: '₹25,000 - ₹35,000 / month',
            work_mode: 'In-Office'
          },
          status: 'Under Review',
          stage: 2, // 1: Submitted, 2: Under Review, 3: Shortlisted, 4: Selected
          applied_at: '2026-08-16',
          match_score: 94,
          notes: 'Candidate has verified NPTEL certifications and strong analytical background. Interview scheduled next week.'
        },
        {
          id: 'app_2',
          internship_id: 'int_2',
          internship: data.find(i => i.id === 'int_2') || {
            title: 'Junior Data Analyst & AI Intern',
            company_name: 'Infosys Limited',
            district: 'Bengaluru',
            state: 'Karnataka',
            stipend: '₹28,000 - ₹38,000 / month',
            work_mode: 'Hybrid'
          },
          status: 'Selected',
          stage: 4,
          applied_at: '2026-08-10',
          match_score: 98,
          notes: 'Congratulations! Selected for AI Research Group internship. Onboarding document generated.'
        },
        {
          id: 'app_3',
          internship_id: 'int_5',
          internship: data.find(i => i.id === 'int_5') || {
            title: 'EV Assembly & Quality Engineering Intern',
            company_name: 'Tata Motors',
            district: 'Pune',
            state: 'Maharashtra',
            stipend: '₹20,000 - ₹28,000 / month',
            work_mode: 'In-Office'
          },
          status: 'Applied',
          stage: 1,
          applied_at: '2026-08-19',
          match_score: 88,
          notes: 'Application forwarded to Pune Plant Recruitment Desk.'
        }
      ];

      setApplications(sampleApps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-black text-gray-900 mb-2">My Applications Tracker</h1>
        <p className="text-sm text-gray-500">Track your submitted applications and selection status under the PM Internship Scheme.</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500 font-bold">Loading your applications...</div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
          <Briefcase className="mx-auto text-gray-300" size={48} />
          <h3 className="text-lg font-bold text-gray-800">You have not applied to any internships yet</h3>
          <p className="text-xs text-gray-500">Use our AI matcher to find opportunities suited to your skills.</p>
          <Link to="/internships" className="inline-block px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-md">
            Explore Opportunities
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-6"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                      {app.internship.title}
                    </h2>
                    <span className="bg-emerald-50 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-md border border-emerald-200">
                      {app.match_score}% AI Match
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {app.internship.company_name} • {app.internship.district}, {app.internship.state} • {app.internship.stipend}
                  </p>
                </div>

                <div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black inline-flex items-center ${
                    app.status === 'Selected'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : app.status === 'Under Review'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {app.status === 'Selected' && <CheckCircle size={14} className="mr-1.5" />}
                    {app.status === 'Under Review' && <Clock size={14} className="mr-1.5" />}
                    <span>Status: {app.status}</span>
                  </span>
                </div>
              </div>

              {/* Progress Timeline Stepper */}
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Application Progress</div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {/* Step 1 */}
                  <div className="space-y-1">
                    <div className={`h-2 rounded-full ${app.stage >= 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                    <span className={`font-bold ${app.stage >= 1 ? 'text-primary' : 'text-gray-400'}`}>1. Applied</span>
                  </div>
                  {/* Step 2 */}
                  <div className="space-y-1">
                    <div className={`h-2 rounded-full ${app.stage >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                    <span className={`font-bold ${app.stage >= 2 ? 'text-primary' : 'text-gray-400'}`}>2. Under Review</span>
                  </div>
                  {/* Step 3 */}
                  <div className="space-y-1">
                    <div className={`h-2 rounded-full ${app.stage >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                    <span className={`font-bold ${app.stage >= 3 ? 'text-primary' : 'text-gray-400'}`}>3. Shortlisted</span>
                  </div>
                  {/* Step 4 */}
                  <div className="space-y-1">
                    <div className={`h-2 rounded-full ${app.stage >= 4 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                    <span className={`font-bold ${app.stage >= 4 ? 'text-emerald-600' : 'text-gray-400'}`}>4. Selected</span>
                  </div>
                </div>
              </div>

              {/* Employer Notes Box */}
              {app.notes && (
                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex items-start space-x-3">
                  <Sparkles size={18} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-primary mb-0.5">Employer Update & Notes:</div>
                    <p className="text-xs text-gray-700 leading-relaxed">{app.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-400">
                  Applied on: {app.applied_at} • Reference: #{app.id}
                </span>

                <div className="flex space-x-3">
                  <Link
                    to={`/job/${app.internship_id}`}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
                  >
                    View Job Spec
                  </Link>
                  <button
                    onClick={() => alert(`Application Receipt for ${app.internship.title} generated.`)}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center space-x-1"
                  >
                    <FileText size={14} />
                    <span>Download Receipt</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ApplicationsPage;
