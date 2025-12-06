import { useState } from 'react';
import {
  getItemById,
  POTION_PRICES,
  POTION_ID,
} from '../../state/gameStateSlice';
import { getAssetPath } from '../../utils/assets';
import ShopModal from './ShopModal';
import './Shop.css';

// Available potions in the shop (in order: weakest to strongest)
const SHOP_POTIONS = [
  POTION_ID.BLESS_HP_100,
  POTION_ID.BLESS_HP_250,
  POTION_ID.BLESS_HP_500,
  POTION_ID.BLESS_HP_2000,
  POTION_ID.BLESS_HP_3000,
  POTION_ID.BLESS_HP_4000,
  POTION_ID.BLESS_HP_5000,
];

export interface ShopProps {
  playerGold: number;
  playerLevel: number;
  onPurchase: (potionId: string, quantity: number) => { success: boolean; message: string };
}

/**
 * Shop - A component that displays potions for sale
 *
 * Features:
 * - Displays all Bless HP potions with prices and level requirements
 * - Click on a potion to open the purchase modal
 * - Shows level requirements for each potion
 */
export default function Shop({ playerGold, playerLevel, onPurchase }: ShopProps) {
  const [selectedPotionId, setSelectedPotionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        {SHOP_POTIONS.map((potionId) => {
          const potionData = getItemById(potionId);
          const price = POTION_PRICES[potionId] ?? 0;

          if (!potionData) return null;

          const meetsLevelRequirement = !potionData.levelRequirement || playerLevel >= potionData.levelRequirement;

          return (
            <button
              key={potionId}
              className={`shop-item ${!meetsLevelRequirement ? 'shop-item-locked' : ''}`}
              onClick={() => handlePotionClick(potionId)}
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
              <span className="shop-item-heal">+{potionData.healAmount} HP</span>
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
