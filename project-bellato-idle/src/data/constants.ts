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

// Potion ID constants
export const POTION_ID = {
  BLESS_HP_100: 'bless_hp_potion_100',
  BLESS_HP_250: 'bless_hp_potion_250',
  BLESS_HP_500: 'bless_hp_potion_500',
  BLESS_HP_2000: 'bless_hp_potion_2000',
  BLESS_HP_3000: 'bless_hp_potion_3000',
  BLESS_HP_4000: 'bless_hp_potion_4000',
  BLESS_HP_5000: 'bless_hp_potion_5000',
} as const;

export type PotionId = typeof POTION_ID[keyof typeof POTION_ID];

// Potion prices in gold
export const POTION_PRICES: Record<string, number> = {
  [POTION_ID.BLESS_HP_100]: 5,     // BlessHPPotion 100: 5 gold
  [POTION_ID.BLESS_HP_250]: 15,    // BlessHPPotion 250: 15 gold
  [POTION_ID.BLESS_HP_500]: 30,    // BlessHPPotion 500: 30 gold
  [POTION_ID.BLESS_HP_2000]: 100,  // BlessHPPotion 2000: 100 gold
  [POTION_ID.BLESS_HP_3000]: 150,  // BlessHPPotion 3000: 150 gold
  [POTION_ID.BLESS_HP_4000]: 200,  // BlessHPPotion 4000: 200 gold
  [POTION_ID.BLESS_HP_5000]: 250,  // BlessHPPotion 5000: 250 gold
};

// Shop constants
export const SHOP_MAX_PURCHASE_QUANTITY = 99;

// Weapon type constants - for PT system
export const WEAPON_TYPE = {
  MELEE: 'melee',
  RANGED: 'ranged',
} as const;

export type WeaponType = typeof WEAPON_TYPE[keyof typeof WEAPON_TYPE];
