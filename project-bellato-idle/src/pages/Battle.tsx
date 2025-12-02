import { useState, useEffect, useRef, useCallback } from 'react';
import zones from '../data/zones.json';
import monsters from '../data/monsters.json';
import { useGameState } from '../state/GameStateContext';
import { useQuestContext } from '../state/QuestContext';
import { calculateExpAndLevel, calculateDeathPenalty, DEATH_EXP_PENALTY, getItemById, ITEM_TYPE } from '../state/gameStateSlice';
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
}

// Combat constants
const DAMAGE_VARIANCE = 0.2; // ±20% damage variance
const BASE_ATTACK_SPEED = 10; // Default attack speed value
const MIN_TICK_INTERVAL_MS = 200; // Minimum time between attacks in ms
const BASE_TICK_INTERVAL_MS = 1000; // Base interval between attacks in ms

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
  const [battleState, setBattleState] = useState<BattleState>({
    isActive: false,
    monsterCurrentHp: 0,
    playerCurrentHp: 0,
    battleLog: [],
    isVictory: null,
    pendingReward: null,
    pendingDeathPenalty: null,
  });
  
  const battleIntervalRef = useRef<number | null>(null);
  const victoryProcessedRef = useRef<boolean>(false);
  const defeatProcessedRef = useRef<boolean>(false);
  const processBattleTickRef = useRef<(() => void) | null>(null);

  // Helper function to check if macro should trigger and consume potion
  const checkAndUseMacroPotion = useCallback((currentHp: number): { newHp: number; message: string | null } => {
    const { macroState, inventoryGrid, character } = gameState;
    
    // Check if macro is enabled and has a valid potion slot
    if (!macroState.enabled || !macroState.potionSlot || !character) {
      return { newHp: currentHp, message: null };
    }

    // Check if HP is below threshold
    if (currentHp >= macroState.hpThreshold) {
      return { newHp: currentHp, message: null };
    }

    // Check if there's a valid potion in the slot
    const { row, col } = macroState.potionSlot;
    const item = inventoryGrid[row]?.[col];
    if (!item) {
      return { newHp: currentHp, message: null };
    }

    const itemData = getItemById(item.itemId);
    if (!itemData || itemData.type !== ITEM_TYPE.CONSUMABLE || !itemData.healAmount) {
      return { newHp: currentHp, message: null };
    }

    // Check if already at or above max HP
    if (currentHp >= character.statusInfo.maxHp) {
      return { newHp: currentHp, message: null };
    }

    // Consume the potion via the context
    const result = consumeMacroPotion();
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
    });
    victoryProcessedRef.current = false;
    defeatProcessedRef.current = false;
  };

  const closeBattleModal = () => {
    // Stop any active battle
    if (battleIntervalRef.current) {
      clearInterval(battleIntervalRef.current);
      battleIntervalRef.current = null;
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
    });
    victoryProcessedRef.current = false;
    defeatProcessedRef.current = false;
  };

  const processBattleTick = useCallback(() => {
    if (!selectedMonster || !gameState.character) return;

    setBattleState((prev) => {
      if (!prev.isActive || prev.isVictory !== null) return prev;

      const newLog = [...prev.battleLog];
      let newMonsterHp = prev.monsterCurrentHp;
      let newPlayerHp = prev.playerCurrentHp;

      // Player attacks monster
      const playerDamage = calculateDamage(
        gameState.character!.statusInfo.genAttack,
        selectedMonster.defense
      );
      newMonsterHp = Math.max(0, newMonsterHp - playerDamage);
      newLog.push(`${gameState.character!.generalInfo.name} hits ${selectedMonster.name} for ${playerDamage} damage!`);

      // Check if monster is defeated
      if (newMonsterHp <= 0) {
        // Calculate rewards when monster is defeated
        const expGain = selectedMonster.expReward;
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
        };
      }

      // Monster attacks player
      const monsterDamage = calculateDamage(
        selectedMonster.attack,
        gameState.character!.statusInfo.avgDefPwr
      );
      newPlayerHp = Math.max(0, newPlayerHp - monsterDamage);
      newLog.push(`${selectedMonster.name} hits ${gameState.character!.generalInfo.name} for ${monsterDamage} damage!`);

      // Check if macro should trigger (HP below threshold)
      const macroResult = checkAndUseMacroPotion(newPlayerHp);
      if (macroResult.message) {
        newLog.push(macroResult.message);
        newPlayerHp = Math.min(macroResult.newHp, gameState.character!.statusInfo.maxHp);
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
        };
      }

      return {
        ...prev,
        monsterCurrentHp: newMonsterHp,
        playerCurrentHp: newPlayerHp,
        battleLog: newLog.slice(-10),
      };
    });
  }, [selectedMonster, gameState.character, checkAndUseMacroPotion]);

  // Keep the processBattleTick ref updated to avoid stale closures in intervals
  useEffect(() => {
    processBattleTickRef.current = processBattleTick;
  }, [processBattleTick]);

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
    }
  }, [battleState.isVictory, battleState.pendingReward, battleState.playerCurrentHp, gameState.character, gameState.materials, updateCharacter, updateMaterials, recordMonsterKill]);

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

  const startBattle = () => {
    if (!selectedMonster || !gameState.character) return;

    // Reset processed flags
    victoryProcessedRef.current = false;
    defeatProcessedRef.current = false;

    // Reset battle state for new fight
    setBattleState({
      isActive: true,
      monsterCurrentHp: selectedMonster.hp,
      playerCurrentHp: gameState.character.statusInfo.hp,
      battleLog: [`Battle started against ${selectedMonster.name}!`],
      isVictory: null,
      pendingReward: null,
      pendingDeathPenalty: null,
    });

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
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (battleIntervalRef.current) {
        clearInterval(battleIntervalRef.current);
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
          <div className="bg-gray-900 rounded-lg border border-red-600 w-full max-w-lg max-h-[90vh] overflow-y-auto">
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
            <div className="p-4 space-y-4">
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
              <div className="bg-gray-800 rounded-lg p-3 max-h-40 overflow-y-auto" aria-live="polite">
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
              {battleState.isVictory === true && (
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

              {/* Fight Button */}
              <button
                onClick={startBattle}
                disabled={battleState.isActive && battleState.isVictory === null}
                className={`w-full py-3 rounded-lg font-bold text-lg transition-colors ${
                  battleState.isActive && battleState.isVictory === null
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {battleState.isActive && battleState.isVictory === null
                  ? 'Fighting...'
                  : battleState.isVictory !== null
                  ? 'Fight Monster Again'
                  : 'Fight Monster'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
