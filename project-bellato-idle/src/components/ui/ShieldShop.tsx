import { getShopShields } from '../../data/equipment/loadEquipment';
import BaseEquipmentShop from './BaseEquipmentShop';

export interface ShieldShopProps {
  playerGold: number;
  playerLevel: number;
  playerRace: string;
  onPurchase: (itemId: string, quantity: number) => { success: boolean; message: string };
}

/**
 * ShieldShop - A component that displays shields for sale
 *
 * Features:
 * - Displays all shields available for purchase
 * - Filters shields by player race (Bellato, Cora, Accretia)
 * - Click on a shield to open the purchase modal
 * - Shows level requirements for each shield
 */
export default function ShieldShop(props: ShieldShopProps) {
  return (
    <BaseEquipmentShop
      {...props}
      shopTitle="Shield Shop"
      shopIcon="🛡️"
      getShopItems={getShopShields}
      statLabel="Def"
      getStatValue={(item) => item.defense}
    />
  );
}
