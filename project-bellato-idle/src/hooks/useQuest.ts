import { useState, useCallback } from 'react';
import type { Quest, ActiveQuest, Character, InventoryGrid } from '../state/gameStateSlice';
import { QUEST_TYPE, INVENTORY_ROWS, INVENTORY_COLS } from '../state/gameStateSlice';
import questsData from '../data/quests.json';
import monstersData from '../data/monsters.json';
import materialsData from '../data/materials.json';

// Type for monster data with material drops
interface MonsterData {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  expReward: number;
  goldDrop: [number, number];
  levelRange: [number, number];
  materialDropId: string;
  materialDropRate: number;
}

// Type for material data
interface MaterialData {
  id: string;
  name: string;
  description: string;
}

const quests = questsData as Quest[];
const monsters = monstersData as MonsterData[];
const materials = materialsData as MaterialData[];

export interface UseQuestReturn {
  activeQuest: ActiveQuest | null;
  completedQuestIds: string[];
  availableQuest: Quest | null;
  character: Character;
  materials: Record<string, number>;
  acceptQuest: (quest: Quest) => void;
  simulateMonsterKill: (monsterId: string) => void;
  completeQuest: () => { rewards: Quest['rewards'] } | null;
  getMonsterName: (monsterId: string) => string;
  getMaterialName: (materialId: string) => string;
}

// Props for integrating with actual game state
export interface UseQuestProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  inventoryGrid: InventoryGrid;
  updateInventoryGrid: (grid: InventoryGrid) => void;
  initialActiveQuest?: ActiveQuest | null;
  initialCompletedQuestIds?: string[];
  initialMaterials?: Record<string, number>;
}

// Find the first empty slot in the inventory grid
function findEmptySlot(grid: InventoryGrid): { row: number; col: number } | null {
  for (let row = 0; row < INVENTORY_ROWS; row++) {
    for (let col = 0; col < INVENTORY_COLS; col++) {
      if (grid[row][col] === null) {
        return { row, col };
      }
    }
  }
  return null;
}

export function useQuest(props: UseQuestProps): UseQuestReturn {
  const { 
    character, 
    updateCharacter, 
    inventoryGrid, 
    updateInventoryGrid,
    initialActiveQuest,
    initialCompletedQuestIds,
    initialMaterials
  } = props;
  
  const [activeQuest, setActiveQuest] = useState<ActiveQuest | null>(
    initialActiveQuest ?? null
  );
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>(
    initialCompletedQuestIds ?? []
  );
  
  const [playerMaterials, setPlayerMaterials] = useState<Record<string, number>>(
    initialMaterials ?? {}
  );

  // Get the next available quest for the player's current level (lowest level first for progression)
  const availableQuest: Quest | null = quests
    .filter((quest) => quest.level <= character.level && !completedQuestIds.includes(quest.id))
    .sort((a, b) => a.level - b.level)[0] ?? null;

  const getMonsterName = useCallback((monsterId: string): string => {
    const monster = monsters.find((m) => m.id === monsterId);
    return monster?.name ?? monsterId;
  }, []);

  const getMaterialName = useCallback((materialId: string): string => {
    const material = materials.find((m) => m.id === materialId);
    return material?.name ?? materialId;
  }, []);

  const acceptQuest = useCallback((quest: Quest) => {
    if (activeQuest !== null) {
      console.warn('Cannot accept a new quest while one is active');
      return;
    }
    if (completedQuestIds.includes(quest.id)) {
      console.warn('Quest already completed');
      return;
    }
    setActiveQuest({
      quest,
      progress: 0,
      isComplete: false,
    });
  }, [activeQuest, completedQuestIds]);

  const updateQuestProgress = useCallback(
    (monsterId: string, materialId?: string) => {
      if (!activeQuest || activeQuest.isComplete) return;

      const { quest } = activeQuest;
      let shouldIncrement = false;

      if (quest.type === QUEST_TYPE.SLAY && quest.targetMonster === monsterId) {
        shouldIncrement = true;
      } else if (
        quest.type === QUEST_TYPE.COLLECT &&
        quest.targetMaterial === materialId
      ) {
        shouldIncrement = true;
      }

      if (shouldIncrement) {
        setActiveQuest((prev) => {
          if (!prev) return null;
          const newProgress = prev.progress + 1;
          const isComplete = newProgress >= prev.quest.targetAmount;
          return {
            ...prev,
            progress: newProgress,
            isComplete,
          };
        });
      }
    },
    [activeQuest]
  );

  const completeQuest = useCallback((): { rewards: Quest['rewards'] } | null => {
    if (!activeQuest || !activeQuest.isComplete) {
      return null;
    }

    const { quest } = activeQuest;

    // Apply rewards to the actual player character
    updateCharacter({
      gold: character.gold + quest.rewards.gold,
      statusInfo: {
        ...character.statusInfo,
        expPoints: character.statusInfo.expPoints + quest.rewards.exp,
      },
    });

    // Add item reward to inventory if present
    if (quest.rewards.item) {
      const emptySlot = findEmptySlot(inventoryGrid);
      if (emptySlot) {
        const newGrid = inventoryGrid.map(row => [...row]);
        newGrid[emptySlot.row][emptySlot.col] = { itemId: quest.rewards.item };
        updateInventoryGrid(newGrid);
      } else {
        console.warn('Inventory full, could not add quest reward item:', quest.rewards.item);
      }
    }

    // Mark quest as completed
    setCompletedQuestIds((prev) => [...prev, quest.id]);

    // Clear active quest
    setActiveQuest(null);

    return { rewards: quest.rewards };
  }, [activeQuest, character, updateCharacter, inventoryGrid, updateInventoryGrid]);

  // Simulate killing a monster (for demo purposes)
  const simulateMonsterKill = useCallback((monsterId: string) => {
    const monster = monsters.find((m) => m.id === monsterId);
    if (!monster) return;

    // Check if material drops
    if (monster.materialDropId && Math.random() < monster.materialDropRate) {
      const materialId = monster.materialDropId;
      setPlayerMaterials((prev) => ({
        ...prev,
        [materialId]: (prev[materialId] ?? 0) + 1,
      }));
      updateQuestProgress(monsterId, materialId);
    } else {
      updateQuestProgress(monsterId);
    }
  }, [updateQuestProgress]);

  return {
    activeQuest,
    completedQuestIds,
    availableQuest,
    character,
    materials: playerMaterials,
    acceptQuest,
    simulateMonsterKill,
    completeQuest,
    getMonsterName,
    getMaterialName,
  };
}
