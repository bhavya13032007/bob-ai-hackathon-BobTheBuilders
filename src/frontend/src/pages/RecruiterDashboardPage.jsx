import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, XCircle, Clock, ShieldCheck, User, Search, Filter, ExternalLink, Award } from 'lucide-react';
import api from '../utils/api';

const RecruiterDashboardPage = () => {
  const [applicants, setApplicants] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('comp_1');
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchApplicants(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    try {
      const { data } = await api.get('/companies');
      setCompanies(data || []);
      if (data && data.length > 0) {
        setSelectedCompanyId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplicants = async (companyId) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/companies/${companyId}/applicants`);
      setApplicants(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCert = async (certId, status) => {
    setActionLoading(true);
    try {
      const activeComp = companies.find(c => c.id === selectedCompanyId);
      await api.put(`/companies/certificates/${certId}/verify`, {
        status: status,
        verified_by_company_name: activeComp ? activeComp.name : "Verified Employer",
        rejection_reason: status === 'Rejected' ? (rejectionReason || "Document requires re-upload") : null
      });
      setSelectedCert(null);
      setRejectionReason('');
      await fetchApplicants(selectedCompanyId);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`/companies/applications/${appId}/status`, {
        status: newStatus
      });
      await fetchApplicants(selectedCompanyId);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const name = app.candidate?.name?.toLowerCase() || '';
    const role = app.internship?.title?.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    return name.includes(term) || role.includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-2">
            <ShieldCheck size={14} className="text-primary" />
            <span className="text-xs font-bold text-primary">Employer Portal</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Candidate Verification & Review</h1>
          <p className="text-sm text-gray-500">Review AI-ranked candidates and verify authentic skills certifications.</p>
        </div>

        {/* Company Selector Switcher */}
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 pl-2">Logged in as:</span>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {companies.map(comp => (
              <option key={comp.id} value={comp.id}>{comp.name} ({comp.sector})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search candidates by name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="text-xs font-semibold text-gray-500">
          Showing {filteredApplicants.length} applicant{filteredApplicants.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Applicants Table / Bento List */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 font-medium">Loading applicant records...</div>
      ) : filteredApplicants.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <Briefcase className="mx-auto text-gray-300 mb-3" size={40} />
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Applications Found</h3>
          <p className="text-sm text-gray-500">No candidates have applied for this company's postings yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Candidate</th>
                  <th className="py-4 px-6">Applied Role</th>
                  <th className="py-4 px-6">AI Match</th>
                  <th className="py-4 px-6">Certificates</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredApplicants.map((item) => (
                  <tr key={item.application_id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Candidate Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                          {item.candidate?.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{item.candidate?.name}</div>
                          <div className="text-xs text-gray-500">{item.candidate?.location} • {item.candidate?.education_level}</div>
                        </div>
                      </div>
                    </td>

                    {/* Applied Role */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-800">{item.internship?.title}</div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                        {item.internship?.sector_label}
                      </span>
                    </td>

                    {/* AI Match Bar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.match_score >= 85 ? 'bg-green-500' : item.match_score >= 70 ? 'bg-secondary' : 'bg-blue-500'}`}
                            style={{ width: `${item.match_score}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-xs text-gray-900">{item.match_score}%</span>
                      </div>
                    </td>

                    {/* Certificates Chips */}
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {item.certificates && item.certificates.length > 0 ? (
                          item.certificates.map(cert => (
                            <button
                              key={cert.id}
                              onClick={() => setSelectedCert(cert)}
                              className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center space-x-1 cursor-pointer transition-all ${
                                cert.verification_status === 'Verified'
                                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                  : cert.verification_status === 'Rejected'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 animate-pulse'
                              }`}
                            >
                              <span>{cert.title}</span>
                              {cert.verification_status === 'Verified' ? (
                                <CheckCircle size={12} />
                              ) : (
                                <Clock size={12} />
                              )}
                            </button>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No certs</span>
                        )}
                      </div>
                    </td>

                    {/* Application Status Dropdown */}
                    <td className="py-4 px-6">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.application_id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none ${
                          item.status === 'Selected'
                            ? 'bg-green-50 text-green-800 border-green-200'
                            : item.status === 'Under Review'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : item.status === 'Onboarding'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-gray-50 text-gray-800 border-gray-200'
                        }`}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Selected">Selected</option>
                        <option value="Onboarding">Onboarding</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      {item.certificates && item.certificates.length > 0 && (
                        <button
                          onClick={() => setSelectedCert(item.certificates[0])}
                          className="text-xs font-bold text-primary hover:text-primary-dark bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center space-x-1"
                        >
                          <span>Verify Docs</span>
                          <ShieldCheck size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Certificate Verification Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Award size={20} className="text-primary" />
                  <h3 className="text-xl font-bold text-gray-900">{selectedCert.title}</h3>
                </div>
                <p className="text-xs text-gray-500">Issued by: <strong>{selectedCert.issuer}</strong> • {selectedCert.issue_date}</p>
              </div>
              <button onClick={() => setSelectedCert(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* Document Preview Box */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center space-y-2">
              <div className="h-16 w-16 bg-white rounded-xl mx-auto flex items-center justify-center text-primary shadow-sm border border-gray-100">
                <ShieldCheck size={32} />
              </div>
              <div className="text-sm font-bold text-gray-800">Official Candidate Credential</div>
              <div className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded border inline-block">
                File: {selectedCert.file_url}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Status: <strong className={selectedCert.verification_status === 'Verified' ? 'text-green-600' : 'text-amber-600'}>{selectedCert.verification_status}</strong>
              </p>
            </div>

            {/* Rejection reason input if rejecting */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Review Notes / Reason (Optional for approval, required for rejection)</label>
              <input
                type="text"
                placeholder="e.g. Document verified against university database / illegible copy"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => handleVerifyCert(selectedCert.id, 'Rejected')}
                className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors flex items-center justify-center space-x-1"
              >
                <XCircle size={16} />
                <span>Reject Document</span>
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleVerifyCert(selectedCert.id, 'Verified')}
                className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1"
              >
                <CheckCircle size={16} />
                <span>Approve & Verify</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboardPage;
