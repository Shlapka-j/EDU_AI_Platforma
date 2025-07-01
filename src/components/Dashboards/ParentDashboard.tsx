import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../Theme/ThemeToggle';

interface StudentResponse {
  id: string;
  questionId: string;
  subject: string;
  topic: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  timestamp: Date;
  timeSpent: number; // seconds
  attempts: number;
  confidence: number; // 1-5 scale
}

interface PracticeRecommendation {
  id: string;
  type: 'weakness' | 'strength' | 'review';
  subject: string;
  topic: string;
  reason: string;
  description: string;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'low' | 'medium' | 'high';
}

interface StudentProfile {
  id: string;
  name: string;
  grade: number;
  avatar: string;
  totalResponses: number;
  correctResponses: number;
  weeklyActivity: number;
  strengths: string[];
  weaknesses: string[];
  preferredLearningTime: string;
  averageSessionTime: number;
}

export const ParentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedChild] = useState<string>('child-1');
  const [activeTab, setActiveTab] = useState<'overview' | 'responses' | 'practice' | 'analytics'>('overview');
  const [responseFilter, setResponseFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');

  const children: StudentProfile[] = [
    {
      id: 'child-1',
      name: 'Petra Svobodová',
      grade: 8,
      avatar: '👧',
      totalResponses: 234,
      correctResponses: 189,
      weeklyActivity: 4.5,
      strengths: ['Matematika', 'Logické myšlení', 'Analytické úlohy'],
      weaknesses: ['Chemie', 'Memorování vzorců', 'Rychlé výpočty'],
      preferredLearningTime: 'Odpoledne (14:00-16:00)',
      averageSessionTime: 25
    }
  ];

  const recentResponses: StudentResponse[] = [
    {
      id: 'r1',
      questionId: 'q1',
      subject: 'Fyzika',
      topic: 'Newtonovy zákony',
      question: 'Jaký je vztah mezi silou, hmotností a zrychlením?',
      studentAnswer: 'F = m * a',
      correctAnswer: 'F = m * a (podle druhého Newtonova zákona)',
      isCorrect: true,
      difficulty: 'medium',
      timestamp: new Date('2025-01-29 14:30'),
      timeSpent: 45,
      attempts: 1,
      confidence: 4
    },
    {
      id: 'r2',
      questionId: 'q2',
      subject: 'Chemie',
      topic: 'Kyseliny a zásady',
      question: 'Jaké je pH čisté vody?',
      studentAnswer: '8',
      correctAnswer: '7 (neutrální)',
      isCorrect: false,
      difficulty: 'easy',
      timestamp: new Date('2025-01-29 15:15'),
      timeSpent: 120,
      attempts: 3,
      confidence: 2
    },
    {
      id: 'r3',
      questionId: 'q3',
      subject: 'Matematika',
      topic: 'Kvadratické rovnice',
      question: 'Vyřešte rovnici: x² - 5x + 6 = 0',
      studentAnswer: 'x = 2, x = 3',
      correctAnswer: 'x = 2, x = 3',
      isCorrect: true,
      difficulty: 'hard',
      timestamp: new Date('2025-01-29 16:00'),
      timeSpent: 180,
      attempts: 2,
      confidence: 5
    },
    {
      id: 'r4',
      questionId: 'q4',
      subject: 'Biologie',
      topic: 'Buněčné dělení',
      question: 'Kolik chromozomů má lidská buňka?',
      studentAnswer: '48',
      correctAnswer: '46 (23 párů)',
      isCorrect: false,
      difficulty: 'easy',
      timestamp: new Date('2025-01-28 15:45'),
      timeSpent: 30,
      attempts: 1,
      confidence: 3
    }
  ];

  const practiceRecommendations: PracticeRecommendation[] = [
    {
      id: 'pr1',
      type: 'weakness',
      subject: 'Chemie',
      topic: 'Kyseliny a zásady',
      reason: 'Nízká úspěšnost (40%) v posledních 5 otázkách',
      description: 'Doporučujeme procvičit základní vlastnosti kyselin a zásad, zejména pH stupnici',
      estimatedTime: 30,
      difficulty: 'easy',
      priority: 'high'
    },
    {
      id: 'pr2',
      type: 'strength',
      subject: 'Matematika',
      topic: 'Pokročilé rovnice',
      reason: 'Excelentní výkon (95%) v kvadratických rovnicích',
      description: 'Petra má talent na matematiku! Můžeme přejít na kubické rovnice a funkce',
      estimatedTime: 45,
      difficulty: 'hard',
      priority: 'medium'
    },
    {
      id: 'pr3',
      type: 'review',
      subject: 'Fyzika',
      topic: 'Mechanika',
      reason: 'Dlouhodobá absence (2 týdny) v tomto tématu',
      description: 'Osvěžit znalosti mechaniky před přechodem na termodynamiku',
      estimatedTime: 20,
      difficulty: 'medium',
      priority: 'medium'
    },
    {
      id: 'pr4',
      type: 'weakness',
      subject: 'Biologie',
      topic: 'Základy buňky',
      reason: 'Časté chyby v základních pojmech',
      description: 'Procvičit strukturu buňky a její základní funkce',
      estimatedTime: 25,
      difficulty: 'easy',
      priority: 'high'
    }
  ];

  const selectedChildData = children.find(c => c.id === selectedChild) || children[0];

  const getFilteredResponses = () => {
    let filtered = recentResponses;
    
    if (responseFilter !== 'all') {
      filtered = filtered.filter(r => 
        responseFilter === 'correct' ? r.isCorrect : !r.isCorrect
      );
    }

    const now = new Date();
    if (timeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(r => r.timestamp > weekAgo);
    } else if (timeFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(r => r.timestamp > monthAgo);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const getResponseStats = () => {
    const responses = getFilteredResponses();
    const correct = responses.filter(r => r.isCorrect).length;
    const total = responses.length;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    
    const avgTime = responses.length > 0 
      ? responses.reduce((sum, r) => sum + r.timeSpent, 0) / responses.length 
      : 0;
    
    const avgAttempts = responses.length > 0
      ? responses.reduce((sum, r) => sum + r.attempts, 0) / responses.length
      : 0;

    return { correct, total, accuracy, avgTime, avgAttempts };
  };

  const getSubjectPerformance = () => {
    const responses = getFilteredResponses();
    const subjects = new Map();
    
    responses.forEach(r => {
      if (!subjects.has(r.subject)) {
        subjects.set(r.subject, { correct: 0, total: 0 });
      }
      const subj = subjects.get(r.subject);
      subj.total++;
      if (r.isCorrect) subj.correct++;
    });

    return Array.from(subjects.entries()).map(([subject, data]) => ({
      subject,
      accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
      total: data.total
    })).sort((a, b) => b.accuracy - a.accuracy);
  };

  const getResponseColor = (isCorrect: boolean) => 
    isCorrect ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weakness': return '⚠️';
      case 'strength': return '🌟';
      case 'review': return '🔄';
      default: return '📚';
    }
  };

  const stats = getResponseStats();
  const subjectPerformance = getSubjectPerformance();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass-header p-6 mb-6 animate-slide-in-glass">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-glass">
                Rodičovský přehled - {user?.name} 👨‍👩‍👧‍👦
              </h1>
              <p className="text-glass-light text-lg">
                Detailní sledování pokroku a doporučení pro {selectedChildData.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="glass-badge glass-badge-success px-4 py-2">
                <span className="font-bold">✅ {stats.accuracy.toFixed(1)}% úspěšnost</span>
              </div>
              <ThemeToggle />
              <button onClick={logout} className="glass-button px-4 py-2 text-red-600 hover:text-red-700 font-medium">
                Odhlásit se
              </button>
            </div>
          </div>
        </div>

        {/* Child Selection & Navigation */}
        <div className="glass-card p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{selectedChildData.avatar}</span>
              <div>
                <h3 className="font-semibold text-gray-900 text-glass">{selectedChildData.name}</h3>
                <p className="text-sm text-gray-600 text-glass">{selectedChildData.grade}. třída</p>
              </div>
            </div>
            
            <div className="flex space-x-2 flex-wrap">
              {[
                { id: 'overview', label: '📊 Přehled' },
                { id: 'responses', label: '💬 Odpovědi' },
                { id: 'practice', label: '📚 Doporučení' },
                { id: 'analytics', label: '📈 Analýzy' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 transition-all font-medium text-lg ${
                    activeTab === tab.id 
                      ? 'glass-tab-active' 
                      : 'glass-tab'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">📝</div>
                <p className="font-semibold text-gray-900 text-glass">Celkem odpovědí</p>
                <p className="text-xl font-bold text-blue-600">{selectedChildData.totalResponses}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">✅</div>
                <p className="font-semibold text-gray-900 text-glass">Správných</p>
                <p className="text-xl font-bold text-green-600">{selectedChildData.correctResponses}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">📊</div>
                <p className="font-semibold text-gray-900 text-glass">Úspěšnost</p>
                <p className="text-xl font-bold text-purple-600">
                  {((selectedChildData.correctResponses / selectedChildData.totalResponses) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">⏰</div>
                <p className="font-semibold text-gray-900 text-glass">Týdenní aktivita</p>
                <p className="text-xl font-bold text-orange-600">{selectedChildData.weeklyActivity}h</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-gray-900 text-glass mb-4">🌟 Silné stránky</h3>
                <div className="space-y-2">
                  {selectedChildData.strengths.map((strength, index) => (
                    <div key={index} className="glass-button p-3 flex items-center justify-between">
                      <span className="text-gray-900 text-glass">{strength}</span>
                      <span className="text-green-500">💪</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-gray-900 text-glass mb-4">⚠️ Oblasti ke zlepšení</h3>
                <div className="space-y-2">
                  {selectedChildData.weaknesses.map((weakness, index) => (
                    <div key={index} className="glass-button p-3 flex items-center justify-between">
                      <span className="text-gray-900 text-glass">{weakness}</span>
                      <span className="text-yellow-500">📈</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Responses Tab */}
        {activeTab === 'responses' && (
          <div className="space-y-6">
            <div className="glass-card p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex space-x-4">
                  <select 
                    value={responseFilter} 
                    onChange={(e) => setResponseFilter(e.target.value as any)}
                    className="glass-button px-3 py-2"
                  >
                    <option value="all">Všechny odpovědi</option>
                    <option value="correct">Pouze správné</option>
                    <option value="incorrect">Pouze nesprávné</option>
                  </select>
                  <select 
                    value={timeFilter} 
                    onChange={(e) => setTimeFilter(e.target.value as any)}
                    className="glass-button px-3 py-2"
                  >
                    <option value="week">Poslední týden</option>
                    <option value="month">Poslední měsíc</option>
                    <option value="all">Vše</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600 text-glass">Správnost</p>
                    <p className="font-bold text-green-600">{stats.accuracy.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 text-glass">Prům. čas</p>
                    <p className="font-bold text-blue-600">{Math.round(stats.avgTime)}s</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 text-glass">Prům. pokusy</p>
                    <p className="font-bold text-purple-600">{stats.avgAttempts.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {getFilteredResponses().map((response) => (
                <div key={response.id} className="glass-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-semibold text-gray-900 text-glass">{response.subject}</span>
                        <span className="text-sm text-gray-600 text-glass">•</span>
                        <span className="text-sm text-gray-600 text-glass">{response.topic}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResponseColor(response.isCorrect)}`}>
                          {response.isCorrect ? '✅ Správně' : '❌ Nesprávně'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(response.difficulty)}`}>
                          {response.difficulty === 'easy' ? 'Snadné' : 
                           response.difficulty === 'medium' ? 'Střední' : 'Těžké'}
                        </span>
                      </div>
                      <p className="text-gray-900 text-glass font-medium mb-3">{response.question}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 text-glass">
                        {response.timestamp.toLocaleDateString('cs-CZ')} {response.timestamp.toLocaleTimeString('cs-CZ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass-button p-3">
                      <p className="text-sm text-gray-600 text-glass mb-1">Odpověď studenta:</p>
                      <p className="text-gray-900 text-glass">{response.studentAnswer}</p>
                    </div>
                    <div className="glass-button p-3">
                      <p className="text-sm text-gray-600 text-glass mb-1">Správná odpověď:</p>
                      <p className="text-gray-900 text-glass">{response.correctAnswer}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex space-x-6 text-sm text-gray-600 text-glass">
                      <span>⏱️ {response.timeSpent}s</span>
                      <span>🔄 {response.attempts} pokus(ů)</span>
                      <span>💪 Jistota: {response.confidence}/5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practice Tab */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-gray-900 text-glass mb-4">📚 Personalizovaná doporučení</h3>
              <p className="text-gray-600 text-glass mb-4">
                Na základě analýzy odpovědí {selectedChildData.name} doporučujeme následující aktivity:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {practiceRecommendations.map((rec) => (
                  <div key={rec.id} className="glass-card p-4 h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getTypeIcon(rec.type)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                          {rec.priority === 'high' ? 'Vysoká' : 
                           rec.priority === 'medium' ? 'Střední' : 'Nízká'} priorita
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 text-glass mb-2">
                      {rec.subject} - {rec.topic}
                    </h4>
                    
                    <p className="text-sm text-gray-600 text-glass mb-3">{rec.reason}</p>
                    <p className="text-sm text-gray-800 text-glass mb-4">{rec.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 text-glass">
                      <span>⏱️ {rec.estimatedTime} min</span>
                      <span className={`px-2 py-1 rounded ${getDifficultyColor(rec.difficulty)}`}>
                        {rec.difficulty === 'easy' ? 'Snadné' : 
                         rec.difficulty === 'medium' ? 'Střední' : 'Náročné'}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => alert(`🚀 Spouštím doporučenou aktivitu:\\n\\n${rec.subject} - ${rec.topic}\\n${rec.description}\\n\\nOdhadovaný čas: ${rec.estimatedTime} minut`)}
                      className="w-full mt-4 glass-card-hover py-2 bg-blue-500 text-white font-medium hover:bg-blue-600"
                    >
                      🎯 Začít procvičovat
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-gray-900 text-glass mb-4">📈 Výkonnost podle předmětů</h3>
              <div className="space-y-4">
                {subjectPerformance.map((subject) => (
                  <div key={subject.subject} className="glass-button p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 text-glass">{subject.subject}</span>
                      <span className="text-sm text-gray-600 text-glass">
                        {subject.accuracy.toFixed(1)}% ({subject.total} odpovědí)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${subject.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h4 className="font-semibold text-gray-900 text-glass mb-4">🕒 Optimální čas učení</h4>
                <div className="text-center">
                  <div className="text-3xl mb-2">🌅</div>
                  <p className="text-lg font-medium text-gray-900 text-glass">{selectedChildData.preferredLearningTime}</p>
                  <p className="text-sm text-gray-600 text-glass">Nejlepší výsledky dosahuje</p>
                </div>
              </div>

              <div className="glass-card p-6">
                <h4 className="font-semibold text-gray-900 text-glass mb-4">⏱️ Průměrná délka studia</h4>
                <div className="text-center">
                  <div className="text-3xl mb-2">📚</div>
                  <p className="text-lg font-medium text-gray-900 text-glass">{selectedChildData.averageSessionTime} minut</p>
                  <p className="text-sm text-gray-600 text-glass">Na jednu session</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};