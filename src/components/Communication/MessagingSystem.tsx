import React, { useState, useEffect } from 'react';

interface MessagingSystemProps {
  userId: string;
  userRole: 'student' | 'teacher' | 'parent' | 'admin';
}

interface Contact {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  unreadCount: number;
  canMessage: boolean;
  classId?: string;
  subject?: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  type: 'text' | 'announcement' | 'assignment' | 'meeting_request';
  attachments?: MessageAttachment[];
  parentMessageId?: string;
  isSystemMessage?: boolean;
}

interface MessageAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
}

interface MessageThread {
  id: string;
  participants: Contact[];
  subject: string;
  lastMessage: Message;
  messages: Message[];
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const MessagingSystem: React.FC<MessagingSystemProps> = ({
  userId,
  userRole
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [selectedView, setSelectedView] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    content: '',
    priority: 'medium' as const,
    type: 'text' as const
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    loadContacts();
    loadMessages();
  }, [userId]);

  const loadContacts = async () => {
    try {
      const response = await fetch(`/api/messaging/contacts/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data.data.contacts);
      } else {
        loadMockContacts();
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      loadMockContacts();
    }
  };

  const loadMockContacts = () => {
    let mockContacts: Contact[] = [];

    if (userRole === 'student') {
      mockContacts = [
        {
          id: 'teacher1',
          name: 'Mgr. Jan Novák',
          role: 'teacher',
          isOnline: true,
          unreadCount: 1,
          canMessage: true,
          subject: 'Fyzika',
          classId: '6a'
        },
        {
          id: 'student2',
          name: 'Klára Svobodová',
          role: 'student',
          isOnline: false,
          lastSeen: new Date(Date.now() - 30 * 60 * 1000),
          unreadCount: 0,
          canMessage: true,
          classId: '6a'
        },
        {
          id: 'parent1',
          name: 'Rodiče',
          role: 'parent',
          isOnline: false,
          unreadCount: 0,
          canMessage: true
        }
      ];
    } else if (userRole === 'teacher') {
      mockContacts = [
        {
          id: 'student1',
          name: 'Tomáš Novák',
          role: 'student',
          isOnline: true,
          unreadCount: 0,
          canMessage: true,
          classId: '6a'
        },
        {
          id: 'parent2',
          name: 'Paní Svobodová',
          role: 'parent',
          isOnline: false,
          unreadCount: 2,
          canMessage: true
        },
        {
          id: 'teacher2',
          name: 'Mgr. Petra Dvořáková',
          role: 'teacher',
          isOnline: true,
          unreadCount: 0,
          canMessage: true,
          subject: 'Matematika'
        }
      ];
    } else if (userRole === 'parent') {
      mockContacts = [
        {
          id: 'teacher1',
          name: 'Mgr. Jan Novák - Fyzika',
          role: 'teacher',
          isOnline: true,
          unreadCount: 1,
          canMessage: true,
          subject: 'Fyzika'
        },
        {
          id: 'student1',
          name: 'Tomáš (moje dítě)',
          role: 'student',
          isOnline: false,
          unreadCount: 0,
          canMessage: true
        }
      ];
    }

    setContacts(mockContacts);
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/messaging/threads/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setThreads(data.data.threads);
      } else {
        loadMockMessages();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      loadMockMessages();
    }
  };

  const loadMockMessages = () => {
    const mockThreads: MessageThread[] = [
      {
        id: 'thread1',
        participants: [
          { id: 'teacher1', name: 'Mgr. Jan Novák', role: 'teacher', isOnline: true, unreadCount: 0, canMessage: true }
        ],
        subject: 'Dotaz k domácímu úkolu',
        lastMessage: {
          id: 'msg1',
          senderId: 'teacher1',
          receiverId: userId,
          subject: 'Dotaz k domácímu úkolu',
          content: 'Dobrý den, pokud máte jakékoliv otázky k domácímu úkolu o gravitaci, neváhejte se zeptat. Termín odevzdání je příští pátek.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: false,
          priority: 'medium',
          type: 'text'
        },
        messages: [
          {
            id: 'msg0',
            senderId: userId,
            receiverId: 'teacher1',
            content: 'Dobrý den, mám otázku k domácímu úkolu o gravitaci. Nevím si rady s výpočtem rychlosti pádu.',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            isRead: true,
            priority: 'medium',
            type: 'text'
          },
          {
            id: 'msg1',
            senderId: 'teacher1',
            receiverId: userId,
            content: 'Dobrý den, pokud máte jakékoliv otázky k domácímu úkolu o gravitaci, neváhejte se zeptat. Termín odevzdání je příští pátek.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            isRead: false,
            priority: 'medium',
            type: 'text'
          }
        ],
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ];

    if (userRole === 'teacher') {
      mockThreads.push({
        id: 'thread2',
        participants: [
          { id: 'parent2', name: 'Paní Svobodová', role: 'parent', isOnline: false, unreadCount: 0, canMessage: true }
        ],
        subject: 'Pokrok Kláry ve fyzice',
        lastMessage: {
          id: 'msg2',
          senderId: 'parent2',
          receiverId: userId,
          subject: 'Pokrok Kláry ve fyzice',
          content: 'Dobrý den, chtěla bych se informovat o pokroku naší dcery Kláry ve fyzice. Jak se jí daří?',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          isRead: true,
          priority: 'medium',
          type: 'text'
        },
        messages: [
          {
            id: 'msg2',
            senderId: 'parent2',
            receiverId: userId,
            content: 'Dobrý den, chtěla bych se informovat o pokroku naší dcery Kláry ve fyzice. Jak se jí daří?',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            isRead: true,
            priority: 'medium',
            type: 'text'
          }
        ],
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      });
    }

    setThreads(mockThreads);
  };

  const sendMessage = async () => {
    if (!composeData.content.trim() || !composeData.to) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: userId,
      receiverId: composeData.to,
      subject: composeData.subject || '(Bez předmětu)',
      content: composeData.content,
      timestamp: new Date(),
      isRead: false,
      priority: composeData.priority,
      type: composeData.type
    };

    try {
      const response = await fetch('/api/messaging/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          receiverId: composeData.to,
          subject: composeData.subject,
          content: composeData.content,
          priority: composeData.priority,
          type: composeData.type
        })
      });

      if (response.ok) {
        setComposeData({ to: '', subject: '', content: '', priority: 'medium', type: 'text' });
        setSelectedView('inbox');
        loadMessages(); // Reload messages
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const replyToMessage = async (content: string, threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: userId,
      receiverId: thread.participants[0].id,
      content,
      timestamp: new Date(),
      isRead: false,
      priority: 'medium',
      type: 'text'
    };

    // Update local state
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          messages: [...t.messages, newMessage],
          lastMessage: newMessage,
          updatedAt: new Date()
        };
      }
      return t;
    }));

    if (selectedThread?.id === threadId) {
      setSelectedThread(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newMessage],
        lastMessage: newMessage
      } : null);
    }

    try {
      await fetch('/api/messaging/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          threadId,
          content,
          priority: 'medium'
        })
      });
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const markAsRead = async (threadId: string) => {
    setThreads(prev => prev.map(t => 
      t.id === threadId ? { ...t, isRead: true } : t
    ));

    try {
      await fetch(`/api/messaging/threads/${threadId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteThread = async (threadId: string) => {
    setThreads(prev => prev.filter(t => t.id !== threadId));
    if (selectedThread?.id === threadId) {
      setSelectedThread(null);
    }

    try {
      await fetch(`/api/messaging/threads/${threadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  const getFilteredContacts = (): Contact[] => {
    let filtered = contacts;

    if (filterRole !== 'all') {
      filtered = contacts.filter(c => c.role === filterRole);
    }

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.filter(c => c.canMessage);
  };

  const getFilteredThreads = (): MessageThread[] => {
    let filtered = threads;

    if (searchTerm) {
      filtered = threads.filter(t => 
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        t.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return 'před chvílí';
    if (diffHours < 24) return `před ${diffHours}h`;
    if (diffDays < 7) return `před ${diffDays} dny`;
    
    return timestamp.toLocaleDateString('cs-CZ');
  };

  const getRoleIcon = (role: string): string => {
    switch (role) {
      case 'teacher': return '👨‍🏫';
      case 'student': return '🧑‍🎓';
      case 'parent': return '👨‍👩‍👧‍👦';
      case 'admin': return '👤';
      default: return '👤';
    }
  };

  const getPriorityIcon = (priority: string): string => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '🟡';
    }
  };

  const unreadCount = threads.filter(t => !t.isRead).length;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">📧 Zprávy</h2>
          <div className="flex items-center space-x-4">
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                {unreadCount} nepřečtených
              </span>
            )}
            <div className="flex rounded-lg overflow-hidden border">
              {[
                { id: 'inbox', label: 'Přijaté', icon: '📥' },
                { id: 'sent', label: 'Odeslané', icon: '📤' },
                { id: 'compose', label: 'Napsat', icon: '✏️' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id as any)}
                  className={`px-4 py-2 text-sm font-medium ${
                    selectedView === tab.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Hledat ve zprávách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[600px]">
        {/* Left Panel */}
        <div className="w-1/3 border-r border-gray-200">
          {selectedView === 'inbox' || selectedView === 'sent' ? (
            /* Message Threads */
            <div className="h-full overflow-y-auto">
              {getFilteredThreads().length > 0 ? (
                getFilteredThreads().map(thread => (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setSelectedThread(thread);
                      if (!thread.isRead) markAsRead(thread.id);
                    }}
                    className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedThread?.id === thread.id ? 'bg-blue-50 border-blue-200' : ''
                    } ${!thread.isRead ? 'bg-blue-25' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span>{getRoleIcon(thread.participants[0].role)}</span>
                          <h4 className={`font-medium text-sm truncate ${!thread.isRead ? 'font-bold' : ''}`}>
                            {thread.participants[0].name}
                          </h4>
                          {!thread.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className={`text-sm truncate ${!thread.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                          {thread.subject}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {thread.lastMessage.content}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(thread.lastMessage.timestamp)}
                        </span>
                        <div className="flex items-center justify-end space-x-1 mt-1">
                          <span className="text-xs">{getPriorityIcon(thread.lastMessage.priority)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteThread(thread.id);
                            }}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">📭</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Žádné zprávy</h4>
                  <p className="text-gray-600">
                    {selectedView === 'inbox' ? 'Nemáte žádné přijaté zprávy' : 'Nemáte žádné odeslané zprávy'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Contacts for Compose */
            <div className="h-full overflow-y-auto">
              <div className="p-4 border-b">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="all">Všechny kontakty</option>
                  <option value="teacher">Učitelé</option>
                  <option value="student">Studenti</option>
                  <option value="parent">Rodiče</option>
                  <option value="admin">Administrátoři</option>
                </select>
              </div>
              
              {getFilteredContacts().map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setComposeData(prev => ({ ...prev, to: contact.id }))}
                  className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    composeData.to === contact.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getRoleIcon(contact.role)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{contact.name}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className={contact.isOnline ? 'text-green-600' : 'text-gray-400'}>
                          {contact.isOnline ? '🟢 Online' : '⚫ Offline'}
                        </span>
                        {contact.subject && <span>• {contact.subject}</span>}
                        {contact.classId && <span>• {contact.classId}</span>}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col">
          {selectedView === 'compose' ? (
            /* Compose Message */
            <div className="flex-1 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">✏️ Napsat zprávu</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Příjemce:</label>
                  <div className="text-sm text-gray-600">
                    {composeData.to ? 
                      getFilteredContacts().find(c => c.id === composeData.to)?.name || 'Neznámý kontakt' :
                      'Vyberte kontakt ze seznamu vlevo'
                    }
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Předmět:</label>
                  <input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Zadejte předmět zprávy..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priorita:</label>
                    <select
                      value={composeData.priority}
                      onChange={(e) => setComposeData(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="low">🟢 Nízká</option>
                      <option value="medium">🟡 Střední</option>
                      <option value="high">🔴 Vysoká</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Typ:</label>
                    <select
                      value={composeData.type}
                      onChange={(e) => setComposeData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="text">📝 Běžná zpráva</option>
                      <option value="announcement">📢 Oznámení</option>
                      <option value="assignment">📋 Úkol</option>
                      <option value="meeting_request">📅 Žádost o schůzku</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zpráva:</label>
                  <textarea
                    value={composeData.content}
                    onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full h-64 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Napište svou zprávu..."
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {composeData.content.length}/2000 znaků
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={sendMessage}
                    disabled={!composeData.to || !composeData.content.trim()}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    📤 Odeslat zprávu
                  </button>
                  <button
                    onClick={() => setComposeData({ to: '', subject: '', content: '', priority: 'medium', type: 'text' })}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    🗑️ Vymazat
                  </button>
                </div>
              </div>
            </div>
          ) : selectedThread ? (
            /* Message Thread View */
            <div className="flex-1 flex flex-col">
              {/* Thread Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getRoleIcon(selectedThread.participants[0].role)}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedThread.subject}</h3>
                      <p className="text-sm text-gray-600">
                        Konverzace s {selectedThread.participants[0].name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteThread(selectedThread.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedThread.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md p-3 rounded-lg ${
                      message.senderId === userId
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs">
                          {getPriorityIcon(message.priority)}
                        </span>
                        <span className="text-xs opacity-75">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Reply */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <textarea
                    placeholder="Napište odpověď..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        const content = (e.target as HTMLTextAreaElement).value;
                        if (content.trim()) {
                          replyToMessage(content, selectedThread.id);
                          (e.target as HTMLTextAreaElement).value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const textarea = e.currentTarget.previousElementSibling as HTMLTextAreaElement;
                      const content = textarea.value;
                      if (content.trim()) {
                        replyToMessage(content, selectedThread.id);
                        textarea.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    📤
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ctrl+Enter pro rychlé odeslání
                </p>
              </div>
            </div>
          ) : (
            /* No Selection */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Vyberte konverzaci
                </h3>
                <p className="text-gray-600">
                  Zvolte zprávu ze seznamu vlevo nebo napište novou
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};