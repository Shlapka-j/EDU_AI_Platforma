import React, { useState, useEffect } from 'react';

interface NotificationSystemProps {
  userId: string;
  userRole: 'student' | 'teacher' | 'parent' | 'admin';
}

interface Notification {
  id: string;
  type: 'achievement' | 'message' | 'assignment' | 'reminder' | 'system' | 'social' | 'warning';
  title: string;
  message: string;
  icon: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  timestamp: Date;
  actionUrl?: string;
  actionText?: string;
  senderId?: string;
  senderName?: string;
  metadata?: any;
  expiresAt?: Date;
}

interface NotificationSettings {
  achievements: boolean;
  messages: boolean;
  assignments: boolean;
  reminders: boolean;
  social: boolean;
  system: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  userId,
  userRole
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    achievements: true,
    messages: true,
    assignments: true,
    reminders: true,
    social: true,
    system: true,
    emailNotifications: false,
    pushNotifications: true,
    soundEnabled: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');

  useEffect(() => {
    loadNotifications();
    loadSettings();
    
    // Set up real-time notifications
    const interval = setInterval(checkForNewNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const loadNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications);
      } else {
        loadMockNotifications();
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      loadMockNotifications();
    }
  };

  const loadMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'achievement',
        title: 'Nový odznak získán!',
        message: 'Gratulujeme! Získal jsi odznak "Týdenní série" za 7 dní učení v řadě.',
        icon: '🏆',
        priority: 'medium',
        isRead: false,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        actionUrl: '/gamification/badges',
        actionText: 'Zobrazit odznaky'
      },
      {
        id: '2',
        type: 'message',
        title: 'Nová zpráva od učitele',
        message: 'Mgr. Novák: "Nezapomeňte na zítřejší test z Newtonových zákonů!"',
        icon: '💬',
        priority: 'high',
        isRead: false,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        senderId: 'teacher1',
        senderName: 'Mgr. Novák',
        actionUrl: '/communication/chat/class',
        actionText: 'Otevřít chat'
      },
      {
        id: '3',
        type: 'assignment',
        title: 'Nový úkol přiřazen',
        message: 'Byl ti přiřazen úkol "Experimenty s gravitací". Termín odevzdání: za 3 dny.',
        icon: '📋',
        priority: 'high',
        isRead: false,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        actionUrl: '/assignments/gravity-experiments',
        actionText: 'Začít úkol'
      },
      {
        id: '4',
        type: 'reminder',
        title: 'Připomenutí učení',
        message: 'Už 2 dny ses neučil! Pokračuj ve svém fyzikálním dobrodružství.',
        icon: '⏰',
        priority: 'medium',
        isRead: true,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        actionUrl: '/learning/continue',
        actionText: 'Pokračovat v učení'
      },
      {
        id: '5',
        type: 'social',
        title: 'Nová výzva od spolužáka',
        message: 'Tomáš tě vyzval na fyzikální souboj! Dokážeš ho porazit?',
        icon: '⚔️',
        priority: 'low',
        isRead: true,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        senderId: 'student2',
        senderName: 'Tomáš',
        actionUrl: '/challenges/physics-duel',
        actionText: 'Přijmout výzvu'
      },
      {
        id: '6',
        type: 'system',
        title: 'Aktualizace systému',
        message: 'Systém byl aktualizován na verzi 2.1. Přidány nové experimenty a vylepšení!',
        icon: '🔄',
        priority: 'low',
        isRead: true,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        actionUrl: '/changelog',
        actionText: 'Zobrazit novinky'
      }
    ];

    // Add role-specific notifications
    if (userRole === 'teacher') {
      mockNotifications.unshift({
        id: 'teacher1',
        type: 'warning',
        title: 'Student vyžaduje pozornost',
        message: 'Jakub Procházka má nízkou aktivitu a klesající výsledky. Doporučujeme kontakt.',
        icon: '⚠️',
        priority: 'urgent',
        isRead: false,
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        actionUrl: '/students/jakub-prochazka',
        actionText: 'Zobrazit profil'
      });
    } else if (userRole === 'parent') {
      mockNotifications.unshift({
        id: 'parent1',
        type: 'achievement',
        title: 'Váše dítě dosáhlo nové úrovně!',
        message: 'Tomáš dosáhl úrovně 18 ve fyzice. Skvělý pokrok!',
        icon: '🌟',
        priority: 'medium',
        isRead: false,
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        actionUrl: '/child/progress/tomas',
        actionText: 'Zobrazit pokrok'
      });
    }

    setNotifications(mockNotifications);
  };

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/notifications/settings/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data.settings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const checkForNewNotifications = async () => {
    try {
      const lastCheck = localStorage.getItem('lastNotificationCheck') || '0';
      const response = await fetch(`/api/notifications/${userId}/new?since=${lastCheck}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data.notifications.length > 0) {
          setNotifications(prev => [...data.data.notifications, ...prev]);
          
          // Show browser notification if enabled
          if (settings.pushNotifications && 'Notification' in window) {
            data.data.notifications.forEach((notif: Notification) => {
              showBrowserNotification(notif);
            });
          }
          
          // Play sound if enabled
          if (settings.soundEnabled && !isQuietHours()) {
            playNotificationSound();
          }
        }
        localStorage.setItem('lastNotificationCheck', Date.now().toString());
      }
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    }
  };

  const showBrowserNotification = (notification: Notification) => {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: notification.icon,
        tag: notification.id
      });
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Could not play notification sound:', e));
  };

  const isQuietHours = (): boolean => {
    if (!settings.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = settings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Spans midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));

    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));

    try {
      await fetch(`/api/notifications/${userId}/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const updateSettings = async (newSettings: NotificationSettings) => {
    setSettings(newSettings);

    try {
      await fetch(`/api/notifications/settings/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(newSettings)
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateSettings({ ...settings, pushNotifications: true });
      }
    }
  };

  const getFilteredNotifications = (): Notification[] => {
    let filtered = notifications;

    switch (filter) {
      case 'unread':
        filtered = notifications.filter(n => !n.isRead);
        break;
      case 'important':
        filtered = notifications.filter(n => n.priority === 'high' || n.priority === 'urgent');
        break;
      default:
        filtered = notifications;
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-blue-500 bg-blue-50';
      case 'low': return 'border-gray-300 bg-gray-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'achievement': return '🏆';
      case 'message': return '💬';
      case 'assignment': return '📋';
      case 'reminder': return '⏰';
      case 'social': return '👥';
      case 'system': return '🔧';
      case 'warning': return '⚠️';
      default: return '📢';
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'právě teď';
    if (diffMins < 60) return `před ${diffMins} min`;
    if (diffHours < 24) return `před ${diffHours}h`;
    if (diffDays < 7) return `před ${diffDays} dny`;
    
    return timestamp.toLocaleDateString('cs-CZ');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <div className="text-xl">🔔</div>
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">🔔 Upozornění</h3>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-500 hover:text-gray-700"
              >
                ⚙️
              </button>
            </div>
            
            {/* Filters */}
            <div className="flex space-x-2">
              {[
                { id: 'all', label: 'Vše', count: notifications.length },
                { id: 'unread', label: 'Nepřečtené', count: unreadCount },
                { id: 'important', label: 'Důležité', count: notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length }
              ].map(filterOption => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id as any)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    filter === filterOption.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.label} ({filterOption.count})
                </button>
              ))}
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700"
              >
                Označit vše jako přečtené
              </button>
            )}
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">Nastavení upozornění</h4>
              
              <div className="space-y-2">
                {[
                  { key: 'achievements', label: 'Úspěchy a odznaky', icon: '🏆' },
                  { key: 'messages', label: 'Zprávy', icon: '💬' },
                  { key: 'assignments', label: 'Úkoly', icon: '📋' },
                  { key: 'reminders', label: 'Připomenutí', icon: '⏰' },
                  { key: 'social', label: 'Sociální aktivity', icon: '👥' },
                  { key: 'system', label: 'Systémové zprávy', icon: '🔧' }
                ].map(option => (
                  <label key={option.key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings[option.key as keyof NotificationSettings] as boolean}
                      onChange={(e) => updateSettings({
                        ...settings,
                        [option.key]: e.target.checked
                      })}
                      className="rounded"
                    />
                    <span className="text-sm">{option.icon}</span>
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => {
                      if (e.target.checked) {
                        requestNotificationPermission();
                      } else {
                        updateSettings({ ...settings, pushNotifications: false });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">Browser notifikace</span>
                </label>
                
                <label className="flex items-center space-x-3 mt-2">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => updateSettings({ ...settings, soundEnabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Zvukové upozornění</span>
                </label>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {getFilteredNotifications().length > 0 ? (
              getFilteredNotifications().map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.priority === 'urgent' ? 'bg-red-500' :
                      notification.priority === 'high' ? 'bg-orange-500' :
                      notification.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    
                    <div className="text-xl">{notification.icon}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium text-sm ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-primary-600 hover:text-primary-700"
                            >
                              Označit jako přečtené
                            </button>
                          )}
                          
                          {notification.actionUrl && (
                            <button className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded hover:bg-primary-200 transition-colors">
                              {notification.actionText || 'Akce'}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {notification.senderName && (
                        <p className="text-xs text-gray-500 mt-1">
                          Od: {notification.senderName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">📭</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Žádná upozornění
                </h4>
                <p className="text-gray-600">
                  {filter === 'unread' ? 'Všechna upozornění jsou přečtená' :
                   filter === 'important' ? 'Žádná důležitá upozornění' :
                   'Zatím nemáte žádná upozornění'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 text-center">
            <button
              onClick={() => setShowNotifications(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Zavřít
            </button>
          </div>
        </div>
      )}
    </div>
  );
};