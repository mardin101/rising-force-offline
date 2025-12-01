# 🔰 Project Bellato Idle: RF Online Nostalgia

An unofficial, single-player mobile idle RPG inspired by the classic mechanics and atmosphere of *Rising Force Online (RFO)*, focusing initially on the **Bellato Federation** race.

## 🚀 Project Overview

The core gameplay centers around **passive progression** and **strategic pre-battle preparation**. The player controls a single Bellato character in a persistent world, setting them to automatically battle monsters in dangerous regions. The primary player input is managing inventory, upgrading gear, choosing the next hunting ground, and advancing their character's class and skills.

### Key Features
* **Single-Player Focused:** No multiplayer or live PvP, allowing for a relaxed, self-paced experience.
* **Idle Auto-Battle:** Select a zone and let your character grind for experience, money, and rare loot until they die or the player intervenes.
* **Deep RPG Progression:** Detailed character sheet including Level, Class, **PT (Proficiency)**, Inventory, and a Class-specific Spell Tree.
* **Loot & Crafting Loop:** Drops from monsters are used for selling or as materials for crafting superior gear.
* **Dynamic Map Unlocks:** New, higher-level zones become available as the player levels up, offering increasing risk and reward.

---

## 🎮 Gameplay Mechanics

This section details the primary systems in the game.

### 1. The Core Combat Loop
1.  **Select Region & Monster:** The player navigates a world map (starting with basic Bellato territory like the **Solus System**). They choose the zone (e.g., *Outskirts of Sette*) and optionally select a specific monster type to prioritize.
2.  **Auto-Battle Begins:** The game enters an **Idle State**. The character automatically engages the selected monsters.
    * Combat is resolved based on character **Attack/Defense** stats, **PT** levels, and the casting of skills/spells from the **Spell Tree**.
    * The game displays a log or basic visual feedback: `[Player] hits [Monster] for X damage!`, `[Monster] drops Y Gold and Z Item.`.
3.  **Loot and EXP:** Monsters grant **Experience** (for character level), **PT** (for skill proficiency), and drop **Currency/Items/Crafting Materials**.
4.  **Death State:** Combat continues indefinitely until the player's HP reaches 0. The player is automatically returned to the **Town** with all earned loot and a small experience/currency penalty (to encourage strategic zone selection).
5.  **Offline Gains:** The game should calculate a period of simulated progress (e.g., up to 8 hours) while the player is offline, rewarding them upon log-in.

### 2. Character Progression & Class System

The foundation of the Bellato character's power is based on the original *RFO* system:

| Base Class | Level 30 Advancement (Examples) | Focus |
| :--- | :--- | :--- |
| **Warrior** | Myrmidon, Sentry | Melee DPS, Tanking |
| **Ranger** | Desperado, Sniper | Ranged Physical DPS |
| **Spiritualist** | Psyper, Chandra | Magic DPS, Force/Buffs |
| **Specialist** | Driver, Craftsman | Utility, Crafting, MAU (Future) |

* **Level (LVL):** Increases base stats (HP, SP, etc.) and unlocks new content (Zones, Quests, Class Advancements).
* **Proficiency (PT):** Skills like **Melee PT**, **Ranged PT**, **Force PT** (Magic) level up passively through use. Higher PT unlocks better skills in the **Spell Tree** and allows the use of higher-grade gear.

### 3. Town Functions (The Upgrade Cycle)

The town is the player's hub for active input:

* **Merchant:** Sells basic consumables (Potions, Scrolls) and starter gear.
* **Quest Master:** Provides the main progression path. Quests often involve killing a specific number of monsters or collecting a certain item, rewarding large EXP/Gold/Rare Materials.
* **Inventory/Equipment:** Where the player manages their loot. The most crucial decision point in the loop.
* **Crafting:** **Blacksmith** NPC (or Specialist character) uses monster materials and **Ore** (e.g., Talic Ore) to create powerful **Intense** or **Rare** gear.

---

## 🛠️ Technical Details

This section is for contributors and developers looking to set up and modify the project.

### Tech Stack
* **Game Engine:** [Specify the Engine, e.g., Unity, Godot, Flutter, etc.]
* **Programming Language:** [Specify the Language, e.g., C#, C++, Dart, Kotlin, etc.]
* **Data/Database:** [How is item/monster data stored? e.g., JSON files, SQLite]
* **Build Targets:** Mobile (iOS/Android)

### Installation & Setup

```bash
# 1. Clone the repository
git clone [YOUR_REPO_URL]
cd project-bellato-idle

# 2. [Engine Specific Step, e.g., Open in Editor]
# Open the project folder in [Your Engine]
# (Requires [Your Engine] version X.Y.Z or higher)

# 3. [Build Command, if applicable]
# For testing:
# [Run Test Script Command]
