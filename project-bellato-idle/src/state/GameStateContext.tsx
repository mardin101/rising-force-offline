import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import {
  type GameState,
  type Character,
  type CharacterClass,
  type CharacterRace,
  type InventoryGrid,
  type ActiveQuest,
  type EquipmentSlotType,
  type EquippedItems,
  type MacroState,
  initialGameState,
  createCharacter,
  createStarterInventoryGrid,
  migrateGameState,
  GAME_STATE_STORAGE_KEY,
  isValidGameState,
  getItemById,
  INVENTORY_ROWS,
  INVENTORY_COLS,
  CLASS_BASE_STATS,
  calculateEquippedDefense,
  ITEM_TYPE,
  POTION_PRICES,
} from './gameStateSlice';
import { isRaceCompatible } from '../data/potions/loadPotions';
import { getEquipmentPrices } from '../data/equipment/loadEquipment';

export interface GameStateContextValue {
  gameState: GameState;
  createNewCharacter: (name: string, characterClass: CharacterClass, race?: CharacterRace) => void;
  updateCharacter: (updater: Partial<Character> | ((currentChar: Character) => Partial<Character>)) => void;
  updateInventoryGrid: (updater: InventoryGrid | ((currentGrid: InventoryGrid) => InventoryGrid)) => void;
  swapInventoryItems: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
  equipItem: (slot: EquipmentSlotType, fromRow: number, fromCol: number) => void;
  unequipItem: (slot: EquipmentSlotType) => void;
  useItem: (row: number, col: number) => { success: boolean; message: string };
  updateMacroState: (updater: Partial<MacroState>) => void;
  consumeMacroPotion: (currentBattleHp: number) => { 
    success: boolean; 
    healAmount: number; 
    message: string;
    inventoryUpdate?: {
      row: number;
      col: number;
      newQuantity: number | null;
      clearPotionSlot: boolean;
    };
    statUpdate?: {
      potionType: 'HP' | 'FP' | 'SP';
      newValue: number;
    };
  };
  applyMacroInventoryUpdate: (update: {
    row: number;
    col: number;
    newQuantity: number | null;
    clearPotionSlot: boolean;
  }) => void;
  applyMacroStatUpdate: (update: {
    potionType: 'FP' | 'SP';
    newValue: number;
  }) => void;
  purchasePotion: (potionId: string, quantity: number) => { success: boolean; message: string };
  purchaseEquipment: (itemId: string, quantity: number) => { success: boolean; message: string };
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
  
  // Use a ref to access current state without causing re-renders
  const gameStateRef = useRef<GameState>(gameState);
  
  // Keep ref in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Save state whenever it changes
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const createNewCharacter = useCallback((name: string, characterClass: CharacterClass, race?: CharacterRace) => {
    const newCharacter = createCharacter(name, characterClass, race);
    setGameState((prev) => ({
      ...prev,
      character: newCharacter,
      inventoryGrid: createStarterInventoryGrid(race),
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
      if (itemData.amount) {
        const currentHp = prev.character.statusInfo.hp;
        const maxHp = prev.character.statusInfo.maxHp;
        const playerLevel = prev.character.level;
        
        // Check level requirement
        if (itemData.levelRequirement && playerLevel < itemData.levelRequirement) {
          result = { success: false, message: `Requires level ${itemData.levelRequirement}` };
          return prev;
        }
        
        // Check if already at full health
        if (currentHp >= maxHp) {
          result = { success: false, message: 'Already at full health' };
          return prev;
        }

        // Calculate new HP (capped at maxHp)
        const newHp = Math.min(currentHp + itemData.amount, maxHp);
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
  const consumeMacroPotion = useCallback((currentBattleHp: number): { 
    success: boolean; 
    healAmount: number; 
    message: string;
    inventoryUpdate?: {
      row: number;
      col: number;
      newQuantity: number | null; // null means remove item
      clearPotionSlot: boolean;
    };
    statUpdate?: {
      potionType: 'HP' | 'FP' | 'SP';
      newValue: number;
    };
  } => {
    // Perform all validations and calculations WITHOUT calling setGameState
    // Return the data needed for the caller to update state
    
    const currentState = gameState;
    
    // Check if macro is enabled and has a valid potion slot
    if (!currentState.macroState.enabled || !currentState.macroState.potionSlot) {
      return { success: false, healAmount: 0, message: 'Macro not configured' };
    }

    const { row, col } = currentState.macroState.potionSlot;
    const inventoryItem = currentState.inventoryGrid[row]?.[col];
    
    if (!inventoryItem) {
      return { success: false, healAmount: 0, message: 'No potion in macro slot' };
    }

    const itemData = getItemById(inventoryItem.itemId);
    if (!itemData || itemData.type !== ITEM_TYPE.CONSUMABLE || !itemData.amount) {
      return { success: false, healAmount: 0, message: 'Invalid potion in macro slot' };
    }

    // Check if character exists
    if (!currentState.character) {
      return { success: false, healAmount: 0, message: 'No character found' };
    }

    const playerLevel = currentState.character.level;
    const playerRace = currentState.character.generalInfo.race;
    
    // Check level requirement
    if (itemData.levelRequirement && playerLevel < itemData.levelRequirement) {
      return { success: false, healAmount: 0, message: `Macro: Requires level ${itemData.levelRequirement}` };
    }
    
    // Check race compatibility
    if (!isRaceCompatible(itemData.race, playerRace)) {
      return { success: false, healAmount: 0, message: `Macro: ${itemData.name} is for ${itemData.race} only` };
    }

    // Determine potion type and corresponding stat
    const potionType = itemData.potionType || 'HP';
    let currentStat: number;
    let maxStat: number;
    let statName: string;
    
    switch (potionType) {
      case 'HP':
        currentStat = currentBattleHp;
        maxStat = currentState.character.statusInfo.maxHp;
        statName = 'HP';
        break;
      case 'FP':
        currentStat = currentState.character.statusInfo.fp;
        maxStat = currentState.character.statusInfo.maxFp;
        statName = 'FP';
        break;
      case 'SP':
        currentStat = currentState.character.statusInfo.sp;
        maxStat = currentState.character.statusInfo.maxSp;
        statName = 'SP';
        break;
      default:
        return { success: false, healAmount: 0, message: 'Unknown potion type' };
    }
    
    // Check if already at full
    if (currentStat >= maxStat) {
      return { success: false, healAmount: 0, message: `Already at full ${statName}` };
    }

    // Calculate restore amount (capped at max)
    const restoreAmount = itemData.amount ?? 0;
    const newStat = Math.min(currentStat + restoreAmount, maxStat);
    const healedAmount = newStat - currentStat;

    // Calculate inventory update
    const currentQuantity = inventoryItem.quantity ?? 1;
    const newQuantity = currentQuantity > 1 ? currentQuantity - 1 : null;
    const clearPotionSlot = newQuantity === null;

    // Return success with all the data needed to update state
    return { 
      success: true, 
      healAmount: healedAmount, 
      message: `Macro: Restored ${healedAmount} ${statName}`,
      inventoryUpdate: {
        row,
        col,
        newQuantity,
        clearPotionSlot
      },
      statUpdate: potionType !== 'HP' ? {
        potionType: potionType as 'FP' | 'SP',
        newValue: newStat
      } : undefined
    };
  }, [gameState]);

  // Apply macro inventory update - called AFTER render to avoid React warning
  const applyMacroInventoryUpdate = useCallback((update: {
    row: number;
    col: number;
    newQuantity: number | null;
    clearPotionSlot: boolean;
  }) => {
    setGameState((prev) => {
      const newGrid = prev.inventoryGrid.map(r => [...r]);
      const inventoryItem = prev.inventoryGrid[update.row]?.[update.col];
      
      if (!inventoryItem) return prev;
      
      if (update.newQuantity !== null) {
        // Reduce quantity
        newGrid[update.row][update.col] = { ...inventoryItem, quantity: update.newQuantity };
      } else {
        // Remove item
        newGrid[update.row][update.col] = null;
      }
      
      return {
        ...prev,
        inventoryGrid: newGrid,
        macroState: update.clearPotionSlot ? {
          ...prev.macroState,
          potionSlot: null,
        } : prev.macroState,
      };
    });
  }, []);

  // Apply macro stat update (FP/SP only) - called AFTER render
  const applyMacroStatUpdate = useCallback((update: {
    potionType: 'FP' | 'SP';
    newValue: number;
  }) => {
    setGameState((prev) => {
      if (!prev.character) return prev;
      
      const updatedStatusInfo = { ...prev.character.statusInfo };
      
      if (update.potionType === 'FP') {
        updatedStatusInfo.fp = update.newValue;
      } else if (update.potionType === 'SP') {
        updatedStatusInfo.sp = update.newValue;
      }
      
      return {
        ...prev,
        character: {
          ...prev.character,
          statusInfo: updatedStatusInfo,
        },
      };
    });
  }, []);

  // Purchase potions from the shop
  const purchasePotion = useCallback((potionId: string, quantity: number): { success: boolean; message: string } => {
    // Validate quantity
    if (quantity <= 0) {
      return { success: false, message: 'Invalid quantity' };
    }

    // Get current state from ref (doesn't cause re-renders)
    const currentState = gameStateRef.current;
    
    // Check if character exists
    if (!currentState.character) {
      return { success: false, message: 'No character found' };
    }

    // Check if potion is valid
    const potionData = getItemById(potionId);
    if (!potionData || potionData.type !== ITEM_TYPE.CONSUMABLE) {
      return { success: false, message: 'Invalid potion' };
    }

    // Check the price
    const pricePerPotion = POTION_PRICES[potionId];
    if (pricePerPotion === undefined) {
      return { success: false, message: 'Potion not for sale' };
    }

    const totalCost = pricePerPotion * quantity;

    // Check if player has enough gold
    if (currentState.character.gold < totalCost) {
      return { success: false, message: 'Not enough gold' };
    }

    // Check for existing stack of the same potion or find empty slot
    let targetRow = -1;
    let targetCol = -1;
    let existingQuantity = 0;

    // First, look for existing stack
    for (let row = 0; row < INVENTORY_ROWS && targetRow === -1; row++) {
      for (let col = 0; col < INVENTORY_COLS; col++) {
        const item = currentState.inventoryGrid[row][col];
        if (item && item.itemId === potionId) {
          targetRow = row;
          targetCol = col;
          existingQuantity = item.quantity ?? 1;
          break;
        }
      }
    }

    // If no existing stack, find empty slot
    if (targetRow === -1) {
      for (let row = 0; row < INVENTORY_ROWS && targetRow === -1; row++) {
        for (let col = 0; col < INVENTORY_COLS; col++) {
          if (!currentState.inventoryGrid[row][col]) {
            targetRow = row;
            targetCol = col;
            break;
          }
        }
      }
    }

    // If no slot available, fail
    if (targetRow === -1) {
      return { success: false, message: 'No inventory space available' };
    }

    // All validations passed - perform the purchase
    // Update state (this is safe because validations passed)
    setGameState((prev) => {
      // Double-check in case of race condition
      if (!prev.character || prev.character.gold < totalCost) {
        return prev;
      }

      // Update inventory
      const newGrid = prev.inventoryGrid.map(row => [...row]);
      
      // Find target slot (prefer existing stack)
      let actualTargetRow = targetRow;
      let actualTargetCol = targetCol;
      let actualExistingQuantity = existingQuantity;
      
      // Recheck for existing stack in case it changed
      for (let row = 0; row < INVENTORY_ROWS; row++) {
        for (let col = 0; col < INVENTORY_COLS; col++) {
          const item = prev.inventoryGrid[row][col];
          if (item && item.itemId === potionId) {
            actualTargetRow = row;
            actualTargetCol = col;
            actualExistingQuantity = item.quantity ?? 1;
            break;
          }
        }
      }
      
      // If original slot is occupied and we didn't find existing stack, find new empty slot
      if (actualTargetRow === targetRow && prev.inventoryGrid[targetRow]?.[targetCol] && prev.inventoryGrid[targetRow][targetCol]?.itemId !== potionId) {
        let foundEmpty = false;
        for (let row = 0; row < INVENTORY_ROWS && !foundEmpty; row++) {
          for (let col = 0; col < INVENTORY_COLS; col++) {
            if (!prev.inventoryGrid[row][col]) {
              actualTargetRow = row;
              actualTargetCol = col;
              actualExistingQuantity = 0;
              foundEmpty = true;
              break;
            }
          }
        }
        if (!foundEmpty) {
          return prev;
        }
      }
      
      newGrid[actualTargetRow][actualTargetCol] = {
        itemId: potionId,
        quantity: actualExistingQuantity + quantity,
      };

      // Deduct gold
      const newGold = prev.character.gold - totalCost;

      return {
        ...prev,
        character: {
          ...prev.character,
          gold: newGold,
        },
        inventoryGrid: newGrid,
      };
    });

    // If we got here, all validations passed, so return success
    return { success: true, message: `Purchased ${quantity}x ${potionData.name} for ${totalCost} gold` };
  }, []);

  // Purchase equipment from the shop
  const purchaseEquipment = useCallback((itemId: string, quantity: number): { success: boolean; message: string} => {
    // Validate quantity - equipment is not stackable
    if (quantity <= 0) {
      return { success: false, message: 'Invalid quantity' };
    }
    
    if (quantity > 1) {
      return { success: false, message: 'Equipment is not stackable. Purchase one at a time.' };
    }

    // Get current state from ref (doesn't cause re-renders)
    const currentState = gameStateRef.current;

    // Check if character exists
    if (!currentState.character) {
      return { success: false, message: 'No character found' };
    }

    // Check if item is valid
    const itemData = getItemById(itemId);
    if (!itemData) {
      return { success: false, message: 'Invalid item' };
    }

    // Get equipment prices
    const equipmentPrices = getEquipmentPrices();
    const pricePerItem = equipmentPrices[itemId];
    if (pricePerItem === undefined) {
      return { success: false, message: 'Item not for sale' };
    }

    const totalCost = pricePerItem * quantity;

    // Check if player has enough gold
    if (currentState.character.gold < totalCost) {
      return { success: false, message: 'Not enough gold' };
    }

    // Find empty slot (equipment is not stackable)
    let targetRow = -1;
    let targetCol = -1;

    for (let row = 0; row < INVENTORY_ROWS && targetRow === -1; row++) {
      for (let col = 0; col < INVENTORY_COLS; col++) {
        if (!currentState.inventoryGrid[row][col]) {
          targetRow = row;
          targetCol = col;
          break;
        }
      }
    }

    // If no slot available, fail
    if (targetRow === -1) {
      return { success: false, message: 'No inventory space available' };
    }

    // All validations passed - perform the purchase
    // Update state (this is safe because validations passed)
    setGameState((prev) => {
      // Double-check in case of race condition
      if (!prev.character || prev.character.gold < totalCost) {
        return prev;
      }

      // Find empty slot again in case inventory changed
      let actualTargetRow = targetRow;
      let actualTargetCol = targetCol;
      
      if (prev.inventoryGrid[targetRow]?.[targetCol]) {
        // Original slot is now occupied, find new empty slot
        let foundEmpty = false;
        for (let row = 0; row < INVENTORY_ROWS && !foundEmpty; row++) {
          for (let col = 0; col < INVENTORY_COLS; col++) {
            if (!prev.inventoryGrid[row][col]) {
              actualTargetRow = row;
              actualTargetCol = col;
              foundEmpty = true;
              break;
            }
          }
        }
        if (!foundEmpty) {
          return prev;
        }
      }

      // Update inventory (equipment is not stackable, so quantity is always 1)
      const newGrid = prev.inventoryGrid.map(row => [...row]);
      newGrid[actualTargetRow][actualTargetCol] = {
        itemId: itemId,
        quantity: 1,
      };

      // Deduct gold
      const newGold = prev.character.gold - totalCost;

      return {
        ...prev,
        character: {
          ...prev.character,
          gold: newGold,
        },
        inventoryGrid: newGrid,
      };
    });

    // If we got here, all validations passed, so return success
    return { success: true, message: `Purchased ${itemData.name} for ${totalCost} gold` };
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
    applyMacroInventoryUpdate,
    applyMacroStatUpdate,
    purchasePotion,
    purchaseEquipment,
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
