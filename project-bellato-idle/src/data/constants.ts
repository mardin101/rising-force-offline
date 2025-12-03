// Game constants
// This file contains constants used across the game

// Quest type constants
export const QUEST_TYPE = {
  SLAY: 'slay',
  COLLECT: 'collect',
} as const;

export type QuestType = typeof QUEST_TYPE[keyof typeof QUEST_TYPE];

// Item type constants
export const ITEM_TYPE = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  CONSUMABLE: 'consumable',
  MATERIAL: 'material',
  ACCESSORY: 'accessory',
} as const;

export type ItemType = typeof ITEM_TYPE[keyof typeof ITEM_TYPE];

// Equipment slot types - the slots where items can be equipped
export const EQUIPMENT_SLOT = {
  HELMET: 'helmet',
  UPPER_BODY: 'upperBody',
  LOWER_BODY: 'lowerBody',
  GLOVES: 'gloves',
  SHOES: 'shoes',
  CAPE: 'cape',
  WEAPON: 'weapon',
} as const;

export type EquipmentSlotType = typeof EQUIPMENT_SLOT[keyof typeof EQUIPMENT_SLOT];

// All equipment slot types as an array for iteration
export const EQUIPMENT_SLOTS: EquipmentSlotType[] = Object.values(EQUIPMENT_SLOT);

// Potion prices in gold
export const POTION_PRICES: Record<string, number> = {
  'potion_health': 1,       // Small potion: 1 gold
  'potion_health_medium': 5,  // Medium potion: 5 gold
  'potion_health_large': 10,  // Large potion: 10 gold
  'potion_health_mega': 20,   // Ultra potion: 20 gold
};

// Shop constants
export const SHOP_MAX_PURCHASE_QUANTITY = 99;
