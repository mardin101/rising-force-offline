import { useState } from 'react';
import { getAllShopEquipment, getEquipmentPrices } from '../../data/equipment/loadEquipment';
import { getAssetPath } from '../../utils/assets';
import EquipmentShopModal from './EquipmentShopModal';
import './Shop.css';

export interface EquipmentShopProps {
  playerGold: number;
  playerLevel: number;
  playerRace: string;
  onPurchase: (itemId: string, quantity: number) => { success: boolean; message: string };
}

/**
 * EquipmentShop - A component that displays weapons, shields, and armor for sale
 *
 * Features:
 * - Displays all equipment available for purchase (weapons, shields, armor)
 * - Filters equipment by player race (Bellato, Cora, Accretia)
 * - Click on an item to open the purchase modal
 * - Shows level requirements for each item
 * - All equipment costs 1 gold each
 */
export default function EquipmentShop({ playerGold, playerLevel, playerRace, onPurchase }: EquipmentShopProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get all shop equipment for the player's race
  const shopEquipment = getAllShopEquipment(playerRace);
  const equipmentPrices = getEquipmentPrices();

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItemId(null);
  };

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h2 className="shop-title">⚔️ Equipment Shop</h2>
        <div className="shop-gold">
          <span className="shop-gold-label">Gold:</span>
          <span className="shop-gold-value">{playerGold}</span>
        </div>
      </div>

      <div className="shop-items-grid">
        {shopEquipment.map((itemData) => {
          const price = equipmentPrices[itemData.id] ?? 1;
          const meetsLevelRequirement = !itemData.levelRequirement || playerLevel >= itemData.levelRequirement;

          return (
            <button
              key={itemData.id}
              className={`shop-item ${!meetsLevelRequirement ? 'shop-item-locked' : ''}`}
              onClick={() => handleItemClick(itemData.id)}
              title={`${itemData.name}: ${itemData.description}`}
            >
              {itemData.image ? (
                <img 
                  src={getAssetPath(itemData.image)} 
                  alt={itemData.name} 
                  className="shop-item-icon shop-item-image"
                />
              ) : (
                <span className="shop-item-icon">⚔️</span>
              )}
              <span className="shop-item-name">{itemData.name}</span>
              {itemData.type === 'weapon' && itemData.attack && (
                <span className="shop-item-heal">Atk: {itemData.attack}</span>
              )}
              {itemData.type === 'armor' && itemData.defense && (
                <span className="shop-item-heal">Def: {itemData.defense}</span>
              )}
              <span className="shop-item-price">
                <span className="shop-item-price-value">{price}</span> gold
              </span>
              {itemData.levelRequirement && (
                <span className={`shop-item-level ${meetsLevelRequirement ? 'met' : 'unmet'}`}>
                  Lv. {itemData.levelRequirement}+
                </span>
              )}
            </button>
          );
        })}
      </div>

      <EquipmentShopModal
        key={selectedItemId ?? 'closed'}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedItemId={selectedItemId}
        playerGold={playerGold}
        playerLevel={playerLevel}
        equipmentPrices={equipmentPrices}
        onPurchase={onPurchase}
      />
    </div>
  );
}
