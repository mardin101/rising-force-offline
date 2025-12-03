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
