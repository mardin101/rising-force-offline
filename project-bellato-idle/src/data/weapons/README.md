# Weapons Data

This directory contains scraped weapon data from Rising Force Online sources.

## Data Structure

Weapon data is stored in JSON format with the following structure:

```json
{
  "id": "weapon_1",
  "weaponId": "1",
  "name": "Dagger",
  "description": "A basic knife weapon",
  "type": "knife",
  "requiredLevel": 1,
  "race": "All",
  "requiredSkill": "Close Range Skill 1",
  "durability": 0,
  "attack": {
    "physical": "13 - 15",
    "force": "-"
  },
  "imageUrl": "images/weapon_knife/Knife_Dagger.gif",
  "localImagePath": "../images/weapons/weapon_1.gif"
}
```

## Generated Files

- `weapons.json` - Complete weapon database scraped from configured sources
