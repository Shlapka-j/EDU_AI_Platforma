import React, { useState } from 'react';

interface CharacterTrait {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'appearance' | 'personality' | 'academic' | 'special';
  unlocked: boolean;
  cost?: number;
}

interface CharacterCustomizationProps {
  studentId: string;
  currentXP: number;
  onUpdate: (traits: CharacterTrait[]) => void;
}

export const CharacterCustomization: React.FC<CharacterCustomizationProps> = ({
  studentId,
  currentXP,
  onUpdate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'appearance' | 'personality' | 'academic' | 'special'>('appearance');
  const [selectedTraits, setSelectedTraits] = useState<string[]>(['default_avatar', 'curious_mind']);

  const characterTraits: CharacterTrait[] = [
    // Appearance
    { id: 'default_avatar', name: 'Základní avatar', description: 'Klasická postava studenta', icon: '🎓', category: 'appearance', unlocked: true },
    { id: 'scientist_avatar', name: 'Vědec', description: 'Avatar s laboratorním pláštěm', icon: '🧪', category: 'appearance', unlocked: true },
    { id: 'explorer_avatar', name: 'Průzkumník', description: 'Dobrodružný outfit', icon: '🗺️', category: 'appearance', unlocked: false, cost: 100 },
    { id: 'wizard_avatar', name: 'Kouzelník fyziky', description: 'Magický vzhled pro pokročilé', icon: '🧙‍♂️', category: 'appearance', unlocked: false, cost: 250 },
    { id: 'robot_avatar', name: 'Kyborg', description: 'Futuristický robotický vzhled', icon: '🤖', category: 'appearance', unlocked: false, cost: 300 },
    { id: 'ninja_avatar', name: 'Fyzika ninja', description: 'Rychlý a tichý student', icon: '🥷', category: 'appearance', unlocked: false, cost: 200 },

    // Personality
    { id: 'curious_mind', name: 'Zvídavá mysl', description: '+10% XP za kladení otázek', icon: '🤔', category: 'personality', unlocked: true },
    { id: 'perfectionist', name: 'Perfekcionista', description: '+15% XP za 100% skóre', icon: '🎯', category: 'personality', unlocked: false, cost: 150 },
    { id: 'team_player', name: 'Týmový hráč', description: '+20% XP v diskusních módech', icon: '🤝', category: 'personality', unlocked: false, cost: 120 },
    { id: 'speed_learner', name: 'Rychlý student', description: 'Zrychlené načítání materiálů', icon: '⚡', category: 'personality', unlocked: false, cost: 180 },
    { id: 'creative_thinker', name: 'Kreativní myslitel', description: 'Bonusové body za originální řešení', icon: '💡', category: 'personality', unlocked: false, cost: 200 },
    { id: 'patient_learner', name: 'Trpělivý student', description: 'Méně stresu z časových limitů', icon: '🧘', category: 'personality', unlocked: false, cost: 100 },

    // Academic
    { id: 'physics_specialist', name: 'Fyzikální specialista', description: '+25% XP ve fyzice', icon: '⚗️', category: 'academic', unlocked: false, cost: 300 },
    { id: 'math_genius', name: 'Matematický génius', description: '+25% XP v matematice', icon: '📐', category: 'academic', unlocked: false, cost: 300 },
    { id: 'chemistry_lover', name: 'Milovník chemie', description: '+25% XP v chemii', icon: '🧪', category: 'academic', unlocked: false, cost: 300 },
    { id: 'biology_expert', name: 'Biologický expert', description: '+25% XP v biologii', icon: '🌱', category: 'academic', unlocked: false, cost: 300 },
    { id: 'experiment_master', name: 'Mistr experimentů', description: 'Dvojnásobné body za praktické úkoly', icon: '🔬', category: 'academic', unlocked: false, cost: 400 },
    { id: 'theory_scholar', name: 'Teoretik', description: 'Bonusy za teoretické znalosti', icon: '📚', category: 'academic', unlocked: false, cost: 350 },

    // Special (unlocked by achievements)
    { id: 'time_traveler', name: 'Cestovatel časem', description: 'Přístup k pokročilým tématům', icon: '⏰', category: 'special', unlocked: false, cost: 500 },
    { id: 'quantum_student', name: 'Kvantový student', description: 'Může být ve více místech současně', icon: '🌌', category: 'special', unlocked: false, cost: 1000 },
    { id: 'ai_whisperer', name: 'Šeptač AI', description: 'Lepší komunikace s Professor Kwarkem', icon: '🤖', category: 'special', unlocked: false, cost: 750 },
    { id: 'knowledge_hoarder', name: 'Sběratel znalostí', description: 'Dvojnásobné fyzikální fragmenty', icon: '💎', category: 'special', unlocked: false, cost: 600 },
    { id: 'exam_legend', name: 'Legenda zkoušek', description: 'Speciální vizuální efekty při úspěchu', icon: '👑', category: 'special', unlocked: false, cost: 800 }
  ];

  const categories = [
    { id: 'appearance', name: 'Vzhled', icon: '👤', description: 'Změň svůj avatar a styl' },
    { id: 'personality', name: 'Osobnost', icon: '🧠', description: 'Vlastnosti ovlivňující učení' },
    { id: 'academic', name: 'Akademické', icon: '🎓', description: 'Specializace v předmětech' },
    { id: 'special', name: 'Speciální', icon: '✨', description: 'Unikátní schopnosti a efekty' }
  ];

  const getCurrentTraits = () => {
    return characterTraits.filter(trait => selectedTraits.includes(trait.id));
  };

  const getCategoryTraits = () => {
    return characterTraits.filter(trait => trait.category === selectedCategory);
  };

  const purchaseTrait = (traitId: string, cost: number) => {
    if (currentXP >= cost) {
      alert(`✅ Koupeno: ${characterTraits.find(t => t.id === traitId)?.name}\n\nStálo tě to ${cost} XP.\nNová vlastnost je aktivní!`);
      setSelectedTraits(prev => [...prev, traitId]);
      // Here you would update the backend and reduce XP
    } else {
      alert(`❌ Nedostatek XP!\n\nPotřebuješ ${cost} XP, ale máš pouze ${currentXP} XP.\n\nPokračuj v učení pro získání více XP! 💪`);
    }
  };

  const toggleTrait = (traitId: string) => {
    const trait = characterTraits.find(t => t.id === traitId);
    if (!trait) return;

    if (selectedTraits.includes(traitId)) {
      setSelectedTraits(prev => prev.filter(id => id !== traitId));
    } else if (trait.unlocked || !trait.cost) {
      setSelectedTraits(prev => [...prev, traitId]);
    } else if (trait.cost) {
      purchaseTrait(traitId, trait.cost);
    }
  };

  const getTraitEffect = (trait: CharacterTrait) => {
    const effects = {
      curious_mind: 'Získáváš bonus za každou otázku položenou AI tutorovi',
      perfectionist: 'Extra XP za bezchybné řešení kvízů a testů',
      team_player: 'Bonusové body při spolupráci s ostatními studenty',
      speed_learner: 'Rychlejší přístup k novým materiálům a lekcím',
      physics_specialist: 'Specialista na fyziku s bonusovými možnostmi',
      experiment_master: 'Dvojnásobné odměny za praktické experimenty'
    };
    return effects[trait.id as keyof typeof effects] || trait.description;
  };

  const getTotalBonuses = () => {
    const activeTraits = getCurrentTraits();
    const bonuses = {
      xpBonus: 0,
      specialEffects: [] as string[]
    };

    activeTraits.forEach(trait => {
      switch (trait.id) {
        case 'curious_mind':
          bonuses.xpBonus += 10;
          bonuses.specialEffects.push('Bonus za otázky');
          break;
        case 'perfectionist':
          bonuses.xpBonus += 15;
          bonuses.specialEffects.push('Perfektní skóre bonus');
          break;
        case 'physics_specialist':
          bonuses.specialEffects.push('+25% XP ve fyzice');
          break;
        case 'experiment_master':
          bonuses.specialEffects.push('2x body za experimenty');
          break;
      }
    });

    return bonuses;
  };

  const bonuses = getTotalBonuses();

  return (
    <div className="space-y-6">
      {/* Character Preview */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-gray-900 text-glass mb-4">👤 Tvůj charakter</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Character Display */}
          <div className="glass-card p-4 text-center">
            <div className="text-8xl mb-4">
              {selectedTraits.includes('wizard_avatar') ? '🧙‍♂️' :
               selectedTraits.includes('robot_avatar') ? '🤖' :
               selectedTraits.includes('ninja_avatar') ? '🥷' :
               selectedTraits.includes('explorer_avatar') ? '🗺️' :
               selectedTraits.includes('scientist_avatar') ? '🧪' : '🎓'}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-glass mb-2">
              {getCurrentTraits().find(t => t.category === 'appearance')?.name || 'Základní avatar'}
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-glass">
                Celkový XP bonus: +{bonuses.xpBonus}%
              </p>
              <div className="flex flex-wrap gap-1 justify-center">
                {bonuses.specialEffects.map((effect, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {effect}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Active Traits */}
          <div className="glass-card p-4">
            <h4 className="font-semibold text-gray-900 text-glass mb-3">✨ Aktivní vlastnosti</h4>
            <div className="space-y-2">
              {getCurrentTraits().map(trait => (
                <div key={trait.id} className="flex items-center justify-between glass-button p-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{trait.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{trait.name}</span>
                  </div>
                  <button
                    onClick={() => toggleTrait(trait.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ❌
                  </button>
                </div>
              ))}
              {getCurrentTraits().length === 0 && (
                <p className="text-sm text-gray-500 text-glass">Žádné speciální vlastnosti nejsou aktivní</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* XP Display */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="font-semibold text-gray-900 text-glass">Tvoje XP</p>
              <p className="text-sm text-gray-600 text-glass">Pro nákup nových vlastností</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-yellow-600">{currentXP}</p>
            <p className="text-sm text-gray-500 text-glass">dostupné XP</p>
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`p-3 rounded-lg transition-all ${
                selectedCategory === category.id
                  ? 'glass-card-hover bg-blue-100 text-blue-700'
                  : 'glass-button hover:bg-gray-100'
              }`}
            >
              <div className="text-2xl mb-1">{category.icon}</div>
              <p className="text-sm font-medium">{category.name}</p>
              <p className="text-xs text-gray-600 text-glass">{category.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Traits Grid */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-gray-900 text-glass mb-4">
          {categories.find(c => c.id === selectedCategory)?.icon} {categories.find(c => c.id === selectedCategory)?.name}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getCategoryTraits().map(trait => (
            <div
              key={trait.id}
              className={`glass-card p-4 transition-all cursor-pointer ${
                selectedTraits.includes(trait.id)
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : trait.unlocked || !trait.cost
                  ? 'hover:bg-gray-50'
                  : 'opacity-75'
              }`}
              onClick={() => toggleTrait(trait.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{trait.icon}</div>
                <div className="flex flex-col items-end">
                  {trait.cost && !selectedTraits.includes(trait.id) && (
                    <span className="text-sm font-bold text-yellow-600">{trait.cost} XP</span>
                  )}
                  {selectedTraits.includes(trait.id) && (
                    <span className="text-green-500">✅</span>
                  )}
                  {!trait.unlocked && !selectedTraits.includes(trait.id) && (
                    <span className="text-gray-400">🔒</span>
                  )}
                </div>
              </div>
              
              <h4 className="font-semibold text-gray-900 text-glass mb-2">{trait.name}</h4>
              <p className="text-sm text-gray-600 text-glass mb-3">{getTraitEffect(trait)}</p>
              
              {trait.cost && !selectedTraits.includes(trait.id) && (
                <div className="mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      purchaseTrait(trait.id, trait.cost!);
                    }}
                    disabled={currentXP < trait.cost}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentXP >= trait.cost
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {currentXP >= trait.cost ? `Koupit za ${trait.cost} XP` : 'Nedostatek XP'}
                  </button>
                </div>
              )}
              
              {selectedTraits.includes(trait.id) && (
                <div className="mt-3">
                  <div className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium text-center">
                    ✅ Aktivní
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Achievement-based Unlocks Info */}
      <div className="glass-card p-4">
        <h4 className="font-semibold text-gray-900 text-glass mb-3">🏆 Jak odemknout speciální vlastnosti</h4>
        <div className="space-y-2 text-sm text-gray-600 text-glass">
          <p>• 🧙‍♂️ <strong>Kouzelník fyziky:</strong> Dokončit 50 experimentů</p>
          <p>• ⏰ <strong>Cestovatel časem:</strong> Získat 10 perfektních skóre v řadě</p>
          <p>• 🌌 <strong>Kvantový student:</strong> Dokončit pokročilý kurz kvantové fyziky</p>
          <p>• 👑 <strong>Legenda zkoušek:</strong> Být nejlepší student měsíce</p>
        </div>
      </div>
    </div>
  );
};