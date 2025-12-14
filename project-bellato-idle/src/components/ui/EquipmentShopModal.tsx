import { useEffect, useCallback, useState } from 'react';
import { getItemById } from '../../state/gameStateSlice';
import { getAssetPath } from '../../utils/assets';
import type { ItemData } from '../../data/items';
import './ShopModal.css';

export interface EquipmentShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItemId: string | null;
  playerGold: number;
  playerLevel: number;
  equipmentPrices: Record<string, number>;
  onPurchase: (itemId: string, quantity: number) => { success: boolean; message: string };
}

/**
 * EquipmentShopModal - A modal for purchasing equipment
 *
 * Features:
 * - Shows equipment details
 * - Fixed quantity of 1 (equipment is not stackable)
 * - Level requirement check
 * - Confirm purchase button
 */
export default function EquipmentShopModal({
  isOpen,
  onClose,
  selectedItemId,
  playerGold,
  playerLevel,
  equipmentPrices,
  onPurchase,
}: EquipmentShopModalProps) {
  const [purchaseMessage, setPurchaseMessage] = useState<{ success: boolean; message: string } | null>(null);

  // Get the item data
  const itemData: ItemData | undefined = selectedItemId ? getItemById(selectedItemId) : undefined;
  const itemPrice = selectedItemId ? (equipmentPrices[selectedItemId] ?? 1) : 1;
  const quantity = 1; // Equipment is always purchased one at a time
  const totalCost = itemPrice * quantity;
  const canAfford = playerGold >= totalCost;
  const meetsLevelRequirement = !itemData?.levelRequirement || playerLevel >= itemData.levelRequirement;
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

  // Handle purchase
  const handlePurchase = () => {
    if (!selectedItemId) return;

    const result = onPurchase(selectedItemId, quantity);
    setPurchaseMessage(result);
  };

  if (!isOpen || !itemData) {
    return null;
  }

  return (
    <div
      className="shop-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Purchase Equipment"
    >
      <div className="shop-modal">
        {/* Header */}
        <div className="shop-modal-header">
          <span className="shop-modal-title">Purchase {itemData.name}</span>
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
          {/* Item Image - Center of Attention (matching battle modal) */}
          {itemData.image && (
            <div className="flex justify-center mb-4">
              <img 
                src={getAssetPath(itemData.image)} 
                alt={itemData.name} 
                className="w-48 h-48 object-contain rounded-lg border-2 border-blue-500 bg-gray-900/50 shadow-lg shadow-blue-500/50"
              />
            </div>
          )}

          {/* Item Info */}
          <div className="shop-potion-info">
            <div className="shop-potion-details">
              <span className="shop-potion-name">{itemData.name}</span>
              <span className="shop-potion-desc">{itemData.description}</span>
              {itemData.type === 'weapon' && itemData.attack && (
                <span className="shop-potion-desc">Attack: {itemData.attack}</span>
              )}
              {itemData.type === 'armor' && itemData.defense && (
                <span className="shop-potion-desc">Defense: {itemData.defense}</span>
              )}
              <span className="shop-potion-price">
                Price: <span className="gold-amount">{itemPrice}</span> gold each
              </span>
              {itemData.levelRequirement && (
                <span className={`shop-potion-level ${meetsLevelRequirement ? 'met' : 'unmet'}`}>
                  Required Level: {itemData.levelRequirement}+ {meetsLevelRequirement ? '✓' : '✗'}
                </span>
              )}
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
            {!canAfford && (
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
