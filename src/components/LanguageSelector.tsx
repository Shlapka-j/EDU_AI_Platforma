import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, changeLanguage, getCurrentLanguage } from '../i18n';

interface LanguageSelectorProps {
  compact?: boolean;
  showFlag?: boolean;
  showName?: boolean;
  position?: 'dropdown' | 'inline' | 'modal';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  showFlag = true,
  showName = true,
  position = 'dropdown'
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const currentLanguage = getCurrentLanguage();

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
    setIsOpen(false);
    setShowModal(false);
    
    // Force re-render of the entire app
    window.location.reload();
  };

  const renderLanguageOption = (language: typeof supportedLanguages[0], isSelected: boolean = false) => (
    <div className={`flex items-center space-x-2 ${compact ? 'text-sm' : ''}`}>
      {showFlag && <span className="text-lg">{language.flag}</span>}
      {showName && (
        <span className={`${isSelected ? 'font-medium' : ''} ${compact ? 'text-sm' : ''}`}>
          {language.name}
        </span>
      )}
    </div>
  );

  if (position === 'inline') {
    return (
      <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
        {supportedLanguages.map(language => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              currentLanguage.code === language.code
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-sm">{language.flag}</span>
            {!compact && <span className="text-sm">{language.name}</span>}
          </button>
        ))}
      </div>
    );
  }

  if (position === 'modal') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 p-2 rounded-lg glass-button transition-colors"
        >
          {renderLanguageOption(currentLanguage)}
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="glass-card max-w-sm w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('common.language') || 'Vyberte jazyk'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-2">
                {supportedLanguages.map(language => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      currentLanguage.code === language.code
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {renderLanguageOption(language)}
                    {currentLanguage.code === language.code && (
                      <span className="text-primary-500">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default dropdown position
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {renderLanguageOption(currentLanguage)}
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-2">
              {supportedLanguages.map(language => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    currentLanguage.code === language.code
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {renderLanguageOption(language)}
                  {currentLanguage.code === language.code && (
                    <span className="text-primary-500">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Hook for using translations with fallbacks
export const useTranslationWithFallback = () => {
  const { t, i18n } = useTranslation();
  
  const tf = (key: string, fallback?: string, options?: any) => {
    const translation = t(key, options);
    
    // If translation is the same as key (not found), return fallback or key
    if (translation === key) {
      return fallback || key;
    }
    
    return translation;
  };
  
  return { t: tf, i18n, originalT: t };
};

// Component for text that automatically translates
interface TranslatedTextProps {
  translationKey: string;
  fallback?: string;
  values?: Record<string, any>;
  className?: string;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({
  translationKey,
  fallback,
  values,
  className,
  as: Component = 'span'
}) => {
  const { t } = useTranslationWithFallback();
  
  return (
    <Component className={className}>
      {t(translationKey, fallback, values) as string}
    </Component>
  );
};