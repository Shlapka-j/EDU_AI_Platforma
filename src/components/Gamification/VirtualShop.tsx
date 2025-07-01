import React, { useState, useEffect } from 'react';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'coins' | 'gems' | 'xp';
  category: 'avatar' | 'theme' | 'power_up' | 'tools' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  imageUrl?: string;
  isOwned: boolean;
  isLimited?: boolean;
  limitedTime?: Date;
  levelRequired?: number;
  discount?: number;
  effects?: ItemEffect[];
}

interface ItemEffect {
  type: 'xp_multiplier' | 'time_bonus' | 'hint_discount' | 'extra_life' | 'unlock_feature';
  value: number | string;
  duration?: number; // in minutes
  description: string;
}

interface PlayerCurrency {
  coins: number;
  gems: number;
  xp: number;
}

interface VirtualShopProps {
  studentId: string;
  playerCurrency: PlayerCurrency;
  playerLevel: number;
  onPurchase?: (item: ShopItem, newCurrency: PlayerCurrency) => void;
  onItemUse?: (item: ShopItem) => void;
}

interface PurchaseHistory {
  id: string;
  itemId: string;
  itemName: string;
  price: number;
  currency: string;
  purchasedAt: Date;
}

export const VirtualShop: React.FC<VirtualShopProps> = ({
  studentId,
  playerCurrency,
  playerLevel,
  onPurchase,
  onItemUse
}) => {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [ownedItems, setOwnedItems] = useState<ShopItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPurchaseModal, setShowPurchaseModal] = useState<ShopItem | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [currentCurrency, setCurrentCurrency] = useState<PlayerCurrency>(playerCurrency);

  useEffect(() => {
    initializeShop();
    loadPlayerInventory();
    loadPurchaseHistory();
  }, [studentId]);

  useEffect(() => {
    setCurrentCurrency(playerCurrency);
  }, [playerCurrency]);

  const initializeShop = async () => {
    try {
      const response = await fetch('/api/gamification/shop/items', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setShopItems(data.data);
      } else {
        loadDefaultShopItems();
      }
    } catch (error) {
      console.error('Error loading shop items:', error);
      loadDefaultShopItems();
    }
  };

  const loadDefaultShopItems = () => {
    const defaultItems: ShopItem[] = [
      // Avatar Items
      {
        id: 'avatar_scientist_coat',
        name: 'Vědecký plášť',
        description: 'Stylový bílý laboratorní plášť pro skutečné vědce',
        price: 500,
        currency: 'coins',
        category: 'avatar',
        rarity: 'common',
        icon: '🥼',
        isOwned: false,
        levelRequired: 5
      },
      {
        id: 'avatar_safety_goggles',
        name: 'Ochranné brýle',
        description: 'Profesionální ochranné brýle pro experimentování',
        price: 300,
        currency: 'coins',
        category: 'avatar',
        rarity: 'common',
        icon: '🥽',
        isOwned: false
      },
      {
        id: 'avatar_genius_hair',
        name: 'Géniův účes',
        description: 'Ikonický rozcuch jako má Einstein',
        price: 1000,
        currency: 'coins',
        category: 'avatar',
        rarity: 'rare',
        icon: '👨‍🔬',
        isOwned: false,
        levelRequired: 15
      },

      // Themes
      {
        id: 'theme_dark_mode',
        name: 'Tmavý režim',
        description: 'Elegantní tmavé rozhraní šetřící oči',
        price: 750,
        currency: 'coins',
        category: 'theme',
        rarity: 'rare',
        icon: '🌙',
        isOwned: false,
        levelRequired: 10
      },
      {
        id: 'theme_rainbow',
        name: 'Duhový motiv',
        description: 'Barevný motiv pro veselé učení',
        price: 1200,
        currency: 'coins',
        category: 'theme',
        rarity: 'epic',
        icon: '🌈',
        isOwned: false,
        levelRequired: 20
      },

      // Power-ups
      {
        id: 'powerup_double_xp',
        name: 'Dvojitý XP (1h)',
        description: 'Získávej dvojnásobné XP po dobu 1 hodiny',
        price: 100,
        currency: 'gems',
        category: 'power_up',
        rarity: 'rare',
        icon: '⚡',
        isOwned: false,
        effects: [{
          type: 'xp_multiplier',
          value: 2,
          duration: 60,
          description: 'Dvojnásobné XP na 60 minut'
        }]
      },
      {
        id: 'powerup_extra_time',
        name: 'Extra čas',
        description: 'Přidá 5 minut k časovému limitu kvízu',
        price: 50,
        currency: 'gems',
        category: 'power_up',
        rarity: 'common',
        icon: '⏰',
        isOwned: false,
        effects: [{
          type: 'time_bonus',
          value: 300, // 5 minutes in seconds
          description: 'Přidá 5 minut času'
        }]
      },
      {
        id: 'powerup_hint_pack',
        name: 'Balíček nápověd',
        description: '5 nápověd zdarma pro kvízy',
        price: 25,
        currency: 'gems',
        category: 'power_up',
        rarity: 'common',
        icon: '💡',
        isOwned: false,
        effects: [{
          type: 'hint_discount',
          value: 5,
          description: '5 bezplatných nápověd'
        }]
      },

      // Tools
      {
        id: 'tool_advanced_calculator',
        name: 'Pokročilá kalkulačka',
        description: 'Vědecká kalkulačka s pokročilými funkcemi',
        price: 800,
        currency: 'coins',
        category: 'tools',
        rarity: 'rare',
        icon: '🔬',
        isOwned: false,
        levelRequired: 12,
        effects: [{
          type: 'unlock_feature',
          value: 'advanced_calculator',
          description: 'Odemkne pokročilé kalkulační funkce'
        }]
      },
      {
        id: 'tool_experiment_kit',
        name: 'Experimentální sada',
        description: 'Rozšíří dostupné experimentální nástroje',
        price: 1500,
        currency: 'coins',
        category: 'tools',
        rarity: 'epic',
        icon: '⚗️',
        isOwned: false,
        levelRequired: 18,
        effects: [{
          type: 'unlock_feature',
          value: 'advanced_experiments',
          description: 'Odemkne pokročilé experimenty'
        }]
      },

      // Special Items
      {
        id: 'special_physics_encyclopedia',
        name: 'Fyzikální encyklopedie',
        description: 'Obsáhlá sbírka fyzikálních faktů a teorií',
        price: 2000,
        currency: 'coins',
        category: 'special',
        rarity: 'legendary',
        icon: '📚',
        isOwned: false,
        levelRequired: 25,
        effects: [{
          type: 'unlock_feature',
          value: 'physics_reference',
          description: 'Přístup k obsáhlé fyzikální databázi'
        }]
      },
      {
        id: 'special_time_machine',
        name: 'Časový stroj',
        description: 'Umožňuje vrátit se k předchozím aktivitám',
        price: 500,
        currency: 'gems',
        category: 'special',
        rarity: 'legendary',
        icon: '⏳',
        isOwned: false,
        isLimited: true,
        limitedTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        levelRequired: 30,
        effects: [{
          type: 'unlock_feature',
          value: 'activity_replay',
          description: 'Možnost opakovat dokončené aktivity'
        }]
      }
    ];

    setShopItems(defaultItems);
  };

  const loadPlayerInventory = async () => {
    try {
      const response = await fetch(`/api/gamification/shop/inventory/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOwnedItems(data.data.items || []);
        
        // Update shop items ownership status
        setShopItems(prev => prev.map(item => ({
          ...item,
          isOwned: data.data.items.some((owned: any) => owned.id === item.id)
        })));
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const loadPurchaseHistory = async () => {
    try {
      const response = await fetch(`/api/gamification/shop/history/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPurchaseHistory(data.data.history || []);
      }
    } catch (error) {
      console.error('Error loading purchase history:', error);
    }
  };

  const canAfford = (item: ShopItem): boolean => {
    return currentCurrency[item.currency] >= item.price;
  };

  const canPurchase = (item: ShopItem): boolean => {
    return !item.isOwned && 
           canAfford(item) && 
           (!item.levelRequired || playerLevel >= item.levelRequired) &&
           (!item.limitedTime || new Date() < item.limitedTime);
  };

  const purchaseItem = async (item: ShopItem) => {
    if (!canPurchase(item)) return;

    try {
      const response = await fetch('/api/gamification/shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          studentId,
          itemId: item.id,
          price: item.price,
          currency: item.currency
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update currency
        const newCurrency = {
          ...currentCurrency,
          [item.currency]: currentCurrency[item.currency] - item.price
        };
        setCurrentCurrency(newCurrency);
        
        // Update item ownership
        setShopItems(prev => prev.map(shopItem => 
          shopItem.id === item.id ? { ...shopItem, isOwned: true } : shopItem
        ));
        
        setOwnedItems(prev => [...prev, { ...item, isOwned: true }]);
        
        // Add to purchase history
        const purchase: PurchaseHistory = {
          id: `purchase_${Date.now()}`,
          itemId: item.id,
          itemName: item.name,
          price: item.price,
          currency: item.currency,
          purchasedAt: new Date()
        };
        setPurchaseHistory(prev => [purchase, ...prev]);
        
        onPurchase?.(item, newCurrency);
        setShowPurchaseModal(null);
      }
    } catch (error) {
      console.error('Error purchasing item:', error);
    }
  };

  const useItem = async (item: ShopItem) => {
    if (!item.effects) return;

    try {
      const response = await fetch('/api/gamification/shop/use-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          studentId,
          itemId: item.id,
          effects: item.effects
        })
      });

      if (response.ok) {
        onItemUse?.(item);
        
        // Remove consumable items from inventory
        if (item.category === 'power_up') {
          setOwnedItems(prev => prev.filter(owned => owned.id !== item.id));
          setShopItems(prev => prev.map(shopItem => 
            shopItem.id === item.id ? { ...shopItem, isOwned: false } : shopItem
          ));
        }
      }
    } catch (error) {
      console.error('Error using item:', error);
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getCurrencyIcon = (currency: string): string => {
    switch (currency) {
      case 'coins': return '🪙';
      case 'gems': return '💎';
      case 'xp': return '⭐';
      default: return '💰';
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'Vše', icon: '🏪' },
    { id: 'avatar', name: 'Avatar', icon: '👤' },
    { id: 'theme', name: 'Motivy', icon: '🎨' },
    { id: 'power_up', name: 'Vylepšení', icon: '⚡' },
    { id: 'tools', name: 'Nástroje', icon: '🔧' },
    { id: 'special', name: 'Speciální', icon: '✨' }
  ];

  return (
    <div className="space-y-6">
      {/* Shop Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">🏪 Virtuální obchod</h2>
            <p className="text-purple-100">Nakupuj vylepšení, motivy a speciální předměty</p>
          </div>
          <div className="text-right">
            <button
              onClick={() => setShowInventory(!showInventory)}
              className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              🎒 Inventář
            </button>
          </div>
        </div>

        {/* Currency Display */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">🪙 {currentCurrency.coins.toLocaleString()}</div>
            <div className="text-sm text-purple-100">Mince</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">💎 {currentCurrency.gems.toLocaleString()}</div>
            <div className="text-sm text-purple-100">Drahokamy</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">⭐ {currentCurrency.xp.toLocaleString()}</div>
            <div className="text-sm text-purple-100">XP</div>
          </div>
        </div>
      </div>

      {/* Inventory Modal */}
      {showInventory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">🎒 Tvůj inventář</h3>
                <button
                  onClick={() => setShowInventory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ownedItems.length > 0 ? ownedItems.map(item => (
                  <div key={item.id} className={`border-2 rounded-lg p-4 ${getRarityColor(item.rarity)}`}>
                    <div className="text-center">
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                      
                      {item.effects && item.category === 'power_up' && (
                        <button
                          onClick={() => useItem(item)}
                          className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        >
                          Použít
                        </button>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-8">
                    <div className="text-4xl mb-4">📦</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Prázdný inventář</h4>
                    <p className="text-gray-600">Zatím nevlastníš žádné předměty z obchodu</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

      {/* Shop Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={`border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-lg ${getRarityColor(item.rarity)} ${
              item.isOwned ? 'opacity-75' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{item.icon}</div>
              <div className="flex flex-col items-end space-y-1">
                {item.isLimited && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    Limitovaný
                  </span>
                )}
                {item.discount && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    -{item.discount}%
                  </span>
                )}
              </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{item.description}</p>

            {/* Effects */}
            {item.effects && (
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">Efekty:</div>
                {item.effects.map((effect, index) => (
                  <div key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mb-1">
                    {effect.description}
                  </div>
                ))}
              </div>
            )}

            {/* Requirements */}
            {item.levelRequired && (
              <div className="mb-3">
                <span className={`text-xs px-2 py-1 rounded ${
                  playerLevel >= item.levelRequired 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  Vyžaduje Level {item.levelRequired}
                </span>
              </div>
            )}

            {/* Price and Purchase */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getCurrencyIcon(item.currency)}</span>
                <span className="font-bold text-lg">
                  {item.discount 
                    ? Math.floor(item.price * (1 - item.discount / 100)).toLocaleString()
                    : item.price.toLocaleString()
                  }
                </span>
                {item.discount && (
                  <span className="text-sm text-gray-500 line-through">
                    {item.price.toLocaleString()}
                  </span>
                )}
              </div>

              {item.isOwned ? (
                <span className="text-sm font-medium text-green-600">✅ Vlastníš</span>
              ) : (
                <button
                  onClick={() => setShowPurchaseModal(item)}
                  disabled={!canPurchase(item)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    canPurchase(item)
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {!canAfford(item) ? 'Nedostatek' :
                   item.levelRequired && playerLevel < item.levelRequired ? 'Zamčeno' :
                   'Koupit'}
                </button>
              )}
            </div>

            {/* Limited Time Countdown */}
            {item.isLimited && item.limitedTime && (
              <div className="mt-2 text-xs text-red-600">
                Dostupný do: {item.limitedTime.toLocaleDateString('cs-CZ')}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">{showPurchaseModal.icon}</div>
              <h3 className="text-xl font-bold text-gray-900">{showPurchaseModal.name}</h3>
              <p className="text-gray-600 mt-1">{showPurchaseModal.description}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Cena:</span>
                <span className="flex items-center space-x-2">
                  <span>{getCurrencyIcon(showPurchaseModal.currency)}</span>
                  <span className="font-bold">{showPurchaseModal.price.toLocaleString()}</span>
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Tvůj zůstatek:</span>
                <span className="text-sm">
                  {currentCurrency[showPurchaseModal.currency].toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Po nákupu:</span>
                <span className="text-sm font-medium">
                  {(currentCurrency[showPurchaseModal.currency] - showPurchaseModal.price).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowPurchaseModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Zrušit
              </button>
              <button
                onClick={() => purchaseItem(showPurchaseModal)}
                disabled={!canPurchase(showPurchaseModal)}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Potvrdit nákup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};