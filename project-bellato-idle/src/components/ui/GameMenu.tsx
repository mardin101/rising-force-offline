import type { ReactNode } from 'react';
import './GameMenu.css';

export interface GameMenuProps {
  /** Title displayed in the menu header */
  title: string;
  /** Content to display inside the menu body */
  children: ReactNode;
  /** Called when the close button is clicked */
  onClose?: () => void;
  /** Called when the info/help button is clicked */
  onInfo?: () => void;
  /** Whether the menu is currently visible */
  isOpen?: boolean;
  /** Additional CSS class for customization */
  className?: string;
  /** Width of the menu (default: 320px) */
  width?: number;
}

/**
 * GameMenu - A reusable menu component styled after Rising Force Online
 * 
 * Features:
 * - Close button (top right)
 * - Info/help button (top left)
 * - Dark theme with metallic borders matching RF Online aesthetic
 * - Flexible content area for stats, inventory, settings, etc.
 */
export default function GameMenu({
  title,
  children,
  onClose,
  onInfo,
  isOpen = true,
  className = '',
  width = 320,
}: GameMenuProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`game-menu ${className}`}
      style={{ width: `${width}px` }}
      role="dialog"
      aria-label={title}
    >
      {/* Header with title and buttons */}
      <div className="game-menu-header">
        {/* Info/Help button (top left) */}
        <button
          className="game-menu-btn game-menu-btn-info"
          onClick={onInfo}
          aria-label="Info/Help"
          title="Info/Help"
        >
          <span className="game-menu-btn-icon">?</span>
        </button>

        {/* Title */}
        <span className="game-menu-title">{title}</span>

        {/* Close button (top right) */}
        <button
          className="game-menu-btn game-menu-btn-close"
          onClick={onClose}
          aria-label="Close menu"
          title="Close"
        >
          <span className="game-menu-btn-icon">×</span>
        </button>
      </div>

      {/* Menu body/content area */}
      <div className="game-menu-body">
        {children}
      </div>
    </div>
  );
}
