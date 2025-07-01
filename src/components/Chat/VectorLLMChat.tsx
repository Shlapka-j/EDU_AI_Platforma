import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { aiApi } from '../../services/api';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  vectorContext?: string[];
  confidence?: number;
  relatedTopics?: string[];
}

interface VectorContext {
  topic: string;
  relevance: number;
  source: string;
  snippet: string;
}

interface VectorLLMChatProps {
  userRole: 'student' | 'teacher';
  studentId?: string;
  subjectId?: string;
}

export const VectorLLMChat: React.FC<VectorLLMChatProps> = ({ 
  userRole, 
  studentId, 
  subjectId 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [vectorContexts, setVectorContexts] = useState<VectorContext[]>([]);
  const [showVectorInfo, setShowVectorInfo] = useState(false);
  const [aiServiceStatus, setAiServiceStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message and check AI service
  useEffect(() => {
    const initializeChat = async () => {
      // Check AI service status
      try {
        await aiApi.getHealth();
        setAiServiceStatus('connected');
      } catch (error) {
        console.warn('AI service not available:', error);
        setAiServiceStatus('disconnected');
      }

      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content: userRole === 'student' 
          ? `Ahoj ${user?.name}! 👋 Jsem Professor Kwark, tvůj AI tutor! Mám přístup ke všem tvým studijním materiálům a pokroku. Na co se chceš zeptat?`
          : `Vítejte ${user?.name}! 👨‍🏫 Jsem váš AI asistent s přístupem ke kompletní vektorové databázi všech materiálů a studentských interakcí. Jak vám mohu pomoci?`,
        timestamp: new Date(),
        confidence: 1.0
      };
      setMessages([welcomeMessage]);
    };

    initializeChat();
  }, [user?.name, userRole]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate vector search and LLM response
  const generateAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    // Simulate vector database search
    const mockVectorContexts: VectorContext[] = [
      {
        topic: 'Newtonovy zákony',
        relevance: 0.95,
        source: 'Učebnice fyziky 8. třída',
        snippet: 'První Newtonův zákon říká, že těleso setrvává v klidu nebo rovnoměrném pohybu...'
      },
      {
        topic: 'Gravitační síla',
        relevance: 0.87,
        source: 'Studentova aktivita',
        snippet: 'Student měl potíže s výpočtem gravitační síly na planetě Mars...'
      },
      {
        topic: 'Síla a zrychlení',
        relevance: 0.82,
        source: 'Kvíz z minulého týdne',
        snippet: 'Správně odpověděl na 7 z 10 otázek o vztahu síly a zrychlení...'
      }
    ];

    setVectorContexts(mockVectorContexts);

    // Simulate AI response generation
    const aiResponses = {
      student: [
        `Na základě tvých předchozích aktivit vidím, že si dobře rozumíš se základy! 🎯 K ${userMessage.toLowerCase()} ti mohu říct: \n\nZ našich materiálů o Newtonových zákonech vyplývá, že je důležité si zapamatovat vztah F = m × a. Vidím, že v minulém kvízu jsi měl 85% úspěšnost! \n\n💡 Tip: Zkus si procvičit příklady s různými planetami - gravitace na Marsu je jiná než na Zemi!`,
        `Skvělá otázka! 🤔 Podle vektorových dat z tvého profilu vidím, že máš talent na logické myšlení. \n\nK tématu ${userMessage.toLowerCase()}: Pamatuješ si náš experiment s kyvadlem? Přesně tady se aplikují principy, které se ptáš. \n\n🎮 Chceš si to procvičit v našem fyzikálním simulátoru?`,
        `Vidím z tvé historie, že tě zajímají praktické aplikace! 🔬 \n\nK ${userMessage.toLowerCase()} - tohle je perfektní příklad toho, jak fyzika funguje v reálném světě. Vzpomínáš si na naši diskusi o autech a brzdění? \n\n📊 Tvoje porozumění této oblasti je na 78% - máme prostor pro zlepšení!`
      ],
      teacher: [
        `Podle analýzy vektorových dat z vaší třídy k tématu ${userMessage.toLowerCase()}: \n\n📊 **Statistiky třídy:**\n• 67% studentů má problémy s tímto konceptem\n• Doporučuji více praktických příkladů\n• Anna Nováková vyniká (95%), Tomáš Svoboda potřebuje pomoc (45%)\n\n🤖 **AI doporučení:** Použijte vizuální demonstrace a skupinovou práci.`,
        `Na základě dokumentů které jste nahráli a studentských interakcí: \n\n📚 **Materiálové pokrytí:** Téma ${userMessage.toLowerCase()} je dobře podloženo v kapitole 3.2\n\n👥 **Studentská data:** Průměrná doba strávená na tomto tématu: 23 minut\n\n⚠️ **Rizikové faktory:** 3 studenti vykazují znaky nepochopení základů`,
        `Vektorová analýza ukazuje souvislosti s předchozími tématy: \n\n🔗 **Propojení:** ${userMessage.toLowerCase()} navazuje na gravitaci (korelace 0.89)\n\n📈 **Predikce:** Studenti kteří pochopí toto téma mají 92% šanci na úspěch v dalších kapitolách\n\n🎯 **Doporučené aktivity:** Simulace, řešení příkladů, diskusní fórum`
      ]
    };

    const responses = aiResponses[userRole];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content: randomResponse,
      timestamp: new Date(),
      vectorContext: mockVectorContexts.map(ctx => `${ctx.topic} (${Math.round(ctx.relevance * 100)}%)`),
      confidence: 0.92,
      relatedTopics: ['Síla', 'Zrychlení', 'Gravitace', 'Energie']
    };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Use real AI backend if connected, otherwise fallback to mock
      if (aiServiceStatus === 'connected') {
        const response = await aiApi.sendMessage({
          message: currentInput,
          userRole,
          subject: subjectId || undefined,
          studentId: studentId || undefined,
          conversationHistory: messages.slice(-6).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        });

        const aiMessage: ChatMessage = {
          id: response.id || `ai-${Date.now()}`,
          type: 'ai',
          content: response.content,
          timestamp: new Date(response.timestamp || new Date()),
          vectorContext: response.vectorContext || [],
          confidence: response.confidence || 0.8,
          relatedTopics: response.relatedTopics || []
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Update vector contexts for display
        if (response.metadata?.contextUsed) {
          setVectorContexts(response.vectorContext?.map((ctx: string, index: number) => ({
            topic: ctx.split(' (')[0],
            relevance: parseFloat(ctx.match(/\((\d+)%\)/)?.[1] || '80') / 100,
            source: `Document ${index + 1}`,
            snippet: `Context from ${ctx.split(' (')[0]}`
          })) || []);
        }
      } else {
        // Fallback to mock response
        const aiResponse = await generateAIResponse(currentInput);
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: aiServiceStatus === 'disconnected' 
          ? 'AI služba není dostupná. Spusťte backend server s Ollama.' 
          : 'Omlouvám se, došlo k chybě. Zkuste to prosím znovu.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'user': return userRole === 'student' ? '🎓' : '👨‍🏫';
      case 'ai': return '🤖';
      case 'system': return '⚙️';
      default: return '💬';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="glass-header p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🤖</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-glass">
                Professor Kwark - AI Tutor
              </h3>
              <p className="text-sm text-gray-600 text-glass">
                {userRole === 'student' ? 'Tvůj osobní AI učitel' : 'AI asistent pro učitele'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowVectorInfo(!showVectorInfo)}
              className={`glass-button px-3 py-1 text-sm ${showVectorInfo ? 'bg-blue-100 text-blue-700' : ''}`}
            >
              🧠 Vector Info
            </button>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600 text-glass">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vector Context Info */}
      {showVectorInfo && vectorContexts.length > 0 && (
        <div className="glass-card p-3 mb-4">
          <h4 className="font-medium text-gray-900 text-glass mb-2">🧠 Aktivní kontext z vektorové databáze:</h4>
          <div className="space-y-2">
            {vectorContexts.map((ctx, index) => (
              <div key={index} className="glass-button p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{ctx.topic}</span>
                  <span className="text-xs text-blue-600">{Math.round(ctx.relevance * 100)}% relevance</span>
                </div>
                <p className="text-xs text-gray-600 text-glass">{ctx.snippet}</p>
                <p className="text-xs text-gray-500 text-glass mt-1">Zdroj: {ctx.source}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`glass-card p-4 ${
                message.type === 'user' 
                  ? 'bg-blue-100 ml-8' 
                  : message.type === 'ai'
                  ? 'bg-green-50 mr-8'
                  : 'bg-yellow-50 mx-8'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className="text-lg">{getMessageIcon(message.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 text-glass">
                        {message.type === 'user' 
                          ? user?.name 
                          : message.type === 'ai' 
                          ? 'Professor Kwark' 
                          : 'Systém'}
                      </span>
                      <span className="text-xs text-gray-500 text-glass">
                        {message.timestamp.toLocaleTimeString('cs-CZ')}
                      </span>
                      {message.confidence && (
                        <span className="text-xs text-blue-600">
                          {Math.round(message.confidence * 100)}% jistota
                        </span>
                      )}
                    </div>
                    
                    <div className="text-gray-700 text-glass whitespace-pre-line">
                      {message.content}
                    </div>
                    
                    {message.vectorContext && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-glass mb-1">
                          🧠 Použité znalosti:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {message.vectorContext.map((context, index) => (
                            <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {context}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {message.relatedTopics && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 text-glass mb-1">
                          🔗 Související témata:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {message.relatedTopics.map((topic, index) => (
                            <button
                              key={index}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                              onClick={() => setInputMessage(`Řekni mi více o: ${topic}`)}
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass-card p-4 bg-green-50 mr-8">
              <div className="flex items-center space-x-3">
                <div className="text-lg">🤖</div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 text-glass">Professor Kwark</span>
                    <span className="text-xs text-gray-500 text-glass">píše...</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="glass-card p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              id="chat-message"
              name="message"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={userRole === 'student' 
                ? "Zeptej se na cokoliv o fyzice, matematice nebo tvém pokroku..." 
                : "Zeptej se na analýzu studentů, materiály nebo doporučení..."}
              className="w-full glass-button px-4 py-3 border-0 focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              disabled={isLoading}
              aria-label="Zadejte zprávu pro AI asistenta"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex space-x-2">
                <button className="glass-button px-3 py-1 text-sm">📎 Přiložit</button>
                <button className="glass-button px-3 py-1 text-sm">🎤 Nahrát</button>
                {userRole === 'teacher' && (
                  <button className="glass-button px-3 py-1 text-sm">📊 Analýza</button>
                )}
              </div>
              <span className="text-xs text-gray-500 text-glass">
                Enter pro odeslání, Shift+Enter pro nový řádek
              </span>
            </div>
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="glass-card-hover px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : '🚀 Odeslat'}
          </button>
        </div>
      </div>
    </div>
  );
};