import React, { useState, useEffect } from 'react';

interface XPSystemProps {
  studentId: string;
  currentXP: number;
  onLevelUp?: (newLevel: number, rewards: any[]) => void;
  onXPGained?: (amount: number, source: string) => void;
}

interface Level {
  level: number;
  xpRequired: number;
  title: string;
  description: string;
  rewards: Reward[];
  icon: string;
  color: string;
}

interface Reward {
  type: 'badge' | 'avatar' | 'theme' | 'feature' | 'bonus_xp';
  name: string;
  description: string;
  value?: any;
}

interface XPGain {
  id: string;
  amount: number;
  source: string;
  description: string;
  timestamp: Date;
  multiplier?: number;
}

export const XPSystem: React.FC<XPSystemProps> = ({
  studentId,
  currentXP,
  onLevelUp,
  onXPGained
}) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [xpInCurrentLevel, setXpInCurrentLevel] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [levels, setLevels] = useState<Level[]>([]);
  const [recentXPGains, setRecentXPGains] = useState<XPGain[]>([]);
  const [showLevelUpModal, setShowLevelUpModal] = useState<Level | null>(null);
  const [xpMultiplier, setXpMultiplier] = useState(1.0);

  useEffect(() => {
    initializeLevels();
  }, []);

  useEffect(() => {
    if (currentXP && levels.length > 0) {
      calculateLevel();
    }
  }, [currentXP, levels]);

  const initializeLevels = () => {
    const levelData: Level[] = [];
    
    for (let i = 1; i <= 50; i++) {
      const baseXP = 100;
      const xpRequired = Math.floor(baseXP * Math.pow(1.15, i - 1));
      
      levelData.push({
        level: i,
        xpRequired,
        title: getLevelTitle(i),
        description: getLevelDescription(i),
        rewards: getLevelRewards(i),
        icon: getLevelIcon(i),
        color: getLevelColor(i)
      });
    }
    
    setLevels(levelData);
  };

  const getLevelTitle = (level: number): string => {
    if (level <= 5) return 'Začátečník';
    if (level <= 10) return 'Student';
    if (level <= 15) return 'Badatel';
    if (level <= 20) return 'Experimentátor';
    if (level <= 25) return 'Vědec';
    if (level <= 30) return 'Expert';
    if (level <= 35) return 'Mistr';
    if (level <= 40) return 'Génius';
    if (level <= 45) return 'Legenda';
    return 'Grandmaster';
  };

  const getLevelDescription = (level: number): string => {
    const descriptions = [
      'Právě začínáš svou cestu!',
      'Učíš se základy fyziky',
      'Zvládáš jednoduché experimenty',
      'Rozumíš základním principům',
      'Dokážeš vyřešit složitější úlohy',
      'Jsi zkušený student fyziky',
      'Experimentuješ s pokročilými koncepty',
      'Ovládáš komplexní teorie',
      'Jsi vzorem pro ostatní',
      'Dosáhl jsi nejvyšší úrovně!'
    ];
    
    return descriptions[Math.floor((level - 1) / 5)] || descriptions[descriptions.length - 1];
  };

  const getLevelRewards = (level: number): Reward[] => {
    const rewards: Reward[] = [];
    
    // Every 5 levels - special rewards
    if (level % 5 === 0) {
      rewards.push({
        type: 'badge',
        name: `Level ${level} Badge`,
        description: `Dosáhl jsi úrovně ${level}!`
      });
    }
    
    // Every 10 levels - avatar items
    if (level % 10 === 0) {
      rewards.push({
        type: 'avatar',
        name: 'Nový avatar',
        description: 'Odemkl jsi novou možnost přizpůsobení avatara'
      });
    }
    
    // Milestone rewards
    if (level === 20) {
      rewards.push({
        type: 'feature',
        name: 'Pokročilé experimenty',
        description: 'Přístup k pokročilým experimentálním nástrojům'
      });
    }
    
    if (level === 30) {
      rewards.push({
        type: 'theme',
        name: 'Tmavý režim',
        description: 'Odemkl jsi tmavý režim rozhraní'
      });
    }
    
    // Bonus XP for high levels
    if (level >= 25) {
      rewards.push({
        type: 'bonus_xp',
        name: 'XP Bonus',
        description: 'Získáváš 10% bonus XP za všechny aktivity',
        value: 0.1
      });
    }
    
    return rewards;
  };

  const getLevelIcon = (level: number): string => {
    if (level <= 5) return '🌱';
    if (level <= 10) return '📚';
    if (level <= 15) return '🔍';
    if (level <= 20) return '⚗️';
    if (level <= 25) return '🧪';
    if (level <= 30) return '🎓';
    if (level <= 35) return '⭐';
    if (level <= 40) return '🏆';
    if (level <= 45) return '👑';
    return '💎';
  };

  const getLevelColor = (level: number): string => {
    if (level <= 5) return 'text-green-600';
    if (level <= 10) return 'text-blue-600';
    if (level <= 15) return 'text-purple-600';
    if (level <= 20) return 'text-orange-600';
    if (level <= 25) return 'text-red-600';
    if (level <= 30) return 'text-pink-600';
    if (level <= 35) return 'text-indigo-600';
    if (level <= 40) return 'text-yellow-600';
    if (level <= 45) return 'text-gray-800';
    return 'text-black';
  };

  const calculateLevel = () => {
    let totalXPUsed = 0;
    let foundLevel = 1;
    
    for (const level of levels) {
      if (totalXPUsed + level.xpRequired <= currentXP) {
        totalXPUsed += level.xpRequired;
        foundLevel = level.level;
      } else {
        break;
      }
    }
    
    const currentLevelData = levels[foundLevel - 1];
    const nextLevelData = levels[foundLevel];
    
    if (currentLevelData) {
      const xpInLevel = currentXP - totalXPUsed;
      const xpNeeded = nextLevelData ? nextLevelData.xpRequired - xpInLevel : 0;
      
      setCurrentLevel(foundLevel);
      setXpInCurrentLevel(xpInLevel);
      setXpToNextLevel(xpNeeded);
      
      // Check for level up
      if (foundLevel > currentLevel) {
        handleLevelUp(currentLevelData);
      }
    }
  };

  const handleLevelUp = (newLevelData: Level) => {
    setShowLevelUpModal(newLevelData);
    onLevelUp?.(newLevelData.level, newLevelData.rewards);
    
    // Apply XP multiplier bonus if available
    const xpBonus = newLevelData.rewards.find(r => r.type === 'bonus_xp');
    if (xpBonus && xpBonus.value) {
      setXpMultiplier(prev => prev + xpBonus.value);
    }
    
    // Send level up to backend
    recordLevelUp(newLevelData.level);
  };

  const recordLevelUp = async (level: number) => {
    try {
      await fetch('/api/gamification/level-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          studentId,
          level,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error recording level up:', error);
    }
  };

  const awardXP = (amount: number, source: string, description: string) => {
    const multipliedAmount = Math.floor(amount * xpMultiplier);
    
    const xpGain: XPGain = {
      id: `xp_${Date.now()}`,
      amount: multipliedAmount,
      source,
      description,
      timestamp: new Date(),
      multiplier: xpMultiplier > 1 ? xpMultiplier : undefined
    };
    
    setRecentXPGains(prev => [xpGain, ...prev.slice(0, 4)]); // Keep last 5
    onXPGained?.(multipliedAmount, source);
    
    // Send XP gain to backend
    recordXPGain(xpGain);
  };

  const recordXPGain = async (xpGain: XPGain) => {
    try {
      await fetch('/api/gamification/xp-gain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          studentId,
          amount: xpGain.amount,
          source: xpGain.source,
          description: xpGain.description,
          timestamp: xpGain.timestamp.toISOString()
        })
      });
    } catch (error) {
      console.error('Error recording XP gain:', error);
    }
  };

  const getCurrentLevelData = (): Level | null => {
    return levels[currentLevel - 1] || null;
  };

  const getNextLevelData = (): Level | null => {
    return levels[currentLevel] || null;
  };

  const getProgressPercentage = (): number => {
    const nextLevel = getNextLevelData();
    if (!nextLevel) return 100;
    
    return Math.min((xpInCurrentLevel / nextLevel.xpRequired) * 100, 100);
  };

  const currentLevelData = getCurrentLevelData();
  const nextLevelData = getNextLevelData();

  return (
    <div className="space-y-6">
      {/* Main XP Display */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{currentLevelData?.icon}</span>
            <div>
              <h2 className="text-2xl font-bold">Level {currentLevel}</h2>
              <p className="text-blue-100">{currentLevelData?.title}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{currentXP.toLocaleString()} XP</div>
            <div className="text-blue-100 text-sm">Celkem</div>
          </div>
        </div>

        {/* Progress Bar */}
        {nextLevelData && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pokrok k další úrovni</span>
              <span>{xpInCurrentLevel.toLocaleString()} / {nextLevelData.xpRequired.toLocaleString()} XP</span>
            </div>
            <div className="w-full bg-blue-400 bg-opacity-30 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <div className="text-right text-sm text-blue-100">
              {xpToNextLevel.toLocaleString()} XP do Level {currentLevel + 1}
            </div>
          </div>
        )}

        {/* XP Multiplier */}
        {xpMultiplier > 1 && (
          <div className="mt-4 bg-yellow-500 bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span>⚡</span>
              <span className="font-medium">XP Bonus aktivní: {Math.round((xpMultiplier - 1) * 100)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Level Milestones */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Blízké milníky</h3>
        <div className="space-y-3">
          {levels.slice(currentLevel - 1, currentLevel + 3).map((level, index) => (
            <div 
              key={level.level}
              className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                level.level === currentLevel 
                  ? 'border-primary-500 bg-primary-50' 
                  : level.level < currentLevel
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <span className="text-2xl mr-3">{level.icon}</span>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">Level {level.level}</h4>
                  <span className={`text-sm font-medium ${level.color}`}>{level.title}</span>
                  {level.level === currentLevel && (
                    <span className="px-2 py-1 bg-primary-500 text-white text-xs rounded-full">Aktuální</span>
                  )}
                  {level.level < currentLevel && (
                    <span className="text-green-500">✅</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{level.description}</p>
                {level.rewards.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {level.rewards.map((reward, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                        🎁 {reward.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {level.xpRequired.toLocaleString()} XP
                </div>
                {level.level > currentLevel && (
                  <div className="text-xs text-gray-500">
                    Potřebuješ ještě {(level.xpRequired - xpInCurrentLevel).toLocaleString()} XP
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent XP Gains */}
      {recentXPGains.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">✨ Nedávno získané XP</h3>
          <div className="space-y-2">
            {recentXPGains.map((gain) => (
              <div key={gain.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-green-500">+{gain.amount} XP</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{gain.description}</p>
                    <p className="text-xs text-gray-500">{gain.source}</p>
                  </div>
                </div>
                <div className="text-right">
                  {gain.multiplier && gain.multiplier > 1 && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      ⚡ {Math.round((gain.multiplier - 1) * 100)}% bonus
                    </span>
                  )}
                  <p className="text-xs text-gray-500">
                    {gain.timestamp.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Level Up Modal */}
      {showLevelUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gratulujeme!</h2>
            <p className="text-lg text-primary-600 mb-4">
              Dosáhl jsi <strong>Level {showLevelUpModal.level}</strong>!
            </p>
            
            <div className="flex items-center justify-center space-x-3 mb-4">
              <span className="text-3xl">{showLevelUpModal.icon}</span>
              <div>
                <h3 className={`font-bold ${showLevelUpModal.color}`}>{showLevelUpModal.title}</h3>
                <p className="text-sm text-gray-600">{showLevelUpModal.description}</p>
              </div>
            </div>

            {showLevelUpModal.rewards.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">🎁 Odměny:</h4>
                <div className="space-y-1">
                  {showLevelUpModal.rewards.map((reward, index) => (
                    <div key={index} className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2">
                      <span className="font-medium">{reward.name}</span>
                      <p className="text-xs text-gray-600">{reward.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowLevelUpModal(null)}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Pokračovat
            </button>
          </div>
        </div>
      )}

      {/* XP Award Function - exposed via ref or context */}
      <div style={{ display: 'none' }}>
        {/* This component exposes awardXP function via parent component */}
      </div>
    </div>
  );
};

// Export the awardXP function for use by other components
export const useXPSystem = () => {
  const awardXP = (amount: number, source: string, description: string) => {
    // This would be connected to the XPSystem component instance
    console.log(`Awarding ${amount} XP from ${source}: ${description}`);
  };

  return { awardXP };
};