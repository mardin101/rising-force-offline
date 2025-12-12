import type { ItemType, EquipmentSlotType, WeaponType } from './constants';
import itemsJson from './items/items.json';

// Potion-specific type for HP potions
export type PotionType = 'HP' | 'FP' | 'SP';

// Item data interface - Updated to match items.json structure
export interface ItemData {
  // Required fields from items.json
  id: string;
  itemId: string;
  name: string;
  description: string;
  code1: string;
  code2: string;
  imageUrl: string;
  localImagePath: string;
  
  // Optional fields for backward compatibility and extended functionality
  type?: ItemType;
  attack?: number;
  defense?: number;
  healAmount?: number;
  equipSlot?: EquipmentSlotType;
  // Weapon-specific fields (only for items with type: ITEM_TYPE.WEAPON)
  weaponType?: WeaponType;  // For PT system: melee or ranged
  // Potion-specific fields (only for items with type: ITEM_TYPE.CONSUMABLE)
  potionType?: PotionType;
  race?: string;
  target?: string;
  specialEffects?: string;
  castDelay?: number;
  trade?: boolean;
  useStatus?: string;
  levelRequirement?: number;
  levelRequirementText?: string;
  maxQuantity?: number;  // Maximum stack size for this item
  image?: string;  // Path to the item image (relative to public folder)
}

// Import items from JSON and cast to ItemData array
const itemsData: ItemData[] = itemsJson as ItemData[];

export default itemsData;
