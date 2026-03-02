// Language context provider
import React, { createContext, useContext, useState, useCallback } from "react";
import { Language, translations } from "./translations";

const STORAGE_KEY = "timol-lang";
const SUPPORTED: Language[] = ["pt", "en", "es"];

function detectLanguage(): Language {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED.includes(saved as Language)) return saved as Language;

  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const l of langs) {
    const prefix = l.slice(0, 2).toLowerCase();
    if (SUPPORTED.includes(prefix as Language)) return prefix as Language;
  }
  return "pt";
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: string) => translations[language][key] || key,
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
