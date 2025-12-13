import { useState, useEffect, useRef, useCallback } from 'react';
import zones from '../data/zones.json';
import monsters from '../data/monsters.json';
import { useGameState } from '../state/GameStateContext';
import { useQuestContext } from '../state/QuestContext';
import { 
  calculateExpAndLevel, 
  calculateDeathPenalty, 
  calculatePtExpGain,
  calculatePtAndExp,
  getMaxPtForLevel,
  getExperienceMultiplier,
  DEATH_EXP_PENALTY, 
  getItemById, 
  ITEM_TYPE,
  WEAPON_TYPE,
  EQUIPMENT_SLOT,
} from '../state/gameStateSlice';
import { QuestProgress } from '../components/game';

interface Zone {
  id: string;
  name: string;
  levelRequirement: number;
  monsters: string[];
  description: string;
}

interface Monster {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  expReward: number;
  expOnHit: number;
  goldDrop: number[];
  levelRange: number[];
  materialDropId: string;
  materialDropRate: number;
}

interface BattleState {
  isActive: boolean;
  monsterCurrentHp: number;
  playerCurrentHp: number;
  battleLog: string[];
  isVictory: boolean | null;
  pendingReward: { expGain: number; goldGain: number; monsterId: string } | null;
  pendingDeathPenalty: { expLost: number } | null;
  monstersDefeated: number; // Track total monsters defeated in continuous mode
  pendingExpOnHit: number;
  // PT experience tracking
  pendingPtExp: {
    melee: number;
    range: number;
    shield: number;
    defense: number;
  };
}

// Combat constants
const DAMAGE_VARIANCE = 0.2; // ±20% damage variance
const BASE_ATTACK_SPEED = 10; // Default attack speed value
const MIN_TICK_INTERVAL_MS = 200; // Minimum time between attacks in ms
const BASE_TICK_INTERVAL_MS = 1000; // Base interval between attacks in ms
const CONTINUOUS_BATTLE_DELAY_MS = 500; // Delay before starting next battle in continuous mode

/**
 * Calculate damage dealt from an attacker to a defender.
 * 
 * @param attack - The attacker's attack power
 * @param defense - The defender's defense power
 * @returns The calculated damage amount (minimum 1)
 * 
 * @description
 * Damage formula: (attack - defense) with ±20% variance.
 * The base damage is clamped to a minimum of 1 before variance is applied.
 * The final damage is also clamped to a minimum of 1.
 */
function calculateDamage(attack: number, defense: number): number {
  // Base damage = attack - defense, minimum 1 damage
  const baseDamage = Math.max(1, attack - defense);
  // Add variance (±DAMAGE_VARIANCE, default ±20%)
  const multiplier = 1 + (Math.random() * 2 - 1) * DAMAGE_VARIANCE;
  return Math.max(1, Math.floor(baseDamage * multiplier));
}

export default function Battle() {
  const { gameState, updateCharacter, updateMaterials, updateCurrentZone, consumeMacroPotion } = useGameState();
  const { recordMonsterKill } = useQuestContext();
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  // Initialize selectedZone from global state if available
  const [selectedZone, setSelectedZone] = useState<Zone | null>(() => {
    if (gameState.currentZone) {
      const zone = (zones as Zone[]).find((z) => z.id === gameState.currentZone);
      return zone ?? null;
    }
    return null;
  });
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
  const [continuousCombat, setContinuousCombat] = useState(false);
  const [battleState, setBattleState] = useState<BattleState>({
    isActive: false,
    monsterCurrentHp: 0,
    playerCurrentHp: 0,
    battleLog: [],
    isVictory: null,
    pendingReward: null,
    pendingDeathPenalty: null,
    monstersDefeated: 0,
    pendingExpOnHit: 0,
    pendingPtExp: {
      melee: 0,
      range: 0,
      shield: 0,
      defense: 0,
    },
  });
  
  const battleIntervalRef = useRef<number | null>(null);
  const continuousBattleTimeoutRef = useRef<number | null>(null);
  const victoryProcessedRef = useRef<boolean>(false);
  const defeatProcessedRef = useRef<boolean>(false);
  const processBattleTickRef = useRef<(() => void) | null>(null);
  const continuousCombatRef = useRef<boolean>(false);
  const battleLogRef = useRef<HTMLDivElement>(null);
  
  // Keep ref in sync with state for use in callbacks
  useEffect(() => {
    continuousCombatRef.current = continuousCombat;
  }, [continuousCombat]);
  const lastAppliedExpOnHitRef = useRef<number>(0);
  const lastAppliedPtExpRef = useRef({
    melee: 0,
    range: 0,
    shield: 0,
    defense: 0,
  });

  // Auto-scroll battle log to bottom when new entries are added
  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [battleState.battleLog]);

  // Helper function to check if macro should trigger and consume potion
  const checkAndUseMacroPotion = useCallback((currentHp: number): { newHp: number; message: string | null } => {
    const { macroState, inventoryGrid, character } = gameState;
    
    // Check if macro is enabled and has a valid potion slot
    if (!macroState.enabled || !macroState.potionSlot || !character) {
      return { newHp: currentHp, message: null };
    }

    // Clamp threshold to current max HP and check if HP is below threshold
    const effectiveThreshold = Math.min(macroState.hpThreshold, character.statusInfo.maxHp);
    if (currentHp >= effectiveThreshold) {
      return { newHp: currentHp, message: null };
    }

    // Check if there's a valid potion in the slot
    const { row, col } = macroState.potionSlot;
    const item = inventoryGrid[row]?.[col];
    if (!item) {
      return { newHp: currentHp, message: null };
    }

    const itemData = getItemById(item.itemId);
    if (!itemData || itemData.type !== ITEM_TYPE.CONSUMABLE || !itemData.amount) {
      return { newHp: currentHp, message: null };
    }

    // Check if already at or above max HP
    if (currentHp >= character.statusInfo.maxHp) {
      return { newHp: currentHp, message: null };
    }

    // Consume the potion via the context, passing current battle HP for accurate calculation
    const result = consumeMacroPotion(currentHp);
    if (result.success) {
      return { newHp: currentHp + result.healAmount, message: result.message };
    }

    return { newHp: currentHp, message: null };
  }, [gameState, consumeMacroPotion]);

  const handleZoneSelect = (zone: Zone) => {
    setSelectedZone(zone);
    updateCurrentZone(zone.id);
    setIsPortalOpen(false);
  };

  const getMonstersByZone = (zone: Zone): Monster[] => {
    return (monsters as Monster[]).filter((monster) => zone.monsters.includes(monster.id));
  };

  const handleMonsterSelect = (monster: Monster) => {
    setSelectedMonster(monster);
    // Reset battle state when selecting a new monster
    setBattleState({
      isActive: false,
      monsterCurrentHp: monster.hp,
      playerCurrentHp: gameState.character?.statusInfo.hp ?? 0,
      battleLog: [],
      isVictory: null,
      pendingReward: null,
      pendingDeathPenalty: null,
      monstersDefeated: 0,
      pendingExpOnHit: 0,
      pendingPtExp: {
        melee: 0,
        range: 0,
        shield: 0,
        defense: 0,
      },
    });
    victoryProcessedRef.current = false;
    defeatProcessedRef.current = false;
    lastAppliedExpOnHitRef.current = 0;
    lastAppliedPtExpRef.current = {
      melee: 0,
      range: 0,
      shield: 0,
      defense: 0,
    };
  };

  const closeBattleModal = () => {
    // Stop any active battle
    if (battleIntervalRef.current) {
      clearInterval(battleIntervalRef.current);
      battleIntervalRef.current = null;
    }
    // Clear any pending continuous battle timeout
    if (continuousBattleTimeoutRef.current) {
      clearTimeout(continuousBattleTimeoutRef.current);
      continuousBattleTimeoutRef.current = null;
    }
    setSelectedMonster(null);
    setBattleState({
      isActive: false,
      monsterCurrentHp: 0,
      playerCurrentHp: 0,
      battleLog: [],
      isVictory: null,
      pendingReward: null,
      pendingDeathPenalty: null,
      monstersDefeated: 0,
      pendingExpOnHit: 0,
      pendingPtExp: {
        melee: 0,
        range: 0,
        shield: 0,
        defense: 0,
      },
    });
    victoryProcessedRef.current = false;
    defeatProcessedRef.current = false;
    lastAppliedExpOnHitRef.current = 0;
    lastAppliedPtExpRef.current = {
      melee: 0,
      range: 0,
      shield: 0,
      defense: 0,
    };
  };

  // Flee from battle - stops combat without rewards or penalties
  const fleeBattle = useCallback(() => {
    // Stop the battle interval
    if (battleIntervalRef.current) {
      clearInterval(battleIntervalRef.current);
      battleIntervalRef.current = null;
    }
    
    setBattleState((prev) => ({
      ...prev,
      isActive: false,
      battleLog: [...prev.battleLog, 'You fled from battle!'],
      isVictory: null,
      monstersDefeated: 0,
    }));
  }, []);

  // End combat after victory (when in continuous mode)
  const endCombat = useCallback(() => {
    // Stop the battle interval if any
    if (battleIntervalRef.current) {
      clearInterval(battleIntervalRef.current);
      battleIntervalRef.current = null;
    }
    
    // Reset battle state but keep the modal open
    setBattleState((prev) => ({
      isActive: false,
      monsterCurrentHp: selectedMonster?.hp ?? 0,
      playerCurrentHp: prev.playerCurrentHp,
      battleLog: [...prev.battleLog, `Combat ended. Defeated ${prev.monstersDefeated} monster(s).`],
      isVictory: null,
      pendingReward: null,
      pendingDeathPenalty: null,
      monstersDefeated: 0,
      pendingExpOnHit: 0,
      pendingPtExp: {
        melee: 0,
        range: 0,
        shield: 0,
        defense: 0,
      },
    }));
    victoryProcessedRef.current = false;
    defeatProcessedRef.current = false;
  }, [selectedMonster?.hp]);

  const processBattleTick = useCallback(() => {
    if (!selectedMonster || !gameState.character) return;

    setBattleState((prev) => {
      if (!prev.isActive || prev.isVictory !== null) return prev;

      const newLog = [...prev.battleLog];
      let newMonsterHp = prev.monsterCurrentHp;
      let newPlayerHp = prev.playerCurrentHp;
      let newPendingExpOnHit = prev.pendingExpOnHit;
      const newPendingPtExp = { ...prev.pendingPtExp };

      // Get monster level (average of level range)
      const monsterLevel = Math.floor((selectedMonster.levelRange[0] + selectedMonster.levelRange[1]) / 2);

      // Player attacks monster
      const playerDamage = calculateDamage(
        gameState.character!.statusInfo.genAttack,
        selectedMonster.defense
      );
      newMonsterHp = Math.max(0, newMonsterHp - playerDamage);
      newLog.push(`${gameState.character!.generalInfo.name} hits ${selectedMonster.name} for ${playerDamage} damage!`);

      // Grant experience on hit (tiny portion)
      const expOnHit = selectedMonster.expOnHit;
      newPendingExpOnHit += expOnHit;
      console.log(`[EXP] Gained ${(expOnHit * 100).toFixed(4)}% experience from attacking ${selectedMonster.name}`);

      // Grant PT experience based on equipped weapon
      const equippedWeapon = gameState.equippedItems[EQUIPMENT_SLOT.WEAPON];
      if (equippedWeapon) {
        const weaponData = getItemById(equippedWeapon.itemId);
        if (weaponData && weaponData.weaponType) {
          if (weaponData.weaponType === WEAPON_TYPE.MELEE) {
            // Grant Melee PT experience
            const meleePtExp = calculatePtExpGain(
              gameState.character!.abilityInfo.melee,
              gameState.character!.level,
              monsterLevel
            );
            newPendingPtExp.melee += meleePtExp;
            console.log(`[PT] Gained ${(meleePtExp * 100).toFixed(4)}% Melee PT experience`);
          } else if (weaponData.weaponType === WEAPON_TYPE.RANGED) {
            // Grant Range PT experience
            const rangePtExp = calculatePtExpGain(
              gameState.character!.abilityInfo.range,
              gameState.character!.level,
              monsterLevel
            );
            newPendingPtExp.range += rangePtExp;
            console.log(`[PT] Gained ${(rangePtExp * 100).toFixed(4)}% Range PT experience`);
          }
        }
      }

      // Check if monster is defeated
      if (newMonsterHp <= 0) {
        // Calculate rewards when monster is defeated
        // Apply experience multiplier based on player level for early game boost
        const baseExpGain = selectedMonster.expReward;
        const expMultiplier = getExperienceMultiplier(gameState.character!.level);
        const expGain = baseExpGain * expMultiplier;
        const goldGain = Math.floor(
          Math.random() * (selectedMonster.goldDrop[1] - selectedMonster.goldDrop[0] + 1) + selectedMonster.goldDrop[0]
        );
        newLog.push(`${selectedMonster.name} has been defeated!`);
        return {
          ...prev,
          monsterCurrentHp: 0,
          battleLog: newLog.slice(-10), // Keep last 10 log entries
          isVictory: true,
          pendingReward: { expGain, goldGain, monsterId: selectedMonster.id },
          monstersDefeated: prev.monstersDefeated + 1,
          pendingExpOnHit: newPendingExpOnHit,
          pendingPtExp: newPendingPtExp,
        };
      }

      // Monster attacks player
      const monsterDamage = calculateDamage(
        selectedMonster.attack,
        gameState.character!.statusInfo.avgDefPwr
      );
      newPlayerHp = Math.max(0, newPlayerHp - monsterDamage);
      newLog.push(`${selectedMonster.name} hits ${gameState.character!.generalInfo.name} for ${monsterDamage} damage!`);

      // Grant Defense PT experience when wearing armor and taking damage
      // Check if player has any armor equipped
      const hasArmor = Object.entries(gameState.equippedItems).some(([, item]) => {
        if (!item) return false;
        const itemData = getItemById(item.itemId);
        return itemData && itemData.type === ITEM_TYPE.ARMOR;
      });

      if (hasArmor) {
        // Grant Defense PT experience
        const defensePtExp = calculatePtExpGain(
          gameState.character!.abilityInfo.defense,
          gameState.character!.level,
          monsterLevel
        );
        newPendingPtExp.defense += defensePtExp;
        console.log(`[PT] Gained ${(defensePtExp * 100).toFixed(4)}% Defense PT experience`);
      }

      // Check if macro should trigger (HP below threshold)
      const macroResult = checkAndUseMacroPotion(newPlayerHp);
      if (macroResult.message) {
        newLog.push(macroResult.message);
        newPlayerHp = macroResult.newHp;
      }

      // Check if player is defeated (death event)
      if (newPlayerHp <= 0) {
        // Calculate death penalty - lose experience
        const { actualPenalty } = calculateDeathPenalty(
          gameState.character!.statusInfo.expPoints,
          DEATH_EXP_PENALTY
        );
        newLog.push(`${gameState.character!.generalInfo.name} has been defeated!`);
        newLog.push(`You lost ${(actualPenalty * 100).toFixed(1)}% experience.`);
        return {
          ...prev,
          playerCurrentHp: 0,
          monsterCurrentHp: newMonsterHp,
          battleLog: newLog.slice(-10),
          isVictory: false,
          pendingDeathPenalty: { expLost: actualPenalty },
          pendingExpOnHit: newPendingExpOnHit,
          pendingPtExp: newPendingPtExp,
        };
      }

      return {
        ...prev,
        monsterCurrentHp: newMonsterHp,
        playerCurrentHp: newPlayerHp,
        battleLog: newLog.slice(-10),
        pendingExpOnHit: newPendingExpOnHit,
        pendingPtExp: newPendingPtExp,
      };
    });
  }, [selectedMonster, gameState.character, gameState.equippedItems, checkAndUseMacroPotion]);

  // Keep the processBattleTick ref updated to avoid stale closures in intervals
  useEffect(() => {
    processBattleTickRef.current = processBattleTick;
  }, [processBattleTick]);

  const startBattle = useCallback((preserveMonstersDefeated: boolean = false) => {
    if (!selectedMonster || !gameState.character) return;

    // Reset processed flags
    victoryProcessedRef.current = false;
    defeatProcessedRef.current = false;
    lastAppliedExpOnHitRef.current = 0;

    // Reset battle state for new fight
    // When preserving state from continuous combat, use the previous battle's HP
    // to avoid restoring HP due to stale closures in the setTimeout callback
    setBattleState((prev) => ({
      isActive: true,
      monsterCurrentHp: selectedMonster.hp,
      playerCurrentHp: preserveMonstersDefeated ? prev.playerCurrentHp : gameState.character!.statusInfo.hp,
      battleLog: [`Battle started against ${selectedMonster.name}!`],
      isVictory: null,
      pendingReward: null,
      pendingDeathPenalty: null,
      monstersDefeated: preserveMonstersDefeated ? prev.monstersDefeated : 0,
      pendingExpOnHit: 0,
      pendingPtExp: {
        melee: 0,
        range: 0,
        shield: 0,
        defense: 0,
      },
    }));

    // Clear any existing interval
    if (battleIntervalRef.current) {
      clearInterval(battleIntervalRef.current);
    }

    // Calculate tick interval based on attack speed
    // Higher attack speed = faster attacks
    const attackSpeedModifier = Math.max(1, gameState.character.statusInfo.attackSpeed / BASE_ATTACK_SPEED);
    const tickInterval = Math.max(MIN_TICK_INTERVAL_MS, BASE_TICK_INTERVAL_MS / attackSpeedModifier);

    // Start battle loop - use ref to always call the latest processBattleTick
    battleIntervalRef.current = window.setInterval(() => {
      processBattleTickRef.current?.();
    }, tickInterval);
  }, [selectedMonster, gameState.character]);
  // Handle experience gain on hit - apply experience when player attacks a monster
  useEffect(() => {
    const newExpToApply = battleState.pendingExpOnHit - lastAppliedExpOnHitRef.current;
    if (newExpToApply > 0 && gameState.character) {
      // Apply only the new experience gained since last application
      const { newLevel, newExp } = calculateExpAndLevel(
        gameState.character.level,
        gameState.character.statusInfo.expPoints,
        newExpToApply
      );

      updateCharacter((currentChar) => ({
        level: newLevel,
        statusInfo: {
          ...currentChar.statusInfo,
          expPoints: newExp,
        },
      }));

      // Update the ref to track what we've already applied
      lastAppliedExpOnHitRef.current = battleState.pendingExpOnHit;
    }
  }, [battleState.pendingExpOnHit, gameState.character, updateCharacter]);

  // Handle PT experience gains - apply PT experience when player performs actions
  useEffect(() => {
    if (!gameState.character) return;

    const maxPt = getMaxPtForLevel(gameState.character.level);
    const abilityUpdates: Partial<typeof gameState.character.abilityInfo> = {};
    let hasUpdates = false;

    // Apply Melee PT experience
    const newMeleePtExp = battleState.pendingPtExp.melee - lastAppliedPtExpRef.current.melee;
    if (newMeleePtExp > 0) {
      const { newPt, newPtExp } = calculatePtAndExp(
        gameState.character.abilityInfo.melee,
        gameState.character.abilityInfo.meleeExp,
        newMeleePtExp,
        maxPt
      );
      abilityUpdates.melee = newPt;
      abilityUpdates.meleeExp = newPtExp;
      hasUpdates = true;
      lastAppliedPtExpRef.current.melee = battleState.pendingPtExp.melee;
    }

    // Apply Range PT experience
    const newRangePtExp = battleState.pendingPtExp.range - lastAppliedPtExpRef.current.range;
    if (newRangePtExp > 0) {
      const { newPt, newPtExp } = calculatePtAndExp(
        gameState.character.abilityInfo.range,
        gameState.character.abilityInfo.rangeExp,
        newRangePtExp,
        maxPt
      );
      abilityUpdates.range = newPt;
      abilityUpdates.rangeExp = newPtExp;
      hasUpdates = true;
      lastAppliedPtExpRef.current.range = battleState.pendingPtExp.range;
    }

    // Apply Shield PT experience (placeholder for future)
    const newShieldPtExp = battleState.pendingPtExp.shield - lastAppliedPtExpRef.current.shield;
    if (newShieldPtExp > 0) {
      const { newPt, newPtExp } = calculatePtAndExp(
        gameState.character.abilityInfo.shield,
        gameState.character.abilityInfo.shieldExp,
        newShieldPtExp,
        maxPt
      );
      abilityUpdates.shield = newPt;
      abilityUpdates.shieldExp = newPtExp;
      hasUpdates = true;
      lastAppliedPtExpRef.current.shield = battleState.pendingPtExp.shield;
    }

    // Apply Defense PT experience
    const newDefensePtExp = battleState.pendingPtExp.defense - lastAppliedPtExpRef.current.defense;
    if (newDefensePtExp > 0) {
      const { newPt, newPtExp } = calculatePtAndExp(
        gameState.character.abilityInfo.defense,
        gameState.character.abilityInfo.defenseExp,
        newDefensePtExp,
        maxPt
      );
      abilityUpdates.defense = newPt;
      abilityUpdates.defenseExp = newPtExp;
      hasUpdates = true;
      lastAppliedPtExpRef.current.defense = battleState.pendingPtExp.defense;
    }

    // Apply updates if any PT changed
    if (hasUpdates) {
      updateCharacter((currentChar) => ({
        abilityInfo: {
          ...currentChar.abilityInfo,
          ...abilityUpdates,
        },
      }));
    }
  }, [battleState.pendingPtExp, gameState.character, updateCharacter]);

  // Handle battle victory - grant experience
  useEffect(() => {
    if (battleState.isVictory === true && battleState.pendingReward && gameState.character && !victoryProcessedRef.current) {
      victoryProcessedRef.current = true;
      
      // Stop the battle interval
      if (battleIntervalRef.current) {
        clearInterval(battleIntervalRef.current);
        battleIntervalRef.current = null;
      }

      // Apply rewards
      const { expGain, goldGain, monsterId } = battleState.pendingReward;
      const { newLevel, newExp } = calculateExpAndLevel(
        gameState.character.level,
        gameState.character.statusInfo.expPoints,
        expGain
      );

      // Material drop logic
      let materialDrop: string | null = null;
      if (monsterId) {
        const monsterData = (monsters as Monster[]).find((m) => m.id === monsterId);
        if (
          monsterData &&
          monsterData.materialDropId &&
          typeof monsterData.materialDropRate === 'number'
        ) {
          if (Math.random() < monsterData.materialDropRate) {
            materialDrop = monsterData.materialDropId;
          }
        }
      }

      // Update character with exp, gold, and current HP
      updateCharacter((currentChar) => ({
        level: newLevel,
        gold: currentChar.gold + goldGain,
        statusInfo: {
          ...currentChar.statusInfo,
          expPoints: newExp,
          hp: battleState.playerCurrentHp,
        },
      }));

      // Update materials if a drop occurred
      if (materialDrop) {
        const currentMaterials = gameState.materials || {};
        updateMaterials({
          ...currentMaterials,
          [materialDrop]: (currentMaterials[materialDrop] || 0) + 1,
        });
      }

      // Record the monster kill for quest progress tracking
      if (monsterId) {
        recordMonsterKill(monsterId, materialDrop ?? undefined);
      }

      // If continuous combat is enabled, automatically start the next battle
      if (continuousCombatRef.current && selectedMonster) {
        // Small delay before starting next battle for visual feedback
        continuousBattleTimeoutRef.current = window.setTimeout(() => {
          startBattle(true);
        }, CONTINUOUS_BATTLE_DELAY_MS);
      }
    }
  }, [battleState.isVictory, battleState.pendingReward, battleState.playerCurrentHp, gameState.character, gameState.materials, updateCharacter, updateMaterials, recordMonsterKill, selectedMonster, startBattle]);

  // Handle battle defeat (death event)
  useEffect(() => {
    if (battleState.isVictory === false && gameState.character && !defeatProcessedRef.current) {
      defeatProcessedRef.current = true;

      // Stop the battle interval
      if (battleIntervalRef.current) {
        clearInterval(battleIntervalRef.current);
        battleIntervalRef.current = null;
      }

      // Apply death penalty: lose experience and restore HP to full
      const { newExp } = calculateDeathPenalty(
        gameState.character.statusInfo.expPoints,
        DEATH_EXP_PENALTY
      );

      updateCharacter((currentChar) => ({
        statusInfo: {
          ...currentChar.statusInfo,
          // Apply experience penalty
          expPoints: newExp,
          // Restore HP to full after death (player is revived)
          hp: currentChar.statusInfo.maxHp,
        },
      }));
    }
  }, [battleState.isVictory, gameState.character, updateCharacter]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (battleIntervalRef.current) {
        clearInterval(battleIntervalRef.current);
      }
      if (continuousBattleTimeoutRef.current) {
        clearTimeout(continuousBattleTimeoutRef.current);
      }
    };
  }, []);

  // Handle escape key and body scroll for battle modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedMonster) {
        closeBattleModal();
      }
    };

    if (selectedMonster) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedMonster]);

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeBattleModal();
    }
  };

  return (
    <div className="p-6 relative">
      {/* Portal Button - Top Right Corner */}
      <button
        onClick={() => setIsPortalOpen(!isPortalOpen)}
        className="absolute top-0 right-0 w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 border-4 border-purple-400 shadow-lg shadow-purple-500/50 flex items-center justify-center transition-all hover:scale-105 text-white font-bold text-xs"
        title="Open Portal"
      >
        Portal
      </button>

      {/* Portal Region Selection Modal */}
      {isPortalOpen && (
        <div className="absolute top-20 right-0 w-72 bg-gray-800 border border-purple-500 rounded-lg shadow-xl z-10">
          <div className="p-4 border-b border-purple-500">
            <h3 className="text-lg font-bold text-purple-400">Select Region</h3>
          </div>
          <ul className="p-2 max-h-64 overflow-y-auto">
            {(zones as Zone[]).map((zone) => (
              <li key={zone.id}>
                <button
                  onClick={() => handleZoneSelect(zone)}
                  className={`w-full text-left p-3 rounded hover:bg-purple-900/50 transition-colors ${
                    selectedZone?.id === zone.id ? 'bg-purple-900/70 border-l-4 border-purple-400' : ''
                  }`}
                >
                  <span className="text-white font-medium">{zone.name}</span>
                  <span className="block text-xs text-gray-400">Lvl {zone.levelRequirement}+</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h1 className="text-3xl font-bold text-red-500 mb-4">Battle Arena</h1>
      <p className="text-gray-300 mb-6">
        Select a zone and click on a monster to begin combat.
        Auto-battle will continue until one side is defeated.
      </p>

      {/* Quest Progress Section */}
      <div className="mb-6">
        <QuestProgress />
      </div>

      {/* Selected Zone Info */}
      {selectedZone ? (
        <div className="mt-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-4">
            <h2 className="text-xl font-bold text-purple-400 mb-2">{selectedZone.name}</h2>
            <p className="text-gray-400 text-sm mb-2">{selectedZone.description}</p>
            <span className="text-xs text-amber-400">Required Level: {selectedZone.levelRequirement}</span>
          </div>

          <h3 className="text-lg font-semibold text-gray-200 mb-3">Available Monsters - Click to Fight</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getMonstersByZone(selectedZone).map((monster) => (
              <button
                key={monster.id}
                onClick={() => handleMonsterSelect(monster)}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-red-500 hover:bg-gray-700/50 transition-colors text-left"
              >
                <h4 className="text-lg font-bold text-red-400 mb-2">{monster.name}</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">
                    <span className="text-gray-500">HP:</span> {monster.hp}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">ATK:</span> {monster.attack}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">DEF:</span> {monster.defense}
                  </p>
                  <p className="text-amber-400">
                    <span className="text-gray-500">EXP:</span> {(monster.expReward * 100).toFixed(1)}%
                  </p>
                  <p className="text-yellow-400">
                    <span className="text-gray-500">Gold:</span> {monster.goldDrop[0]}-{monster.goldDrop[1]}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 text-center p-8 bg-gray-800/50 rounded-lg border border-dashed border-gray-600">
          <p className="text-gray-400">Click the <span className="text-purple-400 font-bold">Portal</span> button to select a region</p>
        </div>
      )}

      {/* Battle Modal */}
      {selectedMonster && gameState.character && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label="Battle Arena"
        >
          <div className="bg-gray-900 rounded-lg border border-red-600 w-full max-w-lg h-[600px] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-red-400">Battle: {selectedMonster.name}</h2>
              <button
                onClick={closeBattleModal}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
                aria-label="Close battle"
              >
                ×
              </button>
            </div>

            {/* Battle Stats */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* Player Stats */}
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-400 font-bold">{gameState.character.generalInfo.name}</span>
                  <span className="text-sm text-gray-400">Lv.{gameState.character.level}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 mb-1">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-300"
                    style={{
                      width: `${(battleState.playerCurrentHp / gameState.character.statusInfo.maxHp) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-400 flex justify-between">
                  <span>HP: {battleState.playerCurrentHp} / {gameState.character.statusInfo.maxHp}</span>
                  <span>ATK: {gameState.character.statusInfo.genAttack} | DEF: {gameState.character.statusInfo.avgDefPwr}</span>
                </div>
              </div>

              {/* VS Divider */}
              <div className="text-center text-2xl font-bold text-amber-400">VS</div>

              {/* Monster Stats */}
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-red-400 font-bold">{selectedMonster.name}</span>
                  <span className="text-sm text-gray-400">Lv.{selectedMonster.levelRange[0]}-{selectedMonster.levelRange[1]}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 mb-1">
                  <div
                    className="bg-red-500 h-4 rounded-full transition-all duration-300"
                    style={{
                      width: `${(battleState.monsterCurrentHp / selectedMonster.hp) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-400 flex justify-between">
                  <span>HP: {battleState.monsterCurrentHp} / {selectedMonster.hp}</span>
                  <span>ATK: {selectedMonster.attack} | DEF: {selectedMonster.defense}</span>
                </div>
              </div>

              {/* Battle Log */}
              <div ref={battleLogRef} className="bg-gray-800 rounded-lg p-3 max-h-40 overflow-y-auto" aria-live="polite">
                <h4 className="text-sm font-bold text-gray-400 mb-2">Battle Log</h4>
                {battleState.battleLog.length > 0 ? (
                  <div className="space-y-1">
                    {battleState.battleLog.map((log, index) => (
                      <p key={`${log}-${index}`} className="text-xs text-gray-300">{log}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Click "Fight Monster" to begin combat!</p>
                )}
              </div>

              {/* Battle Result */}
              {battleState.isVictory === true && !continuousCombat && (
                <div className="bg-green-900/50 border border-green-500 rounded-lg p-3 text-center">
                  <p className="text-green-400 font-bold">Victory!</p>
                  {battleState.pendingReward && (
                    <p className="text-sm text-amber-400">
                      Gained {(battleState.pendingReward.expGain * 100).toFixed(1)}% EXP and {battleState.pendingReward.goldGain} Gold!
                    </p>
                  )}
                  <p className="text-sm text-gray-300">Click "Fight Monster" to fight again!</p>
                </div>
              )}
              {battleState.isVictory === false && (
                <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-center">
                  <p className="text-red-400 font-bold">💀 You Died!</p>
                  {battleState.pendingDeathPenalty && (
                    <p className="text-sm text-amber-400">
                      Lost {(battleState.pendingDeathPenalty.expLost * 100).toFixed(1)}% experience as death penalty.
                    </p>
                  )}
                  <p className="text-sm text-gray-300 mt-1">HP restored. Click "Fight Monster" to try again!</p>
                </div>
              )}

              {/* Continuous Combat Stats */}
              {continuousCombat && battleState.monstersDefeated > 0 && (
                <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-3 text-center">
                  <p className="text-blue-400 font-bold">⚔️ Auto-Battle Active</p>
                  <p className="text-sm text-gray-300">
                    Monsters Defeated: <span className="text-amber-400 font-bold">{battleState.monstersDefeated}</span>
                  </p>
                </div>
              )}

              {/* Continuous Combat Toggle */}
              <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-300">Auto-Battle</span>
                  <span className="text-xs text-gray-500">(Fight continuously)</span>
                </div>
                <button
                  onClick={() => setContinuousCombat(!continuousCombat)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    continuousCombat ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                  aria-label="Toggle continuous combat"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      continuousCombat ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Battle Control Buttons */}
              <div className="space-y-2">
                {/* Main Fight/Start Button - shown when not in active battle */}
                {!(battleState.isActive && battleState.isVictory === null) && (
                  <button
                    onClick={() => startBattle()}
                    className="w-full py-3 rounded-lg font-bold text-lg transition-colors bg-red-600 hover:bg-red-500 text-white"
                  >
                    {battleState.isVictory !== null ? 'Fight Monster Again' : 'Fight Monster'}
                  </button>
                )}

                {/* Flee Button - shown during active battle */}
                {battleState.isActive && battleState.isVictory === null && (
                  <button
                    onClick={fleeBattle}
                    className="w-full py-3 rounded-lg font-bold text-lg transition-colors bg-yellow-600 hover:bg-yellow-500 text-white"
                  >
                    🏃 Flee Battle
                  </button>
                )}

                {/* End Combat Button - shown when in continuous mode and not actively fighting */}
                {continuousCombat && battleState.monstersDefeated > 0 && !(battleState.isActive && battleState.isVictory === null) && (
                  <button
                    onClick={endCombat}
                    className="w-full py-2 rounded-lg font-medium text-sm transition-colors bg-gray-700 hover:bg-gray-600 text-white border border-gray-500"
                  >
                    End Combat ({battleState.monstersDefeated} defeated)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
