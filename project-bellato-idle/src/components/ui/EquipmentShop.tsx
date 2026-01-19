import { getAllShopEquipment } from '../../data/equipment/loadEquipment';
import BaseEquipmentShop from './BaseEquipmentShop';

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
export default function EquipmentShop(props: EquipmentShopProps) {
  return (
    <BaseEquipmentShop
      {...props}
      shopTitle="Equipment Shop"
      shopIcon="⚔️"
      getShopItems={getAllShopEquipment}
      renderStats={(item) => (
        <>
          {item.type === 'weapon' && item.attack && (
            <p className="text-sm text-gray-400">Atk: {item.attack}</p>
          )}
          {item.type === 'armor' && item.defense && (
            <p className="text-sm text-gray-400">Def: {item.defense}</p>
          )}
        </>
      )}
    />
  );
}
