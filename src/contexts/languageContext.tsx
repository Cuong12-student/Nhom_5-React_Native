import React, { createContext, useContext, useState } from "react";
import vi from "../locales/vi.json";
import en from "../locales/en.json";
import fr from "../locales/fr.json";

type Language = "vi" | "en" | "fr";

const dictionaries: Record<Language, any> = { vi, en, fr };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "vi",
  setLanguage: () => {},
  t: (path: string) => path,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("vi");

  // Hàm lấy từ khóa dạng "home.welcome" hoặc "common.save"
  const t = (path: string): string => {
    const keys = path.split(".");
    let result = dictionaries[language];
    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        return path; // Fallback trả về key gốc nếu thiếu từ
      }
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
