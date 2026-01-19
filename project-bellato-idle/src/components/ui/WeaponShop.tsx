import { getShopWeapons } from '../../data/equipment/loadEquipment';
import BaseEquipmentShop from './BaseEquipmentShop';

export interface WeaponShopProps {
  playerGold: number;
  playerLevel: number;
  playerRace: string;
  onPurchase: (itemId: string, quantity: number) => { success: boolean; message: string };
}

/**
 * WeaponShop - A component that displays weapons for sale
 *
 * Features:
 * - Displays all weapons available for purchase
 * - Filters weapons by player race (Bellato, Cora, Accretia)
 * - Click on a weapon to open the purchase modal
 * - Shows level requirements for each weapon
 */
export default function WeaponShop(props: WeaponShopProps) {
  return (
    <BaseEquipmentShop
      {...props}
      shopTitle="Weapon Shop"
      shopIcon="⚔️"
      getShopItems={getShopWeapons}
      statLabel="Atk"
      getStatValue={(item) => item.attack}
    />
  );
}
