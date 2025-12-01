// Game state management
// This file contains the core game state structure and types

// Quest type constants
export const QUEST_TYPE = {
  SLAY: 'slay',
  COLLECT: 'collect',
} as const;

export type QuestType = typeof QUEST_TYPE[keyof typeof QUEST_TYPE];

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

// Base stats for each class
export const CLASS_BASE_STATS: Record<CharacterClass, { hp: number; attack: number; defense: number }> = {
  [CHARACTER_CLASSES.WARRIOR]: { hp: 120, attack: 12, defense: 8 },
  [CHARACTER_CLASSES.RANGER]: { hp: 90, attack: 15, defense: 5 },
  [CHARACTER_CLASSES.SPIRITUALIST]: { hp: 80, attack: 10, defense: 4 },
  [CHARACTER_CLASSES.SPECIALIST]: { hp: 100, attack: 8, defense: 6 },
};

export interface Character {
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

// Inventory item in a grid slot
export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  description?: string;
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
  
  // Add some starter items for demonstration
  grid[0][0] = {
    id: 'sword_basic',
    name: 'Basic Sword',
    type: 'weapon',
    description: 'A basic iron sword for beginners.',
  };
  grid[0][1] = {
    id: 'potion_health',
    name: 'Health Potion',
    type: 'consumable',
    description: 'Restores 50 HP when consumed.',
  };
  grid[0][2] = {
    id: 'potion_health_2',
    name: 'Health Potion',
    type: 'consumable',
    description: 'Restores 50 HP when consumed.',
  };
  grid[1][0] = {
    id: 'leather_armor',
    name: 'Leather Armor',
    type: 'armor',
    description: 'Basic leather armor.',
  };
  grid[2][3] = {
    id: 'iron_ore',
    name: 'Iron Ore',
    type: 'material',
    description: 'Raw iron ore for crafting.',
  };
  
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

// Create a new character with class-specific base stats
export function createCharacter(name: string, characterClass: CharacterClass): Character {
  const baseStats = CLASS_BASE_STATS[characterClass];
  return {
    name,
    level: 1,
    experience: 0,
    hp: baseStats.hp,
    maxHp: baseStats.hp,
    attack: baseStats.attack,
    defense: baseStats.defense,
    gold: STARTING_GOLD,
    class: characterClass,
  };
}

// Storage key for persisting game state
export const GAME_STATE_STORAGE_KEY = 'bellato-idle-game-state';

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
  }
  
  // Character can be null or a valid Character object
  if (state.character !== null) {
    const char = state.character as Record<string, unknown>;
    if (typeof char.name !== 'string') return false;
    if (typeof char.level !== 'number') return false;
    if (typeof char.class !== 'string') return false;
  }
  
  return true;
}

// Migrate old game state to include inventoryGrid if missing
export function migrateGameState(state: GameState): GameState {
  if (!state.inventoryGrid) {
    return {
      ...state,
      inventoryGrid: createStarterInventoryGrid(),
    };
  }
  return state;
}
