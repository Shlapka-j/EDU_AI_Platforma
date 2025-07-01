import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// Import components
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginForm } from './components/Auth/LoginForm';
import { StudentDashboard } from './components/Dashboards/StudentDashboard';
import { TeacherDashboard } from './components/Dashboards/TeacherDashboard';
import { ParentDashboard } from './components/Dashboards/ParentDashboard';
import { ThemeToggle } from './components/Theme/ThemeToggle';
// import { LanguageSelector } from './components/LanguageSelector';
import { useTranslation } from './hooks/useTranslation';
import { UserRole } from './types';

// Loading component
const LoadingSpinner = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-8 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-gray-700 text-glass">{t('common.loading', 'Načítání...')}</p>
      </div>
    </div>
  );
};

// Main App content with authentication
const AppContent: React.FC = () => {
  const { user, login, logout, isLoading, error } = useAuth();

  // Show login form if user is not authenticated
  if (!user) {
    return <LoginForm onLogin={login} isLoading={isLoading} error={error || undefined} />;
  }

  // Route based on user role
  switch (user.role) {
    case UserRole.STUDENT:
      return <StudentDashboard />;
    
    case UserRole.TEACHER:
      return <TeacherDashboard />;
    
    case UserRole.PARENT:
      return <ParentDashboard />;
    
    case UserRole.PSYCHOLOGIST:
      return (
        <div className="min-h-screen p-4">
          <div className="max-w-6xl mx-auto">
            <div className="glass-header p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 text-glass">
                    Psychologické rozbory - {user.name} 🧠
                  </h1>
                  <p className="text-gray-600 text-glass">Analýza učebních stylů a doporučení</p>
                </div>
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                  <button onClick={logout} className="glass-button px-4 py-2 text-red-600">
                    Odhlásit se
                  </button>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-900 text-glass mb-4">🧠 AI analýza učebních stylů</h2>
              <p className="text-gray-600 text-glass">Detailní rozbory pomohou optimalizovat výuku pro každého studenta individuálně.</p>
            </div>
          </div>
        </div>
      );
    
    case UserRole.ADMIN:
      return (
        <div className="min-h-screen p-4">
          <div className="max-w-7xl mx-auto">
            <div className="glass-header p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 text-glass">
                    Admin panel - {user.name} ⚙️
                  </h1>
                  <p className="text-gray-600 text-glass">Správa celé EDU-AI platformy</p>
                </div>
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                  <button onClick={logout} className="glass-button px-4 py-2 text-red-600">
                    Odhlásit se
                  </button>
                </div>
              </div>
            </div>
            
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-900 text-glass mb-4">⚙️ Systémová správa</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl mb-2">👥</div>
                  <p className="font-semibold text-gray-900 text-glass">Uživatelé</p>
                  <p className="text-xl font-bold text-blue-600">1,247</p>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl mb-2">🏫</div>
                  <p className="font-semibold text-gray-900 text-glass">Školy</p>
                  <p className="text-xl font-bold text-green-600">23</p>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl mb-2">📚</div>
                  <p className="font-semibold text-gray-900 text-glass">Předměty</p>
                  <p className="text-xl font-bold text-purple-600">156</p>
                </div>
                <div className="glass-card p-4 text-center">
                  <div className="text-2xl mb-2">🤖</div>
                  <p className="font-semibold text-gray-900 text-glass">AI Sessiony</p>
                  <p className="text-xl font-bold text-orange-600">45,892</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    
    default:
      return <LoginForm onLogin={login} isLoading={isLoading} error="Neznámá role uživatele" />;
  }
};

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Router>
              <Routes>
                <Route path="*" element={<AppContent />} />
              </Routes>
            </Router>
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default App;
