import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useBattleMapStore } from '../store/battleMapStore';
import { 
  X, 
  Upload, 
  Save, 
  Heart, 
  Shield, 
  Zap, 
  Dice6,
  Star,
  Plus,
  Minus,
  Edit,
  Eye,
  Sword,
  Wand2,
  BookOpen,
  Package,
  FileText,
  User,
  Download,
  RotateCcw,
  Check,
  Circle,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const CharacterSheetBeyond = ({ token, onClose }) => {
  const { updateToken, addChatMessage, partyMembers, updatePartyMember } = useBattleMapStore();
  
  const [characterData, setCharacterData] = useState({
    // Header Info
    name: token?.name || '',
    level: token?.level || 1,
    classes: token?.characterClass ? [{ name: token.characterClass, level: token.level || 1 }] : [{ name: 'Fighter', level: 1 }],
    race: token?.race || 'Human',
    subrace: '',
    background: 'Folk Hero',
    alignment: 'Lawful Good',
    experience: 0,
    inspiration: false,

    // Core Stats
    abilities: token?.abilities || { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 },
    proficiencyBonus: Math.ceil((token?.level || 1) / 4) + 1, // D&D 5e proficiency bonus calculation
    
    // HP & Combat
    hp: token?.hp || { current: 10, max: 10, temp: 0 },
    hitDice: { total: token?.level || 1, used: 0, type: 'd10' },
    ac: token?.ac || 16,
    initiative: token?.initiativeBonus || 0,
    speed: 30,
    
    // Death Saves
    deathSaves: { successes: 0, failures: 0 },
    
    // Conditions
    conditions: token?.conditions || [],
    
    // Skills & Saves
    savingThrows: {
      STR: { proficient: true, bonus: 0 },
      DEX: { proficient: false, bonus: 0 },
      CON: { proficient: false, bonus: 0 },
      INT: { proficient: false, bonus: 0 },
      WIS: { proficient: false, bonus: 0 },
      CHA: { proficient: false, bonus: 0 }
    },
    
    // Skills & Saves
    savingThrows: {
      STR: { proficient: true, bonus: 0 },
      DEX: { proficient: false, bonus: 0 },
      CON: { proficient: false, bonus: 0 },
      INT: { proficient: false, bonus: 0 },
      WIS: { proficient: false, bonus: 0 },
      CHA: { proficient: false, bonus: 0 }
    },
    
    skills: {
      'Acrobatics': { proficient: false, expertise: false, ability: 'DEX' },
      'Animal Handling': { proficient: false, expertise: false, ability: 'WIS' },
      'Arcana': { proficient: false, expertise: false, ability: 'INT' },
      'Athletics': { proficient: true, expertise: false, ability: 'STR' },
      'Deception': { proficient: false, expertise: false, ability: 'CHA' },
      'History': { proficient: false, expertise: false, ability: 'INT' },
      'Insight': { proficient: false, expertise: false, ability: 'WIS' },
      'Intimidation': { proficient: true, expertise: false, ability: 'CHA' },
      'Investigation': { proficient: false, expertise: false, ability: 'INT' },
      'Medicine': { proficient: false, expertise: false, ability: 'WIS' },
      'Nature': { proficient: false, expertise: false, ability: 'INT' },
      'Perception': { proficient: false, expertise: false, ability: 'WIS' },
      'Performance': { proficient: false, expertise: false, ability: 'CHA' },
      'Persuasion': { proficient: false, expertise: false, ability: 'CHA' },
      'Religion': { proficient: false, expertise: false, ability: 'INT' },
      'Sleight of Hand': { proficient: false, expertise: false, ability: 'DEX' },
      'Stealth': { proficient: false, expertise: false, ability: 'DEX' },
      'Survival': { proficient: false, expertise: false, ability: 'WIS' }
    },

    // Combat & Actions
    attacks: [
      {
        id: 1,
        name: 'Longsword',
        type: 'Melee Weapon Attack',
        bonus: 5,
        damage: '1d8+3',
        damageType: 'slashing',
        range: '5 ft',
        properties: 'Versatile (1d10)'
      }
    ],

    // Spells - Enhanced for proper D&D 5e spellcasting
    spellcasting: {
      ability: 'INT',
      spellSaveDC: 8,
      spellAttackBonus: 0,
      casterLevel: 0,
      slots: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
      slotsUsed: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }
    },

    cantrips: [
      { name: 'Fire Bolt', school: 'Evocation', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous' },
      { name: 'Mage Hand', school: 'Conjuration', castingTime: '1 action', range: '30 feet', components: 'V, S', duration: '1 minute' }
    ],
    
    spells: {
      1: [
        { name: 'Shield', school: 'Abjuration', castingTime: '1 reaction', range: 'Self', components: 'V, S', duration: '1 round', prepared: true },
        { name: 'Magic Missile', school: 'Evocation', castingTime: '1 action', range: '120 feet', components: 'V, S', duration: 'Instantaneous', prepared: true }
      ],
      2: [],
      3: []
    },

    // Equipment - Enhanced inventory system
    equipment: [
      { name: 'Studded Leather Armor', type: 'armor', equipped: true, ac: 12, properties: 'Light armor' },
      { name: 'Shield', type: 'armor', equipped: true, ac: 2, properties: 'Shield' },
      { name: 'Longsword', type: 'weapon', equipped: true, damage: '1d8', damageType: 'slashing', properties: 'Versatile (1d10)' }
    ],
    
    inventory: [
      { name: 'Healing Potion', quantity: 2, weight: 0.5, description: 'Restores 2d4+2 hit points' },
      { name: 'Rope (50 feet)', quantity: 1, weight: 10, description: 'Hemp rope' },
      { name: 'Thieves\' Tools', quantity: 1, weight: 1, description: 'Proficiency with these tools lets you add your proficiency bonus to any ability checks you make to disarm traps or open locks.' }
    ],
    
    currency: { cp: 0, sp: 0, ep: 0, gp: 150, pp: 0 },

    // Features & Traits - More comprehensive
    classFeatures: [
      { name: 'Fighting Style', description: 'You adopt a particular style of fighting as your specialty. Choose Archery, Defense, Dueling, Great Weapon Fighting, Protection, or Two-Weapon Fighting.' },
      { name: 'Second Wind', description: 'You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level.' }
    ],
    
    racialTraits: [
      { name: 'Extra Language', description: 'You can speak, read, and write one extra language of your choice.' },
      { name: 'Extra Skill', description: 'You gain proficiency in one skill of your choice.' }
    ],
    
    feats: [],
    
    // Description
    appearance: {
      age: 25,
      height: "6'0\"",
      weight: '180 lbs',
      eyes: 'Brown',
      skin: 'Tan',
      hair: 'Black'
    },
    personality: {
      traits: [],
      ideals: [],
      bonds: [],
      flaws: []
    },
    backstory: '',

    // Notes
    notes: ''
  });

  const [activeTab, setActiveTab] = useState('actions');

  // Data synchronization effect
  useEffect(() => {
    if (token) {
      // Sync character data with token changes
      setCharacterData(prev => ({
        ...prev,
        name: token.name || prev.name,
        hp: token.hp || prev.hp,
        ac: token.ac || prev.ac,
        abilities: token.abilities || prev.abilities,
        level: token.level || prev.level,
        conditions: token.conditions || prev.conditions
      }));
    }
  }, [token]);

  // Update token and party member when character data changes
  const syncCharacterData = (newData) => {
    setCharacterData(newData);
    
    // Update token
    if (token) {
      updateToken(token.id, {
        name: newData.name,
        hp: newData.hp,
        ac: newData.ac,
        abilities: newData.abilities,
        level: newData.level,
        conditions: newData.conditions,
        characterClass: newData.classes[0]?.name,
        initiativeBonus: getModifier(newData.abilities.DEX) + (newData.savingThrows.DEX.proficient ? newData.proficiencyBonus : 0)
      });
    }
    
    // Update party member if exists
    if (token?.partyMemberId) {
      const partyMember = partyMembers.find(p => p.id === token.partyMemberId);
      if (partyMember) {
        updatePartyMember(partyMember.id, {
          name: newData.name,
          level: newData.level,
          characterClass: newData.classes[0]?.name,
          hp: newData.hp,
          ac: newData.ac,
          initiativeBonus: getModifier(newData.abilities.DEX) + (newData.savingThrows.DEX.proficient ? newData.proficiencyBonus : 0)
        });
      }
    }
  };

  // Enhanced D&D 5e calculation functions
  const getModifier = (score) => Math.floor((score - 10) / 2);
  const getModifierString = (score) => {
    const mod = getModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const getProficiencyBonus = () => Math.ceil(characterData.level / 4) + 1;

  const getSkillBonus = (skillName) => {
    const skill = characterData.skills[skillName];
    const abilityMod = getModifier(characterData.abilities[skill.ability]);
    let bonus = abilityMod;
    
    if (skill.proficient) {
      bonus += getProficiencyBonus();
    }
    if (skill.expertise) {
      bonus += getProficiencyBonus(); // Expertise adds proficiency bonus twice
    }
    
    return bonus;
  };

  const getSaveBonus = (ability) => {
    const save = characterData.savingThrows[ability];
    const abilityMod = getModifier(characterData.abilities[ability]);
    let bonus = abilityMod + save.bonus;
    
    if (save.proficient) {
      bonus += getProficiencyBonus();
    }
    
    return bonus;
  };

  const getSpellSaveDC = () => {
    const spellcastingMod = getModifier(characterData.abilities[characterData.spellcasting.ability]);
    return 8 + getProficiencyBonus() + spellcastingMod;
  };

  const getSpellAttackBonus = () => {
    const spellcastingMod = getModifier(characterData.abilities[characterData.spellcasting.ability]);
    return getProficiencyBonus() + spellcastingMod;
  };

  // Enhanced dice rolling with chat integration
  const rollDice = (sides, modifier = 0, label = '', advantage = false, disadvantage = false) => {
    let rolls = [Math.floor(Math.random() * sides) + 1];
    
    if (advantage || disadvantage) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
      const selectedRoll = advantage ? Math.max(...rolls) : Math.min(...rolls);
      const total = selectedRoll + modifier;
      
      addChatMessage({
        type: 'roll',
        who: characterData.name,
        formula: `1d${sides}${modifier >= 0 ? '+' : ''}${modifier}`,
        results: rolls,
        total: total,
        note: `${label} (${advantage ? 'Advantage' : 'Disadvantage'})`
      });
      
      return total;
    } else {
      const roll = rolls[0];
      const total = roll + modifier;
      
      addChatMessage({
        type: 'roll',
        who: characterData.name,
        formula: `1d${sides}${modifier >= 0 ? '+' : ''}${modifier}`,
        results: [roll],
        total: total,
        note: label
      });
      
      return total;
    }
  };

  const rollSkill = (skillName) => {
    const bonus = getSkillBonus(skillName);
    rollDice(20, bonus, `${skillName} Check`);
  };

  const rollSave = (ability) => {
    const bonus = getSaveBonus(ability);
    rollDice(20, bonus, `${ability} Save`);
  };

  const rollAbilityCheck = (ability) => {
    const modifier = getModifier(characterData.abilities[ability]);
    rollDice(20, modifier, `${ability} Check`);
  };

  // Utility functions
  const shortRest = () => {
    const newData = {
      ...characterData,
      hitDice: { ...characterData.hitDice, used: Math.max(0, characterData.hitDice.used - 1) }
    };
    syncCharacterData(newData);
    
    addChatMessage({
      type: 'system',
      text: `${characterData.name} takes a short rest and recovers some abilities.`
    });
  };

  const longRest = () => {
    const newData = {
      ...characterData,
      hp: { ...characterData.hp, current: characterData.hp.max },
      hitDice: { ...characterData.hitDice, used: 0 },
      spellcasting: {
        ...characterData.spellcasting,
        slotsUsed: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }
      },
      deathSaves: { successes: 0, failures: 0 },
      conditions: []
    };
    syncCharacterData(newData);
    
    addChatMessage({
      type: 'system',
      text: `${characterData.name} takes a long rest and recovers all hit points and spell slots.`
    });
  };

  // Import/Export functionality
  const exportCharacter = () => {
    const exportData = {
      ...characterData,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${characterData.name.replace(/\s+/g, '_')}_character.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const importCharacter = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        syncCharacterData(importedData);
        
        addChatMessage({
          type: 'system',
          text: `Character data imported for ${importedData.name}.`
        });
      } catch (error) {
        console.error('Failed to import character:', error);
        alert('Failed to import character data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-red-950 to-gray-900 border-2 border-red-600 shadow-2xl text-white">
      {/* TOP BANNER - Character Header */}
      <CardHeader className="bg-gradient-to-r from-red-900 to-red-800 border-b-2 border-red-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Character Portrait */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-800 border-3 border-yellow-500 flex items-center justify-center overflow-hidden shadow-lg">
                <User className="w-12 h-12 text-yellow-400" />
              </div>
              <Button size="sm" className="absolute -bottom-1 -right-1 w-6 h-6 p-0 rounded-full bg-yellow-600 hover:bg-yellow-700">
                <Upload className="w-3 h-3" />
              </Button>
            </div>

            {/* Character Identity */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Input
                  value={characterData.name}
                  onChange={(e) => setCharacterData({ ...characterData, name: e.target.value })}
                  className="text-2xl font-bold bg-transparent border-0 text-yellow-400 p-0 h-auto"
                  placeholder="Character Name"
                />
                <Badge className="bg-yellow-600 text-black font-bold">
                  Level {characterData.level}
                </Badge>
              </div>
              <div className="text-sm text-gray-300">
                {characterData.classes.map(cls => `${cls.name} ${cls.level}`).join(' / ')} • {characterData.race} • {characterData.background}
              </div>
              <div className="text-xs text-gray-400">
                {characterData.alignment} • {characterData.experience} XP
              </div>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2">
            {/* Import/Export */}
            <input
              type="file"
              accept=".json"
              onChange={importCharacter}
              className="hidden"
              id="import-character"
            />
            <Button
              size="sm"
              onClick={() => document.getElementById('import-character').click()}
              className="bg-purple-700 hover:bg-purple-600"
              title="Import Character"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={exportCharacter}
              className="bg-indigo-700 hover:bg-indigo-600"
              title="Export Character"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 bg-red-600" />
            
            <Button 
              size="sm" 
              onClick={shortRest}
              className="bg-green-700 hover:bg-green-600"
              title="Short Rest"
            >
              <Heart className="w-4 h-4 mr-1" />
              Short Rest
            </Button>
            <Button 
              size="sm" 
              onClick={longRest}
              className="bg-blue-700 hover:bg-blue-600"
              title="Long Rest"
            >
              <Save className="w-4 h-4 mr-1" />
              Long Rest
            </Button>
            <Button
              size="sm"
              onClick={() => syncCharacterData({ ...characterData, inspiration: !characterData.inspiration })}
              className={characterData.inspiration ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'}
              title="Toggle Inspiration"
            >
              <Star className={`w-4 h-4 ${characterData.inspiration ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-red-400 hover:text-red-300">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR - Core Stats */}
        <div className="w-80 bg-gradient-to-b from-gray-900 to-gray-800 border-r-2 border-red-600 p-4 overflow-y-auto">
          {/* Ability Scores */}
          <div className="space-y-3 mb-6">
            <h3 className="text-lg font-bold text-yellow-400 border-b border-yellow-600 pb-1">ABILITY SCORES</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(characterData.abilities).map(([ability, score]) => (
                <div key={ability} className="text-center">
                  <div className="bg-red-800 rounded-lg p-3 border border-red-600">
                    <div className="text-xs font-bold text-yellow-400">{ability}</div>
                    <div className="text-2xl font-bold text-white">{score}</div>
                    <div className="text-lg text-gray-300">{getModifierString(score)}</div>
                    <Button
                      size="sm"
                      onClick={() => rollAbilityCheck(ability)}
                      className="w-full mt-1 h-6 text-xs bg-gray-700 hover:bg-gray-600"
                    >
                      <Dice6 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saving Throws */}
          <div className="space-y-2 mb-6">
            <h3 className="text-sm font-bold text-yellow-400">SAVING THROWS</h3>
            {Object.entries(characterData.savingThrows).map(([ability, save]) => (
              <div key={ability} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full border ${save.proficient ? 'bg-yellow-500 border-yellow-500' : 'border-gray-500'}`} />
                  <span className="text-sm">{ability}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{getSaveBonus(ability) >= 0 ? '+' : ''}{getSaveBonus(ability)}</span>
                  <Button
                    size="sm"
                    onClick={() => rollSave(ability)}
                    className="w-6 h-6 p-0 bg-gray-700 hover:bg-gray-600"
                  >
                    <Dice6 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="space-y-2 mb-6">
            <h3 className="text-sm font-bold text-yellow-400">SKILLS</h3>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {Object.entries(characterData.skills).map(([skillName, skill]) => (
                <div key={skillName} className="flex items-center justify-between p-1 hover:bg-gray-800 rounded text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${skill.proficient ? 'bg-yellow-500' : skill.expertise ? 'bg-yellow-300' : 'bg-gray-500'}`} />
                    <span>{skillName}</span>
                    <span className="text-xs text-gray-400">({skill.ability})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{getSkillBonus(skillName) >= 0 ? '+' : ''}{getSkillBonus(skillName)}</span>
                    <Button
                      size="sm"
                      onClick={() => rollSkill(skillName)}
                      className="w-5 h-5 p-0 bg-gray-700 hover:bg-gray-600"
                    >
                      <Dice6 className="w-2 h-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Combat Stats */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-yellow-400">COMBAT</h3>
            
            {/* AC, Initiative, Speed */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-red-800 rounded border border-red-600">
                <div className="text-xs text-gray-300">ARMOR CLASS</div>
                <div className="text-xl font-bold">{characterData.ac}</div>
              </div>
              <div className="text-center p-2 bg-red-800 rounded border border-red-600">
                <div className="text-xs text-gray-300">INITIATIVE</div>
                <div className="text-xl font-bold">{getModifierString(characterData.abilities.DEX)}</div>
              </div>
              <div className="text-center p-2 bg-red-800 rounded border border-red-600">
                <div className="text-xs text-gray-300">SPEED</div>
                <div className="text-xl font-bold">{characterData.speed}</div>
              </div>
            </div>

            {/* Hit Points */}
            <div className="p-3 bg-red-800 rounded border border-red-600">
              <div className="text-xs text-gray-300 mb-1">HIT POINTS</div>
              <div className="flex items-center gap-2 mb-2">
                <Input
                  type="number"
                  value={characterData.hp.current}
                  onChange={(e) => setCharacterData({
                    ...characterData,
                    hp: { ...characterData.hp, current: parseInt(e.target.value) || 0 }
                  })}
                  className="w-16 text-center bg-gray-700 border-gray-600"
                />
                <span>/</span>
                <Input
                  type="number"
                  value={characterData.hp.max}
                  onChange={(e) => setCharacterData({
                    ...characterData,
                    hp: { ...characterData.hp, max: parseInt(e.target.value) || 0 }
                  })}
                  className="w-16 text-center bg-gray-700 border-gray-600"
                />
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all"
                  style={{ width: `${(characterData.hp.current / characterData.hp.max) * 100}%` }}
                />
              </div>
            </div>

            {/* Hit Dice */}
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-gray-300 mb-1">HIT DICE</div>
              <div className="text-sm">{characterData.hitDice.total - characterData.hitDice.used}/{characterData.hitDice.total} {characterData.hitDice.type}</div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA - Tabbed Interface */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="bg-red-900 border-b-2 border-red-600 rounded-none">
              <TabsTrigger value="actions" className="data-[state=active]:bg-red-700">
                <Sword className="w-4 h-4 mr-1" />
                Actions
              </TabsTrigger>
              <TabsTrigger value="spells" className="data-[state=active]:bg-red-700">
                <Wand2 className="w-4 h-4 mr-1" />
                Spells
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-red-700">
                <Package className="w-4 h-4 mr-1" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="features" className="data-[state=active]:bg-red-700">
                <BookOpen className="w-4 h-4 mr-1" />
                Features
              </TabsTrigger>
              <TabsTrigger value="description" className="data-[state=active]:bg-red-700">
                <User className="w-4 h-4 mr-1" />
                Description
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-red-700">
                <FileText className="w-4 h-4 mr-1" />
                Notes
              </TabsTrigger>
            </TabsList>

            {/* Actions Tab */}
            <TabsContent value="actions" className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-6">
                {/* Attacks */}
                <div>
                  <h3 className="text-lg font-bold text-yellow-400 mb-3">ATTACKS & SPELLCASTING</h3>
                  <div className="space-y-2">
                    {characterData.attacks.map(attack => (
                      <div key={attack.id} className="p-3 bg-gray-800 rounded border border-red-600">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white">{attack.name}</div>
                            <div className="text-sm text-gray-300">{attack.type} • Range: {attack.range}</div>
                            <div className="text-xs text-gray-400">{attack.properties}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => rollDice(20, attack.bonus, `${attack.name} Attack`)}
                              className="bg-red-700 hover:bg-red-600"
                            >
                              <Dice6 className="w-4 h-4 mr-1" />
                              {attack.bonus >= 0 ? '+' : ''}{attack.bonus}
                            </Button>
                            <Button
                              onClick={() => {
                                // Parse damage dice (e.g., "1d8+3")
                                const damage = attack.damage;
                                console.log(`${attack.name} Damage: ${damage} ${attack.damageType}`);
                              }}
                              className="bg-orange-700 hover:bg-orange-600"
                            >
                              {attack.damage}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Spells Tab - Fully Implemented */}
            <TabsContent value="spells" className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-6">
                {/* Spellcasting Info */}
                <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-600">
                  <h3 className="text-lg font-bold text-purple-400 mb-3">SPELLCASTING</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <Label className="text-xs text-purple-300">SPELL SAVE DC</Label>
                      <div className="text-xl font-bold text-white">{getSpellSaveDC()}</div>
                    </div>
                    <div className="text-center">
                      <Label className="text-xs text-purple-300">SPELL ATTACK BONUS</Label>
                      <div className="text-xl font-bold text-white">+{getSpellAttackBonus()}</div>
                    </div>
                    <div className="text-center">
                      <Label className="text-xs text-purple-300">SPELLCASTING ABILITY</Label>
                      <Select 
                        value={characterData.spellcasting.ability} 
                        onValueChange={(value) => syncCharacterData({
                          ...characterData,
                          spellcasting: { ...characterData.spellcasting, ability: value }
                        })}
                      >
                        <SelectTrigger className="w-20 bg-purple-800 border-purple-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(characterData.abilities).map(ability => (
                            <SelectItem key={ability} value={ability}>{ability}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Spell Slots */}
                <div className="bg-indigo-900/30 rounded-lg p-4 border border-indigo-600">
                  <h3 className="text-lg font-bold text-indigo-400 mb-3">SPELL SLOTS</h3>
                  <div className="grid grid-cols-9 gap-2">
                    {Object.entries(characterData.spellcasting.slots).map(([level, total]) => (
                      <div key={level} className="text-center">
                        <Label className="text-xs text-indigo-300">{level}</Label>
                        <div className="space-y-1">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            value={total}
                            onChange={(e) => {
                              const newData = {
                                ...characterData,
                                spellcasting: {
                                  ...characterData.spellcasting,
                                  slots: { ...characterData.spellcasting.slots, [level]: parseInt(e.target.value) || 0 }
                                }
                              };
                              syncCharacterData(newData);
                            }}
                            className="w-12 h-8 text-center bg-indigo-800 border-indigo-600 text-white"
                          />
                          <div className="flex flex-col space-y-1">
                            {Array.from({ length: total }, (_, i) => (
                              <Button
                                key={i}
                                size="sm"
                                onClick={() => {
                                  const newUsed = characterData.spellcasting.slotsUsed[level];
                                  const isUsed = i < newUsed;
                                  const newData = {
                                    ...characterData,
                                    spellcasting: {
                                      ...characterData.spellcasting,
                                      slotsUsed: {
                                        ...characterData.spellcasting.slotsUsed,
                                        [level]: isUsed ? newUsed - 1 : newUsed + 1
                                      }
                                    }
                                  };
                                  syncCharacterData(newData);
                                }}
                                className={`w-3 h-3 p-0 ${
                                  i < characterData.spellcasting.slotsUsed[level] 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                              >
                                {i < characterData.spellcasting.slotsUsed[level] ? <XCircle className="w-2 h-2" /> : <Circle className="w-2 h-2" />}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cantrips */}
                <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-600">
                  <h3 className="text-lg font-bold text-yellow-400 mb-3">CANTRIPS</h3>
                  <div className="space-y-2">
                    {characterData.cantrips.map((cantrip, index) => (
                      <Card key={index} className="bg-yellow-800/20 border-yellow-700">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-yellow-300">{cantrip.name}</div>
                              <div className="text-xs text-gray-400">
                                {cantrip.school} • {cantrip.castingTime} • {cantrip.range}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => rollDice(20, getSpellAttackBonus(), `${cantrip.name} Spell Attack`)}
                              className="bg-yellow-700 hover:bg-yellow-600"
                            >
                              <Dice6 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Spell Levels */}
                {Object.entries(characterData.spells).map(([level, spellList]) => (
                  <div key={level} className="bg-purple-900/20 rounded-lg p-4 border border-purple-700">
                    <h3 className="text-lg font-bold text-purple-400 mb-3">LEVEL {level} SPELLS</h3>
                    <div className="space-y-2">
                      {spellList.map((spell, index) => (
                        <Card key={index} className="bg-purple-800/20 border-purple-700">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const newSpells = [...spellList];
                                    newSpells[index] = { ...spell, prepared: !spell.prepared };
                                    const newData = {
                                      ...characterData,
                                      spells: { ...characterData.spells, [level]: newSpells }
                                    };
                                    syncCharacterData(newData);
                                  }}
                                  className={`w-6 h-6 p-0 ${spell.prepared ? 'bg-green-600' : 'bg-gray-600'}`}
                                >
                                  {spell.prepared ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                                </Button>
                                <div>
                                  <div className="font-bold text-purple-300">{spell.name}</div>
                                  <div className="text-xs text-gray-400">
                                    {spell.school} • {spell.castingTime} • {spell.range}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    // Cast spell - use spell slot
                                    if (characterData.spellcasting.slotsUsed[level] < characterData.spellcasting.slots[level]) {
                                      const newData = {
                                        ...characterData,
                                        spellcasting: {
                                          ...characterData.spellcasting,
                                          slotsUsed: {
                                            ...characterData.spellcasting.slotsUsed,
                                            [level]: characterData.spellcasting.slotsUsed[level] + 1
                                          }
                                        }
                                      };
                                      syncCharacterData(newData);
                                      
                                      addChatMessage({
                                        type: 'system',
                                        text: `${characterData.name} casts ${spell.name} (Level ${level} spell slot used)`
                                      });
                                    }
                                  }}
                                  disabled={characterData.spellcasting.slotsUsed[level] >= characterData.spellcasting.slots[level]}
                                  className="bg-purple-700 hover:bg-purple-600"
                                >
                                  <Wand2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => rollDice(20, getSpellAttackBonus(), `${spell.name} Spell Attack`)}
                                  className="bg-red-700 hover:bg-red-600"
                                >
                                  <Dice6 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="flex-1 p-4">
              <div className="text-center text-gray-400 py-8">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Inventory tab - Coming soon</p>
              </div>
            </TabsContent>

            <TabsContent value="features" className="flex-1 p-4">
              <div className="text-center text-gray-400 py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Features & Traits tab - Coming soon</p>
              </div>
            </TabsContent>

            <TabsContent value="description" className="flex-1 p-4">
              <div className="text-center text-gray-400 py-8">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Description tab - Coming soon</p>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="flex-1 p-4">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-yellow-400">NOTES</h3>
                <textarea
                  value={characterData.notes}
                  onChange={(e) => setCharacterData({ ...characterData, notes: e.target.value })}
                  className="w-full h-96 p-3 bg-gray-800 border border-red-600 rounded text-white resize-none"
                  placeholder="Enter your campaign notes, character thoughts, or anything else here..."
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Card>
  );
};

export default CharacterSheetBeyond;