import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo credentials for each role
  const demoCredentials = {
    'ucitel@demo.cz': { role: UserRole.TEACHER, name: 'Jan Novák' },
    'student@demo.cz': { role: UserRole.STUDENT, name: 'Petra Svobodová' },
    'rodic@demo.cz': { role: UserRole.PARENT, name: 'Marie Procházková' },
    'psycholog@demo.cz': { role: UserRole.PSYCHOLOGIST, name: 'Dr. Pavel Černý' },
    'admin@demo.cz': { role: UserRole.ADMIN, name: 'Admin Systému' }
  };

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('edu_ai_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('edu_ai_user');
      }
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Demo authentication
      const demoUser = demoCredentials[email as keyof typeof demoCredentials];
      
      if (demoUser && password === 'heslo123' && demoUser.role === role) {
        const userData: User = {
          id: `user_${Date.now()}`,
          email,
          name: demoUser.name,
          role: demoUser.role,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        setUser(userData);
        localStorage.setItem('edu_ai_user', JSON.stringify(userData));
        return true;
      } else {
        setError('Neplatné přihlašovací údaje nebo role');
        return false;
      }
    } catch (err) {
      setError('Chyba při přihlašování');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('edu_ai_user');
    setError(null);
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};