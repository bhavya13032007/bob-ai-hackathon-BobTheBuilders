import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n/translations';

/**
 * LanguageContext — Provides language state and t() translation helper.
 * Persists language choice in localStorage.
 * Listens for 'languageChange' custom events from Settings page.
 */
const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('cs_lang') || 'en');

  // Listen for language change events (from Settings page or other components)
  useEffect(() => {
    const handler = (e) => {
      const newLang = e.detail;
      if (newLang && translations[newLang]) {
        setLang(newLang);
        localStorage.setItem('cs_lang', newLang);
      }
    };
    window.addEventListener('languageChange', handler);
    return () => window.removeEventListener('languageChange', handler);
  }, []);

  /**
   * Translate a key, with optional interpolation.
   * Usage: t('wizard.step_of', { step: 1, total: 4 }) → "Step 1 of 4"
   */
  const t = useCallback((key, params = {}) => {
    let text = translations[lang]?.[key] || translations['en']?.[key] || key;
    // Simple interpolation: replace {key} with value
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    });
    return text;
  }, [lang]);

  const switchLanguage = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
      localStorage.setItem('cs_lang', newLang);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, t, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if used outside provider
    return {
      lang: 'en',
      t: (key) => translations['en']?.[key] || key,
      switchLanguage: () => {},
    };
  }
  return context;
};
