import type { ItemData } from '../types';
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
    amount: rawPotion.amount ?? 0, // Buff potions may not have amount
    potionType: rawPotion.potionType ?? undefined,
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
      const amount = potion.amount ?? 0; // Buff potions may not have amount
      prices[potion.id] = getPotionPrice(amount);
    }
  });
  
  return prices;
}

/**
 * Check if a potion's race matches the player's race
 * Strict matching - no exceptions
 */
export function isRaceCompatible(potionRace: string | undefined, playerRace: string | undefined): boolean {
  if (!playerRace || !potionRace) {
    return true; // No race restriction
  }
  
  return potionRace.toLowerCase() === playerRace.toLowerCase();
}

/**
 * Get all potions of a specific type sold at NPC, sorted by heal amount (lowest first)
 * Optionally filter by race (Bellato, Cora, or Accretia)
 */
function getShopPotionsByType(potionType: 'HP' | 'FP' | 'SP', race?: string): ItemData[] {
  const allPotions = loadPotions();
  return allPotions
    .filter(potion => {
      // Check if sold at NPC and is the specified potion type
      if (potion.code1 !== 'Y' || potion.potionType !== potionType) {
        return false;
      }
      
      // Filter by race if specified
      return isRaceCompatible(potion.race, race);
    })
    .sort((a, b) => (a.amount || 0) - (b.amount || 0));
}

/**
 * Get all HP potions sold at NPC, sorted by heal amount (lowest first)
 * Optionally filter by race (Bellato, Cora, or Accretia)
 */
export function getShopHPPotions(race?: string): ItemData[] {
  return getShopPotionsByType('HP', race);
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
  return getShopPotionsByType('FP', race);
}

/**
 * Get all SP potions sold at NPC, sorted by heal amount (lowest first)
 * Optionally filter by race (Bellato, Cora, or Accretia)
 */
export function getShopSPPotions(race?: string): ItemData[] {
  return getShopPotionsByType('SP', race);
}

export default loadPotions;
