import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, GraduationCap, X, CheckCircle, Plus, Trash2, Sparkles, Building2 } from 'lucide-react';

const COMMON_SKILLS_LIST = [
  "Python", "Data Analysis", "SQL Basics", "MS Excel", "ReactJS", "Machine Learning",
  "AutoCAD", "Quality Control", "CNC Machining", "PLC & Automation", "Electrical Maintenance",
  "Financial Modeling", "Tally ERP / Prime", "GST & Taxation", "Banking Operations",
  "Agri-Tech & Crop Management", "Renewable Energy & Solar", "Patient Care & Vital Monitoring",
  "Digital Marketing", "UX / UI Design", "Communication", "Problem Solving", "Team Leadership"
];

const SECTORS_LIST = [
  { id: 'it', label: 'Information Tech & AI' },
  { id: 'manufacturing', label: 'Manufacturing & Automotive' },
  { id: 'finance', label: 'Banking & Financial Services' },
  { id: 'agriculture', label: 'Agri-Tech & Rural Innovation' },
  { id: 'healthcare', label: 'Healthcare & Lifesciences' },
  { id: 'education', label: 'Education & Digital Literacy' }
];

const EditProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    education_level: 'Graduate',
    state: 'Maharashtra',
    district: 'Mumbai',
    remote_ok: true,
    skills: [],
    sector_interests: [],
    experience_notes: '',
    avatar_url: ''
  });

  const [customSkillInput, setCustomSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      const skillsArray = typeof user.skills === 'string'
        ? user.skills.split(',').map(s => s.trim()).filter(Boolean)
        : (user.skills || []);

      const sectorsArray = typeof user.sector_interests === 'string'
        ? user.sector_interests.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
        : (user.sector_interests || []);

      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        education_level: user.education_level || 'Graduate',
        state: user.state || 'Maharashtra',
        district: user.district || 'Mumbai',
        remote_ok: user.remote_ok !== undefined ? user.remote_ok : true,
        skills: skillsArray,
        sector_interests: sectorsArray,
        experience_notes: user.experience_notes || '',
        avatar_url: user.avatar_url || ''
      });
      setSaveMessage('');
    }
  }, [user, isOpen]);

  const handleAddSkill = (skill) => {
    const s = skill.trim();
    if (s && !formData.skills.includes(s)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, s] }));
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const handleToggleSector = (secId) => {
    const exists = formData.sector_interests.includes(secId);
    setFormData(prev => ({
      ...prev,
      sector_interests: exists
        ? prev.sector_interests.filter(s => s !== secId)
        : [...prev.sector_interests, secId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser(formData);
      setSaveMessage('Profile saved successfully! AI matching scores updated.');
      if (onProfileUpdated) {
        onProfileUpdated();
      }
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      console.error(err);
      setSaveMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/70">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <User size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">Edit Candidate Profile</h3>
              <p className="text-xs text-gray-500">Changes immediately adjust your AI match ranking</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {saveMessage && (
            <div className="p-3 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-200 flex items-center space-x-2">
              <CheckCircle size={16} />
              <span>{saveMessage}</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Education Level</label>
              <select
                value={formData.education_level}
                onChange={e => setFormData({ ...formData, education_level: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="10th Grade">10th Grade</option>
                <option value="12th Grade">12th Grade</option>
                <option value="ITI / Diploma">ITI / Diploma</option>
                <option value="Graduate">Graduate (Degree)</option>
                <option value="Post Graduate">Post Graduate (Masters/PG)</option>
              </select>
            </div>
          </div>

          {/* Location Preferences */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
                <MapPin size={14} className="mr-1 text-primary" /> Location & Mobility
              </span>
              <label className="flex items-center space-x-2 text-xs font-bold text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.remote_ok}
                  onChange={e => setFormData({ ...formData, remote_ok: e.target.checked })}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span>Open to Remote Internships</span>
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">Home State</label>
                <select
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Assam">Assam</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">District / City</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Pune, Nagpur, Bengaluru, Lucknow"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          </div>

          {/* Skills Management */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700">Skills & Competencies ({formData.skills.length})</label>
              <span className="text-[11px] text-gray-400">Click x to remove</span>
            </div>

            {/* Current Active Skills Chips */}
            <div className="flex flex-wrap gap-1.5 mb-3 min-h-[36px] p-2 bg-gray-50 border border-gray-200 rounded-xl">
              {formData.skills.length === 0 ? (
                <span className="text-xs text-gray-400">No skills selected yet. Add some below.</span>
              ) : (
                formData.skills.map(s => (
                  <span
                    key={s}
                    className="inline-flex items-center bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="ml-1.5 text-blue-200 hover:text-white"
                    >
                      ✕
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Custom Skill Input */}
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={customSkillInput}
                onChange={e => setCustomSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (customSkillInput) {
                      handleAddSkill(customSkillInput);
                      setCustomSkillInput('');
                    }
                  }
                }}
                placeholder="Type custom skill and press Add (e.g. Docker, Figma, Tax Audit)..."
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="button"
                onClick={() => {
                  if (customSkillInput) {
                    handleAddSkill(customSkillInput);
                    setCustomSkillInput('');
                  }
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl"
              >
                + Add
              </button>
            </div>

            {/* Quick Add Recommendations */}
            <div className="text-[11px] font-bold text-gray-500 mb-1.5">⚡ Suggested Skills:</div>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {COMMON_SKILLS_LIST.filter(s => !formData.skills.includes(s)).slice(0, 12).map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleAddSkill(skill)}
                  className="text-[11px] bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-primary px-2 py-1 rounded-md transition-colors"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Sector Interests */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Preferred Industry Sectors</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SECTORS_LIST.map(sec => {
                const selected = formData.sector_interests.includes(sec.id);
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => handleToggleSector(sec.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      selected
                        ? 'bg-primary/10 border-primary text-primary shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {selected && <CheckCircle size={12} className="inline mr-1 text-primary" />}
                    {sec.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Experience Bio Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Experience & Bio Summary</label>
            <textarea
              rows={2}
              value={formData.experience_notes}
              onChange={e => setFormData({ ...formData, experience_notes: e.target.value })}
              placeholder="Brief summary of your academic projects or career goals..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex justify-end space-x-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <Sparkles size={14} className="text-secondary" />
              <span>{saving ? 'Updating...' : 'Save & Re-calculate Matches'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
