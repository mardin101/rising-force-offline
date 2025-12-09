# 🔰 Project Bellato Idle: RF Online Nostalgia

An unofficial, single-player mobile idle RPG inspired by the classic mechanics and atmosphere of *Rising Force Online (RFO)*, focusing initially on the **Bellato Federation** race.

## 🤖 Agentic AI Vision

This project embraces **agentic AI development** to enhance gameplay, automate testing, and enable intelligent game systems. Our vision includes:

- **Intelligent NPCs**: AI agents that make autonomous decisions for realistic NPC behaviors
- **Automated Testing**: Agents that continuously test and validate game mechanics
- **Dynamic Game Balance**: AI-driven economy and difficulty balancing
- **Procedural Content**: Agents that assist in generating quests, items, and encounters

We follow [GitHub's best practices](https://docs.github.com/en/actions) and [OpenAI's agentic AI patterns](https://openai.com/index/practices-for-governing-agentic-ai-systems/) to ensure safe, transparent, and effective AI integration.

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
* **Framework:** React 19 with TypeScript
* **Build Tool:** Vite
* **Styling:** TailwindCSS
* **Data/Database:** JSON files (items, monsters, zones)
* **Build Targets:** Web (Mobile-first design)

### Project Structure

```
rising-force-offline/
├── README.md                 # This file
├── CONTRIBUTING.md           # Contribution guidelines
├── project-bellato-idle/     # Main game application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Game screens
│   │   ├── data/             # Game data (items, monsters, zones)
│   │   ├── state/            # State management
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Utility functions
│   └── package.json
├── agents/                   # Agentic AI implementations
├── tasks/                    # Task definitions for agents
├── environments/             # Environment configurations
└── .github/
    ├── workflows/            # CI/CD workflows
    └── ISSUE_TEMPLATE/       # Issue templates
```

### Installation & Setup

#### Option 1: Local Development

```bash
# 1. Clone the repository
git clone https://github.com/mardin101/rising-force-offline.git
cd rising-force-offline/project-bellato-idle

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Build for production
npm run build

# 5. Run linting
npm run lint
```

#### Option 2: Docker Deployment

For production deployment with HTTPS using Docker and Traefik:

```bash
# 1. Clone the repository
git clone https://github.com/mardin101/rising-force-offline.git
cd rising-force-offline

# 2. Configure environment
cp .env.example .env
# Edit .env with your domain and email

# 3. Start with Docker Compose
docker compose up -d

# Access your app at https://yourdomain.com
```

See [Docker Setup Guide](./DOCKER.md) for detailed instructions.

---

## 📚 Documentation

- [Docker Setup Guide](./DOCKER.md) - Deploy with Docker and Traefik
- [Contributing Guidelines](./CONTRIBUTING.md) - How to contribute to the project
- [Agents Documentation](./agents/README.md) - Agentic AI implementations
- [Tasks Documentation](./tasks/README.md) - Task definitions for agents
- [Environments Documentation](./environments/README.md) - Environment configurations

## 🔗 References

### Agentic AI Best Practices
- [OpenAI Practices for Governing Agentic AI Systems](https://openai.com/index/practices-for-governing-agentic-ai-systems/)
- [GitHub Copilot Coding Agent](https://docs.github.com/en/copilot/using-github-copilot/using-the-github-copilot-coding-agent-in-your-ide)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/using-workflows/best-practices-for-workflow-configuration)

### Game Development
- [Rising Force Online Wiki](https://rf-online.fandom.com/wiki/RF_Online_Wiki)

---

## 📄 License

This project is for educational and nostalgic purposes. All trademarks are property of their respective owners.
