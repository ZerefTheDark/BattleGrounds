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
  X, Upload, Save, Heart, Shield, Zap, Dice6, Star, Plus, Minus, Edit, Eye, Sword, Wand2, BookOpen, Package, FileText, User, Download, RotateCcw, Check, Circle, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';

const CharacterSheetEnhanced = ({ token, onClose }) => {
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
    proficiencyBonus: Math.ceil((token?.level || 1) / 4) + 1,
    
    // HP & Combat
    hp: token?.hp || { current: 10, max: 10, temp: 0 },
    hitDice: { total: token?.level || 1, used: 0, type: 'd10' },
    ac: token?.ac || 16,
    initiative: token?.initiativeBonus || 0,
    speed: 30,
    
    // Death Saves & Conditions
    deathSaves: { successes: 0, failures: 0 },
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

    // Combat Actions
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

    // Equipment & Inventory
    equipment: [
      { name: 'Studded Leather Armor', type: 'armor', equipped: true, ac: 12, properties: 'Light armor' },
      { name: 'Shield', type: 'armor', equipped: true, ac: 2, properties: 'Shield' },
      { name: 'Longsword', type: 'weapon', equipped: true, damage: '1d8', damageType: 'slashing', properties: 'Versatile (1d10)' }
    ],
    inventory: [
      { name: 'Healing Potion', quantity: 2, weight: 0.5, description: 'Restores 2d4+2 hit points' }
    ],
    currency: { cp: 0, sp: 0, ep: 0, gp: 150, pp: 0 },

    // Features & Traits
    classFeatures: [
      { name: 'Fighting Style', description: 'Choose a fighting style specialty: Archery, Defense, Dueling, Great Weapon Fighting, Protection, or Two-Weapon Fighting.' },
      { name: 'Second Wind', description: 'Use a bonus action to regain 1d10 + fighter level hit points once per short or long rest.' }
    ],
    racialTraits: [
      { name: 'Extra Language', description: 'You can speak, read, and write one extra language of your choice.' }
    ],
    feats: [],
    
    // Character Description
    appearance: {
      age: 25,
      height: "6'0\"",
      weight: '180 lbs',
      eyes: 'Brown',
      skin: 'Tan',
      hair: 'Black'
    },
    personality: {
      traits: ['I have a strong sense of fair play and always try to find the most equitable solution to arguments.'],
      ideals: ['Freedom. Chains are meant to be broken, as are those who would forge them.'],
      bonds: ['I protect those who cannot protect themselves.'],
      flaws: ['The tyrant who rules my land will stop at nothing to see me killed.']
    },
    backstory: 'A former soldier who became a folk hero after standing up to a corrupt noble.',
    notes: ''
  });

  const [activeTab, setActiveTab] = useState('actions');

  // Data synchronization with token and party member
  useEffect(() => {
    if (token) {
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

  const syncCharacterData = (newData) => {
    setCharacterData(newData);
    
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

  // D&D 5e Calculation Functions
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
    if (skill.proficient) bonus += getProficiencyBonus();
    if (skill.expertise) bonus += getProficiencyBonus();
    return bonus;
  };

  const getSaveBonus = (ability) => {
    const save = characterData.savingThrows[ability];
    const abilityMod = getModifier(characterData.abilities[ability]);
    let bonus = abilityMod + save.bonus;
    if (save.proficient) bonus += getProficiencyBonus();
    return bonus;
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

  const rollSkill = (skillName) => rollDice(20, getSkillBonus(skillName), `${skillName} Check`);
  const rollSave = (ability) => rollDice(20, getSaveBonus(ability), `${ability} Save`);
  const rollAbilityCheck = (ability) => rollDice(20, getModifier(characterData.abilities[ability]), `${ability} Check`);

  // Rest functions
  const shortRest = () => {
    const newData = { ...characterData, hitDice: { ...characterData.hitDice, used: Math.max(0, characterData.hitDice.used - 1) } };
    syncCharacterData(newData);
    addChatMessage({ type: 'system', text: `${characterData.name} takes a short rest.` });
  };

  const longRest = () => {
    const newData = {
      ...characterData,
      hp: { ...characterData.hp, current: characterData.hp.max },
      hitDice: { ...characterData.hitDice, used: 0 },
      deathSaves: { successes: 0, failures: 0 },
      conditions: []
    };
    syncCharacterData(newData);
    addChatMessage({ type: 'system', text: `${characterData.name} takes a long rest and recovers all hit points.` });
  };

  // Import/Export
  const exportCharacter = () => {
    const exportData = { ...characterData, exportDate: new Date().toISOString(), version: '1.0' };
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
        addChatMessage({ type: 'system', text: `Character data imported for ${importedData.name}.` });
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
                  onChange={(e) => syncCharacterData({ ...characterData, name: e.target.value })}
                  className="text-2xl font-bold bg-transparent border-0 text-yellow-400 p-0 h-auto"
                  placeholder="Character Name"
                />
                <Badge className="bg-yellow-600 text-black font-bold">Level {characterData.level}</Badge>
              </div>
              <div className="text-sm text-gray-300">
                {characterData.classes.map(cls => `${cls.name} ${cls.level}`).join(' / ')} • {characterData.race} • {characterData.background}
              </div>
              <div className="text-xs text-gray-400">{characterData.alignment} • {characterData.experience} XP</div>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2">
            <input type="file" accept=".json" onChange={importCharacter} className="hidden" id="import-character" />
            <Button size="sm" onClick={() => document.getElementById('import-character').click()} className="bg-purple-700 hover:bg-purple-600" title="Import Character">
              <Upload className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={exportCharacter} className="bg-indigo-700 hover:bg-indigo-600" title="Export Character">
              <Download className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 bg-red-600" />
            <Button size="sm" onClick={shortRest} className="bg-green-700 hover:bg-green-600" title="Short Rest">
              <Heart className="w-4 h-4 mr-1" />
              Short Rest
            </Button>
            <Button size="sm" onClick={longRest} className="bg-blue-700 hover:bg-blue-600" title="Long Rest">
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
          {/* Ability Scores with Hexagonal Design */}
          <div className="space-y-3 mb-6">
            <h3 className="text-lg font-bold text-yellow-400 border-b border-yellow-600 pb-1">ABILITY SCORES</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(characterData.abilities).map(([ability, score]) => (
                <div key={ability} className="text-center">
                  <div className="relative bg-red-800 rounded-lg p-3 border border-red-600 transform hover:scale-105 transition-transform">
                    <div className="text-xs font-bold text-yellow-400">{ability}</div>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={score}
                      onChange={(e) => {
                        const newAbilities = { ...characterData.abilities, [ability]: parseInt(e.target.value) || 8 };
                        syncCharacterData({ ...characterData, abilities: newAbilities });
                      }}
                      className="text-2xl font-bold text-white bg-transparent border-0 text-center p-0 h-auto w-16 mx-auto"
                    />
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

          {/* HP, AC, Initiative with enhanced styling */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-red-800/50 rounded p-2 text-center border border-red-600">
              <Label className="text-xs text-red-300">AC</Label>
              <Input
                type="number"
                value={characterData.ac}
                onChange={(e) => syncCharacterData({ ...characterData, ac: parseInt(e.target.value) || 10 })}
                className="text-lg font-bold bg-transparent border-0 text-center p-0 h-auto"
              />
            </div>
            <div className="bg-orange-800/50 rounded p-2 text-center border border-orange-600">
              <Label className="text-xs text-orange-300">INIT</Label>
              <div className="text-lg font-bold">{getModifierString(characterData.abilities.DEX)}</div>
            </div>
            <div className="bg-green-800/50 rounded p-2 text-center border border-green-600">
              <Label className="text-xs text-green-300">SPEED</Label>
              <Input
                type="number"
                value={characterData.speed}
                onChange={(e) => syncCharacterData({ ...characterData, speed: parseInt(e.target.value) || 30 })}
                className="text-lg font-bold bg-transparent border-0 text-center p-0 h-auto"
              />
            </div>
          </div>

          {/* HP Management */}
          <div className="bg-red-900/30 rounded-lg p-3 mb-4 border border-red-600">
            <Label className="text-sm font-bold text-red-400 mb-2 block">HIT POINTS</Label>
            <div className="flex items-center gap-2 mb-2">
              <Input
                type="number"
                value={characterData.hp.current}
                onChange={(e) => {
                  const newHp = { ...characterData.hp, current: parseInt(e.target.value) || 0 };
                  syncCharacterData({ ...characterData, hp: newHp });
                }}
                className="flex-1 text-center bg-red-800 border-red-600"
              />
              <span className="text-gray-300">/</span>
              <Input
                type="number"
                value={characterData.hp.max}
                onChange={(e) => {
                  const newHp = { ...characterData.hp, max: parseInt(e.target.value) || 1 };
                  syncCharacterData({ ...characterData, hp: newHp });
                }}
                className="flex-1 text-center bg-red-800 border-red-600"
              />
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={() => {
                  const newHp = { ...characterData.hp, current: Math.max(0, characterData.hp.current - 1) };
                  syncCharacterData({ ...characterData, hp: newHp });
                }}
                className="flex-1 bg-red-700 hover:bg-red-600"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const newHp = { ...characterData.hp, current: Math.min(characterData.hp.max, characterData.hp.current + 1) };
                  syncCharacterData({ ...characterData, hp: newHp });
                }}
                className="flex-1 bg-green-700 hover:bg-green-600"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Death Saves */}
          <div className="bg-gray-900/50 rounded-lg p-3 mb-4 border border-gray-600">
            <Label className="text-sm font-bold text-gray-400 mb-2 block">DEATH SAVES</Label>
            <div className="flex justify-between">
              <div>
                <Label className="text-xs text-green-400">Successes</Label>
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <Button
                      key={i}
                      size="sm"
                      onClick={() => {
                        const newDeathSaves = { ...characterData.deathSaves, successes: characterData.deathSaves.successes === i ? i - 1 : i };
                        syncCharacterData({ ...characterData, deathSaves: newDeathSaves });
                      }}
                      className={`w-6 h-6 p-0 ${i <= characterData.deathSaves.successes ? 'bg-green-600' : 'bg-gray-600'}`}
                    >
                      {i <= characterData.deathSaves.successes ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-red-400">Failures</Label>
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <Button
                      key={i}
                      size="sm"
                      onClick={() => {
                        const newDeathSaves = { ...characterData.deathSaves, failures: characterData.deathSaves.failures === i ? i - 1 : i };
                        syncCharacterData({ ...characterData, deathSaves: newDeathSaves });
                      }}
                      className={`w-6 h-6 p-0 ${i <= characterData.deathSaves.failures ? 'bg-red-600' : 'bg-gray-600'}`}
                    >
                      {i <= characterData.deathSaves.failures ? <XCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Skills - Compact List */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-yellow-400">SKILLS</h3>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {Object.entries(characterData.skills).map(([skillName, skill]) => (
                <div key={skillName} className="flex items-center justify-between p-1 hover:bg-gray-800 rounded text-sm">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        const newSkills = {
                          ...characterData.skills,
                          [skillName]: { ...skill, proficient: !skill.proficient }
                        };
                        syncCharacterData({ ...characterData, skills: newSkills });
                      }}
                      className={`w-4 h-4 p-0 ${skill.proficient ? 'bg-yellow-500' : skill.expertise ? 'bg-yellow-300' : 'bg-gray-500'}`}
                    >
                      {skill.proficient ? <CheckCircle className="w-2 h-2" /> : <Circle className="w-2 h-2" />}
                    </Button>
                    <span className="text-xs">{skillName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{getSkillBonus(skillName) >= 0 ? '+' : ''}{getSkillBonus(skillName)}</span>
                    <Button size="sm" onClick={() => rollSkill(skillName)} className="w-5 h-5 p-0 bg-gray-700 hover:bg-gray-600">
                      <Dice6 className="w-2 h-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA - Tabs */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-6 bg-gray-800 border-b-2 border-red-600">
              <TabsTrigger value="actions" className="data-[state=active]:bg-red-700">
                <Sword className="w-4 h-4 mr-1" />
                Actions
              </TabsTrigger>
              <TabsTrigger value="spells" className="data-[state=active]:bg-purple-700">
                <Wand2 className="w-4 h-4 mr-1" />
                Spells
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-orange-700">
                <Package className="w-4 h-4 mr-1" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="features" className="data-[state=active]:bg-green-700">
                <BookOpen className="w-4 h-4 mr-1" />
                Features
              </TabsTrigger>
              <TabsTrigger value="description" className="data-[state=active]:bg-blue-700">
                <User className="w-4 h-4 mr-1" />
                Description
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-gray-700">
                <FileText className="w-4 h-4 mr-1" />
                Notes
              </TabsTrigger>
            </TabsList>

            {/* Actions Tab */}
            <TabsContent value="actions" className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="bg-red-900/30 rounded-lg p-4 border border-red-600">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-red-400">ATTACKS & SPELLCASTING</h3>
                    <Button
                      size="sm"
                      onClick={() => {
                        const newAttack = {
                          id: Date.now(),
                          name: 'New Attack',
                          type: 'Melee Weapon Attack',
                          bonus: 0,
                          damage: '1d6',
                          damageType: 'slashing',
                          range: '5 ft',
                          properties: ''
                        };
                        syncCharacterData({ ...characterData, attacks: [...characterData.attacks, newAttack] });
                      }}
                      className="bg-red-700 hover:bg-red-600"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {characterData.attacks.map((attack, index) => (
                      <Card key={attack.id} className="bg-red-800/20 border-red-700">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Input
                              value={attack.name}
                              onChange={(e) => {
                                const newAttacks = [...characterData.attacks];
                                newAttacks[index] = { ...attack, name: e.target.value };
                                syncCharacterData({ ...characterData, attacks: newAttacks });
                              }}
                              className="text-lg font-bold bg-transparent border-0 text-red-300 p-0 h-auto flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                const newAttacks = characterData.attacks.filter((_, i) => i !== index);
                                syncCharacterData({ ...characterData, attacks: newAttacks });
                              }}
                              className="bg-red-700 hover:bg-red-600"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-sm text-gray-400 mb-3">{attack.type}</div>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <Label className="text-xs text-red-300">Attack Bonus</Label>
                              <Input
                                type="number"
                                value={attack.bonus}
                                onChange={(e) => {
                                  const newAttacks = [...characterData.attacks];
                                  newAttacks[index] = { ...attack, bonus: parseInt(e.target.value) || 0 };
                                  syncCharacterData({ ...characterData, attacks: newAttacks });
                                }}
                                className="bg-red-800 border-red-600 text-white"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-red-300">Damage</Label>
                              <Input
                                value={attack.damage}
                                onChange={(e) => {
                                  const newAttacks = [...characterData.attacks];
                                  newAttacks[index] = { ...attack, damage: e.target.value };
                                  syncCharacterData({ ...characterData, attacks: newAttacks });
                                }}
                                className="bg-red-800 border-red-600 text-white"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => rollDice(20, attack.bonus, `${attack.name} Attack`)}
                              className="bg-red-700 hover:bg-red-600 flex-1"
                            >
                              <Dice6 className="w-4 h-4 mr-1" />
                              Attack Roll
                            </Button>
                            <Button
                              onClick={() => {
                                addChatMessage({
                                  type: 'system',
                                  text: `${characterData.name} deals ${attack.damage} ${attack.damageType} damage with ${attack.name}.`
                                });
                              }}
                              className="bg-orange-700 hover:bg-orange-600 flex-1"
                            >
                              Damage
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Other tabs implementation would continue here... */}
            <TabsContent value="spells" className="flex-1 p-4">
              <div className="text-center text-gray-400 py-8">
                <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Spells system - Enhanced D&D Beyond style implementation would go here</p>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="flex-1 p-4">
              <div className="text-center text-gray-400 py-8">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Inventory system - Equipment, currency, and carrying capacity would go here</p>
              </div>
            </TabsContent>

            <TabsContent value="features" className="flex-1 p-4">
              <div className="text-center text-gray-400 py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Features & Traits - Class features, racial traits, and feats would go here</p>
              </div>
            </TabsContent>

            <TabsContent value="description" className="flex-1 p-4">
              <div className="text-center text-gray-400 py-8">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Character Description - Appearance, personality, and backstory would go here</p>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="flex-1 p-4">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-yellow-400">NOTES</h3>
                <textarea
                  value={characterData.notes}
                  onChange={(e) => syncCharacterData({ ...characterData, notes: e.target.value })}
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

export default CharacterSheetEnhanced;