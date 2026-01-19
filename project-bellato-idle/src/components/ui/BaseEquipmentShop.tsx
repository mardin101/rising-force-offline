import { useState } from 'react';
import { getEquipmentPrices } from '../../data/equipment/loadEquipment';
import { getAssetPath } from '../../utils/assets';
import { validateLevelRequirement } from '../../utils/validation';
import type { ItemData } from '../../data/items';
import EquipmentShopModal from './EquipmentShopModal';
import './Shop.css';

export interface BaseEquipmentShopProps {
  playerGold: number;
  playerLevel: number;
  playerRace: string;
  onPurchase: (itemId: string, quantity: number) => { success: boolean; message: string };
  shopTitle: string;
  shopIcon: string;
  getShopItems: (race: string) => ItemData[];
  statLabel?: string;
  getStatValue?: (item: ItemData) => number | undefined;
}

/**
 * BaseEquipmentShop - A generic component that displays equipment for sale
 *
 * Features:
 * - Displays equipment items based on provided data fetcher
 * - Filters equipment by player race (Bellato, Cora, Accretia)
 * - Click on an item to open the purchase modal
 * - Shows level requirements for each item
 * - Configurable title, icon, and stat display
 */
export default function BaseEquipmentShop({ 
  playerGold, 
  playerLevel, 
  playerRace, 
  onPurchase,
  shopTitle,
  shopIcon,
  getShopItems,
  statLabel,
  getStatValue,
}: BaseEquipmentShopProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get all shop items for the player's race
  const shopItems = getShopItems(playerRace);
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
        <h2 className="shop-title">{shopIcon} {shopTitle}</h2>
        <div className="shop-gold">
          <span className="shop-gold-label">Gold:</span>
          <span className="shop-gold-value">{playerGold}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shopItems.map((itemData) => {
          const price = equipmentPrices[itemData.id] ?? 1;
          const meetsLevelRequirement = validateLevelRequirement(playerLevel, itemData.levelRequirement);
          const statValue = getStatValue ? getStatValue(itemData) : undefined;

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
                {statValue !== undefined && statLabel && (
                  <p className="text-sm text-gray-400">{statLabel}: {statValue}</p>
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
