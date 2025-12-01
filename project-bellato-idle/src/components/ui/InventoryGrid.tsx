import { useState, useCallback } from 'react';
import { 
  type InventoryGrid as InventoryGridType, 
  type InventorySlot,
  INVENTORY_ROWS, 
  INVENTORY_COLS 
} from '../../state/gameStateSlice';
import './InventoryGrid.css';

export interface InventoryGridProps {
  grid: InventoryGridType;
  onSwapItems: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
}

interface DragState {
  isDragging: boolean;
  fromRow: number;
  fromCol: number;
}

/**
 * InventoryGrid - An 8x5 grid-based inventory component with drag-and-drop support
 * 
 * Features:
 * - 8 columns x 5 rows grid layout
 * - Touch-friendly drag and drop for item rearrangement
 * - Visual feedback during drag operations
 * - Mobile-optimized touch interactions
 */
export default function InventoryGrid({ grid, onSwapItems }: InventoryGridProps) {
  const [dragState, setDragState] = useState<DragState>({ 
    isDragging: false, 
    fromRow: -1, 
    fromCol: -1 
  });
  const [touchedSlot, setTouchedSlot] = useState<{ row: number; col: number } | null>(null);

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
    const [fromRow, fromCol] = data.split(',').map(Number);
    
    if (fromRow !== toRow || fromCol !== toCol) {
      onSwapItems(fromRow, fromCol, toRow, toCol);
    }
    setDragState({ isDragging: false, fromRow: -1, fromCol: -1 });
  }, [onSwapItems]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDragState({ isDragging: false, fromRow: -1, fromCol: -1 });
  }, []);

  // Handle touch start for mobile
  const handleTouchStart = useCallback((row: number, col: number) => {
    if (touchedSlot) {
      // Second tap - swap items
      if (touchedSlot.row !== row || touchedSlot.col !== col) {
        onSwapItems(touchedSlot.row, touchedSlot.col, row, col);
      }
      setTouchedSlot(null);
    } else if (grid[row][col]) {
      // First tap - select item
      setTouchedSlot({ row, col });
    }
  }, [touchedSlot, onSwapItems, grid]);

  // Clear touched slot when clicking outside
  const handleGridClick = useCallback(() => {
    // Handled by slot clicks
  }, []);

  // Render a single inventory slot
  const renderSlot = (item: InventorySlot, row: number, col: number) => {
    const isDragSource = dragState.isDragging && dragState.fromRow === row && dragState.fromCol === col;
    const isSelected = touchedSlot?.row === row && touchedSlot?.col === col;
    
    return (
      <div
        key={`${row}-${col}`}
        className={`inventory-slot ${item ? 'has-item' : 'empty'} ${isDragSource ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`}
        draggable={!!item}
        onDragStart={(e) => handleDragStart(row, col, e)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(row, col, e)}
        onDragEnd={handleDragEnd}
        onClick={() => handleTouchStart(row, col)}
        role="button"
        aria-label={item ? `${item.name} - Click to select for swap` : 'Empty slot'}
        tabIndex={0}
      >
        {item && (
          <div className="inventory-item">
            <div className="item-icon">
              {getItemIcon(item.type)}
            </div>
            <div className="item-name">{item.name}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="inventory-grid-container" onClick={handleGridClick}>
      <div className="inventory-grid">
        {Array.from({ length: INVENTORY_ROWS }).map((_, row) => (
          <div key={row} className="inventory-row">
            {Array.from({ length: INVENTORY_COLS }).map((_, col) => 
              renderSlot(grid[row]?.[col] ?? null, row, col)
            )}
          </div>
        ))}
      </div>
      {touchedSlot && (
        <div className="inventory-hint">
          Tap another slot to swap, or tap the same slot to deselect
        </div>
      )}
    </div>
  );
}

// Helper function to get item icon based on type
function getItemIcon(type: string): string {
  switch (type) {
    case 'weapon':
      return '⚔️';
    case 'armor':
      return '🛡️';
    case 'consumable':
      return '🧪';
    case 'material':
      return '💎';
    case 'accessory':
      return '💍';
    default:
      return '📦';
  }
}
