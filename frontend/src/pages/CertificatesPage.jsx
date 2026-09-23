import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, Clock, AlertTriangle, ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import api, { getCertificates } from '../utils/api';

const CertificatesPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Upload Form State
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    try {
      const result = await getCertificates('cand_1');
      setData(result);
    } catch (error) {
      console.error("Error fetching certificates", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title || !issuer) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('candidate_id', 'cand_1');
    formData.append('title', title);
    formData.append('issuer', issuer);
    formData.append('issue_date', new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    formData.append('tags', 'Skill, Verified');
    formData.append('file', file);

    try {
      await api.post('/certificates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowModal(false);
      setTitle('');
      setIssuer('');
      setFile(null);
      await fetchCerts();
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center mt-20 font-bold text-gray-500">Loading portfolio...</div>;

  const { certificates, stats } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">My Certificates</h1>
          <p className="text-gray-600">Build trust with verified employer credentials to boost your match score.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-full shadow transition-colors flex items-center space-x-2"
        >
          <Upload size={18} />
          <span className="hidden sm:inline">Upload Certificate</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <ShieldCheck size={28} className="text-green-500 mb-3" />
          <div className="text-3xl font-black text-gray-900 mb-1">{stats.verified}</div>
          <div className="text-xs font-bold text-gray-500 uppercase">Verified</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <Clock size={28} className="text-yellow-500 mb-3" />
          <div className="text-3xl font-black text-gray-900 mb-1">{stats.pending}</div>
          <div className="text-xs font-bold text-gray-500 uppercase">Pending Review</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <FileText size={28} className="text-blue-500 mb-3" />
          <div className="text-3xl font-black text-gray-900 mb-1">{stats.total}</div>
          <div className="text-xs font-bold text-gray-500 uppercase">Total Uploaded</div>
        </div>
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="text-3xl font-black mb-1 relative z-10">+{stats.profile_boost_percentage}%</div>
          <div className="text-xs font-bold text-blue-100 uppercase relative z-10">Profile Match Boost</div>
          <div className="mt-4 text-[10px] text-blue-200 relative z-10">Verification active</div>
        </div>
      </div>

      {/* Certificates List */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Uploads</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {certificates.length === 0 ? (
             <li className="p-8 text-center text-gray-500">No certificates uploaded yet.</li>
          ) : certificates.map((cert) => (
            <li key={cert.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className={`mt-1 p-2 rounded-lg ${cert.verification_status === 'Verified' ? 'bg-green-100 text-green-700' : cert.verification_status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {cert.verification_status === 'Verified' ? <CheckCircle size={24}/> : cert.verification_status === 'Rejected' ? <AlertTriangle size={24}/> : <Clock size={24}/>}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{cert.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{cert.issuer} • {cert.issue_date}</p>
                    {cert.verification_status === 'Verified' && (
                      <p className="text-xs font-semibold text-green-700 flex items-center">
                        <ShieldCheck size={14} className="mr-1"/> Verified by {cert.verified_by}
                      </p>
                    )}
                    {cert.verification_status === 'Rejected' && (
                      <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-2">
                        <p className="text-xs text-red-700 font-semibold mb-1">Verification Failed</p>
                        <p className="text-xs text-red-600">{cert.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {cert.verification_status === 'Rejected' ? (
                  <button onClick={() => setShowModal(true)} className="w-full sm:w-auto text-sm font-bold text-primary bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                    Re-upload
                  </button>
                ) : (
                  <button className="text-gray-400 hover:text-primary transition-colors">
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Upload Certificate</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Certificate Title</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  placeholder="e.g. Data Science Bootcamp"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Issuing Organization</label>
                <input 
                  required
                  type="text" 
                  value={issuer}
                  onChange={e => setIssuer(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  placeholder="e.g. NPTEL / Skill India"
                />
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                <input 
                  required
                  type="file" 
                  accept=".pdf,image/*"
                  onChange={e => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">{file ? file.name : 'Click or drag file to upload'}</p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 5MB</p>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={uploading || !file} className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg shadow transition-colors">
                  {uploading ? 'Uploading...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CertificatesPage;
