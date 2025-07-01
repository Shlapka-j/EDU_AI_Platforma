import React, { useState, useEffect } from 'react';

interface LeaderboardEntry {
  id: string;
  studentId: string;
  studentName: string;
  avatarUrl?: string;
  level: number;
  totalXP: number;
  rank: number;
  weeklyXP: number;
  monthlyXP: number;
  totalScore: number;
  experimentsCompleted: number;
  perfectQuizzes: number;
  currentStreak: number;
  badges: string[];
  title?: string;
  isCurrentUser: boolean;
  lastActive: Date;
  classId?: string;
  className?: string;
}

interface LeaderboardsProps {
  studentId: string;
  classId?: string;
  onChallengePlayer?: (playerId: string) => void;
}

interface LeaderboardFilters {
  scope: 'global' | 'class' | 'friends';
  timeframe: 'all_time' | 'monthly' | 'weekly';
  category: 'xp' | 'level' | 'score' | 'experiments' | 'streaks' | 'badges';
}

export const Leaderboards: React.FC<LeaderboardsProps> = ({
  studentId,
  classId,
  onChallengePlayer
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [filters, setFilters] = useState<LeaderboardFilters>({
    scope: classId ? 'class' : 'global',
    timeframe: 'all_time',
    category: 'xp'
  });
  const [loading, setLoading] = useState(false);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);
  const [showProfile, setShowProfile] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [filters, studentId]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        scope: filters.scope,
        timeframe: filters.timeframe,
        category: filters.category,
        ...(classId && filters.scope === 'class' && { classId })
      });

      const response = await fetch(`/api/gamification/leaderboard?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data.data.entries || []);
        setCurrentUserRank(data.data.currentUser || null);
      } else {
        loadMockLeaderboard();
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      loadMockLeaderboard();
    } finally {
      setLoading(false);
    }
  };

  const loadMockLeaderboard = () => {
    const mockData: LeaderboardEntry[] = [
      {
        id: '1',
        studentId: 'student1',
        studentName: 'Tomáš Novák',
        level: 25,
        totalXP: 15750,
        rank: 1,
        weeklyXP: 2100,
        monthlyXP: 8500,
        totalScore: 8950,
        experimentsCompleted: 45,
        perfectQuizzes: 12,
        currentStreak: 14,
        badges: ['perfect_quiz', 'experiment_master', 'speed_learner'],
        title: 'Fyzikální génius',
        isCurrentUser: false,
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        className: '6.A'
      },
      {
        id: '2',
        studentId: 'student2',
        studentName: 'Klára Svobodová',
        level: 23,
        totalXP: 14200,
        rank: 2,
        weeklyXP: 1800,
        monthlyXP: 7800,
        totalScore: 8200,
        experimentsCompleted: 38,
        perfectQuizzes: 10,
        currentStreak: 9,
        badges: ['daily_streak_7', 'helpful_student'],
        title: 'Experimentátorka',
        isCurrentUser: false,
        lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        className: '6.B'
      },
      {
        id: '3',
        studentId: studentId,
        studentName: 'Ty',
        level: 20,
        totalXP: 12000,
        rank: 3,
        weeklyXP: 1500,
        monthlyXP: 6500,
        totalScore: 7100,
        experimentsCompleted: 32,
        perfectQuizzes: 8,
        currentStreak: 6,
        badges: ['first_steps', 'physics_explorer'],
        title: 'Začínající vědec',
        isCurrentUser: true,
        lastActive: new Date(),
        className: '6.A'
      },
      {
        id: '4',
        studentId: 'student4',
        studentName: 'Jakub Procházka',
        level: 19,
        totalXP: 11500,
        rank: 4,
        weeklyXP: 1200,
        monthlyXP: 5800,
        totalScore: 6800,
        experimentsCompleted: 28,
        perfectQuizzes: 6,
        currentStreak: 4,
        badges: ['perfect_quiz', 'social_helper'],
        isCurrentUser: false,
        lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
        className: '6.A'
      },
      {
        id: '5',
        studentId: 'student5',
        studentName: 'Anička Dvořáková',
        level: 18,
        totalXP: 10800,
        rank: 5,
        weeklyXP: 1100,
        monthlyXP: 5200,
        totalScore: 6300,
        experimentsCompleted: 25,
        perfectQuizzes: 7,
        currentStreak: 12,
        badges: ['daily_streak_7', 'experiment_master'],
        title: 'Průzkumnice',
        isCurrentUser: false,
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
        className: '6.C'
      }
    ];

    setLeaderboardData(mockData);
    setCurrentUserRank(mockData.find(entry => entry.isCurrentUser) || null);
  };

  const getCategoryValue = (entry: LeaderboardEntry): number => {
    switch (filters.category) {
      case 'xp':
        return filters.timeframe === 'weekly' ? entry.weeklyXP :
               filters.timeframe === 'monthly' ? entry.monthlyXP :
               entry.totalXP;
      case 'level': return entry.level;
      case 'score': return entry.totalScore;
      case 'experiments': return entry.experimentsCompleted;
      case 'streaks': return entry.currentStreak;
      case 'badges': return entry.badges.length;
      default: return entry.totalXP;
    }
  };

  const getCategoryLabel = (): string => {
    switch (filters.category) {
      case 'xp': return filters.timeframe === 'weekly' ? 'Týdenní XP' :
                       filters.timeframe === 'monthly' ? 'Měsíční XP' : 'Celkové XP';
      case 'level': return 'Úroveň';
      case 'score': return 'Celkové skóre';
      case 'experiments': return 'Experimenty';
      case 'streaks': return 'Série dní';
      case 'badges': return 'Odznaky';
      default: return 'XP';
    }
  };

  const getCategoryIcon = (): string => {
    switch (filters.category) {
      case 'xp': return '⭐';
      case 'level': return '🏆';
      case 'score': return '🎯';
      case 'experiments': return '🔬';
      case 'streaks': return '🔥';
      case 'badges': return '🏅';
      default: return '⭐';
    }
  };

  const getRankIcon = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50';
      case 2: return 'text-gray-600 bg-gray-50';
      case 3: return 'text-orange-600 bg-orange-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getActivityStatus = (lastActive: Date): { text: string; color: string } => {
    const now = new Date();
    const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return { text: 'Online', color: 'text-green-600' };
    if (diffHours < 24) return { text: `${Math.floor(diffHours)}h`, color: 'text-yellow-600' };
    if (diffHours < 168) return { text: `${Math.floor(diffHours / 24)}d`, color: 'text-gray-600' };
    return { text: 'Neaktivní', color: 'text-red-600' };
  };

  const handleChallengePlayer = (entry: LeaderboardEntry) => {
    onChallengePlayer?.(entry.studentId);
  };

  return (
    <div className="space-y-6">
      {/* Leaderboard Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">🏆 Žebříček</h2>
            <p className="text-yellow-100">Porovnej se s ostatními studenty</p>
          </div>
          {currentUserRank && (
            <div className="text-right">
              <div className="text-3xl font-bold">#{currentUserRank.rank}</div>
              <div className="text-yellow-100">Tvoje pozice</div>
            </div>
          )}
        </div>

        {/* Current User Stats */}
        {currentUserRank && (
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-bold">{currentUserRank.level}</div>
                <div className="text-sm text-yellow-100">Úroveň</div>
              </div>
              <div>
                <div className="text-xl font-bold">{currentUserRank.totalXP.toLocaleString()}</div>
                <div className="text-sm text-yellow-100">XP</div>
              </div>
              <div>
                <div className="text-xl font-bold">{currentUserRank.currentStreak}</div>
                <div className="text-sm text-yellow-100">Série dní</div>
              </div>
              <div>
                <div className="text-xl font-bold">{currentUserRank.badges.length}</div>
                <div className="text-sm text-yellow-100">Odznaky</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="space-y-4">
          {/* Scope Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Rozsah:</label>
            <div className="flex space-x-2">
              {[
                { id: 'global', name: 'Globální', icon: '🌍' },
                { id: 'class', name: 'Třída', icon: '🏫' },
                { id: 'friends', name: 'Přátelé', icon: '👥' }
              ].map(scope => (
                <button
                  key={scope.id}
                  onClick={() => setFilters(prev => ({ ...prev, scope: scope.id as any }))}
                  disabled={scope.id === 'class' && !classId}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.scope === scope.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                  }`}
                >
                  <span>{scope.icon}</span>
                  <span>{scope.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Období:</label>
            <div className="flex space-x-2">
              {[
                { id: 'all_time', name: 'Celkově', icon: '📅' },
                { id: 'monthly', name: 'Tento měsíc', icon: '📆' },
                { id: 'weekly', name: 'Tento týden', icon: '🗓️' }
              ].map(timeframe => (
                <button
                  key={timeframe.id}
                  onClick={() => setFilters(prev => ({ ...prev, timeframe: timeframe.id as any }))}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.timeframe === timeframe.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{timeframe.icon}</span>
                  <span>{timeframe.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Kategorie:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'xp', name: 'XP Body', icon: '⭐' },
                { id: 'level', name: 'Úroveň', icon: '🏆' },
                { id: 'score', name: 'Skóre', icon: '🎯' },
                { id: 'experiments', name: 'Experimenty', icon: '🔬' },
                { id: 'streaks', name: 'Série', icon: '🔥' },
                { id: 'badges', name: 'Odznaky', icon: '🏅' }
              ].map(category => (
                <button
                  key={category.id}
                  onClick={() => setFilters(prev => ({ ...prev, category: category.id as any }))}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.category === category.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-900 flex items-center space-x-2">
            <span>{getCategoryIcon()}</span>
            <span>Žebříček - {getCategoryLabel()}</span>
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Načítám žebříček...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {leaderboardData.map((entry, index) => {
              const activity = getActivityStatus(entry.lastActive);
              
              return (
                <div
                  key={entry.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    entry.isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${getRankColor(entry.rank)}`}>
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* Avatar & Info */}
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          {entry.avatarUrl ? (
                            <img src={entry.avatarUrl} alt={entry.studentName} className="w-10 h-10 rounded-full" />
                          ) : (
                            <span className="text-lg">👤</span>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{entry.studentName}</h4>
                            {entry.isCurrentUser && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Ty</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span>Level {entry.level}</span>
                            {entry.title && <span>• {entry.title}</span>}
                            {entry.className && <span>• {entry.className}</span>}
                            <span className={activity.color}>• {activity.text}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Category Value */}
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {getCategoryValue(entry).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">{getCategoryLabel()}</div>
                      </div>

                      {/* Badges Preview */}
                      <div className="flex space-x-1">
                        {entry.badges.slice(0, 3).map((badge, badgeIndex) => (
                          <div key={badgeIndex} className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs">
                            🏅
                          </div>
                        ))}
                        {entry.badges.length > 3 && (
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                            +{entry.badges.length - 3}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowProfile(entry)}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          Profil
                        </button>
                        {!entry.isCurrentUser && (
                          <button
                            onClick={() => handleChallengePlayer(entry)}
                            className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors"
                          >
                            Vyzvi
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Profil studenta</h3>
              <button
                onClick={() => setShowProfile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                {showProfile.avatarUrl ? (
                  <img src={showProfile.avatarUrl} alt={showProfile.studentName} className="w-20 h-20 rounded-full" />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              <h4 className="text-lg font-bold text-gray-900">{showProfile.studentName}</h4>
              {showProfile.title && (
                <p className="text-sm text-gray-600">{showProfile.title}</p>
              )}
              <div className="flex items-center justify-center space-x-4 mt-2 text-sm text-gray-500">
                <span>Level {showProfile.level}</span>
                <span>#{showProfile.rank}</span>
                {showProfile.className && <span>{showProfile.className}</span>}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{showProfile.totalXP.toLocaleString()}</div>
                <div className="text-xs text-blue-700">Celkové XP</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{showProfile.experimentsCompleted}</div>
                <div className="text-xs text-green-700">Experimenty</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">{showProfile.perfectQuizzes}</div>
                <div className="text-xs text-yellow-700">Perfektní kvízy</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">{showProfile.currentStreak}</div>
                <div className="text-xs text-red-700">Série dní</div>
              </div>
            </div>

            {/* Badges */}
            <div className="mb-6">
              <h5 className="font-medium text-gray-900 mb-2">🏅 Odznaky ({showProfile.badges.length})</h5>
              <div className="flex flex-wrap gap-2">
                {showProfile.badges.map((badge, index) => (
                  <span key={index} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    🏅 {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowProfile(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Zavřít
              </button>
              {!showProfile.isCurrentUser && (
                <button
                  onClick={() => {
                    handleChallengePlayer(showProfile);
                    setShowProfile(null);
                  }}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Vyzvi na souboj
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};