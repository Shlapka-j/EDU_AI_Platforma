import React, { useState } from 'react';
import { UserRole } from '../../types';

interface LoginFormProps {
  onLogin: (email: string, password: string, role: UserRole) => void;
  isLoading?: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password, selectedRole);
  };

  const roles = [
    { value: UserRole.STUDENT, label: '🎓 Student', description: 'Přístup k herním režimům učení' },
    { value: UserRole.TEACHER, label: '👨‍🏫 Učitel', description: 'Správa tříd, osnov a materiálů' },
    { value: UserRole.PARENT, label: '👨‍👩‍👧‍👦 Rodič', description: 'Sledování pokroku dítěte' },
    { value: UserRole.PSYCHOLOGIST, label: '🧠 Psycholog', description: 'Analýza učebních stylů' },
    { value: UserRole.ADMIN, label: '⚙️ Admin', description: 'Správa celé platformy' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-slide-in-glass">
      <div className="glass-card w-full max-w-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-pulse-glass">🎓</div>
          <h1 className="text-3xl font-bold text-glass mb-2">
            EDU-AI Platform
          </h1>
          <p className="text-glass-light text-lg">
            Inteligentní systém pro vzdělávání
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-badge glass-badge-error mb-4 p-3 w-full text-center">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-glass mb-4">
            Vyberte svou roli:
          </label>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-3 mb-6 justify-center">
            {roles.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setSelectedRole(role.value)}
                className={`transition-all ${
                  selectedRole === role.value
                    ? 'login-tab-active'
                    : 'login-tab'
                }`}
              >
                <div className="text-lg mb-1">{role.label.split(' ')[0]}</div>
                <div className="text-xs font-medium hidden sm:block">
                  {role.label.split(' ').slice(1).join(' ')}
                </div>
              </button>
            ))}
          </div>
          
          {/* Selected Role Details */}
          <div className="glass-card p-6 text-center border-2 border-blue-200 animate-slide-in-glass">
            <div className="text-5xl mb-3 animate-pulse-glass">
              {roles.find(r => r.value === selectedRole)?.label.split(' ')[0]}
            </div>
            <h3 className="font-bold text-glass text-xl mb-3">
              {roles.find(r => r.value === selectedRole)?.label}
            </h3>
            <p className="text-glass-muted text-base leading-relaxed mb-4">
              {roles.find(r => r.value === selectedRole)?.description}
            </p>
            <div className="flex justify-center">
              <span className="glass-badge glass-badge-success px-4 py-2">
                <span className="mr-2 text-lg">✓</span>
                <span className="font-semibold">Vybraná role</span>
              </span>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-glass mb-2">
              📧 Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full glass-button px-4 py-3 text-lg font-medium"
              placeholder="vase@email.cz"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-glass mb-2">
              🔐 Heslo
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full glass-button px-4 py-3 pr-12 text-lg font-medium"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-4 flex items-center text-glass hover:text-glass-light transition-colors"
              >
                <span className="text-xl">{showPassword ? '👁️' : '🙈'}</span>
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 font-bold text-lg rounded-xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border-2 border-transparent
              bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 
              hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 
              text-white hover:text-white focus:text-white
              hover:shadow-2xl hover:scale-105 active:scale-95
              focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                <span>Přihlašování...</span>
              </div>
            ) : (
              <span className="flex items-center justify-center">
                <span className="mr-2">🚀</span>
                {`Přihlásit se jako ${roles.find(r => r.value === selectedRole)?.label}`}
              </span>
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 glass-card p-5">
          <h3 className="text-sm font-bold text-glass mb-4 flex items-center">
            <span className="mr-2">🎯</span>
            Demo přístupy:
          </h3>
          <div className="grid grid-cols-1 gap-2 text-sm text-glass-muted">
            <div className="glass-button p-2 text-center font-medium">👨‍🏫 Učitel: <span className="text-glass font-semibold">ucitel@demo.cz</span></div>
            <div className="glass-button p-2 text-center font-medium">🎓 Student: <span className="text-glass font-semibold">student@demo.cz</span></div>
            <div className="glass-button p-2 text-center font-medium">👨‍👩‍👧‍👦 Rodič: <span className="text-glass font-semibold">rodic@demo.cz</span></div>
            <div className="glass-button p-2 text-center font-medium">🧠 Psycholog: <span className="text-glass font-semibold">psycholog@demo.cz</span></div>
            <div className="glass-button p-2 text-center font-medium">⚙️ Admin: <span className="text-glass font-semibold">admin@demo.cz</span></div>
            <div className="text-center mt-2 text-xs text-glass-muted">
              <span className="glass-badge">Všechna hesla: <strong>heslo123</strong></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="glass-badge glass-badge-info">
            <span className="font-bold">EDU-AI Platform v1.0</span>
          </div>
          <p className="mt-2 text-xs text-glass-muted font-medium">
            🔒 Lokální AI • 🌐 Kompletně offline • 🎯 Bezpečné
          </p>
        </div>
      </div>
    </div>
  );
};