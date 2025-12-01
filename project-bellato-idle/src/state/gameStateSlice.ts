// Placeholder for game state management (e.g., Redux, Zustand)
// This file will contain the core game state structure

export interface Character {
  name: string;
  level: number;
  experience: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  gold: number;
  class: string;
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
  type: 'slay' | 'collect';
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
  character: Character;
  currentZone: string | null;
  isInBattle: boolean;
  inventory: string[];
  materials: Record<string, number>;
  activeQuest: ActiveQuest | null;
  completedQuestIds: string[];
}

// Initial state placeholder
export const initialGameState: GameState = {
  character: {
    name: "Hero",
    level: 1,
    experience: 0,
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    gold: 0,
    class: "Warrior",
  },
  currentZone: null,
  isInBattle: false,
  inventory: [],
  materials: {},
  activeQuest: null,
  completedQuestIds: [],
};

// Placeholder actions - to be implemented with state management library
export const gameActions = {
  startBattle: (zoneId: string) => {
    console.log(`Starting battle in zone: ${zoneId}`);
  },
  endBattle: () => {
    console.log("Ending battle");
  },
  addItem: (itemId: string) => {
    console.log(`Adding item: ${itemId}`);
  },
  gainExperience: (amount: number) => {
    console.log(`Gaining ${amount} experience`);
  },
};
