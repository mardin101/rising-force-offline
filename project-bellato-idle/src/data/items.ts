import { ITEM_TYPE, EQUIPMENT_SLOT, type ItemType, type EquipmentSlotType } from './constants';

// Item data interface
export interface ItemData {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  attack?: number;
  defense?: number;
  healAmount?: number;
  equipSlot?: EquipmentSlotType;
}

const itemsData: ItemData[] = [
  {
    id: 'sword_basic',
    name: 'Basic Sword',
    type: ITEM_TYPE.WEAPON,
    attack: 10,
    equipSlot: EQUIPMENT_SLOT.WEAPON,
    description: 'A basic iron sword for beginners.',
  },
  {
    id: 'potion_health',
    name: 'Health Potion',
    type: ITEM_TYPE.CONSUMABLE,
    healAmount: 50,
    description: 'Restores 50 HP when consumed.',
  },
  {
    id: 'potion_health_medium',
    name: 'Medium Health Potion',
    type: ITEM_TYPE.CONSUMABLE,
    healAmount: 100,
    description: 'Restores 100 HP when consumed.',
  },
  {
    id: 'potion_health_large',
    name: 'Large Health Potion',
    type: ITEM_TYPE.CONSUMABLE,
    healAmount: 500,
    description: 'Restores 500 HP when consumed.',
  },
  {
    id: 'potion_health_mega',
    name: 'Mega Health Potion',
    type: ITEM_TYPE.CONSUMABLE,
    healAmount: 1000,
    description: 'Restores 1000 HP when consumed.',
  },
  {
    id: 'leather_armor',
    name: 'Leather Armor',
    type: ITEM_TYPE.ARMOR,
    defense: 5,
    equipSlot: EQUIPMENT_SLOT.UPPER_BODY,
    description: 'Basic leather armor.',
  },
  {
    id: 'iron_ore',
    name: 'Iron Ore',
    type: ITEM_TYPE.MATERIAL,
    description: 'Raw iron ore for crafting.',
  },
  {
    id: 'leather_helmet',
    name: 'Leather Helmet',
    type: ITEM_TYPE.ARMOR,
    defense: 2,
    equipSlot: EQUIPMENT_SLOT.HELMET,
    description: 'A simple leather helmet for beginners.',
  },
  {
    id: 'leather_pants',
    name: 'Leather Pants',
    type: ITEM_TYPE.ARMOR,
    defense: 3,
    equipSlot: EQUIPMENT_SLOT.LOWER_BODY,
    description: 'Basic leather pants for protection.',
  },
  {
    id: 'leather_gloves',
    name: 'Leather Gloves',
    type: ITEM_TYPE.ARMOR,
    defense: 1,
    equipSlot: EQUIPMENT_SLOT.GLOVES,
    description: 'Simple leather gloves.',
  },
  {
    id: 'leather_boots',
    name: 'Leather Boots',
    type: ITEM_TYPE.ARMOR,
    defense: 2,
    equipSlot: EQUIPMENT_SLOT.SHOES,
    description: 'Basic leather boots.',
  },
  {
    id: 'travelers_cape',
    name: "Traveler's Cape",
    type: ITEM_TYPE.ARMOR,
    defense: 1,
    equipSlot: EQUIPMENT_SLOT.CAPE,
    description: 'A simple cape for travelers.',
  },
];

export default itemsData;
