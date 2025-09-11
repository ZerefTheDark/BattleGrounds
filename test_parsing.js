// Test file to verify JSON parsing logic
console.log('Testing D&D JSON parsing...');

// Mock a typical D&D JSON structure
const mockDndJson = {
  "spell": [
    {
      "name": "Fireball",
      "level": 3,
      "school": "Evocation",
      "time": "1 action",
      "range": "150 feet",
      "components": "V, S, M",
      "duration": "Instantaneous",
      "text": "A bright streak flashes from your pointing finger to a point you choose within range..."
    }
  ],
  "monster": [
    {
      "name": "Goblin",
      "size": "Small",
      "type": "humanoid",
      "alignment": "neutral evil",
      "ac": "15 (Leather Armor, Shield)",
      "hp": "7 (2d6)",
      "str": 8,
      "dex": 14,
      "con": 10,
      "int": 10,
      "wis": 8,
      "cha": 8
    }
  ],
  "item": [
    {
      "name": "Longsword",
      "type": "M",
      "rarity": "common",
      "text": "A versatile weapon..."
    }
  ]
};

// Test parsing logic
function testParsing(data) {
  let content = data;
  
  // Check for common D&D JSON structures
  if (data.compendium) {
    content = data.compendium;
  } else if (data.root) {
    content = data.root;
  } else if (data._meta || data.spell || data.monster || data.item || data.race) {
    // This looks like a direct D&D JSON file
    content = data;
  }
  
  console.log('Content structure keys:', Object.keys(content));
  
  const parsed = {
    spells: [],
    cantrips: [],
    characters: [],
    items: []
  };
  
  // Parse spells
  if (content.spell) {
    const spells = Array.isArray(content.spell) ? content.spell : [content.spell];
    spells.forEach(spell => {
      const spellData = {
        name: spell.name,
        level: parseInt(spell.level) || 0,
        school: spell.school,
        description: spell.text
      };
      
      if (spellData.level === 0) {
        parsed.cantrips.push(spellData);
      } else {
        parsed.spells.push(spellData);
      }
    });
  }
  
  // Parse monsters
  if (content.monster) {
    const monsters = Array.isArray(content.monster) ? content.monster : [content.monster];
    parsed.characters = monsters.map(monster => ({
      name: monster.name,
      type: monster.type,
      size: monster.size
    }));
  }
  
  // Parse items
  if (content.item) {
    const items = Array.isArray(content.item) ? content.item : [content.item];
    parsed.items = items.map(item => ({
      name: item.name,
      type: item.type,
      rarity: item.rarity
    }));
  }
  
  return parsed;
}

const result = testParsing(mockDndJson);
console.log('Parsing result:', result);
console.log('Total parsed items:', 
  result.spells.length + result.cantrips.length + result.characters.length + result.items.length
);