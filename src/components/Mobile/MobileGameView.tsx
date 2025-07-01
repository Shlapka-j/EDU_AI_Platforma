import React, { useState, useEffect } from 'react';
import { MobileLayout, MobileCard, MobileTabs, ResponsiveGrid } from './MobileLayout';

interface MobileGameViewProps {
  studentId: string;
  gameProfile: GameProfile;
  leaderboard: LeaderboardEntry[];
  challenges: Challenge[];
  shop: ShopItem[];
  inventory: InventoryItem[];
}

interface GameProfile {
  id: string;
  name: string;
  level: number;
  xp: number;
  nextLevelXP: number;
  coins: number;
  gems: number;
  streak: number;
  avatar: Avatar;
  badges: Badge[];
  stats: PlayerStats;
}

interface Avatar {
  head: string;
  body: string;
  accessory?: string;
  background: string;
  frame?: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  category: string;
}

interface PlayerStats {
  totalPlayTime: number;
  activitiesCompleted: number;
  perfectScores: number;
  experimentsCompleted: number;
  questionsAnswered: number;
  streak: number;
  rank: number;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  level: number;
  xp: number;
  avatar: Avatar;
  rank: number;
  badge?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  icon: string;
  progress: number;
  target: number;
  reward: {
    type: 'xp' | 'coins' | 'gems' | 'badge';
    amount: number;
    icon: string;
  };
  expiresAt?: Date;
  isCompleted: boolean;
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: {
    type: 'coins' | 'gems';
    amount: number;
  };
  category: 'avatar' | 'boost' | 'decoration';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isPurchased: boolean;
}

interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  quantity: number;
  type: 'avatar' | 'boost' | 'decoration';
}

export const MobileGameView: React.FC<MobileGameViewProps> = ({
  studentId,
  gameProfile,
  leaderboard,
  challenges,
  shop,
  inventory
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showCustomization, setShowCustomization] = useState(false);

  const xpProgress = ((gameProfile.xp % 1000) / 1000) * 100;

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getChallengeTypeColor = (type: string): string => {
    switch (type) {
      case 'daily': return 'text-green-600 bg-green-50';
      case 'weekly': return 'text-blue-600 bg-blue-50';
      case 'special': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${minutes % 60}m`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  };

  const renderProfile = () => (
    <div className="space-y-4">
      {/* Avatar and Level */}
      <MobileCard padding={false}>
        <div className="p-6 text-center bg-gradient-to-b from-primary-50 to-white">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold relative overflow-hidden">
              <div className="absolute inset-0" style={{ backgroundColor: gameProfile.avatar.background }} />
              <div className="relative z-10 text-4xl">{gameProfile.avatar.head}</div>
              {gameProfile.avatar.accessory && (
                <div className="absolute top-0 right-0 text-lg">{gameProfile.avatar.accessory}</div>
              )}
              {gameProfile.avatar.frame && (
                <div className="absolute inset-0 border-4 rounded-full" style={{ borderColor: gameProfile.avatar.frame }} />
              )}
            </div>
            <button
              onClick={() => setShowCustomization(true)}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-primary-600"
            >
              ✏️
            </button>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">{gameProfile.name}</h2>
          <div className="text-lg font-semibold text-primary-600 mb-4">Úroveň {gameProfile.level}</div>
          
          {/* XP Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{gameProfile.xp.toLocaleString()} XP</span>
              <span>{gameProfile.nextLevelXP.toLocaleString()} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>

          {/* Currencies */}
          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <div className="text-2xl">🪙</div>
              <div className="font-semibold text-yellow-600">{gameProfile.coins.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Mince</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">💎</div>
              <div className="font-semibold text-blue-600">{gameProfile.gems}</div>
              <div className="text-xs text-gray-500">Drahokamy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">🔥</div>
              <div className="font-semibold text-orange-600">{gameProfile.streak}</div>
              <div className="text-xs text-gray-500">Série dní</div>
            </div>
          </div>
        </div>
      </MobileCard>

      {/* Stats */}
      <MobileCard title="Statistiky" icon="📊">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{gameProfile.stats.activitiesCompleted}</div>
            <div className="text-xs text-blue-700">Aktivit dokončeno</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{gameProfile.stats.perfectScores}</div>
            <div className="text-xs text-green-700">Perfektní skóre</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">{gameProfile.stats.experimentsCompleted}</div>
            <div className="text-xs text-purple-700">Experimenty</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">#{gameProfile.stats.rank}</div>
            <div className="text-xs text-yellow-700">Pořadí</div>
          </div>
        </div>
      </MobileCard>

      {/* Recent Badges */}
      <MobileCard title="Nejnovější odznaky" icon="🏆">
        {gameProfile.badges.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {gameProfile.badges.slice(0, 6).map(badge => (
              <div key={badge.id} className={`p-3 rounded-lg border text-center ${getRarityColor(badge.rarity)}`}>
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-xs font-medium truncate">{badge.name}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm text-gray-600">Zatím žádné odznaky</div>
          </div>
        )}
      </MobileCard>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-3">
      {leaderboard.map((entry, index) => (
        <MobileCard key={entry.id} padding={false}>
          <div className="p-4 flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
              entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
              entry.rank === 3 ? 'bg-orange-100 text-orange-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {entry.rank}
            </div>
            
            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-blue-400 to-purple-500 flex items-center justify-center text-white relative overflow-hidden">
              <div className="absolute inset-0" style={{ backgroundColor: entry.avatar.background }} />
              <div className="relative z-10">{entry.avatar.head}</div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900 truncate">{entry.name}</h3>
                {entry.badge && <span className="text-sm">{entry.badge}</span>}
              </div>
              <div className="text-sm text-gray-600">Úroveň {entry.level}</div>
            </div>
            
            <div className="text-right">
              <div className="font-semibold text-primary-600">{entry.xp.toLocaleString()}</div>
              <div className="text-xs text-gray-500">XP</div>
            </div>
          </div>
        </MobileCard>
      ))}
    </div>
  );

  const renderChallenges = () => (
    <div className="space-y-4">
      {challenges.map(challenge => (
        <MobileCard key={challenge.id}>
          <div className="flex items-start space-x-3">
            <div className="text-2xl">{challenge.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-gray-900 truncate">{challenge.title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getChallengeTypeColor(challenge.type)}`}>
                  {challenge.type === 'daily' ? 'Denní' :
                   challenge.type === 'weekly' ? 'Týdenní' : 'Speciální'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
              
              <div className="flex justify-between text-sm mb-2">
                <span>Pokrok</span>
                <span className="font-medium">{challenge.progress}/{challenge.target}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    challenge.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{challenge.reward.icon}</span>
                  <span className="text-sm font-medium">+{challenge.reward.amount}</span>
                </div>
                
                {challenge.expiresAt && !challenge.isCompleted && (
                  <div className="text-xs text-red-600">
                    Končí za {formatTime(Math.max(0, Math.floor((challenge.expiresAt.getTime() - Date.now()) / 60000)))}
                  </div>
                )}
                
                {challenge.isCompleted && (
                  <div className="text-green-600 text-sm font-medium">✓ Dokončeno</div>
                )}
              </div>
            </div>
          </div>
        </MobileCard>
      ))}
    </div>
  );

  const renderShop = () => (
    <div className="space-y-4">
      <ResponsiveGrid cols={{ xs: 2, sm: 3 }}>
        {shop.map(item => (
          <MobileCard
            key={item.id}
            padding={false}
            clickable={!item.isPurchased}
          >
            <div className={`p-3 text-center border rounded-lg ${getRarityColor(item.rarity)}`}>
              <div className="text-3xl mb-2">{item.icon}</div>
              <h4 className="font-medium text-sm text-gray-900 mb-1 truncate">{item.name}</h4>
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>
              
              {item.isPurchased ? (
                <div className="text-green-600 text-sm font-medium">✓ Vlastníš</div>
              ) : (
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-lg">{item.price.type === 'coins' ? '🪙' : '💎'}</span>
                  <span className="font-semibold">{item.price.amount}</span>
                </div>
              )}
            </div>
          </MobileCard>
        ))}
      </ResponsiveGrid>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profil', icon: '👤' },
    { id: 'leaderboard', label: 'Žebříček', icon: '🏆' },
    { id: 'challenges', label: 'Výzvy', icon: '🎯', badge: challenges.filter(c => !c.isCompleted).length },
    { id: 'shop', label: 'Obchod', icon: '🛒' }
  ];

  return (
    <MobileLayout
      title="Herní profil"
      subtitle={`Úroveň ${gameProfile.level} • #${gameProfile.stats.rank}`}
      headerAction={
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <span className="text-sm">🪙</span>
            <span className="text-sm font-medium">{gameProfile.coins.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm">💎</span>
            <span className="text-sm font-medium">{gameProfile.gems}</span>
          </div>
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
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'leaderboard' && renderLeaderboard()}
        {activeTab === 'challenges' && renderChallenges()}
        {activeTab === 'shop' && renderShop()}
      </div>

      {/* Avatar Customization Modal */}
      {showCustomization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white rounded-t-xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-4">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Přizpůsobit avatara</h3>
              
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold relative overflow-hidden mx-auto">
                  <div className="absolute inset-0" style={{ backgroundColor: gameProfile.avatar.background }} />
                  <div className="relative z-10 text-4xl">{gameProfile.avatar.head}</div>
                  {gameProfile.avatar.accessory && (
                    <div className="absolute top-0 right-0 text-lg">{gameProfile.avatar.accessory}</div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Hlava</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {['👦', '👧', '🧑', '👨', '👩', '🧔'].map(head => (
                      <button
                        key={head}
                        className="p-2 rounded-lg border-2 text-xl hover:border-primary-300"
                        style={{
                          borderColor: gameProfile.avatar.head === head ? '#3B82F6' : '#E5E7EB'
                        }}
                      >
                        {head}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Doplňky</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {['🎓', '👑', '🎩', '🧢', '🎯', '⚡'].map(accessory => (
                      <button
                        key={accessory}
                        className="p-2 rounded-lg border-2 text-xl hover:border-primary-300"
                        style={{
                          borderColor: gameProfile.avatar.accessory === accessory ? '#3B82F6' : '#E5E7EB'
                        }}
                      >
                        {accessory}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCustomization(false)}
                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium"
                  >
                    Uložit
                  </button>
                  <button
                    onClick={() => setShowCustomization(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium"
                  >
                    Zrušit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};