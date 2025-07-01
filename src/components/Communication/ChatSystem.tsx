import React, { useState, useEffect, useRef } from 'react';

interface ChatSystemProps {
  currentUserId: string;
  currentUserRole: 'student' | 'teacher' | 'parent' | 'admin';
  classId?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'teacher' | 'parent' | 'admin' | 'ai_tutor';
  content: string;
  type: 'text' | 'image' | 'file' | 'system' | 'ai_response';
  timestamp: Date;
  isRead: boolean;
  reactions?: Reaction[];
  replyTo?: string;
  attachments?: Attachment[];
  isEdited?: boolean;
  editedAt?: Date;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'class' | 'group' | 'support' | 'ai_tutor';
  participants: Participant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
  createdAt: Date;
  description?: string;
  icon?: string;
}

interface Participant {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'parent' | 'admin' | 'ai_tutor';
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
}

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({
  currentUserId,
  currentUserRole,
  classId
}) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const [isTyping, setIsTyping] = useState<Participant[]>([]);
  const [showRoomList, setShowRoomList] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    initializeChatSystem();
  }, [currentUserId]);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
      markRoomAsRead(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChatSystem = async () => {
    try {
      const response = await fetch(`/api/communication/rooms/${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChatRooms(data.data.rooms);
        if (data.data.rooms.length > 0) {
          setSelectedRoom(data.data.rooms[0]);
        }
      } else {
        loadMockChatRooms();
      }
    } catch (error) {
      console.error('Error initializing chat system:', error);
      loadMockChatRooms();
    }
  };

  const loadMockChatRooms = () => {
    const mockRooms: ChatRoom[] = [
      {
        id: 'ai_tutor',
        name: 'AI Tutor - Professor Kwark',
        type: 'ai_tutor',
        participants: [
          {
            id: 'ai_tutor',
            name: 'Professor Kwark',
            role: 'ai_tutor',
            avatar: '🤖',
            isOnline: true
          }
        ],
        unreadCount: 0,
        isActive: true,
        createdAt: new Date(),
        description: 'Tvůj osobní AI fyzikální asistent',
        icon: '🤖'
      },
      {
        id: 'class_6a',
        name: 'Třída 6.A - Fyzika',
        type: 'class',
        participants: [
          {
            id: 'teacher1',
            name: 'Mgr. Novák',
            role: 'teacher',
            isOnline: true
          },
          {
            id: 'student1',
            name: 'Tomáš',
            role: 'student',
            isOnline: false,
            lastSeen: new Date(Date.now() - 30 * 60 * 1000)
          }
        ],
        unreadCount: 2,
        isActive: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        icon: '🏫'
      },
      {
        id: 'support',
        name: 'Technická podpora',
        type: 'support',
        participants: [
          {
            id: 'support1',
            name: 'Technická podpora',
            role: 'admin',
            isOnline: true
          }
        ],
        unreadCount: 0,
        isActive: true,
        createdAt: new Date(),
        icon: '🛠️'
      }
    ];

    setChatRooms(mockRooms);
    setSelectedRoom(mockRooms[0]);
  };

  const loadMessages = async (roomId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/communication/messages/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.messages);
      } else {
        loadMockMessages(roomId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      loadMockMessages(roomId);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockMessages = (roomId: string) => {
    const mockMessages: ChatMessage[] = [];

    if (roomId === 'ai_tutor') {
      mockMessages.push(
        {
          id: '1',
          senderId: 'ai_tutor',
          senderName: 'Professor Kwark',
          senderRole: 'ai_tutor',
          content: 'Ahoj! Jsem Professor Kwark, tvůj AI asistent pro fyziku. Jak ti dnes mohu pomoci? 🤖⚗️',
          type: 'text',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          isRead: true
        }
      );
    } else if (roomId === 'class_6a') {
      mockMessages.push(
        {
          id: '2',
          senderId: 'teacher1',
          senderName: 'Mgr. Novák',
          senderRole: 'teacher',
          content: 'Dobrý den všichni! Zítra budeme mít test z Newtonových zákonů. Nezapomeňte si zopakovat! 📚',
          type: 'text',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: true
        },
        {
          id: '3',
          senderId: 'student1',
          senderName: 'Tomáš',
          senderRole: 'student',
          content: 'Děkuji za připomenutí! Mám otázku k 3. Newtonovu zákonu 🤔',
          type: 'text',
          timestamp: new Date(Date.now() - 90 * 60 * 1000),
          isRead: false
        }
      );
    }

    setMessages(mockMessages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUserId,
      senderName: 'Ty',
      senderRole: currentUserRole,
      content: newMessage.trim(),
      type: 'text',
      timestamp: new Date(),
      isRead: false,
      replyTo: replyToMessage?.id
    };

    // Add message to local state immediately
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setReplyToMessage(null);

    try {
      // Send to backend
      const response = await fetch('/api/communication/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          content: message.content,
          type: message.type,
          replyTo: message.replyTo
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update message with server response
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, id: data.data.id } : msg
        ));

        // If it's AI tutor, generate AI response
        if (selectedRoom.type === 'ai_tutor') {
          generateAIResponse(message.content);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // If it's AI tutor and backend fails, still generate AI response
      if (selectedRoom.type === 'ai_tutor') {
        generateAIResponse(message.content);
      }
    }
  };

  const generateAIResponse = async (userMessage: string) => {
    setIsTyping([{ id: 'ai_tutor', name: 'Professor Kwark', role: 'ai_tutor', isOnline: true }]);

    try {
      const response = await fetch('/api/local-ai/chat-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          message: userMessage,
          context: 'physics_tutoring',
          studentLevel: currentUserRole === 'student' ? 'grade_6' : 'general',
          conversationHistory: messages.slice(-5)
        })
      });

      let aiResponseText = '';
      
      if (response.ok) {
        const data = await response.json();
        aiResponseText = data.data.response;
      } else {
        // Fallback AI responses
        aiResponseText = generateFallbackAIResponse(userMessage);
      }

      // Simulate typing delay
      setTimeout(() => {
        setIsTyping([]);
        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          senderId: 'ai_tutor',
          senderName: 'Professor Kwark',
          senderRole: 'ai_tutor',
          content: aiResponseText,
          type: 'ai_response',
          timestamp: new Date(),
          isRead: false
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }, 1500 + Math.random() * 1000);

    } catch (error) {
      console.error('Error generating AI response:', error);
      setIsTyping([]);
      
      const fallbackMessage: ChatMessage = {
        id: `ai_fallback_${Date.now()}`,
        senderId: 'ai_tutor',
        senderName: 'Professor Kwark',
        senderRole: 'ai_tutor',
        content: generateFallbackAIResponse(userMessage),
        type: 'ai_response',
        timestamp: new Date(),
        isRead: false
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    }
  };

  const generateFallbackAIResponse = (userMessage: string): string => {
    const lowercaseMessage = userMessage.toLowerCase();
    
    if (lowercaseMessage.includes('gravitace') || lowercaseMessage.includes('pád')) {
      return '🌍 Gravitace je síla, která přitahuje všechny předměty k Zemi! Víš, že všechny předměty padají stejně rychle (pokud neuvažujeme odpor vzduchu)? Zkus si hodit pero a list papíru současně!';
    }
    
    if (lowercaseMessage.includes('newton') || lowercaseMessage.includes('zákon')) {
      return '⚖️ Newtonovy zákony jsou základem mechaniky! 1. zákon říká, že těleso v klidu zůstane v klidu, dokud na něj nezačne působit síla. Chceš vědět o ostatních zákonech?';
    }
    
    if (lowercaseMessage.includes('energie')) {
      return '⚡ Energie je schopnost konat práci! Existuje kinetická energie (energie pohybu) a potenciální energie (uložená energie). Která tě zajímá víc?';
    }
    
    if (lowercaseMessage.includes('síla')) {
      return '💪 Síla je to, co způsobuje změnu pohybu předmětů! Měří se v Newtonech. Můžeš uvést příklad síly, kterou denně používáš?';
    }
    
    if (lowercaseMessage.includes('experiment')) {
      return '🔬 Experimenty jsou skvělý způsob, jak pochopit fyziku! Máš nějaký konkrétní experiment na mysli? Rád ti pomůžu s přípravou nebo vysvětlením!';
    }
    
    if (lowercaseMessage.includes('pomoc') || lowercaseMessage.includes('nevím')) {
      return '🤝 Samozřejmě ti pomůžu! Fyzika může být někdy složitá, ale společně to zvládneme. Řekni mi, co konkrétně ti dělá problémy?';
    }
    
    if (lowercaseMessage.includes('ahoj') || lowercaseMessage.includes('dobrý')) {
      return '👋 Ahoj! Jak se ti dnes daří s fyzikou? Máš nějaké otázky nebo chceš prozkoumat nějaký zajímavý fyzikální jev?';
    }
    
    // Default response
    return '🤔 To je zajímavá otázka! Zkusím ti pomoci. Můžeš mi říct víc detailů nebo být konkrétnější? Třeba se budeme moct ponořit hlouběji do tématu!';
  };

  const addReaction = async (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.userId === currentUserId);
        let newReactions = msg.reactions || [];
        
        if (existingReaction) {
          // Update existing reaction
          newReactions = newReactions.map(r => 
            r.userId === currentUserId ? { ...r, emoji } : r
          );
        } else {
          // Add new reaction
          newReactions.push({
            emoji,
            userId: currentUserId,
            userName: 'Ty'
          });
        }
        
        return { ...msg, reactions: newReactions };
      }
      return msg;
    }));

    try {
      await fetch(`/api/communication/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ emoji })
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const markRoomAsRead = async (roomId: string) => {
    setChatRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, unreadCount: 0 } : room
    ));

    try {
      await fetch(`/api/communication/rooms/${roomId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
    } catch (error) {
      console.error('Error marking room as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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

  const getParticipantIcon = (role: string): string => {
    switch (role) {
      case 'teacher': return '👨‍🏫';
      case 'student': return '🧑‍🎓';
      case 'parent': return '👨‍👩‍👧‍👦';
      case 'admin': return '👤';
      case 'ai_tutor': return '🤖';
      default: return '👤';
    }
  };

  const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🤔'];

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Room List */}
      {showRoomList && (
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">💬 Komunikace</h3>
              <button 
                onClick={() => setShowRoomList(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {chatRooms.map(room => (
              <button
                key={room.id}
                onClick={() => {
                  setSelectedRoom(room);
                  setShowRoomList(false);
                }}
                className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedRoom?.id === room.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{room.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 truncate">{room.name}</h4>
                      {room.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                    {room.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {room.lastMessage.content}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {room.participants.filter(p => p.isOnline).length} online
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setShowRoomList(true)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    ←
                  </button>
                  <div className="text-2xl">{selectedRoom.icon}</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedRoom.name}</h3>
                    <div className="text-sm text-gray-600 flex items-center space-x-2">
                      <span>{selectedRoom.participants.length} účastníků</span>
                      {isTyping.length > 0 && (
                        <span className="text-blue-600">
                          • {isTyping.map(p => p.name).join(', ')} píše...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {selectedRoom.participants.slice(0, 3).map(participant => (
                    <div
                      key={participant.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        participant.isOnline ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                      title={participant.name}
                    >
                      {participant.avatar || getParticipantIcon(participant.role)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                <>
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${message.senderId === currentUserId ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            message.senderId === currentUserId
                              ? 'bg-primary-500 text-white'
                              : message.senderRole === 'ai_tutor'
                              ? 'bg-blue-100 border border-blue-200'
                              : 'bg-gray-100'
                          }`}
                        >
                          {message.senderId !== currentUserId && (
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm">{getParticipantIcon(message.senderRole)}</span>
                              <span className="text-sm font-medium text-gray-700">
                                {message.senderName}
                              </span>
                            </div>
                          )}
                          
                          {message.replyTo && (
                            <div className="text-xs opacity-75 mb-2 p-2 bg-black bg-opacity-10 rounded">
                              Odpověď na zprávu...
                            </div>
                          )}
                          
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-75">
                              {formatTimestamp(message.timestamp)}
                            </span>
                            
                            {message.senderId !== currentUserId && (
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => setReplyToMessage(message)}
                                  className="text-xs opacity-75 hover:opacity-100"
                                >
                                  ↩️
                                </button>
                                <button
                                  onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                                  className="text-xs opacity-75 hover:opacity-100"
                                >
                                  😊
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {/* Reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {message.reactions.map((reaction, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full"
                                  title={reaction.userName}
                                >
                                  {reaction.emoji}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Emoji Picker */}
                          {showEmojiPicker === message.id && (
                            <div className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 mt-2">
                              <div className="grid grid-cols-4 gap-1">
                                {emojis.map(emoji => (
                                  <button
                                    key={emoji}
                                    onClick={() => {
                                      addReaction(message.id, emoji);
                                      setShowEmojiPicker(null);
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded text-lg"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Reply Preview */}
            {replyToMessage && (
              <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Odpovídáš na:</span>
                    <span className="ml-2 text-gray-600 truncate">
                      {replyToMessage.content.substring(0, 50)}...
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyToMessage(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end space-x-3">
                <textarea
                  ref={messageInputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={`Napište zprávu do ${selectedRoom.name}...`}
                  className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  maxLength={1000}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  📤
                </button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Stiskni Enter pro odeslání, Shift+Enter pro nový řádek</span>
                <span>{newMessage.length}/1000</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Vyberte konverzaci
              </h3>
              <p className="text-gray-600">
                Zvolte místnost ze seznamu vlevo pro začátek chatování
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};