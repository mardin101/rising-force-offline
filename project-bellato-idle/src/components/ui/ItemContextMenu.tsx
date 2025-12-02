import { useEffect, useCallback, useRef } from 'react';
import './ItemContextMenu.css';

// Positioning constants for viewport boundary calculations
const MENU_MIN_WIDTH = 150;
const ACTION_HEIGHT = 36;
const MENU_PADDING = 16;

export interface ContextMenuAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface ItemContextMenuProps {
  x: number;
  y: number;
  actions: ContextMenuAction[];
  onClose: () => void;
}

/**
 * ItemContextMenu - A context menu component for inventory items
 * 
 * Features:
 * - Positioned at click location
 * - Click outside to close
 * - Keyboard accessible (Escape to close)
 * - Action buttons for item interactions
 */
export default function ItemContextMenu({ x, y, actions, onClose }: ItemContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      onClose();
    }
  }, [onClose]);

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClickOutside, handleKeyDown]);

  // Adjust position to keep menu within viewport
  const adjustedPosition = {
    left: Math.min(x, window.innerWidth - MENU_MIN_WIDTH),
    top: Math.min(y, window.innerHeight - (actions.length * ACTION_HEIGHT + MENU_PADDING)),
  };

  return (
    <div
      ref={menuRef}
      className="item-context-menu"
      style={{
        left: adjustedPosition.left,
        top: adjustedPosition.top,
      }}
      role="menu"
      aria-label="Item actions"
    >
      {actions.map((action, index) => (
        <button
          key={index}
          className={`context-menu-action ${action.disabled ? 'disabled' : ''}`}
          onClick={() => {
            if (!action.disabled) {
              action.onClick();
              onClose();
            }
          }}
          disabled={action.disabled}
          role="menuitem"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
