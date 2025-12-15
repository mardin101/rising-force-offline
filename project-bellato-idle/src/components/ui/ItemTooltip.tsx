import { useEffect, useRef, useState } from 'react';
import type { ItemData } from '../../state/gameStateSlice';
import { ITEM_TYPE } from '../../state/gameStateSlice';
import { getAssetPath } from '../../utils/assets';
import './ItemTooltip.css';

export interface ItemTooltipProps {
  item: ItemData;
  x: number;
  y: number;
  quantity?: number;
}

/**
 * ItemTooltip - A tooltip component that displays detailed information about an item
 * 
 * Features:
 * - Shows all available item information
 * - Positioned near the cursor/item
 * - Automatically adjusts position to stay within viewport
 * - Theme-consistent styling
 */
export default function ItemTooltip({ item, x, y, quantity }: ItemTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Measure tooltip dimensions after render
  useEffect(() => {
    if (!tooltipRef.current) return;

    const rect = tooltipRef.current.getBoundingClientRect();
    setDimensions({ width: rect.width, height: rect.height });
  }, [item]); // Re-measure when item changes

  // Calculate adjusted position based on dimensions
  const calculatePosition = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // Add offset to avoid covering the item
    const offset = 10;
    adjustedX += offset;
    adjustedY += offset;

    // Check if tooltip goes beyond right edge
    if (dimensions.width > 0 && adjustedX + dimensions.width > viewportWidth) {
      adjustedX = x - dimensions.width - offset;
    }

    // Check if tooltip goes beyond bottom edge
    if (dimensions.height > 0 && adjustedY + dimensions.height > viewportHeight) {
      adjustedY = y - dimensions.height - offset;
    }

    // Ensure tooltip doesn't go beyond left edge
    if (adjustedX < 0) {
      adjustedX = offset;
    }

    // Ensure tooltip doesn't go beyond top edge
    if (adjustedY < 0) {
      adjustedY = offset;
    }

    return { x: adjustedX, y: adjustedY };
  };

  const position = calculatePosition();

  // Get rarity class based on item type or other properties
  const getRarityClass = (): string => {
    // Could be enhanced later with actual rarity system
    if (item.levelRequirement && item.levelRequirement >= 40) {
      return 'rarity-legendary';
    }
    if (item.levelRequirement && item.levelRequirement >= 30) {
      return 'rarity-epic';
    }
    if (item.levelRequirement && item.levelRequirement >= 20) {
      return 'rarity-rare';
    }
    if (item.levelRequirement && item.levelRequirement >= 10) {
      return 'rarity-uncommon';
    }
    return 'rarity-common';
  };

  return (
    <div
      ref={tooltipRef}
      className={`item-tooltip ${getRarityClass()}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header with item name and icon */}
      <div className="item-tooltip-header">
        <div className="item-tooltip-icon">
          {item.image || item.localImagePath ? (
            <img 
              src={getAssetPath(item.image || item.localImagePath)} 
              alt={item.name}
              className="item-tooltip-image"
            />
          ) : (
            getItemIcon(item.type)
          )}
        </div>
        <div className="item-tooltip-name-section">
          <div className="item-tooltip-name">{item.name}</div>
          {item.type && (
            <div className="item-tooltip-type">{getItemTypeName(item.type)}</div>
          )}
        </div>
        {quantity && quantity > 1 && (
          <div className="item-tooltip-quantity">×{quantity}</div>
        )}
      </div>

      {/* Description */}
      {item.description && (
        <div className="item-tooltip-description">
          {item.description}
        </div>
      )}

      {/* Stats section */}
      <div className="item-tooltip-stats">
        {/* Equipment slot */}
        {item.equipSlot && (
          <div className="item-tooltip-stat">
            <span className="stat-label">Slot:</span>
            <span className="stat-value">{formatEquipSlot(item.equipSlot)}</span>
          </div>
        )}

        {/* Weapon type */}
        {item.weaponType && (
          <div className="item-tooltip-stat">
            <span className="stat-label">Type:</span>
            <span className="stat-value">{formatWeaponType(item.weaponType)}</span>
          </div>
        )}

        {/* Attack */}
        {item.attack !== undefined && item.attack > 0 && (
          <div className="item-tooltip-stat stat-positive">
            <span className="stat-label">Attack:</span>
            <span className="stat-value">+{item.attack}</span>
          </div>
        )}

        {/* Defense */}
        {item.defense !== undefined && item.defense > 0 && (
          <div className="item-tooltip-stat stat-positive">
            <span className="stat-label">Defense:</span>
            <span className="stat-value">+{item.defense}</span>
          </div>
        )}

        {/* Heal Amount (for potions) */}
        {item.amount !== undefined && item.amount > 0 && (
          <div className="item-tooltip-stat stat-healing">
            <span className="stat-label">Restores:</span>
            <span className="stat-value">{item.amount} {item.potionType || 'HP'}</span>
          </div>
        )}

        {/* Level Requirement */}
        {item.levelRequirement !== undefined && item.levelRequirement > 0 && (
          <div className="item-tooltip-stat stat-requirement">
            <span className="stat-label">Required Level:</span>
            <span className="stat-value">{item.levelRequirement}</span>
          </div>
        )}

        {/* Race */}
        {item.race && (
          <div className="item-tooltip-stat">
            <span className="stat-label">Race:</span>
            <span className="stat-value">{item.race}</span>
          </div>
        )}

        {/* Target */}
        {item.target && (
          <div className="item-tooltip-stat">
            <span className="stat-label">Target:</span>
            <span className="stat-value">{item.target}</span>
          </div>
        )}

        {/* Special Effects */}
        {item.specialEffects && (
          <div className="item-tooltip-stat stat-special">
            <span className="stat-label">Effect:</span>
            <span className="stat-value">{item.specialEffects}</span>
          </div>
        )}

        {/* Cast Delay */}
        {item.castDelay !== undefined && item.castDelay > 0 && (
          <div className="item-tooltip-stat">
            <span className="stat-label">Cast Delay:</span>
            <span className="stat-value">{item.castDelay}s</span>
          </div>
        )}

        {/* Use Status */}
        {item.useStatus && (
          <div className="item-tooltip-stat">
            <span className="stat-label">Use Status:</span>
            <span className="stat-value">{item.useStatus}</span>
          </div>
        )}

        {/* Tradable */}
        {item.trade !== undefined && (
          <div className="item-tooltip-stat">
            <span className="stat-label">Tradable:</span>
            <span className="stat-value">{item.trade ? 'Yes' : 'No'}</span>
          </div>
        )}

        {/* Max Quantity */}
        {item.maxQuantity !== undefined && item.maxQuantity > 1 && (
          <div className="item-tooltip-stat">
            <span className="stat-label">Max Stack:</span>
            <span className="stat-value">{item.maxQuantity}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get item icon emoji
function getItemIcon(type?: string): string {
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

// Helper function to get item type name
function getItemTypeName(type: string): string {
  switch (type) {
    case ITEM_TYPE.WEAPON:
      return 'Weapon';
    case ITEM_TYPE.ARMOR:
      return 'Armor';
    case ITEM_TYPE.CONSUMABLE:
      return 'Consumable';
    case ITEM_TYPE.MATERIAL:
      return 'Material';
    case ITEM_TYPE.ACCESSORY:
      return 'Accessory';
    default:
      return 'Item';
  }
}

// Helper function to format equipment slot
function formatEquipSlot(slot: string): string {
  return slot
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Helper function to format weapon type
function formatWeaponType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}
