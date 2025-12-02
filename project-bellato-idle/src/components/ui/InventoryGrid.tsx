import { useState, useCallback, useEffect } from 'react';
import { 
  type InventoryGrid as InventoryGridType, 
  type InventorySlot,
  type ItemType,
  INVENTORY_ROWS, 
  INVENTORY_COLS,
  ITEM_TYPE,
  getItemById,
} from '../../state/gameStateSlice';
import ItemContextMenu, { type ContextMenuAction } from './ItemContextMenu';
import './InventoryGrid.css';

// Constants
const FEEDBACK_DISPLAY_DURATION = 2000; // ms

export interface InventoryGridProps {
  grid: InventoryGridType;
  onSwapItems: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
  selectedSlot?: { row: number; col: number } | null;
  onSelectedSlotChange?: (slot: { row: number; col: number } | null) => void;
  onUseItem?: (row: number, col: number) => { success: boolean; message: string };
}

interface DragState {
  isDragging: boolean;
  fromRow: number;
  fromCol: number;
}

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  row: number;
  col: number;
}

/**
 * InventoryGrid - An 8x5 grid-based inventory component with drag-and-drop support
 * 
 * Features:
 * - 8 columns x 5 rows grid layout
 * - Touch-friendly drag and drop for item rearrangement
 * - Visual feedback during drag operations
 * - Mobile-optimized touch interactions
 * - Controlled or uncontrolled selection state
 * - Right-click context menu for item actions (Use, etc.)
 */
export default function InventoryGrid({ 
  grid, 
  onSwapItems,
  selectedSlot: controlledSelectedSlot,
  onSelectedSlotChange,
  onUseItem,
}: InventoryGridProps) {
  const [dragState, setDragState] = useState<DragState>({ 
    isDragging: false, 
    fromRow: -1, 
    fromCol: -1 
  });
  const [internalSelectedSlot, setInternalSelectedSlot] = useState<{ row: number; col: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    row: -1,
    col: -1,
  });
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Auto-dismiss feedback message after duration
  useEffect(() => {
    if (feedbackMessage) {
      const timeoutId = setTimeout(() => setFeedbackMessage(null), FEEDBACK_DISPLAY_DURATION);
      return () => clearTimeout(timeoutId);
    }
  }, [feedbackMessage]);
  
  // Use controlled or uncontrolled selection
  const isControlled = controlledSelectedSlot !== undefined;
  
  // Compute the effective selected slot, clearing it if the slot is now empty
  const rawSelectedSlot = isControlled ? controlledSelectedSlot : internalSelectedSlot;
  const selectedSlot = rawSelectedSlot && grid[rawSelectedSlot.row][rawSelectedSlot.col] 
    ? rawSelectedSlot 
    : null;
  
  const setSelectedSlot = useCallback((slot: { row: number; col: number } | null) => {
    if (isControlled) {
      onSelectedSlotChange?.(slot);
    } else {
      setInternalSelectedSlot(slot);
    }
  }, [isControlled, onSelectedSlotChange]);

  // Handle right-click context menu
  const handleContextMenu = useCallback((row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    const slot = grid[row][col];
    if (!slot) return;

    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      row,
      col,
    });
  }, [grid]);

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Get context menu actions for the current slot
  const getContextMenuActions = useCallback((): ContextMenuAction[] => {
    const actions: ContextMenuAction[] = [];
    const slot = grid[contextMenu.row]?.[contextMenu.col];
    
    if (!slot) return actions;
    
    const itemData = getItemById(slot.itemId);
    if (!itemData) return actions;

    // Add "Use" action for consumable items
    if (itemData.type === ITEM_TYPE.CONSUMABLE && onUseItem) {
      actions.push({
        label: '🧪 Use',
        onClick: () => {
          const result = onUseItem(contextMenu.row, contextMenu.col);
          if (result.message) {
            setFeedbackMessage(result.message);
          }
        },
      });
    }

    return actions;
  }, [contextMenu.row, contextMenu.col, grid, onUseItem]);

  // Handle drag start (mouse)
  const handleDragStart = useCallback((row: number, col: number, e: React.DragEvent) => {
    if (!grid[row][col]) {
      e.preventDefault();
      return;
    }
    setDragState({ isDragging: true, fromRow: row, fromCol: col });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${row},${col}`);
  }, [grid]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop
  const handleDrop = useCallback((toRow: number, toCol: number, e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    const parts = data.split(',');
    
    // Validate that we have exactly 2 parts that are valid numbers
    if (parts.length !== 2) {
      setDragState({ isDragging: false, fromRow: -1, fromCol: -1 });
      return;
    }
    
    const fromRow = parseInt(parts[0], 10);
    const fromCol = parseInt(parts[1], 10);
    
    // Validate parsed values are valid numbers within grid bounds
    if (isNaN(fromRow) || isNaN(fromCol) || 
        fromRow < 0 || fromRow >= INVENTORY_ROWS || 
        fromCol < 0 || fromCol >= INVENTORY_COLS) {
      setDragState({ isDragging: false, fromRow: -1, fromCol: -1 });
      return;
    }
    
    if (fromRow !== toRow || fromCol !== toCol) {
      onSwapItems(fromRow, fromCol, toRow, toCol);
    }
    setDragState({ isDragging: false, fromRow: -1, fromCol: -1 });
  }, [onSwapItems]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDragState({ isDragging: false, fromRow: -1, fromCol: -1 });
  }, []);

  // Handle touch/click for mobile
  const handleSlotClick = useCallback((row: number, col: number) => {
    if (selectedSlot) {
      // Second tap - swap items
      if (selectedSlot.row !== row || selectedSlot.col !== col) {
        onSwapItems(selectedSlot.row, selectedSlot.col, row, col);
      }
      setSelectedSlot(null);
    } else if (grid[row][col]) {
      // First tap - select item
      setSelectedSlot({ row, col });
    }
  }, [selectedSlot, onSwapItems, grid, setSelectedSlot]);

  // Render a single inventory slot
  const renderSlot = (slot: InventorySlot, row: number, col: number) => {
    const isDragSource = dragState.isDragging && dragState.fromRow === row && dragState.fromCol === col;
    const isSelected = selectedSlot?.row === row && selectedSlot?.col === col;
    
    // Look up item data from the data file
    const itemData = slot ? getItemById(slot.itemId) : null;
    const quantity = slot?.quantity;
    
    return (
      <div
        key={`${row}-${col}`}
        className={`inventory-slot ${slot ? 'has-item' : 'empty'} ${isDragSource ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`}
        draggable={!!slot}
        onDragStart={(e) => handleDragStart(row, col, e)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(row, col, e)}
        onDragEnd={handleDragEnd}
        onClick={() => handleSlotClick(row, col)}
        onContextMenu={(e) => handleContextMenu(row, col, e)}
        role="button"
        aria-label={itemData ? `${itemData.name}${quantity && quantity > 1 ? ` (${quantity})` : ''} - Click to select, right-click for options` : 'Empty slot'}
        tabIndex={0}
      >
        {itemData && (
          <div className="inventory-item">
            <div className="item-icon">
              {getItemIcon(itemData.type)}
            </div>
            <div className="item-name">{itemData.name}</div>
            {quantity && quantity > 1 && (
              <div className="item-quantity">{quantity}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="inventory-grid-container">
      <div className="inventory-grid">
        {Array.from({ length: INVENTORY_ROWS }).map((_, row) => (
          <div key={row} className="inventory-row">
            {Array.from({ length: INVENTORY_COLS }).map((_, col) => 
              renderSlot(grid[row][col], row, col)
            )}
          </div>
        ))}
      </div>
      {selectedSlot && (
        <div className="inventory-hint">
          Tap another slot to swap, or tap the same slot to deselect
        </div>
      )}
      {feedbackMessage && (
        <div className="inventory-feedback">
          {feedbackMessage}
        </div>
      )}
      {contextMenu.isOpen && (
        <ItemContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          actions={getContextMenuActions()}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}

// Helper function to get item icon based on type using constants
function getItemIcon(type: ItemType): string {
  switch (type) {
    case ITEM_TYPE.WEAPON:
      return '⚔️';
    case ITEM_TYPE.ARMOR:
      return '🛡️';
    case ITEM_TYPE.CONSUMABLE:
      return '🧪';
    case ITEM_TYPE.MATERIAL:
      return '💎';
    case ITEM_TYPE.ACCESSORY:
      return '💍';
    default:
      return '📦';
  }
}
