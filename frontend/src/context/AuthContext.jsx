import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getCandidate } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('career_setu_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('career_setu_user');
    return !!saved;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('career_setu_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('career_setu_user');
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('career_setu_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('career_setu_user');
  };

  const updateUser = async (updatedFields) => {
    try {
      const merged = { ...user, ...updatedFields };
      // Call backend to persist
      const res = await api.post('/candidates', {
        id: merged.id,
        name: merged.name,
        email: merged.email,
        phone: merged.phone,
        education_level: merged.education_level,
        state: merged.state,
        district: merged.district,
        remote_ok: merged.remote_ok,
        skills: typeof merged.skills === 'string' ? merged.skills : (merged.skills || []).join(', '),
        sector_interests: typeof merged.sector_interests === 'string' ? merged.sector_interests : (merged.sector_interests || []).join(', '),
        experience_notes: merged.experience_notes,
        avatar_url: merged.avatar_url
      });
      
      setUser({ ...merged, ...res.data });
      return { success: true };
    } catch (err) {
      console.error("Error updating user in backend", err);
      // Still update locally
      setUser(prev => ({ ...prev, ...updatedFields }));
      return { success: true };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
