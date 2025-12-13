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
  race: string | null;
  potionType: 'HP' | 'FP' | 'SP' | null;
  amount: number | null;
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
  // Use the new amount property if available, otherwise fall back to parsing healingAmount
  const healAmount = rawPotion.amount ?? parseHealAmount(rawPotion.healingAmount);
  
  // Use the new potionType property if available, otherwise determine from healingAmount
  const potionType = rawPotion.potionType ?? (isHPPotion(rawPotion.healingAmount) ? 'HP' : undefined);
  
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
    potionType: potionType,
    race: rawPotion.race ?? undefined,
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
      
      // If race is specified, filter by race using the race property
      if (race && potion.race) {
        // Use simplified race matching (handle "Accreation" vs "Accretia")
        const potionRace = potion.race.toLowerCase();
        const playerRace = race.toLowerCase();
        const isAccretia = potionRace.startsWith('accre') && playerRace.startsWith('accre');
        return isAccretia || potionRace === playerRace;
      }
      
      return true;
    })
    .sort((a, b) => (a.healAmount || 0) - (b.healAmount || 0));
}

/**
 * Get the lowest grade HP potion (for starter inventory)
 * Optionally filter by race
 */
export function getLowestHPPotion(race?: string): ItemData | null {
  const hpPotions = getShopHPPotions(race);
  return hpPotions.length > 0 ? hpPotions[0] : null;
}

/**
 * Get all FP potions sold at NPC, sorted by heal amount (lowest first)
 * Optionally filter by race (Bellato, Cora, or Accretia)
 */
export function getShopFPPotions(race?: string): ItemData[] {
  const allPotions = loadPotions();
  return allPotions
    .filter(potion => {
      // Check if sold at NPC and is an FP potion
      if (potion.code1 !== 'Y' || potion.potionType !== 'FP' || !potion.healAmount || potion.healAmount <= 0) {
        return false;
      }
      
      // If race is specified, filter by race using the race property
      if (race && potion.race) {
        const potionRace = potion.race.toLowerCase();
        const playerRace = race.toLowerCase();
        const isAccretia = potionRace.startsWith('accre') && playerRace.startsWith('accre');
        return isAccretia || potionRace === playerRace;
      }
      
      return true;
    })
    .sort((a, b) => (a.healAmount || 0) - (b.healAmount || 0));
}

/**
 * Get all SP potions sold at NPC, sorted by heal amount (lowest first)
 * Optionally filter by race (Bellato, Cora, or Accretia)
 */
export function getShopSPPotions(race?: string): ItemData[] {
  const allPotions = loadPotions();
  return allPotions
    .filter(potion => {
      // Check if sold at NPC and is an SP potion
      if (potion.code1 !== 'Y' || potion.potionType !== 'SP' || !potion.healAmount || potion.healAmount <= 0) {
        return false;
      }
      
      // If race is specified, filter by race using the race property
      if (race && potion.race) {
        const potionRace = potion.race.toLowerCase();
        const playerRace = race.toLowerCase();
        const isAccretia = potionRace.startsWith('accre') && playerRace.startsWith('accre');
        return isAccretia || potionRace === playerRace;
      }
      
      return true;
    })
    .sort((a, b) => (a.healAmount || 0) - (b.healAmount || 0));
}

export default loadPotions;
