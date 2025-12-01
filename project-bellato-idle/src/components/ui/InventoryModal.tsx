import { useEffect, useCallback } from 'react';
import { type InventoryGrid as InventoryGridType } from '../../state/gameStateSlice';
import InventoryGrid from './InventoryGrid';
import './InventoryModal.css';

export interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  grid: InventoryGridType;
  onSwapItems: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
}

/**
 * InventoryModal - A modal component for displaying the inventory grid
 * 
 * Features:
 * - Transparent/semi-transparent backdrop
 * - Mobile-friendly design
 * - Close button and click-outside to close
 * - Smooth animations
 */
export default function InventoryModal({ isOpen, onClose, grid, onSwapItems }: InventoryModalProps) {
  // Handle escape key to close modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
            onClick={onClose}
            aria-label="Close inventory"
          >
            ×
          </button>
        </div>
        
        {/* Body with inventory grid */}
        <div className="inventory-modal-body">
          <InventoryGrid grid={grid} onSwapItems={onSwapItems} />
          
          {/* Instructions */}
          <div className="inventory-instructions">
            <p>💡 <strong>Desktop:</strong> Drag and drop items to rearrange</p>
            <p>📱 <strong>Mobile:</strong> Tap an item, then tap destination to swap</p>
          </div>
        </div>
      </div>
    </div>
  );
}
