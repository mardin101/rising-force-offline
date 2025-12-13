import type { ItemType, EquipmentSlotType, WeaponType } from './constants';
import itemsJsonRaw from './items/items.json';
import { loadPotions } from './potions/loadPotions';

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
  healAmount?: number;  // @deprecated - use amount instead
  equipSlot?: EquipmentSlotType;
  // Weapon-specific fields (only for items with type: ITEM_TYPE.WEAPON)
  weaponType?: WeaponType;  // For PT system: melee or ranged
  // Potion-specific fields (only for items with type: ITEM_TYPE.CONSUMABLE)
  potionType?: PotionType;
  amount?: number;  // Amount to heal/restore for consumables
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

// Transform items.json format to ItemData format
// items.json uses "soldAtNpc" and "class" instead of "code1" and "code2"
interface RawItemData {
  id: string;
  itemId: string;
  name: string;
  description: string;
  soldAtNpc: string;
  class: string;
  imageUrl: string;
  localImagePath: string;
}

function transformRawItem(rawItem: RawItemData): ItemData {
  return {
    ...rawItem,
    code1: rawItem.soldAtNpc,
    code2: rawItem.class,
  };
}

// Import items from JSON and transform to ItemData format
const baseItems: ItemData[] = (itemsJsonRaw as RawItemData[]).map(transformRawItem);

// Load potions from potions.json
const potionItems: ItemData[] = loadPotions();

// Combine base items and potions
const itemsData: ItemData[] = [...baseItems, ...potionItems];

export default itemsData;
