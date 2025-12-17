/**
 * Inventory Manager
 * Utility functions for managing the inventory grid
 */

import type { InventoryGrid, InventoryItem } from '../state/gameStateSlice';
import { INVENTORY_ROWS, INVENTORY_COLS, MAX_STACK_SIZE, ITEM_TYPE, getItemById } from '../state/gameStateSlice';

/**
 * Check if an item is stackable based on its type
 * @param itemId The ID of the item to check
 * @returns true if the item can be stacked
 */
export function isItemStackable(itemId: string): boolean {
  const itemData = getItemById(itemId);
  if (!itemData) return false;
  
  // Consumables and materials are stackable
  return itemData.type === ITEM_TYPE.CONSUMABLE || itemData.type === ITEM_TYPE.MATERIAL;
}

/**
 * Find the first empty slot in the inventory grid
 * @param grid The inventory grid to search
 * @returns The row and column of the first empty slot, or null if inventory is full
 */
export function findEmptySlot(grid: InventoryGrid): { row: number; col: number } | null {
  for (let row = 0; row < INVENTORY_ROWS; row++) {
    for (let col = 0; col < INVENTORY_COLS; col++) {
      if (grid[row][col] === null) {
        return { row, col };
      }
    }
  }
  return null;
}

/**
 * Add an item to the first available slot in the inventory
 * @param grid The current inventory grid
 * @param itemId The ID of the item to add
 * @returns A new grid with the item added, or the original grid if inventory is full
 */
export function addItemToInventory(grid: InventoryGrid, itemId: string): { 
  grid: InventoryGrid; 
  success: boolean; 
  slot: { row: number; col: number } | null 
} {
  const emptySlot = findEmptySlot(grid);
  
  if (!emptySlot) {
    return { grid, success: false, slot: null };
  }
  
  const newGrid = grid.map(row => [...row]);
  newGrid[emptySlot.row][emptySlot.col] = { itemId };
  
  return { grid: newGrid, success: true, slot: emptySlot };
}

/**
 * Add items to inventory with quantity and stack limit support
 * Stackable items (consumables, materials) will be added to existing stacks first,
 * respecting the MAX_STACK_SIZE limit. Overflow creates new stacks.
 * 
 * @param grid The current inventory grid
 * @param itemId The ID of the item to add
 * @param quantity The quantity to add (default: 1)
 * @returns New grid with items added and success status
 */
export function addItemWithQuantity(
  grid: InventoryGrid, 
  itemId: string, 
  quantity: number = 1
): { 
  grid: InventoryGrid; 
  success: boolean; 
  added: number; // Number of items actually added
} {
  if (quantity <= 0) {
    return { grid, success: false, added: 0 };
  }

  const stackable = isItemStackable(itemId);
  const newGrid = grid.map(row => [...row]);
  let remainingQuantity = quantity;
  let totalAdded = 0;

  // For stackable items, try to add to existing stacks first
  if (stackable) {
    for (let row = 0; row < INVENTORY_ROWS && remainingQuantity > 0; row++) {
      for (let col = 0; col < INVENTORY_COLS && remainingQuantity > 0; col++) {
        const item = newGrid[row][col];
        
        // Found an existing stack of the same item
        if (item && item.itemId === itemId) {
          const currentQuantity = item.quantity ?? 1;
          const availableSpace = MAX_STACK_SIZE - currentQuantity;
          
          if (availableSpace > 0) {
            const toAdd = Math.min(remainingQuantity, availableSpace);
            newGrid[row][col] = { 
              itemId, 
              quantity: currentQuantity + toAdd 
            };
            remainingQuantity -= toAdd;
            totalAdded += toAdd;
          }
        }
      }
    }
  }

  // Add remaining items to empty slots
  while (remainingQuantity > 0) {
    // Find next empty slot
    let emptyRow = -1;
    let emptyCol = -1;
    
    for (let row = 0; row < INVENTORY_ROWS && emptyRow === -1; row++) {
      for (let col = 0; col < INVENTORY_COLS; col++) {
        if (newGrid[row][col] === null) {
          emptyRow = row;
          emptyCol = col;
          break;
        }
      }
    }

    // No empty slots available
    if (emptyRow === -1) {
      break;
    }

    // Add item to empty slot
    if (stackable) {
      const toAdd = Math.min(remainingQuantity, MAX_STACK_SIZE);
      newGrid[emptyRow][emptyCol] = { itemId, quantity: toAdd };
      remainingQuantity -= toAdd;
      totalAdded += toAdd;
    } else {
      // Non-stackable items (equipment, weapons) are added one at a time
      newGrid[emptyRow][emptyCol] = { itemId, quantity: 1 };
      remainingQuantity -= 1;
      totalAdded += 1;
    }
  }

  const success = totalAdded === quantity;
  return { grid: newGrid, success, added: totalAdded };
}

/**
 * Check if the inventory has any empty slots
 * @param grid The inventory grid to check
 * @returns true if there is at least one empty slot
 */
export function hasEmptySlot(grid: InventoryGrid): boolean {
  return findEmptySlot(grid) !== null;
}

/**
 * Count the number of empty slots in the inventory
 * @param grid The inventory grid to check
 * @returns The number of empty slots
 */
export function countEmptySlots(grid: InventoryGrid): number {
  let count = 0;
  for (let row = 0; row < INVENTORY_ROWS; row++) {
    for (let col = 0; col < INVENTORY_COLS; col++) {
      if (grid[row][col] === null) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Get an item at a specific position in the inventory
 * @param grid The inventory grid
 * @param row The row index
 * @param col The column index
 * @returns The item at the position, or null if empty
 */
export function getItemAt(grid: InventoryGrid, row: number, col: number): InventoryItem | null {
  if (row < 0 || row >= INVENTORY_ROWS || col < 0 || col >= INVENTORY_COLS) {
    return null;
  }
  return grid[row][col];
}

/**
 * Remove an item from a specific position in the inventory
 * @param grid The current inventory grid
 * @param row The row index
 * @param col The column index
 * @returns A new grid with the item removed
 */
export function removeItemAt(grid: InventoryGrid, row: number, col: number): InventoryGrid {
  if (row < 0 || row >= INVENTORY_ROWS || col < 0 || col >= INVENTORY_COLS) {
    return grid;
  }
  
  const newGrid = grid.map(r => [...r]);
  newGrid[row][col] = null;
  return newGrid;
}
