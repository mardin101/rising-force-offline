import { useCallback } from 'react';
import type { Quest, ActiveQuest, Character, InventoryGrid } from '../state/gameStateSlice';
import { QUEST_TYPE, calculateExpAndLevel } from '../state/gameStateSlice';
import { addItemToInventory } from '../utils/inventoryManager';
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
  updateCharacter: (updater: Partial<Character> | ((currentChar: Character) => Partial<Character>)) => void;
  inventoryGrid: InventoryGrid;
  updateInventoryGrid: (updater: InventoryGrid | ((currentGrid: InventoryGrid) => InventoryGrid)) => void;
  activeQuest: ActiveQuest | null;
  updateActiveQuest: (quest: ActiveQuest | null) => void;
  completedQuestIds: string[];
  updateCompletedQuestIds: (ids: string[]) => void;
  materials: Record<string, number>;
  updateMaterials: (materials: Record<string, number>) => void;
}

export function useQuest(props: UseQuestProps): UseQuestReturn {
  const { 
    character, 
    updateCharacter, 
    updateInventoryGrid,
    activeQuest,
    updateActiveQuest,
    completedQuestIds,
    updateCompletedQuestIds,
    materials: playerMaterials,
    updateMaterials,
  } = props;

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
    updateActiveQuest({
      quest,
      progress: 0,
      isComplete: false,
    });
  }, [activeQuest, completedQuestIds, updateActiveQuest]);

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
        const newProgress = activeQuest.progress + 1;
        const isComplete = newProgress >= activeQuest.quest.targetAmount;
        updateActiveQuest({
          ...activeQuest,
          progress: newProgress,
          isComplete,
        });
      }
    },
    [activeQuest, updateActiveQuest]
  );

  const completeQuest = useCallback((): { rewards: Quest['rewards'] } | null => {
    if (!activeQuest || !activeQuest.isComplete) {
      return null;
    }

    const { quest } = activeQuest;

    // Apply rewards to the actual player character using functional update to avoid race conditions
    updateCharacter((currentChar) => {
      // Calculate new experience and level using percentage-based exp
      const { newLevel, newExp } = calculateExpAndLevel(
        currentChar.level,
        currentChar.statusInfo.expPoints,
        quest.rewards.exp
      );
      
      return {
        gold: currentChar.gold + quest.rewards.gold,
        level: newLevel,
        statusInfo: {
          ...currentChar.statusInfo,
          expPoints: newExp,
        },
      };
    });

    // Add item reward to inventory if present using functional update to avoid race conditions
    if (quest.rewards.item) {
      const itemId = quest.rewards.item;
      updateInventoryGrid((currentGrid) => {
        const result = addItemToInventory(currentGrid, itemId);
        if (!result.success) {
          console.warn('Inventory full, could not add quest reward item:', itemId);
        }
        return result.grid;
      });
    }

    // Mark quest as completed
    updateCompletedQuestIds([...completedQuestIds, quest.id]);

    // Clear active quest
    updateActiveQuest(null);

    return { rewards: quest.rewards };
  }, [activeQuest, completedQuestIds, updateCompletedQuestIds, updateActiveQuest, updateCharacter, updateInventoryGrid]);

  // Simulate killing a monster (for demo purposes)
  const simulateMonsterKill = useCallback((monsterId: string) => {
    const monster = monsters.find((m) => m.id === monsterId);
    if (!monster) return;

    // Check if material drops
    if (monster.materialDropId && Math.random() < monster.materialDropRate) {
      const materialId = monster.materialDropId;
      updateMaterials({
        ...playerMaterials,
        [materialId]: (playerMaterials[materialId] ?? 0) + 1,
      });
      updateQuestProgress(monsterId, materialId);
    } else {
      updateQuestProgress(monsterId);
    }
  }, [updateQuestProgress, playerMaterials, updateMaterials]);

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
