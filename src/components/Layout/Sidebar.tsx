import React from 'react';
import { UserRole } from '../../types';

interface SidebarProps {
  userRole: UserRole;
  currentPath: string;
  onNavigate: (path: string) => void;
}

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: '📊',
    roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.PARENT, UserRole.PSYCHOLOGIST, UserRole.ADMIN]
  },
  {
    path: '/subjects',
    label: 'Předměty',
    icon: '📚',
    roles: [UserRole.TEACHER, UserRole.ADMIN]
  },
  {
    path: '/learning',
    label: 'Učení',
    icon: '🎮',
    roles: [UserRole.STUDENT]
  },
  {
    path: '/tests',
    label: 'Testy',
    icon: '📝',
    roles: [UserRole.STUDENT, UserRole.TEACHER]
  },
  {
    path: '/progress',
    label: 'Pokrok',
    icon: '📈',
    roles: [UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER]
  },
  {
    path: '/analytics',
    label: 'Analýzy',
    icon: '🔍',
    roles: [UserRole.TEACHER, UserRole.PSYCHOLOGIST, UserRole.ADMIN]
  },
  {
    path: '/gamification',
    label: 'Gamifikace',
    icon: '🏆',
    roles: [UserRole.STUDENT, UserRole.TEACHER]
  },
  {
    path: '/communication',
    label: 'Komunikace',
    icon: '💬',
    roles: [UserRole.TEACHER, UserRole.PARENT, UserRole.PSYCHOLOGIST]
  },
  {
    path: '/settings',
    label: 'Nastavení',
    icon: '⚙️',
    roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.PARENT, UserRole.PSYCHOLOGIST, UserRole.ADMIN]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ userRole, currentPath, onNavigate }) => {
  const availableItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="bg-gray-50 border-r border-gray-200 w-64 min-h-screen">
      <div className="py-4">
        <nav className="space-y-1">
          {availableItems.map((item) => (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium text-left transition-colors ${
                currentPath === item.path
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;