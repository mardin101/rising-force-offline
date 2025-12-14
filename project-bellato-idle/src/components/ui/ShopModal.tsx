import { useEffect, useCallback, useState } from 'react';
import {
  getItemById,
  POTION_PRICES,
  SHOP_MAX_PURCHASE_QUANTITY,
} from '../../state/gameStateSlice';
import { getAssetPath } from '../../utils/assets';
import type { ItemData } from '../../data/items';
import './ShopModal.css';

export interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPotionId: string | null;
  playerGold: number;
  playerLevel: number;
  onPurchase: (potionId: string, quantity: number) => { success: boolean; message: string };
}

/**
 * ShopModal - A modal for purchasing potions
 *
 * Features:
 * - Slider to select quantity (1-99 or item's max quantity)
 * - Dynamic price calculation
 * - Level requirement check
 * - Confirm purchase button
 */
export default function ShopModal({
  isOpen,
  onClose,
  selectedPotionId,
  playerGold,
  playerLevel,
  onPurchase,
}: ShopModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [purchaseMessage, setPurchaseMessage] = useState<{ success: boolean; message: string } | null>(null);

  // Get the potion data
  const potionData: ItemData | undefined = selectedPotionId ? getItemById(selectedPotionId) : undefined;
  const potionPrice = selectedPotionId ? (POTION_PRICES[selectedPotionId] ?? 0) : 0;
  const totalCost = potionPrice * quantity;
  const canAfford = playerGold >= totalCost && quantity > 0;
  const meetsLevelRequirement = !potionData?.levelRequirement || playerLevel >= potionData.levelRequirement;
  const maxQuantity = potionData?.maxQuantity ?? SHOP_MAX_PURCHASE_QUANTITY;
  const canPurchase = canAfford && meetsLevelRequirement;

  // Handle escape key to close modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, handleKeyDown]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(parseInt(e.target.value, 10));
    setPurchaseMessage(null);
  };

  // Handle purchase
  const handlePurchase = () => {
    if (!selectedPotionId || quantity <= 0) return;

    const result = onPurchase(selectedPotionId, quantity);
    setPurchaseMessage(result);

    if (result.success) {
      // Reset quantity after successful purchase
      setQuantity(1);
    }
  };

  if (!isOpen || !potionData) {
    return null;
  }

  return (
    <div
      className="shop-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Purchase Potion"
    >
      <div className="shop-modal">
        {/* Header */}
        <div className="shop-modal-header">
          <span className="shop-modal-title">Purchase {potionData.name}</span>
          <button
            className="shop-modal-close"
            onClick={onClose}
            aria-label="Close shop dialog"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="shop-modal-body">
          {/* Potion Image - Center of Attention (matching battle modal) */}
          {potionData.image && (
            <div className="flex justify-center mb-4">
              <img 
                src={getAssetPath(potionData.image)} 
                alt={potionData.name} 
                className="w-48 h-48 object-contain rounded-lg border-2 border-blue-500 bg-gray-900/50 shadow-lg shadow-blue-500/50"
              />
            </div>
          )}

          {/* Potion Info */}
          <div className="shop-potion-info">
            <div className="shop-potion-details">
              <span className="shop-potion-name">{potionData.name}</span>
              <span className="shop-potion-desc">{potionData.description}</span>
              <span className="shop-potion-price">
                Price: <span className="gold-amount">{potionPrice}</span> gold each
              </span>
              {potionData.levelRequirement && (
                <span className={`shop-potion-level ${meetsLevelRequirement ? 'met' : 'unmet'}`}>
                  Required Level: {potionData.levelRequirement}+ {meetsLevelRequirement ? '✓' : '✗'}
                </span>
              )}
            </div>
          </div>

          {/* Quantity Slider */}
          <div className="shop-slider-section">
            <div className="shop-slider-header">
              <span className="shop-slider-label">Quantity:</span>
              <span className="shop-slider-value">{quantity}</span>
            </div>
            <input
              type="range"
              className="shop-slider"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={handleSliderChange}
              aria-label="Quantity"
            />
            <div className="shop-slider-range">
              <span>1</span>
              <span>{maxQuantity}</span>
            </div>
          </div>

          {/* Total Cost */}
          <div className="shop-cost-section">
            <div className="shop-cost-row">
              <span className="shop-cost-label">Total Cost:</span>
              <span className={`shop-cost-value ${!canAfford ? 'insufficient' : ''}`}>
                {totalCost} gold
              </span>
            </div>
            <div className="shop-cost-row">
              <span className="shop-cost-label">Your Gold:</span>
              <span className="shop-cost-value gold-amount">{playerGold} gold</span>
            </div>
            {!canAfford && quantity > 0 && (
              <div className="shop-cost-warning">Insufficient gold!</div>
            )}
            {!meetsLevelRequirement && (
              <div className="shop-cost-warning">Level requirement not met!</div>
            )}
          </div>

          {/* Purchase Message */}
          {purchaseMessage && (
            <div className={`shop-message ${purchaseMessage.success ? 'success' : 'error'}`}>
              {purchaseMessage.message}
            </div>
          )}

          {/* Confirm Button */}
          <button
            className="shop-confirm-button"
            onClick={handlePurchase}
            disabled={!canPurchase}
          >
            Confirm Purchase
          </button>
        </div>
      </div>
    </div>
  );
}
