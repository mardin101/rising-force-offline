/**
 * Inventory Manager
 * Utility functions for managing the inventory grid
 */

import type { InventoryGrid, InventoryItem } from '../state/gameStateSlice';
import { INVENTORY_ROWS, INVENTORY_COLS } from '../state/gameStateSlice';

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
