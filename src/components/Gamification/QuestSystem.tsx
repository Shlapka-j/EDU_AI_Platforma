import React, { useState, useEffect } from 'react';

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'story' | 'challenge' | 'special';
  category: 'physics' | 'learning' | 'social' | 'exploration' | 'achievement';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  objectives: QuestObjective[];
  rewards: QuestReward[];
  timeLimit?: number; // in hours
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
  startDate?: Date;
  endDate?: Date;
  prerequisites?: string[];
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface QuestObjective {
  id: string;
  description: string;
  type: 'complete_activities' | 'score_points' | 'quiz_streak' | 'experiment_time' | 'help_peers' | 'discussion_posts';
  target: number;
  current: number;
  isCompleted: boolean;
}

interface QuestReward {
  type: 'xp' | 'badge' | 'item' | 'currency' | 'unlock';
  value: number | string;
  name: string;
  description: string;
}

interface QuestSystemProps {
  studentId: string;
  currentStats: any;
  onQuestComplete?: (quest: Quest) => void;
  onRewardClaimed?: (rewards: QuestReward[]) => void;
}

export const QuestSystem: React.FC<QuestSystemProps> = ({
  studentId,
  currentStats,
  onQuestComplete,
  onRewardClaimed
}) => {
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);
  const [selectedTab, setSelectedTab] = useState<'active' | 'available' | 'completed'>('active');
  const [showQuestModal, setShowQuestModal] = useState<Quest | null>(null);
  const [questStats, setQuestStats] = useState({
    totalCompleted: 0,
    weeklyCompleted: 0,
    currentStreak: 0,
    totalRewards: 0
  });

  useEffect(() => {
    initializeQuests();
    loadQuestProgress();
  }, [studentId]);

  useEffect(() => {
    if (currentStats) {
      updateQuestProgress();
    }
  }, [currentStats]);

  const initializeQuests = async () => {
    try {
      const response = await fetch('/api/gamification/quests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActiveQuests(data.data.active || []);
        setAvailableQuests(data.data.available || []);
        setCompletedQuests(data.data.completed || []);
      } else {
        generateDefaultQuests();
      }
    } catch (error) {
      console.error('Error loading quests:', error);
      generateDefaultQuests();
    }
  };

  const generateDefaultQuests = () => {
    const defaultQuests: Quest[] = [
      // Daily Quests
      {
        id: 'daily_activities_3',
        title: 'Denní dávka učení',
        description: 'Dokonči 3 aktivity dnes',
        type: 'daily',
        category: 'learning',
        difficulty: 'easy',
        objectives: [{
          id: 'obj1',
          description: 'Dokončit 3 aktivity',
          type: 'complete_activities',
          target: 3,
          current: 0,
          isCompleted: false
        }],
        rewards: [
          { type: 'xp', value: 100, name: '100 XP', description: 'Bonus XP za denní cíl' },
          { type: 'currency', value: 50, name: '50 mincí', description: 'Virtuální měna' }
        ],
        timeLimit: 24,
        isActive: true,
        isCompleted: false,
        progress: 0,
        icon: '📚',
        rarity: 'common'
      },
      {
        id: 'daily_perfect_quiz',
        title: 'Perfektní kvíz',
        description: 'Odpověz správně na všechny otázky v kvízu',
        type: 'daily',
        category: 'achievement',
        difficulty: 'medium',
        objectives: [{
          id: 'obj1',
          description: 'Dokončit kvíz se 100% úspěšností',
          type: 'quiz_streak',
          target: 1,
          current: 0,
          isCompleted: false
        }],
        rewards: [
          { type: 'xp', value: 150, name: '150 XP', description: 'Bonus za perfektní výkon' },
          { type: 'badge', value: 'perfect_day', name: 'Perfektní den', description: 'Odznak za bezchybný kvíz' }
        ],
        timeLimit: 24,
        isActive: true,
        isCompleted: false,
        progress: 0,
        icon: '🎯',
        rarity: 'rare'
      },

      // Weekly Quests
      {
        id: 'weekly_experiment_master',
        title: 'Týdenní experimentátor',
        description: 'Stráv celkem 2 hodiny experimentováním',
        type: 'weekly',
        category: 'exploration',
        difficulty: 'medium',
        objectives: [{
          id: 'obj1',
          description: 'Strávit 120 minut v experimentálním režimu',
          type: 'experiment_time',
          target: 120,
          current: 0,
          isCompleted: false
        }],
        rewards: [
          { type: 'xp', value: 500, name: '500 XP', description: 'Týdenní bonus' },
          { type: 'item', value: 'advanced_tools', name: 'Pokročilé nástroje', description: 'Odemknutí nových experimentálních nástrojů' }
        ],
        timeLimit: 168, // 7 days
        isActive: true,
        isCompleted: false,
        progress: 0,
        icon: '⚗️',
        rarity: 'epic'
      },

      // Story Quests
      {
        id: 'story_gravity_master',
        title: 'Mistr gravitace',
        description: 'Prozkoumej všechny aspekty gravitace',
        type: 'story',
        category: 'physics',
        difficulty: 'hard',
        objectives: [
          {
            id: 'obj1',
            description: 'Dokončit 5 aktivit o gravitaci',
            type: 'complete_activities',
            target: 5,
            current: 0,
            isCompleted: false
          },
          {
            id: 'obj2',
            description: 'Získat 500 bodů z experimentů s gravitací',
            type: 'score_points',
            target: 500,
            current: 0,
            isCompleted: false
          }
        ],
        rewards: [
          { type: 'xp', value: 1000, name: '1000 XP', description: 'Příběhový bonus' },
          { type: 'badge', value: 'gravity_master', name: 'Mistr gravitace', description: 'Legendární odznak' },
          { type: 'unlock', value: 'advanced_physics', name: 'Pokročilá fyzika', description: 'Odemknutí nových témat' }
        ],
        isActive: false,
        isCompleted: false,
        progress: 0,
        prerequisites: ['daily_activities_3'],
        icon: '🌍',
        rarity: 'legendary'
      },

      // Challenge Quests
      {
        id: 'challenge_speed_run',
        title: 'Rychlostní výzva',
        description: 'Dokonči 5 aktivit za méně než hodinu',
        type: 'challenge',
        category: 'achievement',
        difficulty: 'hard',
        objectives: [{
          id: 'obj1',
          description: 'Dokončit 5 aktivit za méně než 60 minut',
          type: 'complete_activities',
          target: 5,
          current: 0,
          isCompleted: false
        }],
        rewards: [
          { type: 'xp', value: 300, name: '300 XP', description: 'Rychlostní bonus' },
          { type: 'badge', value: 'speed_demon', name: 'Rychlý démon', description: 'Za rychlé dokončení' }
        ],
        timeLimit: 2, // 2 hours to complete the challenge
        isActive: false,
        isCompleted: false,
        progress: 0,
        icon: '⚡',
        rarity: 'epic'
      },

      // Social Quests
      {
        id: 'social_helper',
        title: 'Pomocná ruka',
        description: 'Pomoz 3 spolužákům v diskuzích',
        type: 'daily',
        category: 'social',
        difficulty: 'medium',
        objectives: [{
          id: 'obj1',
          description: 'Napsat 3 užitečné komentáře v diskuzích',
          type: 'help_peers',
          target: 3,
          current: 0,
          isCompleted: false
        }],
        rewards: [
          { type: 'xp', value: 200, name: '200 XP', description: 'Sociální bonus' },
          { type: 'badge', value: 'helpful_student', name: 'Nápomocný student', description: 'Za pomoc ostatním' }
        ],
        timeLimit: 24,
        isActive: false,
        isCompleted: false,
        progress: 0,
        icon: '🤝',
        rarity: 'rare'
      }
    ];

    setAvailableQuests(defaultQuests.filter(q => !q.isActive));
    setActiveQuests(defaultQuests.filter(q => q.isActive));
  };

  const loadQuestProgress = async () => {
    try {
      const response = await fetch(`/api/gamification/quest-progress/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuestStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error loading quest progress:', error);
    }
  };

  const updateQuestProgress = () => {
    const updatedActiveQuests = activeQuests.map(quest => {
      const updatedObjectives = quest.objectives.map(objective => {
        let newCurrent = objective.current;

        switch (objective.type) {
          case 'complete_activities':
            newCurrent = currentStats.activitiesCompletedToday || 0;
            break;
          case 'score_points':
            newCurrent = currentStats.todayScore || 0;
            break;
          case 'quiz_streak':
            newCurrent = currentStats.perfectQuizzesToday || 0;
            break;
          case 'experiment_time':
            newCurrent = currentStats.experimentTimeWeek || 0;
            break;
          case 'help_peers':
            newCurrent = currentStats.helpfulPostsToday || 0;
            break;
          case 'discussion_posts':
            newCurrent = currentStats.discussionPostsToday || 0;
            break;
        }

        return {
          ...objective,
          current: newCurrent,
          isCompleted: newCurrent >= objective.target
        };
      });

      const progress = updatedObjectives.reduce((sum, obj) => 
        sum + Math.min(obj.current / obj.target, 1), 0
      ) / updatedObjectives.length * 100;

      const isCompleted = updatedObjectives.every(obj => obj.isCompleted);

      if (isCompleted && !quest.isCompleted) {
        completeQuest(quest);
      }

      return {
        ...quest,
        objectives: updatedObjectives,
        progress,
        isCompleted
      };
    });

    setActiveQuests(updatedActiveQuests);
  };

  const completeQuest = async (quest: Quest) => {
    const completedQuest = { ...quest, isCompleted: true, progress: 100 };
    
    // Move from active to completed
    setActiveQuests(prev => prev.filter(q => q.id !== quest.id));
    setCompletedQuests(prev => [completedQuest, ...prev]);
    
    // Award rewards
    onRewardClaimed?.(quest.rewards);
    onQuestComplete?.(completedQuest);
    
    // Send completion to backend
    try {
      await fetch('/api/gamification/quest-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          studentId,
          questId: quest.id,
          completedAt: new Date().toISOString(),
          rewards: quest.rewards
        })
      });
    } catch (error) {
      console.error('Error completing quest:', error);
    }

    // Check for quest unlocks
    checkQuestUnlocks();
  };

  const checkQuestUnlocks = () => {
    const newlyAvailable = availableQuests.filter(quest => {
      if (!quest.prerequisites) return false;
      
      return quest.prerequisites.every(prereqId => 
        completedQuests.some(completed => completed.id === prereqId)
      );
    });

    if (newlyAvailable.length > 0) {
      setAvailableQuests(prev => prev.filter(q => !newlyAvailable.includes(q)));
      // Optionally auto-activate story quests
      newlyAvailable.forEach(quest => {
        if (quest.type === 'story') {
          activateQuest(quest);
        }
      });
    }
  };

  const activateQuest = async (quest: Quest) => {
    const activatedQuest = { 
      ...quest, 
      isActive: true, 
      startDate: new Date(),
      endDate: quest.timeLimit ? new Date(Date.now() + quest.timeLimit * 60 * 60 * 1000) : undefined
    };
    
    setAvailableQuests(prev => prev.filter(q => q.id !== quest.id));
    setActiveQuests(prev => [...prev, activatedQuest]);

    try {
      await fetch('/api/gamification/quest-activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          studentId,
          questId: quest.id,
          activatedAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error activating quest:', error);
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      case 'legendary': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'border-gray-300';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-gray-300';
    }
  };

  const getTimeRemaining = (quest: Quest): string => {
    if (!quest.endDate) return '';
    
    const now = new Date();
    const end = new Date(quest.endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const renderQuestCard = (quest: Quest, showActivateButton = false) => (
    <div
      key={quest.id}
      className={`bg-white rounded-lg shadow-lg border-2 ${getRarityColor(quest.rarity)} p-4 transition-all duration-200 hover:shadow-xl`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{quest.icon}</span>
          <div>
            <h3 className="font-bold text-gray-900">{quest.title}</h3>
            <p className="text-sm text-gray-600">{quest.description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(quest.difficulty)}`}>
            {quest.difficulty === 'easy' ? 'Snadný' :
             quest.difficulty === 'medium' ? 'Střední' :
             quest.difficulty === 'hard' ? 'Těžký' : 'Legendární'}
          </span>
          {quest.timeLimit && (
            <span className="text-xs text-gray-500">
              ⏰ {getTimeRemaining(quest)}
            </span>
          )}
        </div>
      </div>

      {/* Objectives */}
      <div className="space-y-2 mb-4">
        {quest.objectives.map((objective) => (
          <div key={objective.id} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{objective.description}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                {objective.current}/{objective.target}
              </span>
              {objective.isCompleted && <span className="text-green-500">✅</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Pokrok</span>
          <span>{Math.round(quest.progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              quest.isCompleted ? 'bg-green-500' : 'bg-primary-500'
            }`}
            style={{ width: `${quest.progress}%` }}
          />
        </div>
      </div>

      {/* Rewards */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-700 mb-2">🎁 Odměny:</h4>
        <div className="flex flex-wrap gap-1">
          {quest.rewards.map((reward, index) => (
            <span key={index} className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
              {reward.name}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowQuestModal(quest)}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Zobrazit detaily
        </button>
        
        {showActivateButton && (
          <button
            onClick={() => activateQuest(quest)}
            className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
          >
            Aktivovat
          </button>
        )}
        
        {quest.isCompleted && (
          <span className="text-sm font-medium text-green-600">✅ Dokončeno</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Quest Stats Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">⚔️ Mise a výzvy</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{activeQuests.length}</div>
            <div className="text-sm text-gray-600">Aktivní mise</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{questStats.totalCompleted}</div>
            <div className="text-sm text-gray-600">Dokončeno</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{questStats.currentStreak}</div>
            <div className="text-sm text-gray-600">Série dní</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{questStats.totalRewards}</div>
            <div className="text-sm text-gray-600">Odměn</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 py-3">
            {[
              { id: 'active', label: 'Aktivní', count: activeQuests.length },
              { id: 'available', label: 'Dostupné', count: availableQuests.length },
              { id: 'completed', label: 'Dokončené', count: completedQuests.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Quest Grid */}
        <div className="p-6">
          {selectedTab === 'active' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeQuests.length > 0 ? activeQuests.map(quest => renderQuestCard(quest)) : (
                <div className="col-span-2 text-center py-8">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné aktivní mise</h3>
                  <p className="text-gray-600">Aktivuj si nějaké mise z dostupných!</p>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'available' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableQuests.length > 0 ? availableQuests.map(quest => renderQuestCard(quest, true)) : (
                <div className="col-span-2 text-center py-8">
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné dostupné mise</h3>
                  <p className="text-gray-600">Dokončuj aktivní mise pro odemknutí nových!</p>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'completed' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedQuests.length > 0 ? completedQuests.map(quest => renderQuestCard(quest)) : (
                <div className="col-span-2 text-center py-8">
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné dokončené mise</h3>
                  <p className="text-gray-600">Začni plnit mise a vrať se sem pro své úspěchy!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quest Detail Modal */}
      {showQuestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{showQuestModal.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{showQuestModal.title}</h2>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(showQuestModal.difficulty)}`}>
                    {showQuestModal.difficulty === 'easy' ? 'Snadný' :
                     showQuestModal.difficulty === 'medium' ? 'Střední' :
                     showQuestModal.difficulty === 'hard' ? 'Těžký' : 'Legendární'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowQuestModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-600 mb-6">{showQuestModal.description}</p>

            {/* Objectives Detail */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">🎯 Úkoly:</h3>
              <div className="space-y-3">
                {showQuestModal.objectives.map((objective) => (
                  <div key={objective.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">{objective.description}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {objective.current}/{objective.target}
                      </span>
                      {objective.isCompleted && <span className="text-green-500">✅</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards Detail */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">🎁 Odměny:</h3>
              <div className="space-y-2">
                {showQuestModal.rewards.map((reward, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <span className="font-medium">{reward.name}</span>
                      <p className="text-xs text-gray-600">{reward.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Info */}
            {showQuestModal.timeLimit && (
              <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span>⏰</span>
                  <span className="text-sm">
                    Časový limit: {showQuestModal.timeLimit}h
                    {showQuestModal.endDate && ` (zbývá ${getTimeRemaining(showQuestModal)})`}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowQuestModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Zavřít
              </button>
              {!showQuestModal.isActive && !showQuestModal.isCompleted && (
                <button
                  onClick={() => {
                    activateQuest(showQuestModal);
                    setShowQuestModal(null);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Aktivovat misi
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};