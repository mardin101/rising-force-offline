import { ITEM_TYPE, EQUIPMENT_SLOT, type ItemType, type EquipmentSlotType } from './constants';

// Potion-specific type for HP potions
export type PotionType = 'HP' | 'FP' | 'SP';

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
  // Potion-specific fields
  potionType?: PotionType;
  race?: string;
  target?: string;
  specialEffects?: string;
  castDelay?: number;
  trade?: boolean;
  useStatus?: string;
  levelRequirement?: number;
  levelRequirementText?: string;
  maxQuantity?: number;  // Maximum stack size for this item
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
  // Bless HP Potions - Bellato Union exclusive
  {
    id: 'bless_hp_potion_100',
    name: 'BlessHPPotion 100',
    type: ITEM_TYPE.CONSUMABLE,
    potionType: 'HP',
    race: 'Bellato Union',
    target: 'Self',
    specialEffects: 'HP Restoration 100',
    healAmount: 100,
    maxQuantity: 99,
    castDelay: 1.6,
    trade: true,
    useStatus: 'Always',
    description: 'Potion exclusive for Bellato. Only use higher than 1 level.',
    levelRequirementText: 'Only use higher than 1 level.',
    levelRequirement: 1,
  },
  {
    id: 'bless_hp_potion_250',
    name: 'BlessHPPotion 250',
    type: ITEM_TYPE.CONSUMABLE,
    potionType: 'HP',
    race: 'Bellato Union',
    target: 'Self',
    specialEffects: 'HP Restoration 250',
    healAmount: 250,
    maxQuantity: 99,
    castDelay: 1.6,
    trade: true,
    useStatus: 'Always',
    description: 'Potion exclusive for Bellato. Only use higher than 5 level.',
    levelRequirementText: 'Only use higher than 5 level.',
    levelRequirement: 5,
  },
  {
    id: 'bless_hp_potion_500',
    name: 'BlessHPPotion 500',
    type: ITEM_TYPE.CONSUMABLE,
    potionType: 'HP',
    race: 'Bellato Union',
    target: 'Self',
    specialEffects: 'HP Restoration 500',
    healAmount: 500,
    maxQuantity: 99,
    castDelay: 1.6,
    trade: true,
    useStatus: 'Always',
    description: 'Potion exclusive for Bellato. Only use higher than 10 level.',
    levelRequirementText: 'Only use higher than 10 level.',
    levelRequirement: 10,
  },
  {
    id: 'bless_hp_potion_2000',
    name: 'BlessHPPotion 2000',
    type: ITEM_TYPE.CONSUMABLE,
    potionType: 'HP',
    race: 'Bellato Union',
    target: 'Self',
    specialEffects: 'HP Restoration 2000',
    healAmount: 2000,
    maxQuantity: 1,
    castDelay: 2.2,
    trade: true,
    useStatus: 'Always',
    description: 'Potion exclusive for Bellato. Only use higher than 25 level.',
    levelRequirementText: 'Only use higher than 25 level.',
    levelRequirement: 25,
  },
  {
    id: 'bless_hp_potion_3000',
    name: 'BlessHPPotion 3000',
    type: ITEM_TYPE.CONSUMABLE,
    potionType: 'HP',
    race: 'Bellato Union',
    target: 'Self',
    specialEffects: 'HP Restoration 3000',
    healAmount: 3000,
    maxQuantity: 1,
    castDelay: 2.5,
    trade: true,
    useStatus: 'Always',
    description: 'Potion exclusive for Bellato. Only use higher than 35 level.',
    levelRequirementText: 'Only use higher than 35 level.',
    levelRequirement: 35,
  },
  {
    id: 'bless_hp_potion_4000',
    name: 'BlessHPPotion 4000',
    type: ITEM_TYPE.CONSUMABLE,
    potionType: 'HP',
    race: 'Bellato Union',
    target: 'Self',
    specialEffects: 'HP Restoration 4000',
    healAmount: 4000,
    maxQuantity: 1,
    castDelay: 2.5,
    trade: true,
    useStatus: 'Always',
    description: 'Potion exclusive for Bellato. Only use higher than 40 level.',
    levelRequirementText: 'Only use higher than 40 level.',
    levelRequirement: 40,
  },
  {
    id: 'bless_hp_potion_5000',
    name: 'BlessHPPotion 5000',
    type: ITEM_TYPE.CONSUMABLE,
    potionType: 'HP',
    race: 'Bellato Union',
    target: 'Self',
    specialEffects: 'HP Restoration 5000',
    healAmount: 5000,
    maxQuantity: 1,
    castDelay: 2.5,
    trade: true,
    useStatus: 'Always',
    description: 'Potion exclusive for Bellato. Only use higher than 50 level.',
    levelRequirementText: 'Only use higher than 50 level.',
    levelRequirement: 50,
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
