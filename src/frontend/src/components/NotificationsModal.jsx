import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, ShieldCheck, AlertCircle, X, Send, Sliders, Smartphone, MessageSquare } from 'lucide-react';
import api, { getNotifications } from '../utils/api';

const NotificationsModal = ({ isOpen, onClose, onNotificationCountChange }) => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'preferences'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    push_matches: true,
    sms_matches: false,
    wa_matches: true,
    push_updates: true,
    sms_updates: true,
    wa_updates: true,
    push_cert: true,
    sms_cert: false,
    wa_cert: true,
    email_digest: true,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications('cand_1');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
      if (onNotificationCountChange) {
        onNotificationCountChange(data.unread_count || 0);
      }
    } catch (err) {
      console.error("Error loading notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const { data } = await api.get('/notifications/preferences', { params: { user_id: 'cand_1' } });
      if (data) {
        setPreferences(data);
      }
    } catch (err) {
      console.error("Error loading preferences", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all', null, { params: { user_id: 'cand_1' } });
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await api.put('/notifications/preferences', preferences, { params: { user_id: 'cand_1' } });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulate = async (eventType) => {
    try {
      await api.post('/notifications/simulate', {
        user_id: 'cand_1',
        event_type: eventType
      });
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">Notification Center</h3>
              <p className="text-xs text-gray-500">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab(activeTab === 'list' ? 'preferences' : 'list')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors ${activeTab === 'preferences' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              title="Notification Settings"
            >
              <Sliders size={16} />
              <span className="hidden sm:inline">{activeTab === 'preferences' ? 'View Feed' : 'Settings'}</span>
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'list' ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Activity</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {loading ? (
                <div className="py-8 text-center text-sm text-gray-500">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Bell className="mx-auto mb-2 opacity-30" size={32} />
                  <p className="text-sm font-medium">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.is_read && handleMarkSingleRead(n.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${n.is_read ? 'bg-white border-gray-100 text-gray-600' : 'bg-blue-50/60 border-blue-100 shadow-sm'}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {n.category === 'Certificates' ? (
                            <ShieldCheck size={18} className="text-green-600" />
                          ) : n.category === 'Applications' ? (
                            <CheckCircle size={18} className="text-blue-600" />
                          ) : n.category === 'Reminders' ? (
                            <AlertCircle size={18} className="text-amber-500" />
                          ) : (
                            <Bell size={18} className="text-secondary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-bold ${n.is_read ? 'text-gray-800' : 'text-primary'}`}>
                              {n.title}
                            </h4>
                            {!n.is_read && (
                              <span className="h-2 w-2 rounded-full bg-secondary"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-gray-400 mt-2 block">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {n.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Simulation Sandbox Triggers */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  ⚡ Test Live Notifications
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSimulate('new_match')}
                    className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 p-2 rounded-xl text-gray-700 font-semibold transition-colors text-left"
                  >
                    🎯 + New Match
                  </button>
                  <button
                    onClick={() => handleSimulate('cert_verified')}
                    className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 p-2 rounded-xl text-gray-700 font-semibold transition-colors text-left"
                  >
                    ✅ + Cert Verified
                  </button>
                  <button
                    onClick={() => handleSimulate('app_viewed')}
                    className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 p-2 rounded-xl text-gray-700 font-semibold transition-colors text-left"
                  >
                    👀 + App Viewed
                  </button>
                  <button
                    onClick={() => handleSimulate('deadline_alert')}
                    className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 p-2 rounded-xl text-gray-700 font-semibold transition-colors text-left"
                  >
                    ⏰ + Deadline Alert
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Multi-Channel Delivery Preferences</h4>
                <p className="text-xs text-gray-500">Choose how and where you receive career alerts.</p>
              </div>

              {/* Matrix */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                {/* Matches */}
                <div>
                  <div className="font-bold text-xs text-gray-800 mb-2">New Internship Matches</div>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center space-x-2 text-xs bg-white p-2 rounded-xl border border-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.push_matches}
                        onChange={(e) => setPreferences({ ...preferences, push_matches: e.target.checked })}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>In-App / Push</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs bg-white p-2 rounded-xl border border-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.wa_matches}
                        onChange={(e) => setPreferences({ ...preferences, wa_matches: e.target.checked })}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>WhatsApp</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs bg-white p-2 rounded-xl border border-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.sms_matches}
                        onChange={(e) => setPreferences({ ...preferences, sms_matches: e.target.checked })}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>SMS</span>
                    </label>
                  </div>
                </div>

                {/* Application Updates */}
                <div>
                  <div className="font-bold text-xs text-gray-800 mb-2">Application Status Updates</div>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center space-x-2 text-xs bg-white p-2 rounded-xl border border-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.push_updates}
                        onChange={(e) => setPreferences({ ...preferences, push_updates: e.target.checked })}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>In-App / Push</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs bg-white p-2 rounded-xl border border-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.wa_updates}
                        onChange={(e) => setPreferences({ ...preferences, wa_updates: e.target.checked })}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>WhatsApp</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs bg-white p-2 rounded-xl border border-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.sms_updates}
                        onChange={(e) => setPreferences({ ...preferences, sms_updates: e.target.checked })}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>SMS</span>
                    </label>
                  </div>
                </div>

                {/* Certificate Verification */}
                <div>
                  <div className="font-bold text-xs text-gray-800 mb-2">Certificate Verifications</div>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center space-x-2 text-xs bg-white p-2 rounded-xl border border-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.push_cert}
                        onChange={(e) => setPreferences({ ...preferences, push_cert: e.target.checked })}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>In-App / Push</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs bg-white p-2 rounded-xl border border-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.wa_cert}
                        onChange={(e) => setPreferences({ ...preferences, wa_cert: e.target.checked })}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>WhatsApp</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs bg-white p-2 rounded-xl border border-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.sms_cert}
                        onChange={(e) => setPreferences({ ...preferences, sms_cert: e.target.checked })}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>SMS</span>
                    </label>
                  </div>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-green-50 text-green-700 text-xs font-bold text-center border border-green-200">
                  ✓ Preferences saved successfully!
                </div>
              )}

              <button
                onClick={handleSavePreferences}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-md transition-colors text-sm"
              >
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
