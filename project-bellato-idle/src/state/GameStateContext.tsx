import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  type GameState,
  type Character,
  type CharacterClass,
  type InventoryGrid,
  type ActiveQuest,
  type EquipmentSlotType,
  type EquippedItems,
  type MacroState,
  initialGameState,
  createCharacter,
  migrateGameState,
  GAME_STATE_STORAGE_KEY,
  isValidGameState,
  getItemById,
  INVENTORY_ROWS,
  INVENTORY_COLS,
  CLASS_BASE_STATS,
  calculateEquippedDefense,
  ITEM_TYPE,
} from './gameStateSlice';

export interface GameStateContextValue {
  gameState: GameState;
  createNewCharacter: (name: string, characterClass: CharacterClass) => void;
  updateCharacter: (updater: Partial<Character> | ((currentChar: Character) => Partial<Character>)) => void;
  updateInventoryGrid: (updater: InventoryGrid | ((currentGrid: InventoryGrid) => InventoryGrid)) => void;
  swapInventoryItems: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
  equipItem: (slot: EquipmentSlotType, fromRow: number, fromCol: number) => void;
  unequipItem: (slot: EquipmentSlotType) => void;
  useItem: (row: number, col: number) => { success: boolean; message: string };
  updateMacroState: (updater: Partial<MacroState>) => void;
  consumeMacroPotion: (currentBattleHp: number) => { success: boolean; healAmount: number; message: string };
  updateActiveQuest: (quest: ActiveQuest | null) => void;
  updateCompletedQuestIds: (ids: string[]) => void;
  updateMaterials: (materials: Record<string, number>) => void;
  updateCurrentZone: (zoneId: string | null) => void;
  resetGame: () => void;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

export interface GameStateProviderProps {
  children: ReactNode;
}

// Load game state from localStorage
function loadGameState(): GameState {
  try {
    const saved = localStorage.getItem(GAME_STATE_STORAGE_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (isValidGameState(parsed)) {
        // Migrate old state to include new fields
        return migrateGameState(parsed);
      }
      console.warn('Invalid game state in localStorage, using initial state');
    }
  } catch (error) {
    console.error('Failed to load game state:', error);
  }
  return initialGameState;
}

// Save game state to localStorage
function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

// Helper function to update character stats based on equipped items
function updateCharacterStatsFromEquipment(
  character: Character | null,
  equippedItems: EquippedItems
): Character | null {
  if (!character) return null;
  
  const baseDefPwr = CLASS_BASE_STATS[character.generalInfo.class].avgDefPwr;
  const equippedDefense = calculateEquippedDefense(equippedItems);
  
  return {
    ...character,
    statusInfo: {
      ...character.statusInfo,
      avgDefPwr: baseDefPwr + equippedDefense,
    },
  };
}

export function GameStateProvider({ children }: GameStateProviderProps) {
  // Use lazy initialization to load saved state on first render
  const [gameState, setGameState] = useState<GameState>(loadGameState);

  // Save state whenever it changes
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const createNewCharacter = useCallback((name: string, characterClass: CharacterClass) => {
    const newCharacter = createCharacter(name, characterClass);
    setGameState((prev) => ({
      ...prev,
      character: newCharacter,
      hasStartedGame: true,
    }));
  }, []);

  const updateCharacter = useCallback((updater: Partial<Character> | ((currentChar: Character) => Partial<Character>)) => {
    setGameState((prev) => {
      if (!prev.character) return prev;
      const updates = typeof updater === 'function' ? updater(prev.character) : updater;
      return {
        ...prev,
        character: {
          ...prev.character,
          ...updates,
        },
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    localStorage.removeItem(GAME_STATE_STORAGE_KEY);
    setGameState(initialGameState);
  }, []);

  const updateInventoryGrid = useCallback((updater: InventoryGrid | ((currentGrid: InventoryGrid) => InventoryGrid)) => {
    setGameState((prev) => {
      const newGrid = typeof updater === 'function' ? updater(prev.inventoryGrid) : updater;
      return {
        ...prev,
        inventoryGrid: newGrid,
      };
    });
  }, []);

  const swapInventoryItems = useCallback((fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    setGameState((prev) => {
      const newGrid = prev.inventoryGrid.map(row => [...row]);
      const temp = newGrid[fromRow][fromCol];
      newGrid[fromRow][fromCol] = newGrid[toRow][toCol];
      newGrid[toRow][toCol] = temp;
      return {
        ...prev,
        inventoryGrid: newGrid,
      };
    });
  }, []);

  // Equip an item from the inventory grid to an equipment slot
  const equipItem = useCallback((slot: EquipmentSlotType, fromRow: number, fromCol: number) => {
    setGameState((prev) => {
      const inventoryItem = prev.inventoryGrid[fromRow][fromCol];
      if (!inventoryItem) return prev;

      // Get item data to validate it can be equipped to this slot
      const itemData = getItemById(inventoryItem.itemId);
      if (!itemData || itemData.equipSlot !== slot) return prev;

      // Get the currently equipped item (if any)
      const currentlyEquipped = prev.equippedItems[slot];

      // Update inventory grid: remove item from inventory, put equipped item back if any
      const newGrid = prev.inventoryGrid.map(row => [...row]);
      newGrid[fromRow][fromCol] = currentlyEquipped; // swap: currently equipped goes to inventory

      // Update equipped items
      const newEquippedItems: EquippedItems = {
        ...prev.equippedItems,
        [slot]: inventoryItem,
      };

      return {
        ...prev,
        character: updateCharacterStatsFromEquipment(prev.character, newEquippedItems),
        inventoryGrid: newGrid,
        equippedItems: newEquippedItems,
      };
    });
  }, []);

  // Unequip an item from an equipment slot back to inventory
  const unequipItem = useCallback((slot: EquipmentSlotType) => {
    setGameState((prev) => {
      const equippedItem = prev.equippedItems[slot];
      if (!equippedItem) return prev;

      // Find first empty slot in inventory
      let emptyRow = -1;
      let emptyCol = -1;
      for (let row = 0; row < INVENTORY_ROWS && emptyRow === -1; row++) {
        for (let col = 0; col < INVENTORY_COLS; col++) {
          if (!prev.inventoryGrid[row][col]) {
            emptyRow = row;
            emptyCol = col;
            break;
          }
        }
      }

      // If no empty slot found, cannot unequip
      if (emptyRow === -1) return prev;

      // Update inventory grid
      const newGrid = prev.inventoryGrid.map(row => [...row]);
      newGrid[emptyRow][emptyCol] = equippedItem;

      // Update equipped items
      const newEquippedItems: EquippedItems = {
        ...prev.equippedItems,
        [slot]: null,
      };

      return {
        ...prev,
        character: updateCharacterStatsFromEquipment(prev.character, newEquippedItems),
        inventoryGrid: newGrid,
        equippedItems: newEquippedItems,
      };
    });
  }, []);

  // Use a consumable item from the inventory (e.g., potions)
  const useItem = useCallback((row: number, col: number): { success: boolean; message: string } => {
    let result = { success: false, message: '' };
    
    setGameState((prev) => {
      const inventoryItem = prev.inventoryGrid[row][col];
      if (!inventoryItem) {
        result = { success: false, message: 'No item in this slot' };
        return prev;
      }

      const itemData = getItemById(inventoryItem.itemId);
      if (!itemData) {
        result = { success: false, message: 'Item data not found' };
        return prev;
      }

      // Only consumable items can be used
      if (itemData.type !== ITEM_TYPE.CONSUMABLE) {
        result = { success: false, message: 'This item cannot be used' };
        return prev;
      }

      // Check if character exists
      if (!prev.character) {
        result = { success: false, message: 'No character found' };
        return prev;
      }

      // Handle health potions
      if (itemData.healAmount) {
        const currentHp = prev.character.statusInfo.hp;
        const maxHp = prev.character.statusInfo.maxHp;
        
        // Check if already at full health
        if (currentHp >= maxHp) {
          result = { success: false, message: 'Already at full health' };
          return prev;
        }

        // Calculate new HP (capped at maxHp)
        const newHp = Math.min(currentHp + itemData.healAmount, maxHp);
        const healedAmount = newHp - currentHp;

        // Update inventory: reduce quantity or remove item
        const newGrid = prev.inventoryGrid.map(r => [...r]);
        const currentQuantity = inventoryItem.quantity ?? 1;
        
        if (currentQuantity > 1) {
          // Reduce quantity by 1
          newGrid[row][col] = { ...inventoryItem, quantity: currentQuantity - 1 };
        } else {
          // Remove item from inventory
          newGrid[row][col] = null;
        }

        result = { success: true, message: `Restored ${healedAmount} HP` };

        return {
          ...prev,
          character: {
            ...prev.character,
            statusInfo: {
              ...prev.character.statusInfo,
              hp: newHp,
            },
          },
          inventoryGrid: newGrid,
        };
      }

      result = { success: false, message: 'This item has no effect' };
      return prev;
    });

    return result;
  }, []);

  // Update macro state
  const updateMacroState = useCallback((updater: Partial<MacroState>) => {
    setGameState((prev) => ({
      ...prev,
      macroState: {
        ...prev.macroState,
        ...updater,
      },
    }));
  }, []);

  // Consume a potion from the macro slot (used during battle when HP drops below threshold)
  // currentBattleHp: The current HP in battle (may differ from global state during combat)
  const consumeMacroPotion = useCallback((currentBattleHp: number): { success: boolean; healAmount: number; message: string } => {
    let result = { success: false, healAmount: 0, message: '' };
    
    setGameState((prev) => {
      // Check if macro is enabled and has a valid potion slot
      if (!prev.macroState.enabled || !prev.macroState.potionSlot) {
        result = { success: false, healAmount: 0, message: 'Macro not configured' };
        return prev;
      }

      const { row, col } = prev.macroState.potionSlot;
      const inventoryItem = prev.inventoryGrid[row]?.[col];
      
      if (!inventoryItem) {
        result = { success: false, healAmount: 0, message: 'No potion in macro slot' };
        // Clear the potion slot since item is gone
        return {
          ...prev,
          macroState: {
            ...prev.macroState,
            potionSlot: null,
          },
        };
      }

      const itemData = getItemById(inventoryItem.itemId);
      if (!itemData || itemData.type !== ITEM_TYPE.CONSUMABLE || !itemData.healAmount) {
        result = { success: false, healAmount: 0, message: 'Invalid potion in macro slot' };
        return prev;
      }

      // Check if character exists
      if (!prev.character) {
        result = { success: false, healAmount: 0, message: 'No character found' };
        return prev;
      }

      const maxHp = prev.character.statusInfo.maxHp;
      
      // Check if already at full health (using battle HP)
      if (currentBattleHp >= maxHp) {
        result = { success: false, healAmount: 0, message: 'Already at full health' };
        return prev;
      }

      // Calculate heal amount based on current battle HP (capped at maxHp)
      const newHp = Math.min(currentBattleHp + itemData.healAmount, maxHp);
      const healedAmount = newHp - currentBattleHp;

      // Update inventory: reduce quantity or remove item
      const newGrid = prev.inventoryGrid.map(r => [...r]);
      const currentQuantity = inventoryItem.quantity ?? 1;
      
      let newPotionSlot: { row: number; col: number } | null = prev.macroState.potionSlot;
      if (currentQuantity > 1) {
        // Reduce quantity by 1
        newGrid[row][col] = { ...inventoryItem, quantity: currentQuantity - 1 };
      } else {
        // Remove item from inventory and clear potion slot
        newGrid[row][col] = null;
        newPotionSlot = null;
      }

      result = { success: true, healAmount: healedAmount, message: `Macro: Restored ${healedAmount} HP` };

      // Only update inventory and macro state - battle system handles HP
      return {
        ...prev,
        inventoryGrid: newGrid,
        macroState: {
          ...prev.macroState,
          potionSlot: newPotionSlot,
        },
      };
    });

    return result;
  }, []);

  const updateActiveQuest = useCallback((quest: ActiveQuest | null) => {
    setGameState((prev) => ({
      ...prev,
      activeQuest: quest,
    }));
  }, []);

  const updateCompletedQuestIds = useCallback((ids: string[]) => {
    setGameState((prev) => ({
      ...prev,
      completedQuestIds: ids,
    }));
  }, []);

  const updateMaterials = useCallback((materials: Record<string, number>) => {
    setGameState((prev) => ({
      ...prev,
      materials,
    }));
  }, []);

  const updateCurrentZone = useCallback((zoneId: string | null) => {
    setGameState((prev) => ({
      ...prev,
      currentZone: zoneId,
    }));
  }, []);

  const value: GameStateContextValue = {
    gameState,
    createNewCharacter,
    updateCharacter,
    updateInventoryGrid,
    swapInventoryItems,
    equipItem,
    unequipItem,
    useItem,
    updateMacroState,
    consumeMacroPotion,
    updateActiveQuest,
    updateCompletedQuestIds,
    updateMaterials,
    updateCurrentZone,
    resetGame,
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGameState(): GameStateContextValue {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}
