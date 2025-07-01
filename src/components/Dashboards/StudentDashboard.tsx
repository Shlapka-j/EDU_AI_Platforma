import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { VectorLLMChat } from '../Chat/VectorLLMChat';
import { CharacterCustomization } from '../Character/CharacterCustomization';
import { ThemeToggle } from '../Theme/ThemeToggle';

interface GameMode {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  subjects: string[];
  isUnlocked: boolean;
  progress?: number;
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  progress: number;
  nextLesson: string;
  totalLessons: number;
  completedLessons: number;
}

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSubject, setActiveSubject] = useState<string>('physics');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'character'>('dashboard');

  const subjects: Subject[] = [
    { id: 'physics', name: 'Fyzika', icon: '⚗️', progress: 65, nextLesson: 'Gravitační síla', totalLessons: 24, completedLessons: 16 },
    { id: 'math', name: 'Matematika', icon: '📐', progress: 78, nextLesson: 'Kvadratické rovnice', totalLessons: 30, completedLessons: 23 },
    { id: 'chemistry', name: 'Chemie', icon: '🧪', progress: 45, nextLesson: 'Kyseliny a zásady', totalLessons: 20, completedLessons: 9 },
    { id: 'biology', name: 'Biologie', icon: '🌱', progress: 82, nextLesson: 'Buněčné dělení', totalLessons: 18, completedLessons: 15 }
  ];

  const gameModes: GameMode[] = [
    { id: 'story', name: 'Příběhový režim', icon: '📖', description: 'Učení prostřednictvím interaktivních příběhů a dobrodružství', difficulty: 'easy', estimatedTime: 30, subjects: ['physics', 'chemistry', 'biology'], isUnlocked: true, progress: 65 },
    { id: 'quiz', name: 'Kvízový režim', icon: '🎯', description: 'Rychlé otázky a odpovědi pro procvičení znalostí', difficulty: 'medium', estimatedTime: 15, subjects: ['math', 'physics', 'chemistry'], isUnlocked: true, progress: 80 },
    { id: 'exploration', name: 'Průzkumný režim', icon: '🔍', description: 'Svobodné objevování témat vlastním tempem', difficulty: 'medium', estimatedTime: 45, subjects: ['physics', 'biology', 'chemistry'], isUnlocked: true, progress: 45 },
    { id: 'discussion', name: 'Diskusní režim', icon: '💬', description: 'Konverzace s AI tutorem a spolužáky o problémech', difficulty: 'hard', estimatedTime: 25, subjects: ['math', 'physics'], isUnlocked: true, progress: 30 },
    { id: 'minigame', name: 'Mini-hry', icon: '🎮', description: 'Zábavné hry které učí vědecké principy', difficulty: 'easy', estimatedTime: 20, subjects: ['physics', 'chemistry', 'math'], isUnlocked: false, progress: 0 }
  ];

  const studentStats = { totalXP: 2540, level: 8, streak: 7, weeklyGoal: 150, weeklyProgress: 120, badges: 12, achievements: 8 };

  const startGameMode = (mode: GameMode) => {
    if (!mode.isUnlocked) {
      alert('🔒 Tento režim je zatím uzamčen. Dokončete více lekcí k odemčení!');
      return;
    }
    alert(`🎮 Spouštím ${mode.name}\n\n📚 Předmět: ${subjects.find(s => s.id === activeSubject)?.name}\n⏱️ Odhadovaný čas: ${mode.estimatedTime} minut\n\n🚀 Připravte se na učení!`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Snadný';
      case 'medium': return 'Střední';  
      case 'hard': return 'Těžký';
      default: return difficulty;
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass-header p-6 mb-6 animate-slide-in-glass">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-glass">Vítej zpět, {user?.name}! 👋</h1>
              <p className="text-glass-light text-lg">Pokračuj ve svém vzdělávacím dobrodružství</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="glass-badge glass-badge-warning px-4 py-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⭐</span>
                  <span className="font-bold text-lg">{studentStats.totalXP} XP</span>
                </div>
              </div>
              <div className="glass-badge glass-badge-info px-4 py-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🏆</span>
                  <span className="font-bold text-lg">Level {studentStats.level}</span>
                </div>
              </div>
              <ThemeToggle />
              <button onClick={logout} className="glass-button px-4 py-2 text-red-600 hover:text-red-700 font-medium">
                Odhlásit se
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="glass-card p-4 mb-6">
          <div className="flex space-x-4 flex-wrap">
            {[
              { id: 'dashboard', label: '🏠 Dashboard', icon: '🏠' },
              { id: 'chat', label: '🤖 AI Tutor Chat', icon: '🤖' },
              { id: 'character', label: '👤 Můj charakter', icon: '👤' }
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

        {/* Content based on active tab */}
        {activeTab === 'dashboard' && (
          <div className="glass-grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="glass-grid-item">
                <h3 className="font-bold text-glass mb-4 text-lg flex items-center">
                  <span className="text-2xl mr-2">📅</span>
                  Týdenní cíl
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-glass-muted font-medium">Pokrok</span>
                    <span className="text-glass font-bold">{studentStats.weeklyProgress}/{studentStats.weeklyGoal} XP</span>
                  </div>
                  <div className="glass-progress h-4">
                    <div className="glass-progress-bar" style={{ width: `${(studentStats.weeklyProgress / studentStats.weeklyGoal) * 100}%` }} />
                  </div>
                  <div className="text-center">
                    <span className="glass-badge glass-badge-success">
                      {Math.round((studentStats.weeklyProgress / studentStats.weeklyGoal) * 100)}% splněno
                    </span>
                  </div>
                </div>
              </div>
              <div className="glass-grid-item text-center">
                <h3 className="font-bold text-glass mb-4 text-lg flex items-center justify-center">
                  <span className="text-2xl mr-2">🔥</span>
                  Série
                </h3>
                <div className="animate-pulse-glass">
                  <div className="text-5xl font-bold text-orange-500 mb-2">{studentStats.streak}</div>
                  <div className="text-glass-muted font-medium">dní v řadě</div>
                </div>
                <div className="mt-3">
                  <span className="glass-badge glass-badge-warning">
                    Neuvěřitelné! 🚀
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-glass mb-6 flex items-center">
                  <span className="text-3xl mr-3">📚</span>
                  Tvoje předměty
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {subjects.map((subject) => (
                    <button 
                      key={subject.id} 
                      onClick={() => setActiveSubject(subject.id)} 
                      className={`glass-grid-item text-left transition-all ${
                        activeSubject === subject.id ? 'ring-4 ring-blue-400 bg-blue-50' : ''
                      }`}
                    >
                      <div className="text-4xl mb-3 text-center">{subject.icon}</div>
                      <h3 className="font-bold text-glass text-lg mb-2">{subject.name}</h3>
                      <p className="text-sm text-glass-muted mb-3 font-medium">{subject.nextLesson}</p>
                      <div className="glass-progress h-3 mb-2">
                        <div className="glass-progress-bar" style={{ width: `${subject.progress}%` }} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-glass-muted font-medium">{subject.completedLessons}/{subject.totalLessons} lekcí</span>
                        <span className="glass-badge glass-badge-info text-xs">{subject.progress}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h2 className="text-2xl font-bold text-glass mb-6 flex items-center">
                  <span className="text-3xl mr-3">🎮</span>
                  Herní režimy pro {subjects.find(s => s.id === activeSubject)?.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gameModes.filter(mode => mode.subjects.includes(activeSubject)).map((mode) => (
                    <div 
                      key={mode.id} 
                      className={`glass-grid-item transition-all ${
                        !mode.isUnlocked ? 'opacity-70' : 'cursor-pointer hover:scale-105'
                      }`} 
                      onClick={() => startGameMode(mode)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-5xl">{mode.icon}</div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`glass-badge ${getDifficultyColor(mode.difficulty).includes('blue') ? 'glass-badge-info' : 
                            getDifficultyColor(mode.difficulty).includes('yellow') ? 'glass-badge-warning' : 'glass-badge-error'}`}>
                            {getDifficultyText(mode.difficulty)}
                          </span>
                          {!mode.isUnlocked && <span className="text-3xl opacity-50">🔒</span>}
                        </div>
                      </div>
                      <h3 className="font-bold text-glass text-lg mb-3">{mode.name}</h3>
                      <p className="text-sm text-glass-muted mb-4 leading-relaxed">{mode.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-1">
                          <span className="text-lg">⏱️</span>
                          <span className="text-sm text-glass-muted font-medium">{mode.estimatedTime} min</span>
                        </div>
                        {mode.isUnlocked && (
                          <span className="glass-badge glass-badge-success text-xs">
                            📈 {mode.progress}%
                          </span>
                        )}
                      </div>
                      {mode.isUnlocked && mode.progress !== undefined && mode.progress > 0 && (
                        <div className="glass-progress h-2">
                          <div className="glass-progress-bar" style={{ width: `${mode.progress}%` }} />
                        </div>
                      )}
                      {!mode.isUnlocked && (
                        <div className="text-center mt-3">
                          <span className="glass-badge glass-badge-warning text-xs">
                            Dokončete více lekcí k odemčení
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-96">
            <VectorLLMChat 
              userRole="student" 
              studentId={user?.id} 
              subjectId={activeSubject}
            />
          </div>
        )}

        {activeTab === 'character' && (
          <CharacterCustomization 
            studentId={user?.id || ''} 
            currentXP={studentStats.totalXP}
            onUpdate={(traits) => console.log('Character updated:', traits)}
          />
        )}
      </div>
    </div>
  );
};