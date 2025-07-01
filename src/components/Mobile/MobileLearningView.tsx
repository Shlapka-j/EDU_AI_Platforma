import React, { useState, useEffect } from 'react';
import { MobileLayout, MobileCard, MobileTabs, MobileFAB } from './MobileLayout';

interface MobileLearningViewProps {
  studentId: string;
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  activeZones: LearningZone[];
  recentActivities: Activity[];
  achievements: Achievement[];
  streak: number;
}

interface LearningZone {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  isUnlocked: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  topicsCount: number;
}

interface Activity {
  id: string;
  title: string;
  type: 'story' | 'quiz' | 'experiment' | 'discussion' | 'game';
  zone: string;
  progress: number;
  score?: number;
  completedAt?: Date;
  timeSpent: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const MobileLearningView: React.FC<MobileLearningViewProps> = ({
  studentId,
  currentLevel,
  currentXP,
  nextLevelXP,
  activeZones,
  recentActivities,
  achievements,
  streak
}) => {
  const [activeTab, setActiveTab] = useState('zones');
  const [selectedZone, setSelectedZone] = useState<LearningZone | null>(null);

  const xpProgress = ((currentXP % 1000) / 1000) * 100;

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'story': return '📚';
      case 'quiz': return '🎯';
      case 'experiment': return '⚗️';
      case 'discussion': return '💬';
      case 'game': return '🎮';
      default: return '📝';
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-50';
      case 'rare': return 'text-blue-600 bg-blue-50';
      case 'epic': return 'text-purple-600 bg-purple-50';
      case 'legendary': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const renderLearningZones = () => (
    <div className="space-y-4">
      {/* Progress Overview */}
      <MobileCard
        title="Tvůj pokrok"
        icon="📊"
        padding={false}
      >
        <div className="p-4 space-y-4">
          {/* Level Progress */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-primary-600">Úroveň {currentLevel}</div>
              <div className="text-sm text-gray-600">{currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</div>
            </div>
            <div className="text-right">
              <div className="text-2xl">⭐</div>
              <div className="text-sm font-medium text-gray-700">{streak} dní</div>
            </div>
          </div>
          
          {/* XP Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Do další úrovně</span>
              <span>{nextLevelXP - currentXP} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>
      </MobileCard>

      {/* Learning Zones */}
      <div className="space-y-3">
        {activeZones.map(zone => (
          <MobileCard
            key={zone.id}
            clickable
            onClick={() => setSelectedZone(zone)}
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{zone.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">{zone.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(zone.difficulty)}`}>
                    {zone.difficulty === 'easy' ? 'Snadné' : 
                     zone.difficulty === 'medium' ? 'Střední' : 'Těžké'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{zone.description}</p>
                
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Pokrok</span>
                  <span className="font-medium">{zone.progress}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${zone.progress}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{zone.topicsCount} témat</span>
                  <span>{formatTime(zone.estimatedTime)}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                {zone.isUnlocked ? (
                  <div className="text-green-500 text-xl">🔓</div>
                ) : (
                  <div className="text-gray-400 text-xl">🔒</div>
                )}
              </div>
            </div>
          </MobileCard>
        ))}
      </div>
    </div>
  );

  const renderRecentActivities = () => (
    <div className="space-y-3">
      {recentActivities.length > 0 ? (
        recentActivities.map(activity => (
          <MobileCard key={activity.id}>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{activity.title}</h3>
                <p className="text-sm text-gray-600">{activity.zone}</p>
                
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>Pokrok: {activity.progress}%</span>
                  {activity.score && <span>Skóre: {activity.score}%</span>}
                  <span>{formatTime(activity.timeSpent)}</span>
                </div>
                
                {activity.progress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div
                      className="bg-blue-500 h-1 rounded-full"
                      style={{ width: `${activity.progress}%` }}
                    />
                  </div>
                )}
              </div>
              
              {activity.completedAt && (
                <div className="text-green-500 text-xl">✓</div>
              )}
            </div>
          </MobileCard>
        ))
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné nedávné aktivity</h3>
          <p className="text-gray-600">Začni svou fyzikální cestu!</p>
        </div>
      )}
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-3">
      {achievements.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {achievements.map(achievement => (
            <MobileCard key={achievement.id} padding={false}>
              <div className="p-3 text-center">
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h4 className="font-medium text-sm text-gray-900 mb-1">{achievement.name}</h4>
                <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity === 'common' ? 'Běžný' :
                   achievement.rarity === 'rare' ? 'Vzácný' :
                   achievement.rarity === 'epic' ? 'Epický' : 'Legendární'}
                </span>
                <div className="text-xs text-gray-500 mt-2">
                  {achievement.unlockedAt.toLocaleDateString('cs-CZ')}
                </div>
              </div>
            </MobileCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Zatím žádné úspěchy</h3>
          <p className="text-gray-600">Dokončuj aktivity a získej své první odznaky!</p>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'zones', label: 'Zóny', icon: '🗺️' },
    { id: 'activities', label: 'Aktivity', icon: '📚' },
    { id: 'achievements', label: 'Úspěchy', icon: '🏆', badge: achievements.filter(a => 
        new Date().getTime() - a.unlockedAt.getTime() < 24 * 60 * 60 * 1000
      ).length }
  ];

  return (
    <MobileLayout
      title="Učení"
      subtitle={`Úroveň ${currentLevel} • ${streak} dní v řadě`}
      headerAction={
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium text-primary-600">
            {currentXP.toLocaleString()} XP
          </div>
          <div className="text-xl">⭐</div>
        </div>
      }
    >
      <MobileTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="underline"
      />

      <div className="mt-4">
        {activeTab === 'zones' && renderLearningZones()}
        {activeTab === 'activities' && renderRecentActivities()}
        {activeTab === 'achievements' && renderAchievements()}
      </div>

      {/* Zone Detail Modal */}
      {selectedZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white rounded-t-xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-4">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
              
              <div className="flex items-start space-x-4 mb-6">
                <div className="text-4xl">{selectedZone.icon}</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{selectedZone.name}</h2>
                  <p className="text-gray-600 mt-1">{selectedZone.description}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm">
                    <span className={`px-2 py-1 rounded font-medium ${getDifficultyColor(selectedZone.difficulty)}`}>
                      {selectedZone.difficulty === 'easy' ? 'Snadné' : 
                       selectedZone.difficulty === 'medium' ? 'Střední' : 'Těžké'}
                    </span>
                    <span className="text-gray-600">{selectedZone.topicsCount} témat</span>
                    <span className="text-gray-600">{formatTime(selectedZone.estimatedTime)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span>Pokrok v zóně</span>
                    <span>{selectedZone.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${selectedZone.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 bg-blue-50 text-blue-600 rounded-lg text-center">
                    <div className="text-2xl mb-2">📚</div>
                    <div className="font-medium">Pokračovat</div>
                  </button>
                  <button className="p-4 bg-green-50 text-green-600 rounded-lg text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="font-medium">Kvíz</div>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedZone(null)}
                  className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg"
                >
                  Zavřít
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Button */}
      <MobileFAB
        icon="🚀"
        label="Začít učení"
        onClick={() => {
          // Navigate to first available zone or continue learning
          const unlockedZone = activeZones.find(zone => zone.isUnlocked && zone.progress < 100);
          if (unlockedZone) {
            setSelectedZone(unlockedZone);
          }
        }}
      />
    </MobileLayout>
  );
};