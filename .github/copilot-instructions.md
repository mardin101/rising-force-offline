# Copilot Instructions for Rising Force Offline

This document provides coding guidelines for GitHub Copilot when working with the Rising Force Offline project.

## Always Use Constants Instead of String Literals

When working with categories, item types, equipment slots, character classes, and other enumerable values, **always use the defined constants** instead of string literals.

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
