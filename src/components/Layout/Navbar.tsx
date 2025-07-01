import React from 'react';
import { UserRole } from '../../types';

interface NavbarProps {
  user: {
    name: string;
    role: UserRole;
    avatar?: string;
  };
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case UserRole.STUDENT:
        return 'Žák';
      case UserRole.TEACHER:
        return 'Učitel';
      case UserRole.PARENT:
        return 'Rodič';
      case UserRole.PSYCHOLOGIST:
        return 'Psycholog';
      case UserRole.ADMIN:
        return 'Administrátor';
      default:
        return 'Uživatel';
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary-700">
                EDU-AI Platform
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-gray-500">{getRoleDisplayName(user.role)}</div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Odhlásit se
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;