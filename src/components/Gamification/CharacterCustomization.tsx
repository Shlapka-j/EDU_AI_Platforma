import React, { useState, useEffect } from 'react';

interface CharacterItem {
  id: string;
  name: string;
  description: string;
  type: 'hat' | 'glasses' | 'clothing' | 'accessory' | 'background' | 'effect' | 'badge_display';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'exam_exclusive';
  icon: string;
  imageUrl?: string;
  isUnlocked: boolean;
  isEquipped: boolean;
  unlockSource: 'shop' | 'exam' | 'achievement' | 'level' | 'special';
  examRequired?: string; // Which exam unlocks this item
  examScore?: number; // Minimum score required (0-100)
  animationEffect?: string;
  glowColor?: string;
}

interface ExamReward {
  examId: string;
  examName: string;
  subject: string;
  rewards: CharacterItem[];
  scoreThresholds: {
    bronze: number; // 60%
    silver: number; // 80%
    gold: number;   // 95%
    perfect: number; // 100%
  };
}

interface CharacterCustomizationProps {
  studentId: string;
  examResults: any[];
  onItemEquipped?: (item: CharacterItem) => void;
  onExamRewardUnlocked?: (exam: ExamReward, items: CharacterItem[]) => void;
}

export const CharacterCustomization: React.FC<CharacterCustomizationProps> = ({
  studentId,
  examResults,
  onItemEquipped,
  onExamRewardUnlocked
}) => {
  const [characterItems, setCharacterItems] = useState<CharacterItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<CharacterItem[]>([]);
  const [availableExamRewards, setAvailableExamRewards] = useState<ExamReward[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showItemModal, setShowItemModal] = useState<CharacterItem | null>(null);
  const [newUnlocks, setNewUnlocks] = useState<CharacterItem[]>([]);

  useEffect(() => {
    initializeCharacterItems();
    loadEquippedItems();
  }, [studentId]);

  useEffect(() => {
    if (examResults && examResults.length > 0) {
      checkExamRewards();
    }
  }, [examResults]);

  const initializeCharacterItems = () => {
    const examRewards: ExamReward[] = [
      // Physics Exam Rewards
      {
        examId: 'physics_mechanics',
        examName: 'Mechanika',
        subject: 'Fyzika',
        scoreThresholds: { bronze: 60, silver: 80, gold: 95, perfect: 100 },
        rewards: [
          {
            id: 'mechanics_bronze_gear',
            name: 'Bronzové ozubené kolo',
            description: 'Odznak za zvládnutí základů mechaniky',
            type: 'badge_display',
            rarity: 'common',
            icon: '⚙️',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_mechanics',
            examScore: 60,
            glowColor: '#cd7f32'
          },
          {
            id: 'mechanics_silver_pendulum',
            name: 'Stříbrné kyvadlo',
            description: 'Elegantní kyvadlo za pokročilé znalosti mechaniky',
            type: 'accessory',
            rarity: 'rare',
            icon: '⏱️',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_mechanics',
            examScore: 80,
            animationEffect: 'swing',
            glowColor: '#c0c0c0'
          },
          {
            id: 'mechanics_gold_crown',
            name: 'Zlatá koruna mechaniky',
            description: 'Královská koruna pro mistry mechaniky',
            type: 'hat',
            rarity: 'epic',
            icon: '👑',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_mechanics',
            examScore: 95,
            animationEffect: 'sparkle',
            glowColor: '#ffd700'
          },
          {
            id: 'mechanics_perfect_aura',
            name: 'Aura perfektní mechaniky',
            description: 'Mystická aura obklopující perfektní fyziky',
            type: 'effect',
            rarity: 'legendary',
            icon: '✨',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_mechanics',
            examScore: 100,
            animationEffect: 'orbital_glow',
            glowColor: '#ff6b6b'
          }
        ]
      },

      // Thermodynamics Exam
      {
        examId: 'physics_thermodynamics',
        examName: 'Termodynamika',
        subject: 'Fyzika',
        scoreThresholds: { bronze: 60, silver: 80, gold: 95, perfect: 100 },
        rewards: [
          {
            id: 'thermo_bronze_thermometer',
            name: 'Bronzový teploměr',
            description: 'Klasický teploměr za znalost teploty',
            type: 'accessory',
            rarity: 'common',
            icon: '🌡️',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_thermodynamics',
            examScore: 60,
            glowColor: '#cd7f32'
          },
          {
            id: 'thermo_silver_flame',
            name: 'Stříbrný plamen',
            description: 'Věčný plamen pro znalce tepelné energie',
            type: 'effect',
            rarity: 'rare',
            icon: '🔥',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_thermodynamics',
            examScore: 80,
            animationEffect: 'flicker',
            glowColor: '#c0c0c0'
          },
          {
            id: 'thermo_gold_goggles',
            name: 'Zlaté tepelné brýle',
            description: 'Speciální brýle pro pozorování tepelného záření',
            type: 'glasses',
            rarity: 'epic',
            icon: '🥽',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_thermodynamics',
            examScore: 95,
            animationEffect: 'heat_vision',
            glowColor: '#ffd700'
          },
          {
            id: 'thermo_perfect_frost_fire',
            name: 'Mrazivý plamen dokonalosti',
            description: 'Jedinečná kombinace ledu a ohně pro perfektní termodynamiky',
            type: 'background',
            rarity: 'legendary',
            icon: '❄️🔥',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_thermodynamics',
            examScore: 100,
            animationEffect: 'frost_fire_spiral',
            glowColor: '#00ffff'
          }
        ]
      },

      // Optics Exam
      {
        examId: 'physics_optics',
        examName: 'Optika',
        subject: 'Fyzika',
        scoreThresholds: { bronze: 60, silver: 80, gold: 95, perfect: 100 },
        rewards: [
          {
            id: 'optics_bronze_lens',
            name: 'Bronzová čočka',
            description: 'Jednoduchá čočka pro začínající optiky',
            type: 'accessory',
            rarity: 'common',
            icon: '🔍',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_optics',
            examScore: 60,
            glowColor: '#cd7f32'
          },
          {
            id: 'optics_silver_prism',
            name: 'Stříbrný hranol',
            description: 'Hranol rozkládající světlo na barvy spektra',
            type: 'accessory',
            rarity: 'rare',
            icon: '🔺',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_optics',
            examScore: 80,
            animationEffect: 'rainbow_refraction',
            glowColor: '#c0c0c0'
          },
          {
            id: 'optics_gold_laser_hat',
            name: 'Zlatá laserová čepice',
            description: 'High-tech čepice s holografickými efekty',
            type: 'hat',
            rarity: 'epic',
            icon: '🎩',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_optics',
            examScore: 95,
            animationEffect: 'laser_show',
            glowColor: '#ffd700'
          },
          {
            id: 'optics_perfect_light_being',
            name: 'Bytost ze světla',
            description: 'Transformace do bytosti z čistého světla',
            type: 'effect',
            rarity: 'legendary',
            icon: '💫',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_optics',
            examScore: 100,
            animationEffect: 'light_transformation',
            glowColor: '#ffffff'
          }
        ]
      },

      // Electricity Exam
      {
        examId: 'physics_electricity',
        examName: 'Elektřina a magnetismus',
        subject: 'Fyzika',
        scoreThresholds: { bronze: 60, silver: 80, gold: 95, perfect: 100 },
        rewards: [
          {
            id: 'electric_bronze_bolt',
            name: 'Bronzový blesk',
            description: 'Malý elektrický blesk pro začátečníky',
            type: 'effect',
            rarity: 'common',
            icon: '⚡',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_electricity',
            examScore: 60,
            animationEffect: 'small_spark',
            glowColor: '#cd7f32'
          },
          {
            id: 'electric_silver_tesla_coil',
            name: 'Stříbrná Teslova cívka',
            description: 'Miniaturní Teslova cívka generující elektrické oblouky',
            type: 'accessory',
            rarity: 'rare',
            icon: '🗲',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_electricity',
            examScore: 80,
            animationEffect: 'tesla_arcs',
            glowColor: '#c0c0c0'
          },
          {
            id: 'electric_gold_conductor_crown',
            name: 'Zlatá koruna vodiče',
            description: 'Elektricky vodivá koruna s magnetickými vlastnostmi',
            type: 'hat',
            rarity: 'epic',
            icon: '⚡👑',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_electricity',
            examScore: 95,
            animationEffect: 'magnetic_field',
            glowColor: '#ffd700'
          },
          {
            id: 'electric_perfect_storm',
            name: 'Dokonalá bouře',
            description: 'Ovládání blesku a hromu jako bůh bouře',
            type: 'background',
            rarity: 'legendary',
            icon: '🌩️',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_electricity',
            examScore: 100,
            animationEffect: 'lightning_storm',
            glowColor: '#9370db'
          }
        ]
      },

      // Quantum Physics Exam (Advanced)
      {
        examId: 'physics_quantum',
        examName: 'Kvantová fyzika',
        subject: 'Fyzika',
        scoreThresholds: { bronze: 60, silver: 80, gold: 95, perfect: 100 },
        rewards: [
          {
            id: 'quantum_bronze_atom',
            name: 'Bronzový atom',
            description: 'Základní model atomu s orbitujícími elektrony',
            type: 'accessory',
            rarity: 'common',
            icon: '⚛️',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_quantum',
            examScore: 60,
            animationEffect: 'orbital_motion',
            glowColor: '#cd7f32'
          },
          {
            id: 'quantum_silver_uncertainty',
            name: 'Stříbrná nejistota',
            description: 'Efekt kvantové nejistoty - někdy viditelný, někdy ne',
            type: 'effect',
            rarity: 'rare',
            icon: '🌀',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_quantum',
            examScore: 80,
            animationEffect: 'quantum_flicker',
            glowColor: '#c0c0c0'
          },
          {
            id: 'quantum_gold_schrodinger',
            name: 'Zlatá Schrödingerova čepice',
            description: 'Čepice existující v superpozici všech stylů současně',
            type: 'hat',
            rarity: 'epic',
            icon: '🎭',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_quantum',
            examScore: 95,
            animationEffect: 'superposition',
            glowColor: '#ffd700'
          },
          {
            id: 'quantum_perfect_multiverse',
            name: 'Multiverzální existence',
            description: 'Existence ve všech možných realitách současně',
            type: 'background',
            rarity: 'legendary',
            icon: '🌌',
            isUnlocked: false,
            isEquipped: false,
            unlockSource: 'exam',
            examRequired: 'physics_quantum',
            examScore: 100,
            animationEffect: 'multiverse_shift',
            glowColor: '#ff69b4'
          }
        ]
      }
    ];

    setAvailableExamRewards(examRewards);
    
    // Flatten all rewards into character items
    const allItems = examRewards.flatMap(exam => exam.rewards);
    setCharacterItems(allItems);
  };

  const checkExamRewards = () => {
    const newlyUnlocked: CharacterItem[] = [];

    examResults.forEach(result => {
      const examReward = availableExamRewards.find(er => er.examId === result.examId);
      if (!examReward) return;

      const scorePercentage = (result.score / result.maxScore) * 100;

      examReward.rewards.forEach(item => {
        if (!item.isUnlocked && item.examScore && scorePercentage >= item.examScore) {
          const unlockedItem = { ...item, isUnlocked: true };
          newlyUnlocked.push(unlockedItem);
        }
      });
    });

    if (newlyUnlocked.length > 0) {
      setCharacterItems(prev => prev.map(item => {
        const unlocked = newlyUnlocked.find(u => u.id === item.id);
        return unlocked ? unlocked : item;
      }));

      setNewUnlocks(newlyUnlocked);
      
      // Show unlock animation/notification
      setTimeout(() => setNewUnlocks([]), 5000);
    }
  };

  const loadEquippedItems = async () => {
    try {
      const response = await fetch(`/api/gamification/character/equipped/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEquippedItems(data.data.equippedItems || []);
      }
    } catch (error) {
      console.error('Error loading equipped items:', error);
    }
  };

  const equipItem = async (item: CharacterItem) => {
    if (!item.isUnlocked) return;

    try {
      // Unequip items of the same type first
      const updatedEquipped = equippedItems.filter(equipped => equipped.type !== item.type);
      const newEquipped = [...updatedEquipped, { ...item, isEquipped: true }];

      const response = await fetch('/api/gamification/character/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          studentId,
          itemId: item.id,
          itemType: item.type
        })
      });

      if (response.ok) {
        setEquippedItems(newEquipped);
        setCharacterItems(prev => prev.map(charItem => ({
          ...charItem,
          isEquipped: charItem.type === item.type ? charItem.id === item.id : charItem.isEquipped
        })));
        
        onItemEquipped?.(item);
      }
    } catch (error) {
      console.error('Error equipping item:', error);
    }
  };

  const unequipItem = async (item: CharacterItem) => {
    try {
      const response = await fetch('/api/gamification/character/unequip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          studentId,
          itemId: item.id,
          itemType: item.type
        })
      });

      if (response.ok) {
        setEquippedItems(prev => prev.filter(equipped => equipped.id !== item.id));
        setCharacterItems(prev => prev.map(charItem => 
          charItem.id === item.id ? { ...charItem, isEquipped: false } : charItem
        ));
      }
    } catch (error) {
      console.error('Error unequipping item:', error);
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      case 'exam_exclusive': return 'border-red-300 bg-red-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 95) return 'text-yellow-600'; // Gold
    if (score >= 80) return 'text-gray-600';   // Silver
    if (score >= 60) return 'text-orange-600'; // Bronze
    return 'text-gray-400';
  };

  const filteredItems = selectedCategory === 'all' 
    ? characterItems 
    : characterItems.filter(item => item.type === selectedCategory);

  const categories = [
    { id: 'all', name: 'Vše', icon: '👤' },
    { id: 'hat', name: 'Pokrývky hlavy', icon: '🎩' },
    { id: 'glasses', name: 'Brýle', icon: '🤓' },
    { id: 'clothing', name: 'Oblečení', icon: '👕' },
    { id: 'accessory', name: 'Doplňky', icon: '💍' },
    { id: 'effect', name: 'Efekty', icon: '✨' },
    { id: 'background', name: 'Pozadí', icon: '🖼️' },
    { id: 'badge_display', name: 'Odznaky', icon: '🏆' }
  ];

  return (
    <div className="space-y-6">
      {/* Character Preview */}
      <div className="bg-gradient-to-b from-blue-400 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">👤 Tvá postava</h2>
        
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            {/* Character Base */}
            <div className="text-6xl">🧑‍🎓</div>
            
            {/* Equipped Items Overlay */}
            {equippedItems.map(item => (
              <div 
                key={item.id}
                className={`absolute text-2xl ${item.animationEffect ? 'animate-pulse' : ''}`}
                style={{ 
                  color: item.glowColor,
                  filter: item.glowColor ? `drop-shadow(0 0 8px ${item.glowColor})` : 'none'
                }}
              >
                {item.icon}
              </div>
            ))}
          </div>
        </div>

        {/* Equipped Items List */}
        <div className="text-center">
          <h3 className="font-medium mb-2">Nasazené předměty:</h3>
          {equippedItems.length > 0 ? (
            <div className="flex justify-center flex-wrap gap-2">
              {equippedItems.map(item => (
                <span key={item.id} className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                  {item.icon} {item.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-blue-100">Žádné předměty nejsou nasazeny</p>
          )}
        </div>
      </div>

      {/* New Unlocks Notification */}
      {newUnlocks.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {newUnlocks.map(item => (
            <div key={item.id} className="bg-yellow-400 text-yellow-900 p-4 rounded-lg shadow-lg animate-bounce">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-bold">Nový předmět odemčen!</p>
                  <p className="text-sm">{item.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exam Progress */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Pokrok ve zkouškách</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableExamRewards.map(exam => {
            const examResult = examResults.find(r => r.examId === exam.examId);
            const score = examResult ? (examResult.score / examResult.maxScore) * 100 : 0;
            
            return (
              <div key={exam.examId} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{exam.examName}</h4>
                <p className="text-sm text-gray-600">{exam.subject}</p>
                
                <div className="mt-2 space-y-1">
                  {[
                    { name: 'Bronz', threshold: exam.scoreThresholds.bronze, icon: '🥉' },
                    { name: 'Stříbro', threshold: exam.scoreThresholds.silver, icon: '🥈' },
                    { name: 'Zlato', threshold: exam.scoreThresholds.gold, icon: '🥇' },
                    { name: 'Dokonalost', threshold: exam.scoreThresholds.perfect, icon: '💎' }
                  ].map(tier => (
                    <div key={tier.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center space-x-1">
                        <span>{tier.icon}</span>
                        <span>{tier.name}</span>
                      </span>
                      <span className={score >= tier.threshold ? 'text-green-600' : 'text-gray-400'}>
                        {score >= tier.threshold ? '✅' : `${tier.threshold}%`}
                      </span>
                    </div>
                  ))}
                </div>
                
                {examResult && (
                  <div className="mt-2 text-sm">
                    <span className={`font-medium ${getScoreColor(score)}`}>
                      Tvé skóre: {Math.round(score)}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
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

      {/* Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={`border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-lg ${getRarityColor(item.rarity)} ${
              item.isEquipped ? 'ring-2 ring-green-500' : ''
            } ${!item.isUnlocked ? 'opacity-50' : ''}`}
          >
            <div className="text-center">
              <div 
                className={`text-3xl mb-2 ${item.animationEffect ? 'animate-pulse' : ''}`}
                style={{ 
                  filter: item.glowColor && item.isUnlocked ? `drop-shadow(0 0 4px ${item.glowColor})` : 'none'
                }}
              >
                {item.isUnlocked ? item.icon : '🔒'}
              </div>
              
              <h4 className="font-medium text-gray-900 text-sm mb-1">{item.name}</h4>
              <p className="text-xs text-gray-600 mb-2">{item.description}</p>
              
              {/* Unlock Requirements */}
              {!item.isUnlocked && item.examRequired && (
                <div className="text-xs text-red-600 mb-2">
                  Vyžaduje: {item.examRequired} ({item.examScore}%+)
                </div>
              )}
              
              {/* Rarity Badge */}
              <div className="mb-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  item.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                  item.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                  item.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.rarity === 'legendary' ? 'Legendární' :
                   item.rarity === 'epic' ? 'Epický' :
                   item.rarity === 'rare' ? 'Vzácný' :
                   item.rarity === 'exam_exclusive' ? 'Exkluzivní' : 'Obyčejný'}
                </span>
              </div>
              
              {/* Action Button */}
              {item.isUnlocked && (
                <button
                  onClick={() => item.isEquipped ? unequipItem(item) : equipItem(item)}
                  className={`text-xs px-3 py-1 rounded transition-colors ${
                    item.isEquipped
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {item.isEquipped ? 'Sundat' : 'Nasadit'}
                </button>
              )}
              
              {!item.isUnlocked && (
                <div className="text-xs text-gray-500">
                  Nedostupné
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Item Detail Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">{showItemModal.icon}</div>
              <h3 className="text-xl font-bold text-gray-900">{showItemModal.name}</h3>
              <p className="text-gray-600 mt-1">{showItemModal.description}</p>
            </div>

            {showItemModal.animationEffect && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  ✨ Speciální efekt: {showItemModal.animationEffect}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowItemModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Zavřít
              </button>
              {showItemModal.isUnlocked && (
                <button
                  onClick={() => {
                    showItemModal.isEquipped ? unequipItem(showItemModal) : equipItem(showItemModal);
                    setShowItemModal(null);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    showItemModal.isEquipped
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {showItemModal.isEquipped ? 'Sundat' : 'Nasadit'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};