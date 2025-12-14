import type { ItemData } from '../types';
import weaponsJson from '../weapons/weapons.json';
import armorJson from '../armor/armor.json';
import shieldsJson from '../shields/shields.json';
import { ITEM_TYPE, CHARACTER_RACES } from '../constants';

// Raw weapon data structure from JSON
interface RawWeaponData {
  id: string;
  weaponId: string;
  name: string;
  description: string;
  type: string;
  requiredLevel: number;
  race: string;
  requiredSkill: string;
  durability: number;
  attack: {
    physical: string;
    force: string;
  };
  imageUrl: string;
  localImagePath: string;
}

// Raw armor data structure from JSON
interface RawArmorData {
  id: string;
  name: string;
  type: string;
  requiredLevel: number;
  requiredSkill: string;
  avgDefPower: number;
  avgDefRate: number;
  defenseSuccessRate: number;
  elementalResist: string;
  specialEffect: string;
  class: string;
  trainingCap: string;
  imageUrl: string;
  localImagePath: string;
}

// Raw shield data structure from JSON
interface RawShieldData {
  id: string;
  shieldId: string;
  name: string;
  description: string;
  requiredLevel: number;
  requiredSkill: string;
  avgDefPower: number;
  avgDefRate: number;
  defenseSuccessRate: number;
  race: string;
  specialEffect: string;
  imageUrl: string;
  localImagePath: string;
}

/**
 * Get the race from the imageUrl path
 * Armor uses path like "images/armor_bellato_all/..." to indicate race
 */
function getRaceFromImageUrl(imageUrl: string): string | undefined {
  const lowerUrl = imageUrl.toLowerCase();
  
  if (lowerUrl.includes('bellato')) {
    return CHARACTER_RACES.BELLATO;
  }
  if (lowerUrl.includes('cora')) {
    return CHARACTER_RACES.CORA;
  }
  if (lowerUrl.includes('accretia')) {
    return CHARACTER_RACES.ACCRETIA;
  }
  
  return undefined; // All races
}

/**
 * Check if an item's race matches the player's race
 */
export function isEquipmentRaceCompatible(itemRace: string | undefined, playerRace: string | undefined): boolean {
  if (!playerRace || !itemRace) {
    return true; // No race restriction
  }
  
  const normalizedItemRace = itemRace.toLowerCase();
  const normalizedPlayerRace = playerRace.toLowerCase();
  
  // Handle "All" race
  if (normalizedItemRace === 'all') {
    return true;
  }
  
  // Handle combined races like "Bellato & Cora"
  if (normalizedItemRace.includes('&')) {
    return normalizedItemRace.includes(normalizedPlayerRace);
  }
  
  return normalizedItemRace === normalizedPlayerRace;
}

/**
 * Convert raw weapon data from JSON to ItemData format
 */
export function transformWeaponToItem(rawWeapon: RawWeaponData): ItemData {
  return {
    id: rawWeapon.id,
    itemId: rawWeapon.weaponId,
    name: rawWeapon.name,
    description: rawWeapon.description,
    code1: 'Y', // Sold at NPC
    code2: rawWeapon.type,
    imageUrl: rawWeapon.imageUrl,
    localImagePath: rawWeapon.localImagePath,
    type: ITEM_TYPE.WEAPON,
    race: rawWeapon.race,
    levelRequirement: rawWeapon.requiredLevel,
    image: rawWeapon.localImagePath,
  };
}

/**
 * Convert raw armor data from JSON to ItemData format
 */
export function transformArmorToItem(rawArmor: RawArmorData): ItemData {
  // Get race from imageUrl since armor doesn't have explicit race field
  const race = getRaceFromImageUrl(rawArmor.imageUrl);
  
  return {
    id: rawArmor.id,
    itemId: rawArmor.id, // armor doesn't have separate numeric ID
    name: rawArmor.name,
    description: `${rawArmor.specialEffect}`,
    code1: 'Y', // Sold at NPC
    code2: rawArmor.type,
    imageUrl: rawArmor.imageUrl,
    localImagePath: rawArmor.localImagePath,
    type: ITEM_TYPE.ARMOR,
    defense: rawArmor.avgDefPower,
    race: race,
    levelRequirement: rawArmor.requiredLevel,
    image: rawArmor.localImagePath,
  };
}

/**
 * Convert raw shield data from JSON to ItemData format
 */
export function transformShieldToItem(rawShield: RawShieldData): ItemData {
  return {
    id: rawShield.id,
    itemId: rawShield.shieldId,
    name: rawShield.name,
    description: rawShield.description,
    code1: 'Y', // Sold at NPC
    code2: 'Shield',
    imageUrl: rawShield.imageUrl,
    localImagePath: rawShield.localImagePath,
    type: ITEM_TYPE.ARMOR, // Shields are armor type
    defense: rawShield.avgDefPower,
    race: rawShield.race,
    levelRequirement: rawShield.requiredLevel,
    image: rawShield.localImagePath,
  };
}

/**
 * Load all weapons from weapons.json and convert to ItemData format
 */
export function loadWeapons(): ItemData[] {
  const rawWeapons = weaponsJson as RawWeaponData[];
  return rawWeapons.map(transformWeaponToItem);
}

/**
 * Load all armor from armor.json and convert to ItemData format
 */
export function loadArmor(): ItemData[] {
  const rawArmor = armorJson as RawArmorData[];
  return rawArmor.map(transformArmorToItem);
}

/**
 * Load all shields from shields.json and convert to ItemData format
 */
export function loadShields(): ItemData[] {
  const rawShields = shieldsJson as RawShieldData[];
  return rawShields.map(transformShieldToItem);
}

/**
 * Get all weapons sold at NPC, optionally filtered by race
 */
export function getShopWeapons(race?: string): ItemData[] {
  const allWeapons = loadWeapons();
  return allWeapons
    .filter(weapon => isEquipmentRaceCompatible(weapon.race, race))
    .sort((a, b) => (a.levelRequirement || 0) - (b.levelRequirement || 0));
}

/**
 * Get all armor sold at NPC, optionally filtered by race
 */
export function getShopArmor(race?: string): ItemData[] {
  const allArmor = loadArmor();
  return allArmor
    .filter(armor => isEquipmentRaceCompatible(armor.race, race))
    .sort((a, b) => (a.levelRequirement || 0) - (b.levelRequirement || 0));
}

/**
 * Get all shields sold at NPC, optionally filtered by race
 */
export function getShopShields(race?: string): ItemData[] {
  const allShields = loadShields();
  return allShields
    .filter(shield => isEquipmentRaceCompatible(shield.race, race))
    .sort((a, b) => (a.levelRequirement || 0) - (b.levelRequirement || 0));
}

/**
 * Get all equipment (weapons, shields, armor) sold at NPC, optionally filtered by race
 */
export function getAllShopEquipment(race?: string): ItemData[] {
  return [
    ...getShopWeapons(race),
    ...getShopShields(race),
    ...getShopArmor(race),
  ];
}

/**
 * Get equipment prices - all equipment is 1 gold as specified
 */
export function getEquipmentPrices(): Record<string, number> {
  const prices: Record<string, number> = {};
  const allEquipment = getAllShopEquipment();
  
  allEquipment.forEach(item => {
    prices[item.id] = 1; // All equipment is 1 gold
  });
  
  return prices;
}
