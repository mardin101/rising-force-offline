import { useEffect, useCallback, useState, type DragEvent } from 'react';
import { 
  type InventoryGrid as InventoryGridType,
  type MacroState,
  getItemById,
  ITEM_TYPE,
  INVENTORY_ROWS,
  INVENTORY_COLS,
} from '../../state/gameStateSlice';
import './MacroModal.css';

export interface MacroModalProps {
  isOpen: boolean;
  onClose: () => void;
  macroState: MacroState;
  inventoryGrid: InventoryGridType;
  maxHp: number;
  currentHp: number;
  playerLevel: number;
  onUpdateMacro: (updates: Partial<MacroState>) => void;
}

interface AvailablePotion {
  row: number;
  col: number;
  itemId: string;
  name: string;
  quantity: number;
  healAmount: number;
  levelRequirement?: number;
}

// Utility function to check if coordinates are valid inventory bounds
function isValidInventoryCoordinate(row: number, col: number): boolean {
  return !isNaN(row) && !isNaN(col) &&
         row >= 0 && row < INVENTORY_ROWS &&
         col >= 0 && col < INVENTORY_COLS;
}

/**
 * MacroModal - A modal for configuring the potion auto-use macro
 * 
 * Features:
 * - Enable/disable toggle for the macro
 * - Drag and drop potion slot
 * - HP threshold slider (0 to max HP)
 * - List of available potions from inventory
 */
export default function MacroModal({ 
  isOpen, 
  onClose, 
  macroState,
  inventoryGrid,
  maxHp,
  currentHp,
  playerLevel,
  onUpdateMacro,
}: MacroModalProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingFrom, setDraggingFrom] = useState<{ row: number; col: number } | null>(null);

  // Handle escape key to close modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, handleKeyDown]);

  // Get available potions from inventory
  const getAvailablePotions = useCallback((): AvailablePotion[] => {
    const potions: AvailablePotion[] = [];
    
    for (let row = 0; row < INVENTORY_ROWS; row++) {
      for (let col = 0; col < INVENTORY_COLS; col++) {
        const item = inventoryGrid[row][col];
        if (item) {
          const itemData = getItemById(item.itemId);
          if (itemData && itemData.type === ITEM_TYPE.CONSUMABLE && itemData.healAmount) {
            potions.push({
              row,
              col,
              itemId: item.itemId,
              name: itemData.name,
              quantity: item.quantity ?? 1,
              healAmount: itemData.healAmount,
              levelRequirement: itemData.levelRequirement,
            });
          }
        }
      }
    }
    
    return potions;
  }, [inventoryGrid]);

  // Get the currently assigned potion info
  const getAssignedPotion = useCallback(() => {
    if (!macroState.potionSlot) return null;
    
    const { row, col } = macroState.potionSlot;
    const item = inventoryGrid[row]?.[col];
    if (!item) return null;
    
    const itemData = getItemById(item.itemId);
    if (!itemData || itemData.type !== ITEM_TYPE.CONSUMABLE) return null;
    
    return {
      name: itemData.name,
      quantity: item.quantity ?? 1,
      healAmount: itemData.healAmount ?? 0,
      levelRequirement: itemData.levelRequirement,
    };
  }, [macroState.potionSlot, inventoryGrid]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle toggle
  const handleToggle = () => {
    onUpdateMacro({ enabled: !macroState.enabled });
  };

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateMacro({ hpThreshold: parseInt(e.target.value, 10) });
  };

  // Handle drag start from available potions
  const handleDragStart = (e: DragEvent<HTMLDivElement>, row: number, col: number) => {
    e.dataTransfer.setData('text/plain', `${row},${col}`);
    e.dataTransfer.effectAllowed = 'copy';
    setDraggingFrom({ row, col });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingFrom(null);
  };

  // Handle drag over on the macro slot
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  // Handle drag leave on the macro slot
  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Handle drop on the macro slot
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const data = e.dataTransfer.getData('text/plain');
    const parts = data.split(',');
    
    if (parts.length !== 2) return;
    
    const row = parseInt(parts[0], 10);
    const col = parseInt(parts[1], 10);
    
    if (!isValidInventoryCoordinate(row, col)) {
      return;
    }

    // Verify it's a valid potion
    const item = inventoryGrid[row]?.[col];
    if (!item) return;
    
    const itemData = getItemById(item.itemId);
    if (!itemData || itemData.type !== ITEM_TYPE.CONSUMABLE || !itemData.healAmount) {
      return;
    }

    // Set the potion slot
    onUpdateMacro({ potionSlot: { row, col } });
  };

  // Handle click on available potion to assign it
  const handlePotionClick = (row: number, col: number) => {
    onUpdateMacro({ potionSlot: { row, col } });
  };

  // Clear the potion slot
  const handleClearSlot = () => {
    onUpdateMacro({ potionSlot: null });
  };

  if (!isOpen) {
    return null;
  }

  const availablePotions = getAvailablePotions();
  const assignedPotion = getAssignedPotion();

  return (
    <div 
      className="macro-modal-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Macro Settings"
    >
      <div className="macro-modal">
        {/* Header */}
        <div className="macro-modal-header">
          <span className="macro-modal-title">Macro Settings</span>
          <button
            className="macro-modal-close"
            onClick={onClose}
            aria-label="Close macro settings"
          >
            ×
          </button>
        </div>
        
        {/* Body */}
        <div className="macro-modal-body">
          {/* Enable/Disable Toggle */}
          <div className="macro-enable-row">
            <span className="macro-enable-label">Enable Auto-Potion</span>
            <button
              className={`macro-toggle ${macroState.enabled ? 'enabled' : ''}`}
              onClick={handleToggle}
              aria-label={macroState.enabled ? 'Disable macro' : 'Enable macro'}
              aria-pressed={macroState.enabled}
            >
              <span className="macro-toggle-slider" />
            </button>
          </div>

          {/* Potion Slot */}
          <div className="macro-section">
            <div className="macro-section-title">Assigned Potion</div>
            <div
              className={`macro-potion-slot ${assignedPotion ? 'has-item' : ''} ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={assignedPotion ? handleClearSlot : undefined}
              title={assignedPotion ? 'Click to remove' : 'Drag a potion here or click one below'}
            >
              {assignedPotion ? (
                <div className="macro-potion-slot-content">
                  <span className="macro-potion-icon">🧪</span>
                  <span className="macro-potion-quantity">x{assignedPotion.quantity}</span>
                </div>
              ) : (
                <span className="macro-potion-empty">Drop potion here</span>
              )}
            </div>
            {assignedPotion && (
              <div style={{ textAlign: 'center', fontSize: '11px', color: '#a0d0ff' }}>
                {assignedPotion.name} (+{assignedPotion.healAmount} HP)
                {assignedPotion.levelRequirement && (
                  <span style={{ 
                    marginLeft: '6px',
                    padding: '1px 4px', 
                    borderRadius: '3px',
                    fontSize: '10px',
                    backgroundColor: playerLevel >= assignedPotion.levelRequirement 
                      ? 'rgba(128, 255, 192, 0.15)' 
                      : 'rgba(255, 128, 128, 0.15)',
                    color: playerLevel >= assignedPotion.levelRequirement ? '#80ffc0' : '#ff8080',
                    border: `1px solid ${playerLevel >= assignedPotion.levelRequirement ? 'rgba(128, 255, 192, 0.3)' : 'rgba(255, 128, 128, 0.3)'}`
                  }}>
                    Lv.{assignedPotion.levelRequirement}+
                  </span>
                )}
              </div>
            )}
          </div>

          {/* HP Threshold Slider */}
          <div className="macro-section">
            <div className="macro-section-title">HP Threshold</div>
            <div className="macro-slider-container">
              <div className="macro-slider-header">
                <span className="macro-slider-label">Use potion when HP drops below:</span>
                <span className="macro-slider-value">{macroState.hpThreshold} HP</span>
              </div>
              <input
                type="range"
                className="macro-slider"
                min="0"
                max={maxHp}
                value={macroState.hpThreshold}
                onChange={handleSliderChange}
                aria-label="HP threshold"
              />
              <div className="macro-slider-hint">
                Current HP: {currentHp} / {maxHp}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="macro-divider">
            <span className="macro-divider-text">Available Potions</span>
          </div>

          {/* Available Potions Grid */}
          <div className="macro-potions-grid">
            {availablePotions.length > 0 ? (
              availablePotions.map((potion) => {
                const meetsLevel = !potion.levelRequirement || playerLevel >= potion.levelRequirement;
                return (
                  <div
                    key={`${potion.row}-${potion.col}`}
                    className={`macro-potion-item ${
                      draggingFrom?.row === potion.row && draggingFrom?.col === potion.col ? 'dragging' : ''
                    } ${!meetsLevel ? 'level-locked' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, potion.row, potion.col)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handlePotionClick(potion.row, potion.col)}
                    title={`${potion.name}: +${potion.healAmount} HP (x${potion.quantity})${potion.levelRequirement ? ` - Requires Lv.${potion.levelRequirement}` : ''}`}
                  >
                    <span className="macro-potion-item-icon">🧪</span>
                    <span className="macro-potion-item-name">{potion.name}</span>
                    <span className="macro-potion-item-quantity">x{potion.quantity}</span>
                    {potion.levelRequirement && (
                      <span className={`macro-potion-item-level ${meetsLevel ? 'met' : 'unmet'}`}>
                        Lv.{potion.levelRequirement}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="macro-no-potions">
                No potions in inventory
              </div>
            )}
          </div>

          {/* Status */}
          <div className="macro-status">
            <div className="macro-status-row">
              <span className="macro-status-label">Status:</span>
              <span className={`macro-status-value ${macroState.enabled ? 'active' : 'inactive'}`}>
                {macroState.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="macro-status-row">
              <span className="macro-status-label">Potion:</span>
              <span className="macro-status-value">
                {assignedPotion ? `${assignedPotion.name} (x${assignedPotion.quantity})` : 'None'}
              </span>
            </div>
            <div className="macro-status-row">
              <span className="macro-status-label">Trigger at:</span>
              <span className="macro-status-value">{macroState.hpThreshold} HP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
