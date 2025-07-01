import React, { useState, useEffect } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'engagement' | 'social' | 'achievement' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: BadgeRequirement[];
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
}

interface BadgeRequirement {
  type: 'score' | 'streak' | 'time' | 'activities' | 'quiz_perfect' | 'help_others' | 'experiment_complete';
  value: number;
  description: string;
}

interface BadgeSystemProps {
  studentId: string;
  currentStats: any;
  onBadgeUnlocked?: (badge: Badge) => void;
}

export const BadgeSystem: React.FC<BadgeSystemProps> = ({
  studentId,
  currentStats,
  onBadgeUnlocked
}) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<Badge[]>([]);
  const [showBadgeModal, setShowBadgeModal] = useState<Badge | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Initialize badges
  useEffect(() => {
    initializeBadges();
  }, []);

  // Check for new badge unlocks when stats change
  useEffect(() => {
    if (currentStats) {
      checkBadgeProgress();
    }
  }, [currentStats]);

  const initializeBadges = async () => {
    try {
      const response = await fetch('/api/gamification/badges', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBadges(data.data);
      } else {
        loadDefaultBadges();
      }
    } catch (error) {
      console.error('Error loading badges:', error);
      loadDefaultBadges();
    }
  };

  const loadDefaultBadges = () => {
    const defaultBadges: Badge[] = [
      // Learning Badges
      {
        id: 'first_steps',
        name: 'První kroky',
        description: 'Dokončil jsi svou první aktivitu!',
        icon: '👶',
        category: 'learning',
        rarity: 'common',
        points: 10,
        requirements: [{ type: 'activities', value: 1, description: 'Dokončit 1 aktivitu' }],
        isUnlocked: false
      },
      {
        id: 'physics_explorer',
        name: 'Fyzikální průzkumník',
        description: 'Dokončil jsi 10 aktivit z fyziky',
        icon: '🔬',
        category: 'learning',
        rarity: 'common',
        points: 50,
        requirements: [{ type: 'activities', value: 10, description: 'Dokončit 10 aktivit' }],
        isUnlocked: false
      },
      {
        id: 'experiment_master',
        name: 'Mistr experimentů',
        description: 'Úspěšně jsi dokončil 5 experimentů',
        icon: '⚗️',
        category: 'learning',
        rarity: 'rare',
        points: 100,
        requirements: [{ type: 'experiment_complete', value: 5, description: 'Dokončit 5 experimentů' }],
        isUnlocked: false
      },
      
      // Achievement Badges
      {
        id: 'perfect_quiz',
        name: 'Perfektní kvíz',
        description: 'Zodpověděl jsi všechny otázky správně!',
        icon: '🎯',
        category: 'achievement',
        rarity: 'rare',
        points: 75,
        requirements: [{ type: 'quiz_perfect', value: 1, description: 'Dokončit kvíz se 100% skóre' }],
        isUnlocked: false
      },
      {
        id: 'speed_learner',
        name: 'Rychlý student',
        description: 'Dokončil jsi aktivitu za méně než 5 minut',
        icon: '⚡',
        category: 'achievement',
        rarity: 'rare',
        points: 60,
        requirements: [{ type: 'time', value: 300, description: 'Dokončit aktivitu za méně než 5 minut' }],
        isUnlocked: false
      },
      
      // Engagement Badges
      {
        id: 'daily_streak_3',
        name: 'Třídenní série',
        description: 'Učil jsi se 3 dny v řadě',
        icon: '🔥',
        category: 'engagement',
        rarity: 'common',
        points: 30,
        requirements: [{ type: 'streak', value: 3, description: '3 dny v řadě' }],
        isUnlocked: false
      },
      {
        id: 'daily_streak_7',
        name: 'Týdenní série',
        description: 'Učil jsi se 7 dní v řadě!',
        icon: '🔥',
        category: 'engagement',
        rarity: 'rare',
        points: 100,
        requirements: [{ type: 'streak', value: 7, description: '7 dní v řadě' }],
        isUnlocked: false
      },
      {
        id: 'daily_streak_30',
        name: 'Měsíční série',
        description: 'Neuvěřitelných 30 dní v řadě!',
        icon: '🏆',
        category: 'engagement',
        rarity: 'legendary',
        points: 500,
        requirements: [{ type: 'streak', value: 30, description: '30 dní v řadě' }],
        isUnlocked: false
      },
      
      // Social Badges
      {
        id: 'helpful_student',
        name: 'Nápomocný student',
        description: 'Pomohl jsi ostatním v diskuzi',
        icon: '🤝',
        category: 'social',
        rarity: 'common',
        points: 25,
        requirements: [{ type: 'help_others', value: 1, description: 'Pomoci jinému studentovi' }],
        isUnlocked: false
      },
      
      // Special Badges
      {
        id: 'early_bird',
        name: 'Ranní ptáče',
        description: 'Dokončil jsi aktivitu před 8:00 ráno',
        icon: '🌅',
        category: 'special',
        rarity: 'epic',
        points: 150,
        requirements: [{ type: 'time', value: 8, description: 'Aktivita dokončena před 8:00' }],
        isUnlocked: false
      },
      {
        id: 'night_owl',
        name: 'Noční sova',
        description: 'Učil jsi se po 22:00',
        icon: '🦉',
        category: 'special',
        rarity: 'epic',
        points: 150,
        requirements: [{ type: 'time', value: 22, description: 'Aktivita dokončena po 22:00' }],
        isUnlocked: false
      }
    ];

    setBadges(defaultBadges);
  };

  const checkBadgeProgress = () => {
    const updatedBadges = badges.map(badge => {
      if (badge.isUnlocked) return badge;

      const progress = calculateBadgeProgress(badge, currentStats);
      const shouldUnlock = progress >= 100;

      if (shouldUnlock && !badge.isUnlocked) {
        const unlockedBadge = {
          ...badge,
          isUnlocked: true,
          unlockedAt: new Date(),
          progress: 100
        };

        // Show unlock notification
        setRecentlyUnlocked(prev => [...prev, unlockedBadge]);
        onBadgeUnlocked?.(unlockedBadge);

        // Send to backend
        unlockBadge(badge.id);

        return unlockedBadge;
      }

      return { ...badge, progress };
    });

    setBadges(updatedBadges);
  };

  const calculateBadgeProgress = (badge: Badge, stats: any): number => {
    const requirement = badge.requirements[0]; // Simplified - taking first requirement
    
    switch (requirement.type) {
      case 'activities':
        return Math.min((stats.completedActivities / requirement.value) * 100, 100);
      case 'score':
        return Math.min((stats.totalScore / requirement.value) * 100, 100);
      case 'streak':
        return Math.min((stats.currentStreak / requirement.value) * 100, 100);
      case 'quiz_perfect':
        return stats.perfectQuizzes >= requirement.value ? 100 : 0;
      case 'experiment_complete':
        return Math.min((stats.experimentsCompleted / requirement.value) * 100, 100);
      case 'help_others':
        return Math.min((stats.helpCount / requirement.value) * 100, 100);
      default:
        return 0;
    }
  };

  const unlockBadge = async (badgeId: string) => {
    try {
      await fetch('/api/gamification/badges/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          studentId,
          badgeId,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error unlocking badge:', error);
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'text-gray-600 border-gray-300';
      case 'rare': return 'text-blue-600 border-blue-300';
      case 'epic': return 'text-purple-600 border-purple-300';
      case 'legendary': return 'text-yellow-600 border-yellow-300';
      default: return 'text-gray-600 border-gray-300';
    }
  };

  const getRarityBg = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'bg-gray-50';
      case 'rare': return 'bg-blue-50';
      case 'epic': return 'bg-purple-50';
      case 'legendary': return 'bg-yellow-50';
      default: return 'bg-gray-50';
    }
  };

  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter(badge => badge.category === selectedCategory);

  const unlockedCount = badges.filter(badge => badge.isUnlocked).length;
  const totalPoints = badges.filter(badge => badge.isUnlocked).reduce((sum, badge) => sum + badge.points, 0);

  return (
    <div className="space-y-6">
      {/* Badge Collection Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">🏆 Sbírka odznaků</h2>
          <div className="text-right">
            <div className="text-sm text-gray-600">Odemčeno</div>
            <div className="text-xl font-bold text-primary-600">{unlockedCount}/{badges.length}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Celkový pokrok</span>
            <span className="text-sm text-gray-600">{Math.round((unlockedCount / badges.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / badges.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xl font-bold text-blue-600">{totalPoints}</div>
            <div className="text-sm text-blue-700">Bodů za odznaky</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xl font-bold text-green-600">{badges.filter(b => b.rarity === 'rare' && b.isUnlocked).length}</div>
            <div className="text-sm text-green-700">Vzácné odznaky</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-xl font-bold text-purple-600">{badges.filter(b => b.rarity === 'legendary' && b.isUnlocked).length}</div>
            <div className="text-sm text-purple-700">Legendární</div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Všechny
          </button>
          {['learning', 'achievement', 'engagement', 'social', 'special'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'learning' ? 'Učení' :
               category === 'achievement' ? 'Úspěchy' :
               category === 'engagement' ? 'Aktivita' :
               category === 'social' ? 'Sociální' : 'Speciální'}
            </button>
          ))}
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map(badge => (
          <div
            key={badge.id}
            onClick={() => setShowBadgeModal(badge)}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 rounded-lg border-2 p-4 ${
              badge.isUnlocked 
                ? `${getRarityBg(badge.rarity)} ${getRarityColor(badge.rarity)}` 
                : 'bg-gray-100 border-gray-200 opacity-60'
            }`}
          >
            <div className="text-center">
              <div className={`text-4xl mb-2 ${badge.isUnlocked ? '' : 'grayscale'}`}>
                {badge.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{badge.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
              
              {/* Rarity indicator */}
              <div className="flex items-center justify-center space-x-1 mb-2">
                <span className={`text-xs px-2 py-1 rounded ${getRarityBg(badge.rarity)} ${getRarityColor(badge.rarity)}`}>
                  {badge.rarity === 'common' ? 'Obyčejný' :
                   badge.rarity === 'rare' ? 'Vzácný' :
                   badge.rarity === 'epic' ? 'Epický' : 'Legendární'}
                </span>
                <span className="text-xs text-yellow-600">+{badge.points} XP</span>
              </div>

              {/* Progress bar for locked badges */}
              {!badge.isUnlocked && badge.progress !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${badge.progress}%` }}
                  />
                </div>
              )}

              {/* Unlock timestamp */}
              {badge.isUnlocked && badge.unlockedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Odemčeno {badge.unlockedAt.toLocaleDateString('cs-CZ')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Badge Detail Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className={`text-6xl mb-3 ${showBadgeModal.isUnlocked ? '' : 'grayscale'}`}>
                {showBadgeModal.icon}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{showBadgeModal.name}</h2>
              <p className="text-gray-600 mt-1">{showBadgeModal.description}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Vzácnost:</span>
                <span className={`text-sm font-medium ${getRarityColor(showBadgeModal.rarity)}`}>
                  {showBadgeModal.rarity === 'common' ? 'Obyčejný' :
                   showBadgeModal.rarity === 'rare' ? 'Vzácný' :
                   showBadgeModal.rarity === 'epic' ? 'Epický' : 'Legendární'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Odměna:</span>
                <span className="text-sm font-medium text-yellow-600">+{showBadgeModal.points} XP</span>
              </div>

              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Požadavky:</h4>
                {showBadgeModal.requirements.map((req, index) => (
                  <p key={index} className="text-sm text-gray-600">• {req.description}</p>
                ))}
              </div>

              {!showBadgeModal.isUnlocked && showBadgeModal.progress !== undefined && (
                <div className="border-t pt-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Pokrok:</span>
                    <span className="text-sm text-gray-600">{Math.round(showBadgeModal.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${showBadgeModal.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowBadgeModal(null)}
              className="w-full mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Zavřít
            </button>
          </div>
        </div>
      )}

      {/* Recent Unlocks Notification */}
      {recentlyUnlocked.map((badge, index) => (
        <div
          key={badge.id}
          className="fixed top-4 right-4 bg-white border-2 border-yellow-400 rounded-lg shadow-lg p-4 z-50 animate-bounce"
          style={{ animationDelay: `${index * 200}ms` }}
        >
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{badge.icon}</div>
            <div>
              <p className="font-bold text-gray-900">Nový odznak!</p>
              <p className="text-sm text-gray-600">{badge.name}</p>
              <p className="text-xs text-yellow-600">+{badge.points} XP</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};