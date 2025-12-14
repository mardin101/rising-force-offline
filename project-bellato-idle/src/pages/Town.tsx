import { useState } from 'react';
import { QuestMaster, QuestProgress } from '../components/game';
import { Shop, WeaponShop, ArmorShop, ShieldShop } from '../components/ui';
import { useGameState } from '../state/GameStateContext';

export default function Town() {
  const { gameState, purchasePotion, purchaseEquipment } = useGameState();
  const playerGold = gameState.character?.gold ?? 0;
  const playerLevel = gameState.character?.level ?? 1;
  const playerRace = gameState.character?.generalInfo.race ?? 'Bellato';

  // State for which shop modal is open
  const [openShop, setOpenShop] = useState<'potion' | 'weapon' | 'armor' | 'shield' | null>(null);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-amber-400 mb-4">Town Hub</h1>
      <p className="text-gray-300 mb-6">
        Welcome to the town! Here you can manage your inventory, visit merchants,
        and prepare for your next adventure.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shops Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">🏪 Town Shops</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Potion Shop */}
            <button
              onClick={() => setOpenShop('potion')}
              className="bg-gradient-to-br from-green-900 to-green-700 hover:from-green-800 hover:to-green-600 rounded-lg p-6 border-2 border-green-500 transition-all hover:scale-105 shadow-lg"
            >
              <div className="text-4xl mb-2">🧪</div>
              <div className="text-xl font-bold text-white">Potion Shop</div>
              <div className="text-sm text-green-200 mt-1">Healing Items</div>
            </button>

            {/* Weapon Shop */}
            <button
              onClick={() => setOpenShop('weapon')}
              className="bg-gradient-to-br from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 rounded-lg p-6 border-2 border-red-500 transition-all hover:scale-105 shadow-lg"
            >
              <div className="text-4xl mb-2">⚔️</div>
              <div className="text-xl font-bold text-white">Weapon Shop</div>
              <div className="text-sm text-red-200 mt-1">Swords & Guns</div>
            </button>

            {/* Armor Shop */}
            <button
              onClick={() => setOpenShop('armor')}
              className="bg-gradient-to-br from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 rounded-lg p-6 border-2 border-blue-500 transition-all hover:scale-105 shadow-lg"
            >
              <div className="text-4xl mb-2">🥋</div>
              <div className="text-xl font-bold text-white">Armor Shop</div>
              <div className="text-sm text-blue-200 mt-1">Protective Gear</div>
            </button>

            {/* Shield Shop */}
            <button
              onClick={() => setOpenShop('shield')}
              className="bg-gradient-to-br from-purple-900 to-purple-700 hover:from-purple-800 hover:to-purple-600 rounded-lg p-6 border-2 border-purple-500 transition-all hover:scale-105 shadow-lg"
            >
              <div className="text-4xl mb-2">🛡️</div>
              <div className="text-xl font-bold text-white">Shield Shop</div>
              <div className="text-sm text-purple-200 mt-1">Defensive Shields</div>
            </button>
          </div>
        </div>

        {/* Quest Progress Section */}
        <div>
          <QuestProgress />
        </div>

        {/* Quest Master NPC */}
        <div>
          <QuestMaster />
        </div>
      </div>

      {/* Shop Modals - Only render when opened */}
      {openShop === 'potion' && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setOpenShop(null)}
                className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold"
                aria-label="Close shop"
              >
                ×
              </button>
              <Shop playerGold={playerGold} playerLevel={playerLevel} playerRace={playerRace} onPurchase={purchasePotion} />
            </div>
          </div>
        </div>
      )}

      {openShop === 'weapon' && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setOpenShop(null)}
                className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold"
                aria-label="Close shop"
              >
                ×
              </button>
              <WeaponShop playerGold={playerGold} playerLevel={playerLevel} playerRace={playerRace} onPurchase={purchaseEquipment} />
            </div>
          </div>
        </div>
      )}

      {openShop === 'armor' && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setOpenShop(null)}
                className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold"
                aria-label="Close shop"
              >
                ×
              </button>
              <ArmorShop playerGold={playerGold} playerLevel={playerLevel} playerRace={playerRace} onPurchase={purchaseEquipment} />
            </div>
          </div>
        </div>
      )}

      {openShop === 'shield' && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setOpenShop(null)}
                className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold"
                aria-label="Close shop"
              >
                ×
              </button>
              <ShieldShop playerGold={playerGold} playerLevel={playerLevel} playerRace={playerRace} onPurchase={purchaseEquipment} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
