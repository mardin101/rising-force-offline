/**
 * Validation utilities for game logic
 * Consolidates common validation patterns used throughout the application
 */

/**
 * Validates if a player meets the level requirement for an item or feature
 * @param playerLevel - The player's current level
 * @param requiredLevel - The required level (undefined means no requirement)
 * @returns true if the player meets the requirement, false otherwise
 */
export function validateLevelRequirement(
  playerLevel: number,
  requiredLevel: number | undefined
): boolean {
  return !requiredLevel || playerLevel >= requiredLevel;
}

/**
 * Validates if a player can afford a purchase
 * @param playerGold - The player's current gold amount
 * @param cost - The cost of the item or service
 * @returns true if the player has enough gold, false otherwise
 */
export function validateCanAfford(playerGold: number, cost: number): boolean {
  return playerGold >= cost;
}

/**
 * Combined validation for purchases
 * @param playerGold - The player's current gold amount
 * @param playerLevel - The player's current level
 * @param cost - The cost of the item
 * @param requiredLevel - The required level (undefined means no requirement)
 * @returns true if the player can afford and meets level requirement
 */
export function validatePurchaseEligibility(
  playerGold: number,
  playerLevel: number,
  cost: number,
  requiredLevel: number | undefined
): boolean {
  return validateCanAfford(playerGold, cost) && validateLevelRequirement(playerLevel, requiredLevel);
}
