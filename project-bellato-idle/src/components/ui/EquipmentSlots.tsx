import { useState, useCallback } from 'react';
import {
  type EquippedItems,
  type EquipmentSlotType,
  type InventoryItem,
  EQUIPMENT_SLOT,
  getItemById,
} from '../../state/gameStateSlice';
import { getAssetPath } from '../../utils/assets';
import './EquipmentSlots.css';

export interface EquipmentSlotsProps {
  equippedItems: EquippedItems;
  onUnequipItem: (slot: EquipmentSlotType) => void;
  onDropToSlot: (slot: EquipmentSlotType, fromRow: number, fromCol: number) => void;
  selectedInventorySlot: { row: number; col: number } | null;
  canEquipSelectedItem: (slot: EquipmentSlotType) => boolean;
}

// Slot configuration with labels and icons
const SLOT_CONFIG: Record<EquipmentSlotType, { label: string; icon: string }> = {
  [EQUIPMENT_SLOT.HELMET]: { label: 'Helmet', icon: '🪖' },
  [EQUIPMENT_SLOT.UPPER_BODY]: { label: 'Upper Body', icon: '👕' },
  [EQUIPMENT_SLOT.LOWER_BODY]: { label: 'Lower Body', icon: '👖' },
  [EQUIPMENT_SLOT.GLOVES]: { label: 'Gloves', icon: '🧤' },
  [EQUIPMENT_SLOT.SHOES]: { label: 'Shoes', icon: '👟' },
  [EQUIPMENT_SLOT.CAPE]: { label: 'Cape', icon: '🧣' },
  [EQUIPMENT_SLOT.WEAPON]: { label: 'Weapon', icon: '⚔️' },
};

/**
 * EquipmentSlots - A component showing equipped items in a person-shaped layout
 * 
 * Layout:
 *        [Helmet]
 *   [Cape] [Upper] [Weapon]
 *   [Gloves][Lower]
 *         [Shoes]
 */
export default function EquipmentSlots({
  equippedItems,
  onUnequipItem,
  onDropToSlot,
  selectedInventorySlot,
  canEquipSelectedItem,
}: EquipmentSlotsProps) {
  const [dragOverSlot, setDragOverSlot] = useState<EquipmentSlotType | null>(null);

  // Handle drag over for equipment slots
  const handleDragOver = useCallback((slot: EquipmentSlotType, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(slot);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDragOverSlot(null);
  }, []);

  // Handle drop on equipment slot
  const handleDrop = useCallback((slot: EquipmentSlotType, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSlot(null);

    const data = e.dataTransfer.getData('text/plain');
    const parts = data.split(',');

    if (parts.length !== 2) return;

    const fromRow = parseInt(parts[0], 10);
    const fromCol = parseInt(parts[1], 10);

    if (isNaN(fromRow) || isNaN(fromCol)) return;

    onDropToSlot(slot, fromRow, fromCol);
  }, [onDropToSlot]);

  // Handle click on equipment slot (for mobile tap-to-equip)
  const handleSlotClick = useCallback((slot: EquipmentSlotType) => {
    if (selectedInventorySlot && canEquipSelectedItem(slot)) {
      onDropToSlot(slot, selectedInventorySlot.row, selectedInventorySlot.col);
    } else if (equippedItems[slot]) {
      // If there's an equipped item and no selected inventory item, unequip
      onUnequipItem(slot);
    }
  }, [selectedInventorySlot, canEquipSelectedItem, onDropToSlot, equippedItems, onUnequipItem]);

  // Render a single equipment slot
  const renderSlot = (slot: EquipmentSlotType) => {
    const config = SLOT_CONFIG[slot];
    const equippedItem: InventoryItem | null = equippedItems[slot];
    const itemData = equippedItem ? getItemById(equippedItem.itemId) : null;
    const isDragOver = dragOverSlot === slot;
    const canAcceptSelected = selectedInventorySlot && canEquipSelectedItem(slot);

    return (
      <div
        key={slot}
        className={`equipment-slot ${equippedItem ? 'has-item' : 'empty'} ${isDragOver ? 'drag-over' : ''} ${canAcceptSelected ? 'can-accept' : ''}`}
        onDragOver={(e) => handleDragOver(slot, e)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(slot, e)}
        onClick={() => handleSlotClick(slot)}
        role="button"
        aria-label={itemData ? `${config.label}: ${itemData.name} - Click to unequip` : `${config.label}: Empty - Drag item here to equip`}
        tabIndex={0}
      >
        {itemData ? (
          <div className="equipped-item">
            <div className="equipped-item-icon">
              {itemData.image || itemData.localImagePath ? (
                <img 
                  src={getAssetPath(itemData.image || itemData.localImagePath)} 
                  alt={itemData.name} 
                  className="equipped-item-image"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                config.icon
              )}
            </div>
            <div className="equipped-item-name">{itemData.name}</div>
          </div>
        ) : (
          <div className="empty-slot">
            <div className="empty-slot-icon">{config.icon}</div>
            <div className="empty-slot-label">{config.label}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="equipment-slots-container">
      <div className="equipment-slots-title">Equipped Items</div>
      <div className="equipment-slots-grid">
        {/* Top row: Helmet centered */}
        <div className="equipment-row equipment-row-top">
          <div className="equipment-spacer"></div>
          {renderSlot(EQUIPMENT_SLOT.HELMET)}
          <div className="equipment-spacer"></div>
        </div>
        
        {/* Middle row: Cape, Upper Body, Weapon */}
        <div className="equipment-row equipment-row-middle">
          {renderSlot(EQUIPMENT_SLOT.CAPE)}
          {renderSlot(EQUIPMENT_SLOT.UPPER_BODY)}
          {renderSlot(EQUIPMENT_SLOT.WEAPON)}
        </div>
        
        {/* Third row: Gloves, Lower Body */}
        <div className="equipment-row equipment-row-third">
          {renderSlot(EQUIPMENT_SLOT.GLOVES)}
          {renderSlot(EQUIPMENT_SLOT.LOWER_BODY)}
          <div className="equipment-spacer"></div>
        </div>
        
        {/* Bottom row: Shoes centered */}
        <div className="equipment-row equipment-row-bottom">
          <div className="equipment-spacer"></div>
          {renderSlot(EQUIPMENT_SLOT.SHOES)}
          <div className="equipment-spacer"></div>
        </div>
      </div>
      
      {selectedInventorySlot && (
        <div className="equipment-hint">
          Tap an equipment slot to equip the selected item
        </div>
      )}
    </div>
  );
}
