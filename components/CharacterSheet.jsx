import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { X, Plus, Trash2, Upload, Dice6, Save, FileText, Shield, Sword, Heart } from 'lucide-react';
import { useBattleMapStore } from '../store/battleMapStore';

const CharacterSheet = ({ token, onClose }) => {
  const { updateToken, addChatMessage } = useBattleMapStore();
  const [activeTab, setActiveTab] = useState('stats');

  const handleUpdateToken = (updates) => {
    updateToken(token.id, updates);
  };

  const rollDice = (sides, bonus = 0, label = '') => {
    const roll = Math.floor(Math.random() * sides) + 1;
    const total = roll + bonus;
    
    addChatMessage({
      type: 'roll',
      who: token.name,
      formula: `1d${sides}${bonus !== 0 ? (bonus > 0 ? `+${bonus}` : bonus) : ''}`,
      results: [roll],
      total,
      note: label
    });
  };

  const getModifier = (score) => {
    return Math.floor((score - 10) / 2);
  };

  const getModifierString = (score) => {
    const mod = getModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  const skills = [
    { name: 'Acrobatics', ability: 'DEX' },
    { name: 'Animal Handling', ability: 'WIS' },
    { name: 'Arcana', ability: 'INT' },
    { name: 'Athletics', ability: 'STR' },
    { name: 'Deception', ability: 'CHA' },
    { name: 'History', ability: 'INT' },
    { name: 'Insight', ability: 'WIS' },
    { name: 'Intimidation', ability: 'CHA' },
    { name: 'Investigation', ability: 'INT' },
    { name: 'Medicine', ability: 'WIS' },
    { name: 'Nature', ability: 'INT' },
    { name: 'Perception', ability: 'WIS' },
    { name: 'Performance', ability: 'CHA' },
    { name: 'Persuasion', ability: 'CHA' },
    { name: 'Religion', ability: 'INT' },
    { name: 'Sleight of Hand', ability: 'DEX' },
    { name: 'Stealth', ability: 'DEX' },
    { name: 'Survival', ability: 'WIS' }
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const characterData = e.target.result;
        // Store the uploaded character sheet data
        handleUpdateToken({ 
          uploadedSheet: characterData,
          sheetFileName: file.name 
        });
        
        // Save to localStorage for future use
        const savedSheets = JSON.parse(localStorage.getItem('saved_character_sheets') || '[]');
        savedSheets.push({
          id: Date.now().toString(),
          name: token.name,
          fileName: file.name,
          data: characterData,
          created: Date.now()
        });
        localStorage.setItem('saved_character_sheets', JSON.stringify(savedSheets));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="h-full flex flex-col shadow-2xl fantasy-scrollbar" style={{
      background: 'linear-gradient(145deg, #0a0a0a 0%, #1a0f0f 30%, #2a1a1a 70%, #0a0a0a 100%)',
      border: '2px solid',
      borderImage: 'linear-gradient(45deg, #dc2626, #f59e0b, #dc2626, #b91c1c) 1',
      boxShadow: '0 0 30px rgba(220, 38, 38, 0.3), inset 0 1px 0 rgba(248, 113, 113, 0.1)'
    }}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 py-3" style={{
        background: 'linear-gradient(135deg, rgba(185, 28, 28, 0.2) 0%, rgba(220, 38, 38, 0.15) 50%, rgba(153, 27, 27, 0.2) 100%)',
        borderBottom: '2px solid rgba(220, 38, 38, 0.4)'
      }}>
        <div className="flex items-center gap-3">
          {/* Character Portrait */}
          <div className="relative">
            <div className="w-16 h-16 rounded-lg bg-gray-800 border-2 border-yellow-500/50 flex items-center justify-center overflow-hidden">
              {token.portrait ? (
                <img src={token.portrait} alt="Portrait" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id={`portrait-${token.id}`}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => handleUpdateToken({ portrait: e.target.result });
                  reader.readAsDataURL(file);
                }
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              className="fantasy-button-emerald absolute -bottom-1 -right-1 w-6 h-6 p-0 rounded-full"
              onClick={() => document.getElementById(`portrait-${token.id}`).click()}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold text-transparent bg-clip-text" style={{
              backgroundImage: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)',
              textShadow: '0 0 10px rgba(251, 191, 36, 0.5)'
            }}>
              {token.name}
            </CardTitle>
            <div className="text-sm font-medium" style={{ color: '#f87171' }}>
              {token.race || 'Human'} {token.class || 'Fighter'} • Level {token.level || 1}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Upload Character Sheet */}
          <input
            type="file"
            accept=".json,.pdf,image/*"
            className="hidden"
            id={`sheet-upload-${token.id}`}
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById(`sheet-upload-${token.id}`).click()}
            className="fantasy-button-emerald border-green-500/50 text-green-400 hover:bg-green-500/10"
          >
            <FileText className="w-3 h-3 mr-1" />
            Upload Sheet
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Save character data to localStorage
              const characterData = {
                id: token.id,
                name: token.name,
                data: token,
                saved: Date.now()
              };
              const savedCharacters = JSON.parse(localStorage.getItem('saved_characters') || '[]');
              const existingIndex = savedCharacters.findIndex(c => c.id === token.id);
              if (existingIndex >= 0) {
                savedCharacters[existingIndex] = characterData;
              } else {
                savedCharacters.push(characterData);
              }
              localStorage.setItem('saved_characters', JSON.stringify(savedCharacters));
            }}
            className="fantasy-button border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
          >
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/30 border border-red-600/50 rounded-full w-8 h-8 p-0"
            title="Close Character Sheet"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid grid-cols-6 rounded-none" style={{
            background: 'linear-gradient(135deg, #1f2937, #374151)',
            borderBottom: '2px solid #dc2626'
          }}>
            <TabsTrigger value="stats" className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-red-400">
              <Shield className="w-3 h-3 mr-1" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="combat" className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-red-400">
              <Sword className="w-3 h-3 mr-1" />
              Combat
            </TabsTrigger>
            <TabsTrigger value="spells" className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-red-400">✨ Spells</TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-red-400">🎒 Items</TabsTrigger>
            <TabsTrigger value="features" className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-red-400">⭐ Features</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-red-400">📝 Notes</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 p-4 space-y-4 min-h-0">
            <TabsContent value="stats" className="space-y-4 mt-0 max-h-[600px] overflow-y-auto fantasy-scrollbar">
              {/* Core Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg border-2" style={{
                  background: 'linear-gradient(145deg, #374151, #1f2937)',
                  borderColor: '#dc2626',
                  boxShadow: '0 4px 10px rgba(220, 38, 38, 0.2)'
                }}>
                  <div className="text-2xl font-bold text-transparent bg-clip-text" style={{
                    backgroundImage: 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                  }}>
                    {token.ac || 10}
                  </div>
                  <div className="text-xs font-bold text-red-300 mt-1">ARMOR CLASS</div>
                </div>
                
                <div className="text-center p-3 rounded-lg border-2" style={{
                  background: 'linear-gradient(145deg, #374151, #1f2937)',
                  borderColor: '#dc2626',
                  boxShadow: '0 4px 10px rgba(220, 38, 38, 0.2)'
                }}>
                  <div className="text-xl font-bold text-white">
                    {token.hp?.current || 0} / {token.hp?.max || 0}
                  </div>
                  <div className="text-xs font-bold text-red-300 mt-1">HIT POINTS</div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2 border border-red-500/30">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${token.hp ? (token.hp.current / token.hp.max) * 100 : 0}%`,
                        background: 'linear-gradient(90deg, #dc2626, #ef4444, #f87171)'
                      }}
                    />
                  </div>
                </div>
                
                <div className="text-center p-3 rounded-lg border-2" style={{
                  background: 'linear-gradient(145deg, #374151, #1f2937)',
                  borderColor: '#dc2626',
                  boxShadow: '0 4px 10px rgba(220, 38, 38, 0.2)'
                }}>
                  <div className="text-2xl font-bold text-transparent bg-clip-text" style={{
                    backgroundImage: 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                  }}>
                    {token.speed?.replace('ft', '') || '30'}
                  </div>
                  <div className="text-xs font-bold text-red-300 mt-1">SPEED (FT)</div>
                </div>
              </div>

              {/* Ability Scores */}
              <Card className="border-2" style={{
                background: 'linear-gradient(145deg, #1a1a1a, #2a1a1a)',
                borderColor: '#dc2626',
                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.2)'
              }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-red-400">ABILITY SCORES</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2">
                  {abilities.map(ability => {
                    const score = token.abilities?.[ability] || 10;
                    const modifier = getModifier(score);
                    return (
                      <div key={ability} className="text-center">
                        <div className="relative">
                          {/* Hexagonal background */}
                          <div className="w-16 h-16 mx-auto mb-1 flex items-center justify-center relative" style={{
                            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                            boxShadow: '0 4px 10px rgba(220, 38, 38, 0.3)'
                          }}>
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">{getModifierString(score)}</div>
                            </div>
                          </div>
                          {/* Base score circle */}
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{
                            background: 'linear-gradient(135deg, #374151, #1f2937)',
                            border: '2px solid #dc2626'
                          }}>
                            {score}
                          </div>
                        </div>
                        <div className="text-xs font-bold text-red-300 mt-2">{ability}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-1 h-6 text-xs bg-gray-800 hover:bg-red-900/30 border border-red-500/30 text-red-300"
                          onClick={() => rollDice(20, modifier, `${ability} Check`)}
                        >
                          <Dice6 className="w-3 h-3 mr-1" />
                          Roll
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="bg-gray-800 border border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-400">Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {skills.map(skill => {
                    const abilityScore = token.abilities?.[skill.ability] || 10;
                    const modifier = getModifier(abilityScore);
                    const proficient = token.proficiencies?.includes(skill.name) || false;
                    const bonus = modifier + (proficient ? (token.proficiencyBonus || 2) : 0);
                    
                    return (
                      <div key={skill.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={proficient}
                            onCheckedChange={(checked) => {
                              const profs = token.proficiencies || [];
                              const newProfs = checked 
                                ? [...profs, skill.name]
                                : profs.filter(p => p !== skill.name);
                              handleUpdateToken({ proficiencies: newProfs });
                            }}
                            className="scale-75"
                          />
                          <span className="text-sm">{skill.name}</span>
                          <span className="text-xs text-gray-500">({skill.ability})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono">
                            {bonus >= 0 ? '+' : ''}{bonus}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-6 h-6 p-0"
                            onClick={() => rollDice(20, bonus, skill.name)}
                          >
                            <Dice6 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Additional Character Information */}
              <Card className="border-2" style={{
                background: 'linear-gradient(145deg, #1a1a1a, #2a1a1a)',
                borderColor: '#dc2626',
                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.2)'
              }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-red-400">PROFICIENCIES & LANGUAGES</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs font-bold text-red-300">Armor Proficiencies</Label>
                    <div className="text-sm text-gray-300 mt-1">Light Armor, Medium Armor, Shields</div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-red-300">Weapon Proficiencies</Label>
                    <div className="text-sm text-gray-300 mt-1">Simple Weapons, Martial Weapons</div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-red-300">Languages</Label>
                    <div className="text-sm text-gray-300 mt-1">Common, Elvish, Draconic</div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-red-300">Tools</Label>
                    <div className="text-sm text-gray-300 mt-1">Thieves' Tools, Gaming Set</div>
                  </div>
                </CardContent>
              </Card>

              {/* Saving Throws */}
              <Card className="border-2" style={{
                background: 'linear-gradient(145deg, #1a1a1a, #2a1a1a)',
                borderColor: '#dc2626',
                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.2)'
              }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-red-400">SAVING THROWS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {abilities.map(ability => {
                      const score = token.abilities?.[ability] || 10;
                      const modifier = getModifier(score);
                      return (
                        <div key={ability} className="flex items-center justify-between p-2 rounded bg-gray-800 border border-red-500/30">
                          <span className="text-sm font-medium text-red-300">{ability}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-white">
                              {modifier >= 0 ? '+' : ''}{modifier}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-6 h-6 p-0 bg-red-900/30 hover:bg-red-800/40"
                              onClick={() => rollDice(20, modifier, `${ability} Save`)}
                            >
                              <Dice6 className="w-3 h-3 text-red-400" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="combat" className="space-y-4 mt-0 max-h-[600px] overflow-y-auto fantasy-scrollbar">
              {/* Initiative and Combat Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gray-800 border border-red-500/30">
                  <CardContent className="p-3 text-center">
                    <div className="text-red-400 font-bold text-lg">
                      {getModifierString(token.abilities?.DEX || 10)}
                    </div>
                    <div className="text-xs text-gray-400">INITIATIVE</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-1"
                      onClick={() => rollDice(20, getModifier(token.abilities?.DEX || 10), 'Initiative')}
                    >
                      <Dice6 className="w-3 h-3 mr-1" />
                      Roll
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border border-blue-500/30">
                  <CardContent className="p-3 text-center">
                    <div className="text-blue-400 font-bold text-lg">{token.proficiencyBonus || 2}</div>
                    <div className="text-xs text-gray-400">PROF BONUS</div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <Card className="bg-gray-800 border border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-400 flex items-center justify-between">
                    Actions
                    <Button
                      size="sm"
                      onClick={() => {
                        const newAction = {
                          id: Date.now().toString(),
                          name: 'New Action',
                          type: 'action',
                          damage: '1d6',
                          attackBonus: '+3',
                          desc: ''
                        };
                        const actions = token.actions || [];
                        handleUpdateToken({ actions: [...actions, newAction] });
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(token.actions || []).map((action) => (
                    <Card key={action.id} className="bg-gray-700 border border-gray-600">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <Input
                            value={action.name}
                            onChange={(e) => {
                              const actions = token.actions.map(a =>
                                a.id === action.id ? { ...a, name: e.target.value } : a
                              );
                              handleUpdateToken({ actions });
                            }}
                            className="font-medium bg-gray-600 border-gray-500 text-sm"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const actions = token.actions.filter(a => a.id !== action.id);
                              handleUpdateToken({ actions });
                            }}
                            className="text-red-400 ml-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <Input
                            value={action.attackBonus || ''}
                            onChange={(e) => {
                              const actions = token.actions.map(a =>
                                a.id === action.id ? { ...a, attackBonus: e.target.value } : a
                              );
                              handleUpdateToken({ actions });
                            }}
                            placeholder="Attack +3"
                            className="bg-gray-600 border-gray-500 text-xs"
                          />
                          <Input
                            value={action.damage || ''}
                            onChange={(e) => {
                              const actions = token.actions.map(a =>
                                a.id === action.id ? { ...a, damage: e.target.value } : a
                              );
                              handleUpdateToken({ actions });
                            }}
                            placeholder="1d8+3"
                            className="bg-gray-600 border-gray-500 text-xs"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-red-600 hover:bg-red-700"
                            onClick={() => {
                              // Roll attack
                              const bonus = parseInt(action.attackBonus?.replace(/[^-\d]/g, '') || '0');
                              rollDice(20, bonus, `${action.name} Attack`);
                            }}
                          >
                            Attack
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                            onClick={() => {
                              // Roll damage
                              const match = action.damage?.match(/(\d+)d(\d+)([+-]\d+)?/);
                              if (match) {
                                const count = parseInt(match[1]);
                                const sides = parseInt(match[2]);
                                const bonus = parseInt(match[3] || '0');
                                let total = bonus;
                                const results = [];
                                for (let i = 0; i < count; i++) {
                                  const roll = Math.floor(Math.random() * sides) + 1;
                                  results.push(roll);
                                  total += roll;
                                }
                                addChatMessage({
                                  type: 'roll',
                                  who: token.name,
                                  formula: action.damage,
                                  results,
                                  total,
                                  note: `${action.name} Damage`
                                });
                              }
                            }}
                          >
                            Damage
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="spells" className="space-y-4 mt-0 max-h-[600px] overflow-y-auto fantasy-scrollbar">
              {/* Spell Slots */}
              <Card className="bg-gray-800 border border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-purple-400">Spell Slots</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
                    const slots = token.spellSlots?.[level] || { used: 0, max: 0 };
                    return (
                      <div key={level} className="text-center border border-gray-700 rounded p-2">
                        <div className="text-xs text-gray-400">Level {level}</div>
                        <div className="flex items-center justify-between">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newSlots = {
                                ...token.spellSlots,
                                [level]: { ...slots, used: Math.max(0, slots.used - 1) }
                              };
                              handleUpdateToken({ spellSlots: newSlots });
                            }}
                            className="w-6 h-6 p-0"
                          >
                            -
                          </Button>
                          <span className="text-sm">{slots.used}/{slots.max}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newSlots = {
                                ...token.spellSlots,
                                [level]: { ...slots, used: Math.min(slots.max, slots.used + 1) }
                              };
                              handleUpdateToken({ spellSlots: newSlots });
                            }}
                            className="w-6 h-6 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Spell List */}
              <Card className="bg-gray-800 border border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-400 flex items-center justify-between">
                    Spells
                    <Button
                      size="sm"
                      onClick={() => {
                        const newSpell = {
                          id: Date.now().toString(),
                          name: 'New Spell',
                          level: 1,
                          prepared: true,
                          desc: ''
                        };
                        const spells = token.spells || [];
                        handleUpdateToken({ spells: [...spells, newSpell] });
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(token.spells || []).map((spell) => (
                    <Card key={spell.id} className="bg-gray-700 border border-gray-600">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <Input
                              value={spell.name}
                              onChange={(e) => {
                                const spells = token.spells.map(s =>
                                  s.id === spell.id ? { ...s, name: e.target.value } : s
                                );
                                handleUpdateToken({ spells });
                              }}
                              className="font-medium bg-gray-600 border-gray-500 mb-2"
                            />
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Level:</Label>
                              <Input
                                type="number"
                                value={spell.level}
                                onChange={(e) => {
                                  const spells = token.spells.map(s =>
                                    s.id === spell.id ? { ...s, level: parseInt(e.target.value) || 1 } : s
                                  );
                                  handleUpdateToken({ spells });
                                }}
                                className="w-16 bg-gray-600 border-gray-500 text-xs"
                                min="0"
                                max="9"
                              />
                              <Switch
                                checked={spell.prepared}
                                onCheckedChange={(checked) => {
                                  const spells = token.spells.map(s =>
                                    s.id === spell.id ? { ...s, prepared: checked } : s
                                  );
                                  handleUpdateToken({ spells });
                                }}
                                className="scale-75"
                              />
                              <Label className="text-xs">Prepared</Label>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 ml-2"
                            onClick={() => {
                              const slots = token.spellSlots?.[spell.level];
                              if (slots && slots.used < slots.max) {
                                const newSlots = {
                                  ...token.spellSlots,
                                  [spell.level]: { ...slots, used: slots.used + 1 }
                                };
                                handleUpdateToken({ spellSlots: newSlots });
                                
                                addChatMessage({
                                  type: 'spell',
                                  who: token.name,
                                  text: `Cast ${spell.name} (Level ${spell.level})`
                                });
                              }
                            }}
                            disabled={
                              !token.spellSlots?.[spell.level] ||
                              token.spellSlots[spell.level].used >= token.spellSlots[spell.level].max
                            }
                          >
                            Cast
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4 mt-0 max-h-[600px] overflow-y-auto fantasy-scrollbar">
              {/* Inventory management - simplified for space */}
              <Card className="bg-gray-800 border border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-400">Equipment & Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={token.equipment || ''}
                    onChange={(e) => handleUpdateToken({ equipment: e.target.value })}
                    placeholder="List your equipment, weapons, armor, and other items..."
                    className="bg-gray-700 border-gray-600 min-h-32"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-4 mt-0 max-h-[600px] overflow-y-auto fantasy-scrollbar">
              {/* Features and Traits */}
              <Card className="bg-gray-800 border border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-400">Features & Traits</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={token.features || ''}
                    onChange={(e) => handleUpdateToken({ features: e.target.value })}
                    placeholder="Racial traits, class features, feats, and other abilities..."
                    className="bg-gray-700 border-gray-600 min-h-32"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 mt-0 max-h-[600px] overflow-y-auto fantasy-scrollbar">
              {/* Notes */}
              <Card className="bg-gray-800 border border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-400">Character Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={token.notes || ''}
                    onChange={(e) => handleUpdateToken({ notes: e.target.value })}
                    placeholder="Backstory, personality traits, bonds, ideals, flaws, and other notes..."
                    className="bg-gray-700 border-gray-600 min-h-40"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CharacterSheet;