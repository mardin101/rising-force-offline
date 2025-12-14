import { useState } from 'react';
import {
  POTION_PRICES,
} from '../../state/gameStateSlice';
import { getShopHPPotions } from '../../data/potions/loadPotions';
import { getAssetPath } from '../../utils/assets';
import ShopModal from './ShopModal';
import './Shop.css';

export interface ShopProps {
  playerGold: number;
  playerLevel: number;
  playerRace: string;
  onPurchase: (potionId: string, quantity: number) => { success: boolean; message: string };
}

/**
 * Shop - A component that displays potions for sale
 *
 * Features:
 * - Displays all HP potions available for purchase from potions.json
 * - Filters potions by player race (Bellato, Cora, Accretia)
 * - Click on a potion to open the purchase modal
 * - Shows level requirements for each potion
 */
export default function Shop({ playerGold, playerLevel, playerRace, onPurchase }: ShopProps) {
  const [selectedPotionId, setSelectedPotionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get all shop HP potions for the player's race
  const shopPotions = getShopHPPotions(playerRace);

  const handlePotionClick = (potionId: string) => {
    setSelectedPotionId(potionId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPotionId(null);
  };

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h2 className="shop-title">🏪 Potion Shop</h2>
        <div className="shop-gold">
          <span className="shop-gold-label">Gold:</span>
          <span className="shop-gold-value">{playerGold}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shopPotions.map((potionData) => {
          const price = POTION_PRICES[potionData.id] ?? 0;
          const meetsLevelRequirement = !potionData.levelRequirement || playerLevel >= potionData.levelRequirement;

          return (
            <button
              key={potionData.id}
              className={`bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 hover:bg-gray-700/50 transition-colors text-center ${
                !meetsLevelRequirement ? 'opacity-60' : ''
              }`}
              onClick={() => handlePotionClick(potionData.id)}
              title={`${potionData.name}: ${potionData.description}`}
            >
              {potionData.image && (
                <div className="flex justify-center mb-3">
                  <img 
                    src={getAssetPath(potionData.image)} 
                    alt={potionData.name} 
                    className="w-32 h-32 object-contain rounded border border-gray-600 bg-gray-900/50"
                  />
                </div>
              )}
              <div className="mb-3">
                <h4 className="text-xl font-bold text-blue-400 mb-1">{potionData.name}</h4>
                <p className="text-sm text-gray-400">+{potionData.amount} {potionData.potionType || 'HP'}</p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-yellow-400">
                  <span className="text-gray-500">Price:</span> {price} gold
                </p>
                {potionData.levelRequirement && (
                  <p className={meetsLevelRequirement ? 'text-green-400' : 'text-red-400'}>
                    <span className="text-gray-500">Level:</span> {potionData.levelRequirement}+
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <ShopModal
        key={selectedPotionId ?? 'closed'}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedPotionId={selectedPotionId}
        playerGold={playerGold}
        playerLevel={playerLevel}
        onPurchase={onPurchase}
      />
    </div>
  );
}
