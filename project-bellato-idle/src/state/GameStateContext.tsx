import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  type GameState,
  type Character,
  type CharacterClass,
  type InventoryGrid,
  type ActiveQuest,
  type EquipmentSlotType,
  type EquippedItems,
  initialGameState,
  createCharacter,
  migrateGameState,
  GAME_STATE_STORAGE_KEY,
  isValidGameState,
  getItemById,
  INVENTORY_ROWS,
  INVENTORY_COLS,
} from './gameStateSlice';

export interface GameStateContextValue {
  gameState: GameState;
  createNewCharacter: (name: string, characterClass: CharacterClass) => void;
  updateCharacter: (updater: Partial<Character> | ((currentChar: Character) => Partial<Character>)) => void;
  updateInventoryGrid: (updater: InventoryGrid | ((currentGrid: InventoryGrid) => InventoryGrid)) => void;
  swapInventoryItems: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
  equipItem: (slot: EquipmentSlotType, fromRow: number, fromCol: number) => void;
  unequipItem: (slot: EquipmentSlotType) => void;
  updateActiveQuest: (quest: ActiveQuest | null) => void;
  updateCompletedQuestIds: (ids: string[]) => void;
  updateMaterials: (materials: Record<string, number>) => void;
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
        inventoryGrid: newGrid,
        equippedItems: newEquippedItems,
      };
    });
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

  const value: GameStateContextValue = {
    gameState,
    createNewCharacter,
    updateCharacter,
    updateInventoryGrid,
    swapInventoryItems,
    equipItem,
    unequipItem,
    updateActiveQuest,
    updateCompletedQuestIds,
    updateMaterials,
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
