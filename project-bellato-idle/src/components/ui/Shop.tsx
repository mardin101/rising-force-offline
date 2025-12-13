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

      <div className="shop-items-grid">
        {shopPotions.map((potionData) => {
          const price = POTION_PRICES[potionData.id] ?? 0;
          const meetsLevelRequirement = !potionData.levelRequirement || playerLevel >= potionData.levelRequirement;

          return (
            <button
              key={potionData.id}
              className={`shop-item ${!meetsLevelRequirement ? 'shop-item-locked' : ''}`}
              onClick={() => handlePotionClick(potionData.id)}
              title={`${potionData.name}: ${potionData.description}`}
            >
              {potionData.image ? (
                <img 
                  src={getAssetPath(potionData.image)} 
                  alt={potionData.name} 
                  className="shop-item-icon shop-item-image"
                />
              ) : (
                <span className="shop-item-icon">🧪</span>
              )}
              <span className="shop-item-name">{potionData.name}</span>
              <span className="shop-item-heal">+{potionData.amount} {potionData.potionType || 'HP'}</span>
              <span className="shop-item-price">
                <span className="shop-item-price-value">{price}</span> gold
              </span>
              {potionData.levelRequirement && (
                <span className={`shop-item-level ${meetsLevelRequirement ? 'met' : 'unmet'}`}>
                  Lv. {potionData.levelRequirement}+
                </span>
              )}
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
