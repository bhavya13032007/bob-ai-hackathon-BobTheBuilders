import React, { useState, useEffect } from 'react';
import { Bell, Globe, Save, CheckCircle2, Loader2, Smartphone, Mail, MessageCircle, Volume2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import api from '../utils/api';

/**
 * SettingsPage — Language switcher + notification channel preferences.
 * Wired to GET/PUT /notifications/preferences API.
 */
const SettingsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const userId = user?.id || 'cand_1';

  const [language, setLanguage] = useState(() => localStorage.getItem('cs_lang') || 'en');
  const [prefs, setPrefs] = useState({
    push_matches: true, sms_matches: false, wa_matches: true,
    push_updates: true, sms_updates: true, wa_updates: true,
    push_cert: true, sms_cert: false, wa_cert: true,
    email_digest: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const { data } = await api.get('/notifications/preferences', { params: { user_id: userId } });
        if (data) {
          setPrefs({
            push_matches: data.push_matches ?? true,
            sms_matches: data.sms_matches ?? false,
            wa_matches: data.wa_matches ?? true,
            push_updates: data.push_updates ?? true,
            sms_updates: data.sms_updates ?? true,
            wa_updates: data.wa_updates ?? true,
            push_cert: data.push_cert ?? true,
            sms_cert: data.sms_cert ?? false,
            wa_cert: data.wa_cert ?? true,
            email_digest: data.email_digest ?? true,
          });
        }
      } catch (err) {
        console.error('Error loading preferences:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.put(`/notifications/preferences?user_id=${userId}`, prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('cs_lang', lang);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }));
  };

  const Toggle = ({ checked, onChange, label }) => (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900">{label}</span>
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        <div className={`w-10 h-5 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-gray-300'}`} />
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </div>
    </label>
  );

  const channelIcon = { push: Volume2, sms: Smartphone, wa: MessageCircle, email: Mail };

  const categories = [
    {
      title: t('settings.category_matches'),
      desc: t('settings.category_matches_desc'),
      keys: { push: 'push_matches', sms: 'sms_matches', wa: 'wa_matches' },
    },
    {
      title: t('settings.category_updates'),
      desc: t('settings.category_updates_desc'),
      keys: { push: 'push_updates', sms: 'sms_updates', wa: 'wa_updates' },
    },
    {
      title: t('settings.category_cert'),
      desc: t('settings.category_cert_desc'),
      keys: { push: 'push_cert', sms: 'sms_cert', wa: 'wa_cert' },
    },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F7F9FB] py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-black text-gray-900">{t('settings.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('settings.subtitle')}</p>
        </div>

        {/* Language Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Globe size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-gray-900">{t('settings.language')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { code: 'en', label: 'English', native: 'English' },
              { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
            ].map(lang_opt => (
              <button
                key={lang_opt.code}
                onClick={() => handleLanguageChange(lang_opt.code)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  language === lang_opt.code
                    ? 'border-primary bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="font-bold text-gray-900">{lang_opt.native}</div>
                <div className="text-xs text-gray-500 mt-0.5">{lang_opt.label}</div>
                {language === lang_opt.code && (
                  <CheckCircle2 size={16} className="text-primary mt-2" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell size={18} className="text-primary" />
              <h2 className="text-lg font-bold text-gray-900">{t('settings.notifications')}</h2>
            </div>
            {saving ? (
              <Loader2 size={18} className="text-gray-400 animate-spin" />
            ) : saved ? (
              <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-2 py-1 rounded-md">
                <CheckCircle2 size={14} className="mr-1" /> Saved
              </span>
            ) : null}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-gray-400" size={24} />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {categories.map((cat, idx) => (
                <div key={idx} className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{cat.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['push', 'sms', 'wa'].map(type => {
                      const Icon = channelIcon[type];
                      const labelMap = { push: 'App Push', sms: 'SMS', wa: 'WhatsApp' };
                      return (
                        <div key={type} className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon size={14} className="text-gray-500" />
                            <span className="text-xs font-bold text-gray-700">{labelMap[type]}</span>
                          </div>
                          <Toggle
                            checked={prefs[cat.keys[type]]}
                            onChange={(e) => setPrefs({ ...prefs, [cat.keys[type]]: e.target.checked })}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Email Digest */}
              <div className="p-6 bg-blue-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      <Mail size={16} className="text-primary" /> Weekly Email Digest
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Summary of matching internships and updates</p>
                  </div>
                  <Toggle
                    checked={prefs.email_digest}
                    onChange={(e) => setPrefs({ ...prefs, email_digest: e.target.checked })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-70 shadow-sm hover:shadow-md"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{t('settings.save_prefs')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
