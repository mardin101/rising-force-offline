import type { ItemType, EquipmentSlotType, WeaponType } from './constants';
import itemsJson from './items/items.json';

// Potion-specific type for HP potions
export type PotionType = 'HP' | 'FP' | 'SP';

// Item data interface - Updated to match items.json structure
export interface ItemData {
  // Required fields from items.json
  id: string;                  // Unique identifier (e.g., "item_1", "item_2")
  itemId: string;              // Numeric item ID from original game data
  name: string;
  description: string;
  code1: string;               // Item code category (e.g., "Y", "N", "A", "B", "C")
  code2: string;               // Item code subcategory or effect description
  imageUrl: string;            // Original image URL from game data
  localImagePath: string;      // Local path to item image
  
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
// The items.json contains the required fields (id, itemId, name, description, code1, code2, imageUrl, localImagePath)
// Optional fields (type, healAmount, etc.) are used for extended functionality and backward compatibility
const itemsData: ItemData[] = itemsJson as ItemData[];

export default itemsData;
