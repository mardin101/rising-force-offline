import itemsJsonRaw from './items/items.json';
import { loadPotions } from './potions/loadPotions';
import { loadWeapons, loadArmor, loadShields } from './equipment/loadEquipment';
import type { ItemData } from './types';

// Re-export types for backward compatibility
export type { ItemData, PotionType } from './types';

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

// Load equipment (weapons, armor, shields) from equipment JSON files
const weaponItems: ItemData[] = loadWeapons();
const armorItems: ItemData[] = loadArmor();
const shieldItems: ItemData[] = loadShields();

// Combine all items
const itemsData: ItemData[] = [...baseItems, ...potionItems, ...weaponItems, ...armorItems, ...shieldItems];

export default itemsData;
