import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all language files
import cs from './locales/cs.json';
import en from './locales/en.json';
import de from './locales/de.json';
import pl from './locales/pl.json';
import uk from './locales/uk.json';
import sk from './locales/sk.json';
import vi from './locales/vi.json';

// Supported languages
export const supportedLanguages = [
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
];

// Get default language from browser or localStorage
const getDefaultLanguage = (): string => {
  const savedLanguage = localStorage.getItem('preferred_language');
  if (savedLanguage && supportedLanguages.find(lang => lang.code === savedLanguage)) {
    return savedLanguage;
  }

  const browserLanguage = navigator.language.split('-')[0];
  if (supportedLanguages.find(lang => lang.code === browserLanguage)) {
    return browserLanguage;
  }

  return 'cs'; // Default to Czech
};

// i18n configuration
i18n
  .use(initReactI18next)
  .init({
    resources: {
      cs: { translation: cs },
      en: { translation: en },
      de: { translation: de },
      pl: { translation: pl },
      uk: { translation: uk },
      sk: { translation: sk },
      vi: { translation: vi }
    },
    lng: getDefaultLanguage(),
    fallbackLng: 'cs',
    
    interpolation: {
      escapeValue: false // React already does escaping
    },

    // Namespace configuration
    defaultNS: 'translation',
    
    // Development settings
    debug: process.env.NODE_ENV === 'development',
    
    // Load strategy
    load: 'languageOnly',
    
    // Detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'preferred_language',
      caches: ['localStorage']
    }
  });

// Helper function to change language
export const changeLanguage = (languageCode: string) => {
  i18n.changeLanguage(languageCode);
  localStorage.setItem('preferred_language', languageCode);
  
  // Update HTML lang attribute
  document.documentElement.lang = languageCode;
  
  // Update direction for RTL languages if needed
  const rtlLanguages = ['ar', 'he', 'fa'];
  document.documentElement.dir = rtlLanguages.includes(languageCode) ? 'rtl' : 'ltr';
};

// Helper function to get current language info
export const getCurrentLanguage = () => {
  const currentLang = i18n.language;
  return supportedLanguages.find(lang => lang.code === currentLang) || supportedLanguages[0];
};

// Helper function for pluralization
export const getPlural = (key: string, count: number, options?: any) => {
  return i18n.t(key, { count, ...options });
};

// Helper function for formatted strings
export const formatString = (key: string, values: Record<string, any>) => {
  return i18n.t(key, values);
};

export default i18n;