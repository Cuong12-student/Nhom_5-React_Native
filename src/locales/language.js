import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import lg from "./language.json";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3", // Cần thiết cho môi trường React Native
  resources: {
    vi: { translation: vi },
    en: { translation: en },
  },
  lng: "vi", // Ngôn ngữ khởi động mặc định (Tiếng Việt)
  fallbackLng: "en", // Nếu thiếu từ khóa sẽ tự lấy bản Tiếng Anh
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
