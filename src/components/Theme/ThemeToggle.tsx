import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, actualTheme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
        return '🌓';
      default:
        return '☀️';
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Světlý režim';
      case 'dark':
        return 'Tmavý režim';
      case 'auto':
        return 'Automatický';
      default:
        return 'Světlý režim';
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case 'light':
        return 'Přepnout na tmavý režim';
      case 'dark':
        return 'Přepnout na automatický režim';
      case 'auto':
        return 'Přepnout na světlý režim';
      default:
        return 'Přepnout téma';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="glass-button px-3 py-2 flex items-center space-x-2 hover:scale-105 transition-all duration-300"
      title={getTooltip()}
      aria-label={getTooltip()}
    >
      <span className="text-xl">{getThemeIcon()}</span>
      <span className="hidden sm:inline text-sm font-medium text-glass">
        {getThemeLabel()}
      </span>
      {actualTheme !== theme && (
        <span className="text-xs text-glass-muted">
          ({actualTheme === 'dark' ? '🌙' : '☀️'})
        </span>
      )}
    </button>
  );
};