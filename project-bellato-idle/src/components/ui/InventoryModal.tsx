import { useState, useCallback } from 'react';
import { 
  type InventoryGrid as InventoryGridType,
  type EquippedItems,
  type EquipmentSlotType,
  getItemById,
} from '../../state/gameStateSlice';
import InventoryGrid from './InventoryGrid';
import EquipmentSlots from './EquipmentSlots';
import { useModalEscape } from '../../hooks/useModalEscape';
import './InventoryModal.css';

export interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  grid: InventoryGridType;
  equippedItems: EquippedItems;
  onSwapItems: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
  onEquipItem: (slot: EquipmentSlotType, fromRow: number, fromCol: number) => void;
  onUnequipItem: (slot: EquipmentSlotType) => void;
  onUseItem?: (row: number, col: number) => { success: boolean; message: string };
}

/**
 * InventoryModal - A modal component for displaying the inventory grid and equipment slots
 * 
 * Features:
 * - Transparent/semi-transparent backdrop
 * - Mobile-friendly design
 * - Close button and click-outside to close
 * - Smooth animations
 * - Equipment slots above backpack in person-shaped layout
 * - Drag and drop from inventory to equipment slots
 */
export default function InventoryModal({ 
  isOpen, 
  onClose, 
  grid, 
  equippedItems,
  onSwapItems,
  onEquipItem,
  onUnequipItem,
  onUseItem,
}: InventoryModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ row: number; col: number } | null>(null);

  // Handle escape key to close modal and manage body overflow
  useModalEscape(isOpen, onClose);

  // Handle backdrop click - also clears selection
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedSlot(null);
      onClose();
    }
  };

  // Handle close button click
  const handleCloseClick = () => {
    setSelectedSlot(null);
    onClose();
  };

  // Check if the selected inventory item can be equipped to a specific slot
  const canEquipSelectedItem = useCallback((slot: EquipmentSlotType): boolean => {
    if (!selectedSlot) return false;
    const inventoryItem = grid[selectedSlot.row][selectedSlot.col];
    if (!inventoryItem) return false;
    const itemData = getItemById(inventoryItem.itemId);
    return itemData?.equipSlot === slot;
  }, [selectedSlot, grid]);

  // Handle drop to equipment slot
  const handleDropToSlot = useCallback((slot: EquipmentSlotType, fromRow: number, fromCol: number) => {
    onEquipItem(slot, fromRow, fromCol);
    setSelectedSlot(null);
  }, [onEquipItem]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="inventory-modal-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Inventory"
    >
      <div className="inventory-modal">
        {/* Header */}
        <div className="inventory-modal-header">
          <span className="inventory-modal-title">Inventory</span>
          <button
            className="inventory-modal-close"
            onClick={handleCloseClick}
            aria-label="Close inventory"
          >
            ×
          </button>
        </div>
        
        {/* Body with equipment slots and inventory grid */}
        <div className="inventory-modal-body">
          {/* Equipment Slots - Person-shaped layout above inventory */}
          <EquipmentSlots
            equippedItems={equippedItems}
            onUnequipItem={onUnequipItem}
            onDropToSlot={handleDropToSlot}
            selectedInventorySlot={selectedSlot}
            canEquipSelectedItem={canEquipSelectedItem}
          />

          {/* Divider */}
          <div className="inventory-divider">
            <span className="inventory-divider-text">Backpack</span>
          </div>

          {/* Inventory Grid */}
          <InventoryGrid 
            grid={grid} 
            onSwapItems={onSwapItems}
            selectedSlot={selectedSlot}
            onSelectedSlotChange={setSelectedSlot}
            onUseItem={onUseItem}
          />
          
          {/* Instructions */}
          <div className="inventory-instructions">
            <p>💡 <strong>Desktop:</strong> Drag and drop items to rearrange or equip. Right-click to use items.</p>
            <p>📱 <strong>Mobile:</strong> Tap an item, then tap destination to swap or equip</p>
          </div>
        </div>
      </div>
    </div>
  );
}
