# Shields Data

This directory contains scraped shield data from Rising Force Online sources.

## Data Structure

Shield data is stored in JSON format with the following structure:

```json
{
  "id": "shield_1",
  "shieldId": "1",
  "name": "Round Shield",
  "description": "Normal Shield",
  "requiredLevel": 4,
  "requiredSkill": "Shield Skill 1",
  "avgDefPower": 13,
  "avgDefRate": 5,
  "defenseSuccessRate": 35,
  "race": "Bellato & Cora",
  "specialEffect": "100 Decrease in damage avoidance.",
  "imageUrl": "images/armor_shield/bell_cora/Shield_RoundShield.gif",
  "localImagePath": "../images/shields/shield_1.gif"
}
```

## Generated Files

- `shields.json` - Complete shield database scraped from configured sources
