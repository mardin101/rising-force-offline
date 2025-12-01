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
  materials: {},
  activeQuest: null,
  completedQuestIds: [],
  hasStartedGame: false,
};

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
    gold: 100, // Starting gold
    class: characterClass,
  };
}

// Storage key for persisting game state
export const GAME_STATE_STORAGE_KEY = 'bellato-idle-game-state';
