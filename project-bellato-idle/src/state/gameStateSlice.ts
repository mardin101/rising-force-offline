// Game state management
// This file contains the core game state structure and types

import itemsData from '../data/items.json';

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

// Character class constants
export const CHARACTER_CLASSES = {
  WARRIOR: 'Warrior',
  RANGER: 'Ranger',
  SPIRITUALIST: 'Spiritualist',
  SPECIALIST: 'Specialist',
} as const;

export type CharacterClass = typeof CHARACTER_CLASSES[keyof typeof CHARACTER_CLASSES];

// Character creation constants
export const CHARACTER_NAME_MIN_LENGTH = 2;
export const CHARACTER_NAME_MAX_LENGTH = 20;
export const STARTING_GOLD = 100;

// PT (Proficiency Points) constants
export const PT_MIN = 0;
export const PT_MAX_AT_LEVEL_1 = 2;
export const PT_MAX_AT_MAX_LEVEL = 99;
export const MAX_CHARACTER_LEVEL = 55;
export const PT_EXPERIENCE_PER_ACTION = 0.0005; // 0.05% experience per action

// Character race constants
export const CHARACTER_RACES = {
  BELLATO: 'Bellato',
  CORA: 'Cora',
  ACCRETIA: 'Accretia',
} as const;

export type CharacterRace = typeof CHARACTER_RACES[keyof typeof CHARACTER_RACES];

// Character sex constants
export const CHARACTER_SEX = {
  MALE: 'Male',
  FEMALE: 'Female',
} as const;

export type CharacterSex = typeof CHARACTER_SEX[keyof typeof CHARACTER_SEX];

// Character grade constants
export const CHARACTER_GRADES = {
  F: 'F',
  E: 'E',
  D: 'D',
  C: 'C',
  B: 'B',
  A: 'A',
  S: 'S',
} as const;

export type CharacterGrade = typeof CHARACTER_GRADES[keyof typeof CHARACTER_GRADES];

// Calculate max PT for a given level (linear interpolation from level 1 to 55)
export function getMaxPtForLevel(level: number): number {
  if (level <= 1) return PT_MAX_AT_LEVEL_1;
  if (level >= MAX_CHARACTER_LEVEL) return PT_MAX_AT_MAX_LEVEL;
  
  // Linear interpolation: at level 1 max is 2, at level 55 max is 99
  const progress = (level - 1) / (MAX_CHARACTER_LEVEL - 1);
  return Math.floor(PT_MAX_AT_LEVEL_1 + progress * (PT_MAX_AT_MAX_LEVEL - PT_MAX_AT_LEVEL_1));
}

// Experience needed to gain 1 PT (100% / 0.05% per action = 2000 actions)
export const PT_EXPERIENCE_TO_LEVEL = 1.0;

// Ability Info - PT stats with experience tracking
export interface AbilityInfo {
  melee: number;      // Melee PT (0-99)
  meleeExp: number;   // Melee experience (0-1, 1 = gain 1 PT)
  range: number;      // Range PT
  rangeExp: number;
  unit: number;       // UNIT PT (MAU/vehicle proficiency)
  unitExp: number;
  force: number;      // Force PT (magic)
  forceExp: number;
  shield: number;     // Shield PT
  shieldExp: number;
  defense: number;    // Defense PT
  defenseExp: number;
}

// Element Resist Info
export interface ElementResistInfo {
  fire: number;
  aqua: number;
  terra: number;
  wind: number;
}

// Status Info - Combat and resource stats
export interface StatusInfo {
  hp: number;
  maxHp: number;
  fp: number;         // Force Points
  maxFp: number;
  sp: number;         // Stamina Points
  maxSp: number;
  defGauge: number;   // Defense Gauge
  maxDefGauge: number;
  expPoints: number;  // Experience Points
  genAttack: number;  // General Attack
  forceAttack: number;// Force Attack
  avgDefPwr: number;  // Average Defense Power
  avgDefRange: number;// Average Defense Range
  avgDefRate: number; // Average Defense Rate
  attackSpeed: number;
  accuracy: number;
  dodge: number;
}

// Base stats for each class - extended with new stat structure
export interface ClassBaseStats {
  // Status Info base values
  hp: number;
  fp: number;
  sp: number;
  defGauge: number;
  genAttack: number;
  forceAttack: number;
  avgDefPwr: number;
  avgDefRange: number;
  avgDefRate: number;
  attackSpeed: number;
  accuracy: number;
  dodge: number;
  // Starting Ability PT values
  melee: number;
  range: number;
  unit: number;
  force: number;
  shield: number;
  defense: number;
  // Element resists
  fire: number;
  aqua: number;
  terra: number;
  wind: number;
}

export const CLASS_BASE_STATS: Record<CharacterClass, ClassBaseStats> = {
  [CHARACTER_CLASSES.WARRIOR]: {
    hp: 120, fp: 50, sp: 80, defGauge: 100,
    genAttack: 12, forceAttack: 3, avgDefPwr: 8, avgDefRange: 5, avgDefRate: 15,
    attackSpeed: 10, accuracy: 85, dodge: 10,
    melee: 1, range: 0, unit: 0, force: 0, shield: 1, defense: 1,
    fire: 5, aqua: 5, terra: 5, wind: 5,
  },
  [CHARACTER_CLASSES.RANGER]: {
    hp: 90, fp: 40, sp: 100, defGauge: 60,
    genAttack: 15, forceAttack: 2, avgDefPwr: 5, avgDefRange: 8, avgDefRate: 12,
    attackSpeed: 15, accuracy: 95, dodge: 20,
    melee: 0, range: 1, unit: 0, force: 0, shield: 0, defense: 0,
    fire: 3, aqua: 3, terra: 3, wind: 3,
  },
  [CHARACTER_CLASSES.SPIRITUALIST]: {
    hp: 80, fp: 120, sp: 60, defGauge: 40,
    genAttack: 6, forceAttack: 15, avgDefPwr: 4, avgDefRange: 3, avgDefRate: 8,
    attackSpeed: 8, accuracy: 80, dodge: 15,
    melee: 0, range: 0, unit: 0, force: 1, shield: 0, defense: 0,
    fire: 8, aqua: 8, terra: 8, wind: 8,
  },
  [CHARACTER_CLASSES.SPECIALIST]: {
    hp: 100, fp: 70, sp: 90, defGauge: 80,
    genAttack: 8, forceAttack: 6, avgDefPwr: 6, avgDefRange: 6, avgDefRate: 10,
    attackSpeed: 12, accuracy: 90, dodge: 12,
    melee: 0, range: 0, unit: 1, force: 0, shield: 0, defense: 1,
    fire: 5, aqua: 5, terra: 5, wind: 5,
  },
};

// General Info - Basic character information
export interface GeneralInfo {
  name: string;
  race: CharacterRace;
  sex: CharacterSex;
  class: CharacterClass;
  classPropensity: string;  // e.g., "Melee DPS", "Tank", "Support"
  grade: CharacterGrade;
  cp: number;  // Combat Power
}

export interface Character {
  // General Info
  generalInfo: GeneralInfo;
  level: number;
  gold: number;
  // Status Info
  statusInfo: StatusInfo;
  // Ability Info (PT stats)
  abilityInfo: AbilityInfo;
  // Element Resist Info
  elementResistInfo: ElementResistInfo;
}

// Legacy Character interface fields for backward compatibility
export interface LegacyCharacter {
  name: string;
  level: number;
  experience: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  gold: number;
  class: CharacterClass;
}

// Inventory constants
export const INVENTORY_ROWS = 5;
export const INVENTORY_COLS = 8;

// Item data interface (from items.json)
export interface ItemData {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  attack?: number;
  defense?: number;
  healAmount?: number;
}

// Get all items from the data file
export function getItemsData(): ItemData[] {
  return itemsData as ItemData[];
}

// Get an item by ID from the data file
export function getItemById(id: string): ItemData | undefined {
  return getItemsData().find(item => item.id === id);
}

// Inventory item in a grid slot (stores only the item ID reference)
export interface InventoryItem {
  itemId: string;
}

// Grid-based inventory slot (null means empty)
export type InventorySlot = InventoryItem | null;

// Full inventory grid type (5 rows x 8 columns)
export type InventoryGrid = InventorySlot[][];

// Create an empty inventory grid
export function createEmptyInventoryGrid(): InventoryGrid {
  return Array.from({ length: INVENTORY_ROWS }, () => 
    Array.from({ length: INVENTORY_COLS }, () => null)
  );
}

// Create an inventory grid with starter items
export function createStarterInventoryGrid(): InventoryGrid {
  const grid = createEmptyInventoryGrid();
  
  // Add some starter items for demonstration using item IDs
  grid[0][0] = { itemId: 'sword_basic' };
  grid[0][1] = { itemId: 'potion_health' };
  grid[0][2] = { itemId: 'potion_health' };
  grid[1][0] = { itemId: 'leather_armor' };
  grid[2][3] = { itemId: 'iron_ore' };
  
  return grid;
}

export interface QuestRewards {
  gold: number;
  exp: number;
  item?: string;
}

export interface Quest {
  id: string;
  level: number;
  title: string;
  type: QuestType;
  description: string;
  targetMonster: string;
  targetMaterial?: string;
  targetAmount: number;
  rewards: QuestRewards;
}

export interface ActiveQuest {
  quest: Quest;
  progress: number;
  isComplete: boolean;
}

export interface GameState {
  character: Character | null;
  currentZone: string | null;
  isInBattle: boolean;
  inventory: string[];
  inventoryGrid: InventoryGrid;
  materials: Record<string, number>;
  activeQuest: ActiveQuest | null;
  completedQuestIds: string[];
  hasStartedGame: boolean;
}

// Initial state for a new game (before character creation)
export const initialGameState: GameState = {
  character: null,
  currentZone: null,
  isInBattle: false,
  inventory: [],
  inventoryGrid: createStarterInventoryGrid(),
  materials: {},
  activeQuest: null,
  completedQuestIds: [],
  hasStartedGame: false,
};

// Validate character name
export function validateCharacterName(name: string): { valid: boolean; error?: string } {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { valid: false, error: 'Please enter a character name' };
  }
  
  if (trimmedName.length < CHARACTER_NAME_MIN_LENGTH) {
    return { valid: false, error: `Character name must be at least ${CHARACTER_NAME_MIN_LENGTH} characters` };
  }
  
  if (trimmedName.length > CHARACTER_NAME_MAX_LENGTH) {
    return { valid: false, error: `Character name must be ${CHARACTER_NAME_MAX_LENGTH} characters or less` };
  }
  
  return { valid: true };
}

// Class propensity descriptions
export const CLASS_PROPENSITIES: Record<CharacterClass, string> = {
  [CHARACTER_CLASSES.WARRIOR]: 'Melee DPS / Tank',
  [CHARACTER_CLASSES.RANGER]: 'Ranged DPS',
  [CHARACTER_CLASSES.SPIRITUALIST]: 'Force DPS / Support',
  [CHARACTER_CLASSES.SPECIALIST]: 'Utility / Crafting',
};

// Calculate Combat Power from stats
export function calculateCP(statusInfo: StatusInfo, abilityInfo: AbilityInfo): number {
  const statusCP = statusInfo.genAttack * 10 + statusInfo.forceAttack * 10 +
    statusInfo.avgDefPwr * 5 + statusInfo.attackSpeed * 3 +
    statusInfo.accuracy + statusInfo.dodge;
  const abilityCP = (abilityInfo.melee + abilityInfo.range + abilityInfo.unit +
    abilityInfo.force + abilityInfo.shield + abilityInfo.defense) * 5;
  return Math.floor(statusCP + abilityCP);
}

// Create a new character with class-specific base stats
export function createCharacter(
  name: string,
  characterClass: CharacterClass,
  race: CharacterRace = CHARACTER_RACES.BELLATO,
  sex: CharacterSex = CHARACTER_SEX.MALE
): Character {
  const baseStats = CLASS_BASE_STATS[characterClass];
  
  const statusInfo: StatusInfo = {
    hp: baseStats.hp,
    maxHp: baseStats.hp,
    fp: baseStats.fp,
    maxFp: baseStats.fp,
    sp: baseStats.sp,
    maxSp: baseStats.sp,
    defGauge: baseStats.defGauge,
    maxDefGauge: baseStats.defGauge,
    expPoints: 0,
    genAttack: baseStats.genAttack,
    forceAttack: baseStats.forceAttack,
    avgDefPwr: baseStats.avgDefPwr,
    avgDefRange: baseStats.avgDefRange,
    avgDefRate: baseStats.avgDefRate,
    attackSpeed: baseStats.attackSpeed,
    accuracy: baseStats.accuracy,
    dodge: baseStats.dodge,
  };
  
  const abilityInfo: AbilityInfo = {
    melee: baseStats.melee,
    meleeExp: 0,
    range: baseStats.range,
    rangeExp: 0,
    unit: baseStats.unit,
    unitExp: 0,
    force: baseStats.force,
    forceExp: 0,
    shield: baseStats.shield,
    shieldExp: 0,
    defense: baseStats.defense,
    defenseExp: 0,
  };
  
  const elementResistInfo: ElementResistInfo = {
    fire: baseStats.fire,
    aqua: baseStats.aqua,
    terra: baseStats.terra,
    wind: baseStats.wind,
  };
  
  const generalInfo: GeneralInfo = {
    name,
    race,
    sex,
    class: characterClass,
    classPropensity: CLASS_PROPENSITIES[characterClass],
    grade: CHARACTER_GRADES.F,
    cp: calculateCP(statusInfo, abilityInfo),
  };
  
  return {
    generalInfo,
    level: 1,
    gold: STARTING_GOLD,
    statusInfo,
    abilityInfo,
    elementResistInfo,
  };
}

// Storage key for persisting game state
export const GAME_STATE_STORAGE_KEY = 'bellato-idle-game-state';

// Check if character is in legacy format
function isLegacyCharacter(char: Record<string, unknown>): boolean {
  return typeof char.name === 'string' && 
         typeof char.class === 'string' && 
         !char.generalInfo;
}

// Check if character is in new format
function isNewCharacter(char: Record<string, unknown>): boolean {
  return typeof char.generalInfo === 'object' && 
         char.generalInfo !== null &&
         typeof char.statusInfo === 'object' &&
         typeof char.abilityInfo === 'object' &&
         typeof char.elementResistInfo === 'object';
}

// Migrate legacy character to new format
export function migrateLegacyCharacter(legacy: LegacyCharacter): Character {
  const characterClass = legacy.class;
  const baseStats = CLASS_BASE_STATS[characterClass];
  
  const statusInfo: StatusInfo = {
    hp: legacy.hp,
    maxHp: legacy.maxHp,
    fp: baseStats.fp,
    maxFp: baseStats.fp,
    sp: baseStats.sp,
    maxSp: baseStats.sp,
    defGauge: baseStats.defGauge,
    maxDefGauge: baseStats.defGauge,
    expPoints: legacy.experience,
    genAttack: legacy.attack || baseStats.genAttack,
    forceAttack: baseStats.forceAttack,
    avgDefPwr: legacy.defense || baseStats.avgDefPwr,
    avgDefRange: baseStats.avgDefRange,
    avgDefRate: baseStats.avgDefRate,
    attackSpeed: baseStats.attackSpeed,
    accuracy: baseStats.accuracy,
    dodge: baseStats.dodge,
  };
  
  const abilityInfo: AbilityInfo = {
    melee: baseStats.melee,
    meleeExp: 0,
    range: baseStats.range,
    rangeExp: 0,
    unit: baseStats.unit,
    unitExp: 0,
    force: baseStats.force,
    forceExp: 0,
    shield: baseStats.shield,
    shieldExp: 0,
    defense: baseStats.defense,
    defenseExp: 0,
  };
  
  const elementResistInfo: ElementResistInfo = {
    fire: baseStats.fire,
    aqua: baseStats.aqua,
    terra: baseStats.terra,
    wind: baseStats.wind,
  };
  
  const generalInfo: GeneralInfo = {
    name: legacy.name,
    race: CHARACTER_RACES.BELLATO,
    sex: CHARACTER_SEX.MALE,
    class: characterClass,
    classPropensity: CLASS_PROPENSITIES[characterClass],
    grade: CHARACTER_GRADES.F,
    cp: calculateCP(statusInfo, abilityInfo),
  };
  
  return {
    generalInfo,
    level: legacy.level,
    gold: legacy.gold,
    statusInfo,
    abilityInfo,
    elementResistInfo,
  };
}

// Validate that a value is a valid GameState object
export function isValidGameState(value: unknown): value is GameState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  const state = value as Record<string, unknown>;
  
  // Check required properties exist with correct types
  if (typeof state.hasStartedGame !== 'boolean') return false;
  if (typeof state.isInBattle !== 'boolean') return false;
  if (!Array.isArray(state.inventory)) return false;
  if (!Array.isArray(state.completedQuestIds)) return false;
  if (typeof state.materials !== 'object' || state.materials === null) return false;
  
  // Validate inventoryGrid if it exists
  if (state.inventoryGrid !== undefined) {
    if (!Array.isArray(state.inventoryGrid)) return false;
    // Validate grid structure (should be 5 rows x 8 columns)
    if (state.inventoryGrid.length !== INVENTORY_ROWS) return false;
    for (const row of state.inventoryGrid) {
      if (!Array.isArray(row)) return false;
      if (row.length !== INVENTORY_COLS) return false;
    }
  }
  
  // Character can be null or a valid Character object (legacy or new format)
  if (state.character !== null) {
    const char = state.character as Record<string, unknown>;
    // Accept both legacy format and new format
    if (!isLegacyCharacter(char) && !isNewCharacter(char)) {
      return false;
    }
    if (typeof char.level !== 'number') return false;
  }
  
  return true;
}

// Migrate old game state to include new fields
export function migrateGameState(state: GameState): GameState {
  let migratedState = state;
  
  // Migrate inventoryGrid if missing
  if (!migratedState.inventoryGrid) {
    migratedState = {
      ...migratedState,
      inventoryGrid: createStarterInventoryGrid(),
    };
  }
  
  // Migrate legacy character to new format
  if (migratedState.character) {
    const char = migratedState.character as unknown as Record<string, unknown>;
    if (isLegacyCharacter(char)) {
      migratedState = {
        ...migratedState,
        character: migrateLegacyCharacter(char as unknown as LegacyCharacter),
      };
    }
  }
  
  return migratedState;
}
