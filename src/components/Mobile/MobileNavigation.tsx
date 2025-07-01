import React, { useState } from 'react';

interface MobileNavigationProps {
  currentUser: {
    id: string;
    name: string;
    role: 'student' | 'teacher' | 'parent' | 'admin';
    avatar?: string;
    level?: number;
    xp?: number;
  };
  currentRoute: string;
  onNavigate: (route: string) => void;
  unreadNotifications?: number;
  unreadMessages?: number;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
  roles: string[];
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentUser,
  currentRoute,
  onNavigate,
  unreadNotifications = 0,
  unreadMessages = 0
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      route: '/dashboard',
      roles: ['student', 'teacher', 'parent', 'admin']
    },
    {
      id: 'learning',
      label: 'Učení',
      icon: '📚',
      route: '/learning',
      roles: ['student']
    },
    {
      id: 'classes',
      label: 'Třídy',
      icon: '👥',
      route: '/classes',
      roles: ['teacher']
    },
    {
      id: 'children',
      label: 'Děti',
      icon: '👨‍👩‍👧‍👦',
      route: '/children',
      roles: ['parent']
    },
    {
      id: 'gamification',
      label: 'Herní profil',
      icon: '🎮',
      route: '/gamification',
      roles: ['student']
    },
    {
      id: 'achievements',
      label: 'Úspěchy',
      icon: '🏆',
      route: '/achievements',
      roles: ['student', 'parent']
    },
    {
      id: 'communication',
      label: 'Komunikace',
      icon: '💬',
      route: '/communication',
      badge: unreadMessages,
      roles: ['student', 'teacher', 'parent']
    },
    {
      id: 'notifications',
      label: 'Upozornění',
      icon: '🔔',
      route: '/notifications',
      badge: unreadNotifications,
      roles: ['student', 'teacher', 'parent', 'admin']
    },
    {
      id: 'analytics',
      label: 'Analytika',
      icon: '📊',
      route: '/analytics',
      roles: ['teacher', 'admin']
    },
    {
      id: 'settings',
      label: 'Nastavení',
      icon: '⚙️',
      route: '/settings',
      roles: ['student', 'teacher', 'parent', 'admin']
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(currentUser.role)
  );

  const bottomNavItems = filteredItems.slice(0, 5);
  const menuItems = filteredItems.slice(5);

  const getUserRoleIcon = (role: string): string => {
    switch (role) {
      case 'student': return '🧑‍🎓';
      case 'teacher': return '👨‍🏫';
      case 'parent': return '👨‍👩‍👧‍👦';
      case 'admin': return '👤';
      default: return '👤';
    }
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'student': return 'Student';
      case 'teacher': return 'Učitel';
      case 'parent': return 'Rodič';
      case 'admin': return 'Administrátor';
      default: return 'Uživatel';
    }
  };

  const handleNavigation = (route: string) => {
    onNavigate(route);
    setShowMenu(false);
  };

  return (
    <>
      {/* Top Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${{
              student: 'bg-gradient-to-r from-blue-400 to-purple-500',
              teacher: 'bg-gradient-to-r from-green-400 to-blue-500',
              parent: 'bg-gradient-to-r from-purple-400 to-pink-500',
              admin: 'bg-gradient-to-r from-gray-400 to-gray-600'
            }[currentUser.role]}`}>
              {currentUser.avatar || currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{currentUser.name}</div>
              <div className="text-xs text-gray-500">{getRoleLabel(currentUser.role)}</div>
            </div>
          </div>

          {/* User Level/XP for Students */}
          {currentUser.role === 'student' && currentUser.level && (
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="text-sm font-bold text-primary-600">Úroveň {currentUser.level}</div>
                <div className="text-xs text-gray-500">{currentUser.xp?.toLocaleString()} XP</div>
              </div>
              <div className="text-xl">⭐</div>
            </div>
          )}

          {/* Notification Badge */}
          {(unreadNotifications > 0 || unreadMessages > 0) && (
            <div className="flex items-center space-x-1">
              {unreadMessages > 0 && (
                <div className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </div>
              )}
              {unreadNotifications > 0 && (
                <div className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around py-2">
          {bottomNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.route)}
              className={`flex flex-col items-center justify-center py-2 px-3 relative transition-colors ${
                currentRoute === item.route
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="text-xl mb-1">{item.icon}</div>
              <span className="text-xs font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </div>
              )}
            </button>
          ))}
          
          {/* More Menu Button */}
          {menuItems.length > 0 && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex flex-col items-center justify-center py-2 px-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <div className="text-xl mb-1">⋯</div>
              <span className="text-xs font-medium">Více</span>
            </button>
          )}
        </div>
      </div>

      {/* Menu Overlay */}
      {showMenu && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowMenu(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[70vh] overflow-y-auto">
            <div className="p-4">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-4">Navigace</h3>
              
              <div className="space-y-2">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.route)}
                    className={`w-full flex items-center space-x-4 p-4 rounded-lg transition-colors ${
                      currentRoute === item.route
                        ? 'bg-primary-50 text-primary-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl">{item.icon}</div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.label}</div>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <div className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* User Profile Section */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{getUserRoleIcon(currentUser.role)}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{currentUser.name}</div>
                    <div className="text-sm text-gray-500">{getRoleLabel(currentUser.role)}</div>
                    {currentUser.role === 'student' && currentUser.level && (
                      <div className="text-sm text-primary-600">
                        Úroveň {currentUser.level} • {currentUser.xp?.toLocaleString()} XP
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleNavigation('/profile')}
                  className="p-3 bg-blue-50 text-blue-600 rounded-lg text-center"
                >
                  <div className="text-xl mb-1">👤</div>
                  <div className="text-sm font-medium">Profil</div>
                </button>
                <button
                  onClick={() => handleNavigation('/help')}
                  className="p-3 bg-green-50 text-green-600 rounded-lg text-center"
                >
                  <div className="text-xl mb-1">❓</div>
                  <div className="text-sm font-medium">Nápověda</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed navigation */}
      <div className="lg:hidden h-16"></div> {/* Top spacer */}
      <div className="lg:hidden h-16"></div> {/* Bottom spacer */}
    </>
  );
};