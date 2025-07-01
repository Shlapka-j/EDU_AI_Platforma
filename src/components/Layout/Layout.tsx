import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { UserRole } from '../../types';

interface LayoutProps {
  user: {
    name: string;
    role: UserRole;
    avatar?: string;
  };
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ 
  user, 
  currentPath, 
  onNavigate, 
  onLogout, 
  children 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      <div className="flex">
        <Sidebar 
          userRole={user.role} 
          currentPath={currentPath} 
          onNavigate={onNavigate} 
        />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;