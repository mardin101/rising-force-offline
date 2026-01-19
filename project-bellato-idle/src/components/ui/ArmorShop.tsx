import { getShopArmor } from '../../data/equipment/loadEquipment';
import BaseEquipmentShop from './BaseEquipmentShop';

export interface ArmorShopProps {
  playerGold: number;
  playerLevel: number;
  playerRace: string;
  onPurchase: (itemId: string, quantity: number) => { success: boolean; message: string };
}

/**
 * ArmorShop - A component that displays armor for sale
 *
 * Features:
 * - Displays all armor available for purchase
 * - Filters armor by player race (Bellato, Cora, Accretia)
 * - Click on armor to open the purchase modal
 * - Shows level requirements for each armor piece
 */
export default function ArmorShop(props: ArmorShopProps) {
  return (
    <BaseEquipmentShop
      {...props}
      shopTitle="Armor Shop"
      shopIcon="🥋"
      getShopItems={getShopArmor}
      statLabel="Def"
      getStatValue={(item) => item.defense}
    />
  );
}
