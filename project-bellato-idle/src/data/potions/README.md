# Potions Data

This directory contains scraped potion data from RFO Classic database.

## File Structure

- `potions.json` - Main data file containing all potion information

## Data Format

Each potion entry contains:
- `id` - Unique identifier
- `potionId` - Potion ID from the database
- `name` - Potion name
- `description` - Potion description/effect
- `soldAtNPC` - Whether the potion is sold at NPC (Y/N)
- `healingAmount` - Healing amount or effect description
- `class` - Potion class/type
- `imageUrl` - Original image URL
- `localImagePath` - Path to downloaded image

## Usage

To scrape potion data, run:
```bash
npm start
```

Configure the potion URLs in `src/config.js` under `baseUrls.potions`.
