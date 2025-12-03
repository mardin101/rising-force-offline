import { useState } from 'react';
import {
  getItemById,
  POTION_PRICES,
} from '../../state/gameStateSlice';
import ShopModal from './ShopModal';
import './Shop.css';

// Available potions in the shop (in order: small, medium, large, mega)
const SHOP_POTIONS = [
  'potion_health',
  'potion_health_medium',
  'potion_health_large',
  'potion_health_mega',
];

export interface ShopProps {
  playerGold: number;
  onPurchase: (potionId: string, quantity: number) => { success: boolean; message: string };
}

/**
 * Shop - A component that displays potions for sale
 *
 * Features:
 * - Displays all four potion types with prices
 * - Click on a potion to open the purchase modal
 */
export default function Shop({ playerGold, onPurchase }: ShopProps) {
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

          return (
            <button
              key={potionId}
              className="shop-item"
              onClick={() => handlePotionClick(potionId)}
              title={`${potionData.name}: ${potionData.description}`}
            >
              <span className="shop-item-icon">🧪</span>
              <span className="shop-item-name">{potionData.name}</span>
              <span className="shop-item-heal">+{potionData.healAmount} HP</span>
              <span className="shop-item-price">
                <span className="shop-item-price-value">{price}</span> gold
              </span>
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
        onPurchase={onPurchase}
      />
    </div>
  );
}
