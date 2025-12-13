import type { ItemData } from '../items';
import potionsJson from './potions.json';

// Raw potion data structure from JSON
interface RawPotionData {
  id: string;
  potionId: string;
  name: string;
  description: string;
  soldAtNPC: string;
  healingAmount: string;
  class: string;
  imageUrl: string;
  localImagePath: string;
}

/**
 * Parse healing amount from string format like "+100 HP" or "+50 FP"
 * Returns the numeric value if it's a simple HP restoration, 0 otherwise
 */
function parseHealAmount(healingAmount: string): number {
  // Match patterns like "+100 HP", "+250 HP", etc.
  const hpMatch = healingAmount.match(/\+(\d+)\s*HP/i);
  if (hpMatch) {
    return parseInt(hpMatch[1], 10);
  }
  return 0;
}

/**
 * Determine if this is a simple HP restoration potion
 */
function isHPPotion(healingAmount: string): boolean {
  return /\+\d+\s*HP/i.test(healingAmount) && !/\(/.test(healingAmount);
}

/**
 * Get a base price for a potion based on its heal amount
 * Lower tier potions are cheaper
 */
function getPotionPrice(healAmount: number): number {
  if (healAmount === 0) return 10; // Default for non-HP potions
  if (healAmount <= 100) return 5;
  if (healAmount <= 250) return 15;
  if (healAmount <= 500) return 30;
  if (healAmount <= 1000) return 50;
  if (healAmount <= 2000) return 100;
  if (healAmount <= 3000) return 150;
  if (healAmount <= 4000) return 200;
  return 250;
}

/**
 * Convert raw potion data from JSON to ItemData format
 */
export function transformPotionToItem(rawPotion: RawPotionData): ItemData {
  const healAmount = parseHealAmount(rawPotion.healingAmount);
  
  return {
    id: rawPotion.id,
    itemId: rawPotion.potionId,
    name: rawPotion.name,
    description: rawPotion.description,
    code1: rawPotion.soldAtNPC,
    code2: rawPotion.healingAmount,
    imageUrl: rawPotion.imageUrl,
    localImagePath: rawPotion.localImagePath,
    type: 'consumable', // Use string literal instead of ITEM_TYPE.CONSUMABLE to avoid circular dependency
    healAmount: healAmount,
    potionType: isHPPotion(rawPotion.healingAmount) ? 'HP' : undefined,
    image: rawPotion.localImagePath,
    maxQuantity: 99,
  };
}

/**
 * Load all potions from potions.json and convert to ItemData format
 */
export function loadPotions(): ItemData[] {
  const rawPotions = potionsJson as RawPotionData[];
  return rawPotions.map(transformPotionToItem);
}

/**
 * Get a map of potion ID to price for all potions sold at NPC
 */
export function getPotionPrices(): Record<string, number> {
  const prices: Record<string, number> = {};
  const rawPotions = potionsJson as RawPotionData[];
  
  rawPotions.forEach(potion => {
    if (potion.soldAtNPC === 'Y') {
      const healAmount = parseHealAmount(potion.healingAmount);
      prices[potion.id] = getPotionPrice(healAmount);
    }
  });
  
  return prices;
}

/**
 * Get all HP potions sold at NPC, sorted by heal amount (lowest first)
 * Optionally filter by race (Bellato, Cora, or Accretia)
 */
export function getShopHPPotions(race?: string): ItemData[] {
  const allPotions = loadPotions();
  return allPotions
    .filter(potion => {
      // Check if sold at NPC and is an HP potion
      if (potion.code1 !== 'Y' || potion.potionType !== 'HP' || !potion.healAmount || potion.healAmount <= 0) {
        return false;
      }
      
      // If race is specified, filter by race prefix in potion name
      if (race) {
        // Match race prefix in potion name (e.g., "Bellato", "Cora", "Acc" for Accretia)
        const racePrefix = race === 'Accretia' ? 'Acc' : race;
        return potion.name.startsWith(racePrefix);
      }
      
      return true;
    })
    .sort((a, b) => (a.healAmount || 0) - (b.healAmount || 0));
}

/**
 * Get the lowest grade HP potion (for starter inventory)
 */
export function getLowestHPPotion(): ItemData | null {
  const hpPotions = getShopHPPotions();
  return hpPotions.length > 0 ? hpPotions[0] : null;
}

export default loadPotions;
