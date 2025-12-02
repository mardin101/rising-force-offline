import { useState, useCallback } from 'react';
import type { Quest, ActiveQuest, GameState, Character } from '../state/gameStateSlice';
import { QUEST_TYPE, CHARACTER_CLASSES, CHARACTER_RACES, CHARACTER_SEX, CHARACTER_GRADES, CLASS_BASE_STATS, CLASS_PROPENSITIES, calculateCP } from '../state/gameStateSlice';
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

export function useQuest(initialState?: Partial<GameState>): UseQuestReturn {
  const [activeQuest, setActiveQuest] = useState<ActiveQuest | null>(
    initialState?.activeQuest ?? null
  );
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>(
    initialState?.completedQuestIds ?? []
  );
  
  // Create default character if not provided
  const defaultCharacter = (): Character => {
    const baseStats = CLASS_BASE_STATS[CHARACTER_CLASSES.WARRIOR];
    const statusInfo = {
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
    const abilityInfo = {
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
    const elementResistInfo = {
      fire: baseStats.fire,
      aqua: baseStats.aqua,
      terra: baseStats.terra,
      wind: baseStats.wind,
    };
    return {
      generalInfo: {
        name: 'Hero',
        race: CHARACTER_RACES.BELLATO,
        sex: CHARACTER_SEX.MALE,
        class: CHARACTER_CLASSES.WARRIOR,
        classPropensity: CLASS_PROPENSITIES[CHARACTER_CLASSES.WARRIOR],
        grade: CHARACTER_GRADES.F,
        cp: calculateCP(statusInfo, abilityInfo),
      },
      level: 1,
      gold: 0,
      statusInfo,
      abilityInfo,
      elementResistInfo,
    };
  };
  
  const [character, setCharacter] = useState<Character>(
    initialState?.character ?? defaultCharacter()
  );
  const [playerMaterials, setPlayerMaterials] = useState<Record<string, number>>(
    initialState?.materials ?? {}
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

    // Apply rewards
    setCharacter((prev) => ({
      ...prev,
      gold: prev.gold + quest.rewards.gold,
      statusInfo: {
        ...prev.statusInfo,
        expPoints: prev.statusInfo.expPoints + quest.rewards.exp,
      },
    }));

    // Mark quest as completed
    setCompletedQuestIds((prev) => [...prev, quest.id]);

    // Clear active quest
    setActiveQuest(null);

    return { rewards: quest.rewards };
  }, [activeQuest]);

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
