# Copilot Instructions for Rising Force Offline

This document provides coding guidelines for GitHub Copilot when working with the Rising Force Offline project.

## General Principles

### Avoid Circular Dependencies

**NEVER** create circular dependencies between modules. Circular dependencies can lead to:
- Runtime errors and undefined behavior
- Difficulty in testing and mocking
- Unpredictable module initialization order
- Build system issues

**Strategies to avoid circular dependencies:**

1. **Extract shared types/interfaces to a separate module:**
   ```typescript
   // ✅ Correct - Shared types in separate file
   // types/character.ts
   export interface Character { ... }
   
   // modules/characterManager.ts
   import type { Character } from '../types/character';
   
   // modules/inventory.ts
   import type { Character } from '../types/character';
   ```

2. **Use dependency injection:**
   ```typescript
   // ✅ Correct - Pass dependencies as parameters
   export function processInventory(character: Character) { ... }
   
   // ❌ Incorrect - Importing the module that imports this one
   import { getCharacter } from './characterManager'; // characterManager imports this file
   ```

3. **Restructure to use a unidirectional dependency flow:**
   - Lower-level modules should not import higher-level modules
   - State management (Redux/Zustand) should be at the lowest level
   - UI components should import from state, not vice versa

4. **Use events or callbacks instead of direct imports:**
   ```typescript
   // ✅ Correct - Use callbacks to break circular dependency
   export function setupInventory(onItemChange: (item: Item) => void) { ... }
   ```

### Always Use Constants Instead of String Literals

When working with any enumerable values (types, categories, states, etc.), **ALWAYS** use defined constants instead of string or number literals. This applies to:
- Item types, equipment slots, character attributes
- UI states, status codes, error messages
- Configuration values, magic numbers
- Any value that appears more than once in the codebase

See the detailed examples in the sections below.

## Constant Usage Examples

### Item Types

Use the `ITEM_TYPE` constant from `gameStateSlice.ts`:

```typescript
// ✅ Correct - Use constants
import { ITEM_TYPE } from '../state/gameStateSlice';

if (item.type === ITEM_TYPE.WEAPON) { ... }
if (item.type === ITEM_TYPE.ARMOR) { ... }
if (item.type === ITEM_TYPE.CONSUMABLE) { ... }
if (item.type === ITEM_TYPE.MATERIAL) { ... }
if (item.type === ITEM_TYPE.ACCESSORY) { ... }

// ❌ Incorrect - Do not use string literals
if (item.type === 'weapon') { ... }
if (item.type === 'armor') { ... }
```

### Equipment Slots

Use the `EQUIPMENT_SLOT` constant:

```typescript
// ✅ Correct
import { EQUIPMENT_SLOT } from '../state/gameStateSlice';

if (item.equipSlot === EQUIPMENT_SLOT.HELMET) { ... }
if (item.equipSlot === EQUIPMENT_SLOT.UPPER_BODY) { ... }
if (item.equipSlot === EQUIPMENT_SLOT.LOWER_BODY) { ... }
if (item.equipSlot === EQUIPMENT_SLOT.GLOVES) { ... }
if (item.equipSlot === EQUIPMENT_SLOT.SHOES) { ... }
if (item.equipSlot === EQUIPMENT_SLOT.CAPE) { ... }

// ❌ Incorrect
if (item.equipSlot === 'helmet') { ... }
if (item.equipSlot === 'upperBody') { ... }
```

### Character Classes

Use the `CHARACTER_CLASSES` constant:

```typescript
// ✅ Correct
import { CHARACTER_CLASSES } from '../state/gameStateSlice';

if (character.class === CHARACTER_CLASSES.WARRIOR) { ... }
if (character.class === CHARACTER_CLASSES.RANGER) { ... }
if (character.class === CHARACTER_CLASSES.SPIRITUALIST) { ... }
if (character.class === CHARACTER_CLASSES.SPECIALIST) { ... }

// ❌ Incorrect
if (character.class === 'Warrior') { ... }
if (character.class === 'Ranger') { ... }
```

### Character Races

Use the `CHARACTER_RACES` constant:

```typescript
// ✅ Correct
import { CHARACTER_RACES } from '../state/gameStateSlice';

if (character.race === CHARACTER_RACES.BELLATO) { ... }
if (character.race === CHARACTER_RACES.CORA) { ... }
if (character.race === CHARACTER_RACES.ACCRETIA) { ... }

// ❌ Incorrect
if (character.race === 'Bellato') { ... }
```

### Character Sex

Use the `CHARACTER_SEX` constant:

```typescript
// ✅ Correct
import { CHARACTER_SEX } from '../state/gameStateSlice';

if (character.sex === CHARACTER_SEX.MALE) { ... }
if (character.sex === CHARACTER_SEX.FEMALE) { ... }

// ❌ Incorrect
if (character.sex === 'Male') { ... }
```

### Character Grades

Use the `CHARACTER_GRADES` constant:

```typescript
// ✅ Correct
import { CHARACTER_GRADES } from '../state/gameStateSlice';

if (character.grade === CHARACTER_GRADES.S) { ... }
if (character.grade === CHARACTER_GRADES.A) { ... }

// ❌ Incorrect
if (character.grade === 'S') { ... }
```

### Quest Types

Use the `QUEST_TYPE` constant:

```typescript
// ✅ Correct
import { QUEST_TYPE } from '../state/gameStateSlice';

if (quest.type === QUEST_TYPE.SLAY) { ... }
if (quest.type === QUEST_TYPE.COLLECT) { ... }

// ❌ Incorrect
if (quest.type === 'slay') { ... }
if (quest.type === 'collect') { ... }
```

## Available Constants Reference

All constants are defined in `project-bellato-idle/src/state/gameStateSlice.ts`:

| Constant | Values | Description |
|----------|--------|-------------|
| `ITEM_TYPE` | `WEAPON`, `ARMOR`, `CONSUMABLE`, `MATERIAL`, `ACCESSORY` | Item categories |
| `EQUIPMENT_SLOT` | `HELMET`, `UPPER_BODY`, `LOWER_BODY`, `GLOVES`, `SHOES`, `CAPE` | Equipment slots |
| `CHARACTER_CLASSES` | `WARRIOR`, `RANGER`, `SPIRITUALIST`, `SPECIALIST` | Player classes |
| `CHARACTER_RACES` | `BELLATO`, `CORA`, `ACCRETIA` | Player races |
| `CHARACTER_SEX` | `MALE`, `FEMALE` | Character sex |
| `CHARACTER_GRADES` | `F`, `E`, `D`, `C`, `B`, `A`, `S` | Character grades |
| `QUEST_TYPE` | `SLAY`, `COLLECT` | Quest categories |

## Numeric Constants

Also use numeric constants instead of magic numbers:

```typescript
// ✅ Correct
import { 
  INVENTORY_ROWS, 
  INVENTORY_COLS,
  CHARACTER_NAME_MIN_LENGTH,
  CHARACTER_NAME_MAX_LENGTH,
  STARTING_GOLD,
  MAX_CHARACTER_LEVEL,
  DEATH_EXP_PENALTY
} from '../state/gameStateSlice';

// ❌ Incorrect
const maxSlots = 5 * 8; // Use INVENTORY_ROWS * INVENTORY_COLS
const maxLevel = 55;    // Use MAX_CHARACTER_LEVEL
```

## Type Safety

Use the corresponding TypeScript types for type annotations:

```typescript
import type { 
  ItemType, 
  EquipmentSlotType, 
  CharacterClass, 
  CharacterRace,
  CharacterSex,
  CharacterGrade,
  QuestType 
} from '../state/gameStateSlice';

function processItem(type: ItemType): void { ... }
function equipToSlot(slot: EquipmentSlotType): void { ... }
```

## Benefits of Using Constants

1. **Type Safety**: TypeScript will catch typos and invalid values at compile time
2. **Refactoring**: Changing a value only requires updating one location
3. **Autocomplete**: IDE provides better autocomplete suggestions
4. **Consistency**: Ensures all code uses the same values
5. **Documentation**: Constants serve as self-documenting code

## Additional Best Practices

### Module Organization

1. **Follow a clear dependency hierarchy:**
   - `/state` - State management (lowest level, no UI dependencies)
   - `/data` - Static data and constants
   - `/utils` - Pure utility functions
   - `/hooks` - React hooks (can depend on state/utils)
   - `/components` - Reusable UI components
   - `/pages` - Page-level components (highest level)

2. **Keep modules focused:**
   - Each file should have a single, clear responsibility
   - Avoid "God modules" that do everything
   - Split large files into smaller, focused modules

### Import Statements

1. **Group imports logically:**
   ```typescript
   // ✅ Correct - Grouped and ordered imports
   // External dependencies
   import React from 'react';
   import { useSelector } from 'react-redux';
   
   // Internal types
   import type { Character, Item } from '../types';
   
   // Internal modules
   import { ITEM_TYPE } from '../state/gameStateSlice';
   import { calculateDamage } from '../utils/combat';
   
   // Styles
   import './Component.css';
   ```

2. **Prefer named imports over default imports for consistency:**
   ```typescript
   // ✅ Correct - Named exports are more refactor-friendly
   export const CHARACTER_CLASSES = { ... };
   export const ITEM_TYPE = { ... };
   
   // Import:
   import { CHARACTER_CLASSES, ITEM_TYPE } from './constants';
   ```

### TypeScript Best Practices

1. **Use strict type checking:**
   - Avoid `any` type - use `unknown` if type is truly unknown
   - Enable all strict TypeScript compiler options
   - Use type guards for narrowing types

2. **Prefer interfaces for object shapes, types for unions/intersections:**
   ```typescript
   // ✅ Correct
   interface Character {
     name: string;
     level: number;
   }
   
   type CharacterClass = 'Warrior' | 'Ranger' | 'Spiritualist' | 'Specialist';
   ```

3. **Use const assertions for readonly objects:**
   ```typescript
   // ✅ Correct - Values are immutable and types are literal
   export const ITEM_TYPE = {
     WEAPON: 'weapon',
     ARMOR: 'armor',
   } as const;
   ```

### React Best Practices

1. **Keep components pure and predictable:**
   - Avoid side effects in render
   - Use hooks appropriately (useEffect, useMemo, useCallback)
   - Keep component logic minimal - extract to hooks or utils

2. **Optimize re-renders:**
   - Use React.memo for expensive components
   - Use useCallback for functions passed as props
   - Use useMemo for expensive calculations

3. **Follow React hooks rules:**
   - Only call hooks at the top level
   - Only call hooks from React functions
   - Custom hooks should start with "use"

### Performance Considerations

1. **Avoid premature optimization:**
   - Write clear, readable code first
   - Profile before optimizing
   - Focus on algorithmic improvements over micro-optimizations

2. **Be mindful of bundle size:**
   - Import only what you need from libraries
   - Use dynamic imports for code splitting when appropriate
   - Avoid importing entire libraries when only a function is needed

### Error Handling

1. **Handle errors gracefully:**
   ```typescript
   // ✅ Correct - Specific error handling
   try {
     const data = await fetchData();
     return processData(data);
   } catch (error) {
     if (error instanceof NetworkError) {
       // Handle network error
     } else {
       // Handle other errors
     }
     throw error; // Re-throw if can't handle
   }
   ```

2. **Validate inputs and outputs:**
   - Check function parameters
   - Validate user input
   - Handle edge cases explicitly

### Documentation

1. **Write self-documenting code:**
   - Use descriptive variable and function names
   - Keep functions small and focused
   - Use constants instead of magic values

2. **Add comments for complex logic:**
   - Explain "why" not "what"
   - Document non-obvious behavior
   - Update comments when code changes

3. **Use JSDoc for public APIs:**
   ```typescript
   /**
    * Calculates damage dealt to a target based on attacker stats.
    * @param attacker - The character performing the attack
    * @param target - The character being attacked
    * @param skillModifier - Optional skill damage modifier (default: 1.0)
    * @returns The final damage amount after all calculations
    */
   export function calculateDamage(
     attacker: Character,
     target: Character,
     skillModifier: number = 1.0
   ): number {
     // Implementation
   }
   ```

### Testing

1. **Write testable code:**
   - Keep functions pure when possible
   - Avoid tight coupling
   - Use dependency injection

2. **Follow existing test patterns:**
   - Match the testing style in the repository
   - Test behavior, not implementation
   - Keep tests focused and independent
