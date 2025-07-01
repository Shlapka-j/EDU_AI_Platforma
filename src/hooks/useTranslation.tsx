import { useTranslation as useI18nTranslation } from 'react-i18next';
import { getCurrentLanguage, supportedLanguages, changeLanguage } from '../i18n';

// Enhanced translation hook with additional utilities
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  
  // Get current language info
  const currentLanguage = getCurrentLanguage();
  
  // Translation with fallback
  const tf = (key: string, fallback?: string, options?: any) => {
    const translation = t(key, options);
    
    // If translation is the same as key (not found), return fallback or key
    if (translation === key && fallback) {
      return fallback;
    }
    
    return translation;
  };
  
  // Format time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffMs / 604800000);
    const diffMonths = Math.floor(diffMs / 2629800000);
    const diffYears = Math.floor(diffMs / 31557600000);

    if (diffMins < 1) return t('time.now');
    if (diffMins < 2) return t('time.justNow');
    if (diffMins < 60) return t('time.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('time.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('time.daysAgo', { count: diffDays });
    if (diffWeeks < 4) return t('time.weeksAgo', { count: diffWeeks });
    if (diffMonths < 12) return t('time.monthsAgo', { count: diffMonths });
    return t('time.yearsAgo', { count: diffYears });
  };
  
  // Format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return t('time.minutesAgo', { count: minutes }).replace('ago', '').trim();
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    
    if (hours < 24) {
      if (remainingMins === 0) {
        return `${hours}${t('time.hour', { count: hours })}`;
      }
      return `${hours}h ${remainingMins}m`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (remainingHours === 0) {
      return `${days}${t('time.day', { count: days })}`;
    }
    return `${days}d ${remainingHours}h`;
  };
  
  // Format numbers based on locale
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(currentLanguage.code).format(num);
  };
  
  // Format currency (if needed)
  const formatCurrency = (amount: number, currency: string = 'CZK'): string => {
    return new Intl.NumberFormat(currentLanguage.code, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    return new Intl.DateTimeFormat(currentLanguage.code, defaultOptions).format(date);
  };
  
  // Format time
  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat(currentLanguage.code, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Format date and time
  const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat(currentLanguage.code, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get localized role name
  const getRoleName = (role: string): string => {
    return t(`roles.${role}`, role);
  };
  
  // Get localized difficulty
  const getDifficultyName = (difficulty: string): string => {
    return t(`learning.difficulty.${difficulty}`, difficulty);
  };
  
  // Get localized game mode
  const getGameModeName = (mode: string): string => {
    return t(`learning.gameMode.${mode}`, mode);
  };
  
  // Get localized subject name
  const getSubjectName = (subject: string): string => {
    return t(`learning.subjects.${subject}`, subject);
  };
  
  // Get localized priority
  const getPriorityName = (priority: string): string => {
    return t(`communication.priority.${priority}`, priority);
  };
  
  // Get localized message type
  const getMessageTypeName = (type: string): string => {
    return t(`communication.messageType.${type}`, type);
  };
  
  // Get localized rarity
  const getRarityName = (rarity: string): string => {
    return t(`gamification.rarity.${rarity}`, rarity);
  };
  
  // Get localized challenge type
  const getChallengeTypeName = (type: string): string => {
    return t(`gamification.challengeType.${type}`, type);
  };
  
  // Get current direction (for RTL languages)
  const isRTL = (): boolean => {
    const rtlLanguages = ['ar', 'he', 'fa'];
    return rtlLanguages.includes(currentLanguage.code);
  };
  
  return {
    t,
    tf,
    i18n,
    currentLanguage,
    supportedLanguages,
    changeLanguage,
    formatTimeAgo,
    formatDuration,
    formatNumber,
    formatCurrency,
    formatDate,
    formatTime,
    formatDateTime,
    getRoleName,
    getDifficultyName,
    getGameModeName,
    getSubjectName,
    getPriorityName,
    getMessageTypeName,
    getRarityName,
    getChallengeTypeName,
    isRTL
  };
};

// Higher-order component for adding translation to components
export const withTranslation = <P extends object>(
  Component: React.ComponentType<P & { t: any; currentLanguage: any }>
) => {
  return (props: P) => {
    const { t, currentLanguage } = useTranslation();
    return <Component {...props} t={t} currentLanguage={currentLanguage} />;
  };
};