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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shopEquipment.map((itemData) => {
          const price = equipmentPrices[itemData.id] ?? 1;
          const meetsLevelRequirement = !itemData.levelRequirement || playerLevel >= itemData.levelRequirement;

          return (
            <button
              key={itemData.id}
              className={`bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 hover:bg-gray-700/50 transition-colors text-center ${
                !meetsLevelRequirement ? 'opacity-60' : ''
              }`}
              onClick={() => handleItemClick(itemData.id)}
              title={`${itemData.name}: ${itemData.description}`}
            >
              {itemData.image && (
                <div className="flex justify-center mb-3">
                  <img 
                    src={getAssetPath(itemData.image)} 
                    alt={itemData.name} 
                    className="w-32 h-32 object-contain rounded border border-gray-600 bg-gray-900/50"
                  />
                </div>
              )}
              <div className="mb-3">
                <h4 className="text-xl font-bold text-blue-400 mb-1">{itemData.name}</h4>
                {itemData.type === 'weapon' && itemData.attack && (
                  <p className="text-sm text-gray-400">Atk: {itemData.attack}</p>
                )}
                {itemData.type === 'armor' && itemData.defense && (
                  <p className="text-sm text-gray-400">Def: {itemData.defense}</p>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-yellow-400">
                  <span className="text-gray-500">Price:</span> {price} gold
                </p>
                {itemData.levelRequirement && (
                  <p className={meetsLevelRequirement ? 'text-green-400' : 'text-red-400'}>
                    <span className="text-gray-500">Level:</span> {itemData.levelRequirement}+
                  </p>
                )}
              </div>
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
