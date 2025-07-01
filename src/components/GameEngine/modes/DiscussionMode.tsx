import React, { useState, useEffect } from 'react';
import { Activity, GameState, LearningPreferences } from '../../../types';

interface DiscussionModeProps {
  activity: Activity;
  gameState: GameState;
  preferences: LearningPreferences;
  adaptiveSettings: any;
  onComplete: (result: any) => void;
  onProgressUpdate: (progress: number) => void;
  onInteraction: (interaction: any) => void;
}

interface Message {
  id: string;
  sender: 'student' | 'ai_teacher' | 'peer' | 'system';
  content: string;
  timestamp: Date;
  type: 'text' | 'question' | 'hint' | 'encouragement';
  metadata?: any;
}

interface DiscussionTopic {
  id: string;
  title: string;
  description: string;
  questions: string[];
  concepts: string[];
  difficulty: string;
}

export const DiscussionMode: React.FC<DiscussionModeProps> = ({
  activity,
  gameState,
  preferences,
  adaptiveSettings,
  onComplete,
  onProgressUpdate,
  onInteraction
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [discussionTopic, setDiscussionTopic] = useState<DiscussionTopic | null>(null);
  const [participationScore, setParticipationScore] = useState(0);
  const [conceptsExplored, setConceptsExplored] = useState<string[]>([]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [sessionStartTime] = useState(new Date());

  // Initialize discussion
  useEffect(() => {
    initializeDiscussion();
  }, [activity]);

  const initializeDiscussion = async () => {
    // Generate discussion topic based on activity
    const topic: DiscussionTopic = {
      id: `topic_${activity.id}`,
      title: activity.title,
      description: activity.description || 'Pojďme si promluvit o fyzice!',
      questions: [
        'Jaké jsou tvé zkušenosti s gravitací v každodenním životě?',
        'Proč myslíš, že všechny předměty padají stejně rychle?',
        'Můžeš uvést příklad gravitace, který jsi pozoroval?'
      ],
      concepts: ['gravitace', 'síla', 'zrychlení', 'hmotnost'],
      difficulty: adaptiveSettings.difficulty
    };

    setDiscussionTopic(topic);

    // Start with AI greeting
    const welcomeMessage: Message = {
      id: 'welcome',
      sender: 'ai_teacher',
      content: generateWelcomeMessage(topic),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages([welcomeMessage]);
    
    // Ask opening question after a delay
    setTimeout(() => {
      askOpeningQuestion(topic);
    }, 2000);
  };

  const generateWelcomeMessage = (topic: DiscussionTopic): string => {
    const greetings = [
      `Ahoj! Jsem tu, abych si s tebou popovídal o ${topic.title.toLowerCase()}.`,
      `Vítej v naší diskuzi o ${topic.title.toLowerCase()}! Těším se na tvé myšlenky.`,
      `Pojďme společně prozkoumat ${topic.title.toLowerCase()}. Co o tom víš?`
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const askOpeningQuestion = (topic: DiscussionTopic) => {
    const questionMessage: Message = {
      id: `question_${Date.now()}`,
      sender: 'ai_teacher',
      content: topic.questions[0] || 'Co si myslíš o tomto tématu?',
      timestamp: new Date(),
      type: 'question'
    };

    setMessages(prev => [...prev, questionMessage]);
    onProgressUpdate(10);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || !discussionTopic) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      sender: 'student',
      content: currentInput.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');

    // Track interaction
    onInteraction({
      type: 'discussion_message',
      content: userMessage.content,
      timestamp: userMessage.timestamp,
      topicId: discussionTopic.id
    });

    // Analyze student response and generate AI reply
    setIsAiTyping(true);
    
    try {
      const aiResponse = await generateAiResponse(userMessage, discussionTopic);
      
      setTimeout(() => {
        setMessages(prev => [...prev, aiResponse]);
        setIsAiTyping(false);
        
        // Update progress and scores
        updateDiscussionProgress(userMessage, aiResponse);
      }, 1500 + Math.random() * 1000); // Simulate thinking time
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      const fallbackResponse = generateFallbackResponse();
      
      setTimeout(() => {
        setMessages(prev => [...prev, fallbackResponse]);
        setIsAiTyping(false);
      }, 1500);
    }
  };

  const generateAiResponse = async (userMessage: Message, topic: DiscussionTopic): Promise<Message> => {
    try {
      const response = await fetch('/api/local-ai/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          studentMessage: userMessage.content,
          topic: topic.title,
          concepts: topic.concepts,
          previousMessages: messages.slice(-5), // Last 5 messages for context
          studentProfile: {
            learningStyle: preferences.auditoryLearning > 0.5 ? 'auditory' : 'visual',
            level: gameState.stats.level,
            engagement: participationScore
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: `ai_${Date.now()}`,
          sender: 'ai_teacher',
          content: data.data.feedback,
          timestamp: new Date(),
          type: 'text',
          metadata: { concepts: extractConcepts(userMessage.content) }
        };
      } else {
        return generateFallbackResponse();
      }
    } catch (error) {
      return generateFallbackResponse();
    }
  };

  const generateFallbackResponse = (): Message => {
    const responses = [
      'To je zajímavý pohled! Můžeš to rozvést víc?',
      'Skvělé pozorování! Co si myslíš, že by se stalo, kdyby...?',
      'To mě zaujalo. Jak se to podle tebe projevuje v praxi?',
      'Dobrá myšlenka! Zkusíš mi vysvětlit proč si to myslíš?',
      'Výborně! Máš ještě nějaký příklad z každodenního života?'
    ];

    return {
      id: `ai_fallback_${Date.now()}`,
      sender: 'ai_teacher',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
      type: 'text'
    };
  };

  const extractConcepts = (text: string): string[] => {
    const concepts: string[] = [];
    const lowercaseText = text.toLowerCase();

    const conceptKeywords = {
      'gravitace': ['gravitace', 'tíha', 'pád', 'padání', 'tíže'],
      'síla': ['síla', 'tlak', 'působení', 'účinek'],
      'energie': ['energie', 'práce', 'výkon'],
      'rychlost': ['rychlost', 'tempo', 'rychle', 'pomalu'],
      'hmotnost': ['hmotnost', 'váha', 'těžký', 'lehký']
    };

    for (const [concept, keywords] of Object.entries(conceptKeywords)) {
      if (keywords.some(keyword => lowercaseText.includes(keyword))) {
        concepts.push(concept);
      }
    }

    return concepts;
  };

  const updateDiscussionProgress = (userMessage: Message, aiResponse: Message) => {
    // Award points for participation
    const messagePoints = 10;
    setParticipationScore(prev => prev + messagePoints);

    // Check for new concepts
    const userConcepts = extractConcepts(userMessage.content);
    const newConcepts = userConcepts.filter(concept => !conceptsExplored.includes(concept));
    
    if (newConcepts.length > 0) {
      setConceptsExplored(prev => [...prev, ...newConcepts]);
      setParticipationScore(prev => prev + newConcepts.length * 15); // Bonus for new concepts
    }

    // Count questions answered
    if (aiResponse.type === 'question') {
      setQuestionsAnswered(prev => prev + 1);
    }

    // Update overall progress
    const progressIncrement = 15;
    const currentProgress = Math.min((messages.length / 2) * progressIncrement, 100);
    onProgressUpdate(currentProgress);

    // Check if discussion should end
    if (messages.length >= 10 && conceptsExplored.length >= 3) {
      setTimeout(() => {
        concludeDiscussion();
      }, 3000);
    }
  };

  const concludeDiscussion = () => {
    const sessionDuration = Date.now() - sessionStartTime.getTime();
    const totalMessages = messages.filter(msg => msg.sender === 'student').length;
    
    const result = {
      type: 'discussion_complete',
      score: Math.min(participationScore / 100, 1.0), // Normalize to 0-1
      points: participationScore,
      messagesCount: totalMessages,
      conceptsExplored: conceptsExplored.length,
      questionsAnswered,
      sessionDuration: Math.floor(sessionDuration / 1000), // in seconds
      engagementLevel: calculateEngagementLevel(),
      feedback: generateDiscussionFeedback()
    };

    onComplete(result);
  };

  const calculateEngagementLevel = (): string => {
    const avgMessageLength = messages
      .filter(msg => msg.sender === 'student')
      .reduce((sum, msg) => sum + msg.content.length, 0) / messages.filter(msg => msg.sender === 'student').length;

    if (avgMessageLength > 50 && conceptsExplored.length >= 3) {
      return 'vysoká';
    } else if (avgMessageLength > 30 && conceptsExplored.length >= 2) {
      return 'střední';
    } else {
      return 'nízká';
    }
  };

  const generateDiscussionFeedback = (): string => {
    const studentMessages = messages.filter(msg => msg.sender === 'student').length;
    
    if (studentMessages >= 8 && conceptsExplored.length >= 3) {
      return '🗣️ Fantastická diskuze! Tvé myšlenky byly velmi zajímavé a prohloubil jsi své chápání tématu.';
    } else if (studentMessages >= 5 && conceptsExplored.length >= 2) {
      return '👍 Dobrá diskuze! Aktivně jsi se zapojoval a sdílel zajímavé pozorování.';
    } else {
      return '🤔 Zkus se příště více zapojit do diskuze. Tvé myšlenky a otázky jsou důležité!';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Discussion Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">💬 Diskuze: {discussionTopic?.title}</h2>
              <p className="text-blue-100 mt-1">{discussionTopic?.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Body: {participationScore}</div>
              <div className="text-sm text-blue-100">Koncepty: {conceptsExplored.length}</div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'student' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'student'
                    ? 'bg-primary-500 text-white'
                    : message.sender === 'ai_teacher'
                    ? 'bg-white border border-gray-200'
                    : 'bg-gray-100'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <span className="text-lg flex-shrink-0">
                    {message.sender === 'student' ? '🧑‍🎓' : 
                     message.sender === 'ai_teacher' ? '🤖' : '💭'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'student' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString('cs-CZ', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                
                {/* Show concepts mentioned */}
                {message.metadata?.concepts && message.metadata.concepts.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {message.metadata.concepts.map((concept: string, index: number) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                      >
                        💡 {concept}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* AI Typing Indicator */}
          {isAiTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 max-w-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🤖</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">píše...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="flex space-x-3">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Napiš svou myšlenku, otázku nebo pozorování..."
              className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              disabled={isAiTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentInput.trim() || isAiTyping}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="hidden sm:inline">Odeslat</span>
              <span className="sm:hidden">📤</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>💡 Tip: Použij Shift+Enter pro nový řádek</span>
            <span>{currentInput.length}/500</span>
          </div>
        </div>

        {/* Discussion Stats */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary-600">
                {messages.filter(msg => msg.sender === 'student').length}
              </div>
              <div className="text-xs text-gray-600">Tvé zprávy</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{conceptsExplored.length}</div>
              <div className="text-xs text-gray-600">Koncepty</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{participationScore}</div>
              <div className="text-xs text-gray-600">Body za účast</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {Math.floor((Date.now() - sessionStartTime.getTime()) / 60000)}m
              </div>
              <div className="text-xs text-gray-600">Čas diskuze</div>
            </div>
          </div>
        </div>

        {/* Concepts Explored */}
        {conceptsExplored.length > 0 && (
          <div className="p-4 bg-blue-50 border-t">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Probrané koncepty:
            </h4>
            <div className="flex flex-wrap gap-2">
              {conceptsExplored.map((concept, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                >
                  🧠 {concept}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};