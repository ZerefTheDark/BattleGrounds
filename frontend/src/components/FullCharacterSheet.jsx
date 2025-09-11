import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  X, 
  Sword, 
  Wand2, 
  Package, 
  Star, 
  BookOpen, 
  FileText, 
  Plus,
  Heart,
  Shield,
  Zap,
  User,
  Edit,
  Save,
  Upload,
  Download,
  Eye,
  Dice6,
  Target,
  Clock,
  Coins,
  Scroll
} from 'lucide-react';

const FullCharacterSheet = ({ character, onClose, onUpdateCharacter }) => {
  const [activeTab, setActiveTab] = useState('actions');
  const [editedCharacter, setEditedCharacter] = useState(character || {
    name: 'New Character',
    level: 1,
    race: 'Human',
    class: 'Fighter',
    background: 'Soldier',
    stats: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 },
    hitPoints: { current: 10, max: 10 },
    armorClass: 16,
    speed: 30,
    proficiencyBonus: 2,
    spellSlots: {},
    spells: [],
    attacks: [],
    equipment: [],
    features: [],
    traits: [],
    notes: '',
    personality: { traits: '', ideals: '', bonds: '', flaws: '' }
  });

  const getModifier = (score) => Math.floor((score - 10) / 2);
  const formatModifier = (modifier) => modifier >= 0 ? `+${modifier}` : `${modifier}`;

  const updateCharacter = (updates) => {
    const updated = { ...editedCharacter, ...updates };
    setEditedCharacter(updated);
    onUpdateCharacter?.(updated);
  };

  const addItem = (category, item) => {
    updateCharacter({
      [category]: [...(editedCharacter[category] || []), { id: Date.now(), ...item }]
    });
  };

  const removeItem = (category, id) => {
    updateCharacter({
      [category]: (editedCharacter[category] || []).filter(item => item.id !== id)
    });
  };

  return (
    <Card className="fantasy-card w-full max-w-4xl text-white shadow-2xl border-2 border-green-500/50 h-full">
      <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-green-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-green-400" />
            <CardTitle className="text-xl dragon-stones-title">
              {editedCharacter.name} - Full Character Sheet
            </CardTitle>
            <Badge variant="outline" className="text-green-400 border-green-400">
              Level {editedCharacter.level}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-green-400 hover:text-green-300 hover:bg-green-900/30"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Character Basic Info */}
        <div className="grid grid-cols-5 gap-4 mt-4">
          <div>
            <Label className="text-xs text-gray-400">Race</Label>
            <div className="text-sm">{editedCharacter.race}</div>
          </div>
          <div>
            <Label className="text-xs text-gray-400">Class</Label>
            <div className="text-sm">{editedCharacter.class}</div>
          </div>
          <div>
            <Label className="text-xs text-gray-400">Background</Label>
            <div className="text-sm">{editedCharacter.background}</div>
          </div>
          <div>
            <Label className="text-xs text-gray-400">AC</Label>
            <div className="text-sm font-bold">{editedCharacter.armorClass}</div>
          </div>
          <div>
            <Label className="text-xs text-gray-400">HP</Label>
            <div className="text-sm font-bold">{editedCharacter.hitPoints.current}/{editedCharacter.hitPoints.max}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="w-full justify-start bg-gray-800 border-b border-gray-700 rounded-none px-4">
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Sword className="w-4 h-4" />
              Actions
            </TabsTrigger>
            <TabsTrigger value="spells" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Spells
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Features & Traits
            </TabsTrigger>
            <TabsTrigger value="background" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Background
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="extras" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Extras
            </TabsTrigger>
          </TabsList>

          <div className="p-6 h-[600px] overflow-y-auto fantasy-scrollbar">
            {/* ACTIONS TAB */}
            <TabsContent value="actions" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Attacks */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-orange-400">Attacks</h3>
                    <Button
                      size="sm"
                      onClick={() => addItem('attacks', {
                        name: 'New Attack',
                        attackBonus: '+5',
                        damage: '1d8+3',
                        damageType: 'slashing',
                        range: 'Melee'
                      })}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Attack
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {(editedCharacter.attacks || []).map((attack) => (
                      <div key={attack.id} className="bg-gray-800 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <Input
                            value={attack.name}
                            onChange={(e) => {
                              const updated = editedCharacter.attacks.map(a =>
                                a.id === attack.id ? { ...a, name: e.target.value } : a
                              );
                              updateCharacter({ attacks: updated });
                            }}
                            className="bg-gray-700 border-gray-600 font-medium"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem('attacks', attack.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">Attack Bonus</Label>
                            <Input
                              value={attack.attackBonus}
                              onChange={(e) => {
                                const updated = editedCharacter.attacks.map(a =>
                                  a.id === attack.id ? { ...a, attackBonus: e.target.value } : a
                                );
                                updateCharacter({ attacks: updated });
                              }}
                              className="bg-gray-700 border-gray-600"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Damage</Label>
                            <Input
                              value={attack.damage}
                              onChange={(e) => {
                                const updated = editedCharacter.attacks.map(a =>
                                  a.id === attack.id ? { ...a, damage: e.target.value } : a
                                );
                                updateCharacter({ attacks: updated });
                              }}
                              className="bg-gray-700 border-gray-600"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Range</Label>
                            <Input
                              value={attack.range}
                              onChange={(e) => {
                                const updated = editedCharacter.attacks.map(a =>
                                  a.id === attack.id ? { ...a, range: e.target.value } : a
                                );
                                updateCharacter({ attacks: updated });
                              }}
                              className="bg-gray-700 border-gray-600"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Actions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-blue-400">Special Actions</h3>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="font-medium">Action Surge</span>
                        <Badge variant="outline" className="text-xs">1/rest</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-400" />
                        <span className="font-medium">Second Wind</span>
                        <Badge variant="outline" className="text-xs">1/rest</Badge>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-purple-400">Bonus Actions</h3>
                  <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                    <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No bonus actions configured</p>
                  </div>

                  <h3 className="text-lg font-bold text-yellow-400">Reactions</h3>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-yellow-400" />
                      <span className="font-medium">Opportunity Attack</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* SPELLS TAB */}
            <TabsContent value="spells" className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Spell Slots */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-purple-400">Spell Slots</h3>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                      <div key={level} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                        <span className="text-sm">Level {level}</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editedCharacter.spellSlots?.[level]?.current || 0}
                            min="0"
                            max={editedCharacter.spellSlots?.[level]?.max || 0}
                            className="w-12 h-6 text-center bg-gray-700 border-gray-600"
                          />
                          <span className="text-gray-400">/</span>
                          <Input
                            type="number"
                            value={editedCharacter.spellSlots?.[level]?.max || 0}
                            min="0"
                            className="w-12 h-6 text-center bg-gray-700 border-gray-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spellcasting Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-purple-400">Spellcasting</h3>
                  <div className="space-y-3 bg-gray-800 p-4 rounded-lg">
                    <div>
                      <Label className="text-xs text-gray-400">Spellcasting Ability</Label>
                      <Select defaultValue="INT">
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INT">Intelligence</SelectItem>
                          <SelectItem value="WIS">Wisdom</SelectItem>
                          <SelectItem value="CHA">Charisma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Spell Save DC</Label>
                      <div className="text-lg font-bold">
                        {8 + editedCharacter.proficiencyBonus + getModifier(editedCharacter.stats.INT)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Spell Attack Bonus</Label>
                      <div className="text-lg font-bold">
                        {formatModifier(editedCharacter.proficiencyBonus + getModifier(editedCharacter.stats.INT))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spells Known/Prepared */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-purple-400">Spells</h3>
                    <Button
                      size="sm"
                      onClick={() => addItem('spells', {
                        name: 'New Spell',
                        level: 1,
                        school: 'Evocation',
                        castingTime: '1 action',
                        range: '30 feet',
                        components: 'V, S',
                        duration: 'Instantaneous'
                      })}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Spell
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {(editedCharacter.spells || []).map((spell) => (
                      <div key={spell.id} className="bg-gray-800 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Input
                            value={spell.name}
                            onChange={(e) => {
                              const updated = editedCharacter.spells.map(s =>
                                s.id === spell.id ? { ...s, name: e.target.value } : s
                              );
                              updateCharacter({ spells: updated });
                            }}
                            className="bg-gray-700 border-gray-600 font-medium"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem('spells', spell.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Scroll className="w-3 h-3 text-purple-400" />
                            Level {spell.level}
                          </div>
                          <div className="text-gray-400">{spell.school}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* INVENTORY TAB */}
            <TabsContent value="inventory" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Equipment */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-green-400">Equipment</h3>
                    <Button
                      size="sm"
                      onClick={() => addItem('equipment', {
                        name: 'New Item',
                        type: 'Weapon',
                        rarity: 'Common',
                        attuned: false
                      })}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {(editedCharacter.equipment || []).map((item) => (
                      <div key={item.id} className="bg-gray-800 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const updated = editedCharacter.equipment.map(i =>
                                i.id === item.id ? { ...i, name: e.target.value } : i
                              );
                              updateCharacter({ equipment: updated });
                            }}
                            className="bg-gray-700 border-gray-600 font-medium"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem('equipment', item.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="outline">{item.type}</Badge>
                          <span className="text-gray-400">{item.rarity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Currency & Containers */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-yellow-400">Currency</h3>
                  <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                    {[
                      { name: 'Platinum', key: 'pp', icon: '💎' },
                      { name: 'Gold', key: 'gp', icon: '🪙' },
                      { name: 'Silver', key: 'sp', icon: '🪙' },
                      { name: 'Copper', key: 'cp', icon: '🪙' }
                    ].map(currency => (
                      <div key={currency.key} className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {currency.icon}
                          {currency.name}
                        </span>
                        <Input
                          type="number"
                          defaultValue={0}
                          className="w-20 h-6 text-center bg-gray-700 border-gray-600"
                        />
                      </div>
                    ))}
                  </div>

                  <h3 className="text-lg font-bold text-blue-400">Containers</h3>
                  <div className="space-y-2">
                    <div className="bg-gray-800 rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-blue-400" />
                        <span className="font-medium">Backpack</span>
                      </div>
                      <div className="text-xs text-gray-400">15/30 lbs</div>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium">Belt Pouch</span>
                      </div>
                      <div className="text-xs text-gray-400">2/6 lbs</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* FEATURES & TRAITS TAB */}
            <TabsContent value="features" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-green-400">Class Features</h3>
                  <div className="space-y-2">
                    <div className="bg-gray-800 rounded p-3">
                      <h4 className="font-medium text-green-400">Fighting Style</h4>
                      <p className="text-sm text-gray-300">Defense: +1 AC while wearing armor</p>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <h4 className="font-medium text-green-400">Second Wind</h4>
                      <p className="text-sm text-gray-300">Regain 1d10+1 hit points as a bonus action</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-blue-400">Racial Traits</h3>
                  <div className="space-y-2">
                    <div className="bg-gray-800 rounded p-3">
                      <h4 className="font-medium text-blue-400">Extra Language</h4>
                      <p className="text-sm text-gray-300">You can speak, read, and write one extra language</p>
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <h4 className="font-medium text-blue-400">Extra Skill</h4>
                      <p className="text-sm text-gray-300">You gain proficiency in one skill</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-purple-400">Proficiencies</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-800 rounded p-3">
                    <h4 className="font-medium text-purple-400 mb-2">Skills</h4>
                    <div className="space-y-1 text-sm">
                      <div>Athletics</div>
                      <div>Intimidation</div>
                      <div>Perception</div>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded p-3">
                    <h4 className="font-medium text-purple-400 mb-2">Languages</h4>
                    <div className="space-y-1 text-sm">
                      <div>Common</div>
                      <div>Orcish</div>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded p-3">
                    <h4 className="font-medium text-purple-400 mb-2">Tools</h4>
                    <div className="space-y-1 text-sm">
                      <div>Smith's Tools</div>
                      <div>Vehicles (Land)</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* BACKGROUND TAB */}
            <TabsContent value="background" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-orange-400">Background: {editedCharacter.background}</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-orange-400">Personality Traits</Label>
                      <Textarea
                        placeholder="Enter personality traits..."
                        value={editedCharacter.personality?.traits || ''}
                        onChange={(e) => updateCharacter({
                          personality: { ...editedCharacter.personality, traits: e.target.value }
                        })}
                        className="bg-gray-800 border-gray-600 mt-2"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-orange-400">Ideals</Label>
                      <Textarea
                        placeholder="Enter ideals..."
                        value={editedCharacter.personality?.ideals || ''}
                        onChange={(e) => updateCharacter({
                          personality: { ...editedCharacter.personality, ideals: e.target.value }
                        })}
                        className="bg-gray-800 border-gray-600 mt-2"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-orange-400">Bonds</Label>
                      <Textarea
                        placeholder="Enter bonds..."
                        value={editedCharacter.personality?.bonds || ''}
                        onChange={(e) => updateCharacter({
                          personality: { ...editedCharacter.personality, bonds: e.target.value }
                        })}
                        className="bg-gray-800 border-gray-600 mt-2"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-orange-400">Flaws</Label>
                      <Textarea
                        placeholder="Enter flaws..."
                        value={editedCharacter.personality?.flaws || ''}
                        onChange={(e) => updateCharacter({
                          personality: { ...editedCharacter.personality, flaws: e.target.value }
                        })}
                        className="bg-gray-800 border-gray-600 mt-2"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-bold text-orange-400 mb-2">Background Feature</h4>
                  <div className="bg-gray-800 rounded p-4">
                    <h5 className="font-medium">Military Rank</h5>
                    <p className="text-sm text-gray-300 mt-1">
                      You have a military rank from your career as a soldier. Soldiers loyal to your former military organization still recognize your authority and influence.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* NOTES TAB */}
            <TabsContent value="notes" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-blue-400">Character Notes</h3>
                <Textarea
                  placeholder="Write your character's backstory, campaign notes, or any other information here..."
                  value={editedCharacter.notes || ''}
                  onChange={(e) => updateCharacter({ notes: e.target.value })}
                  className="bg-gray-800 border-gray-600 min-h-[400px]"
                />
              </div>
            </TabsContent>

            {/* EXTRAS TAB */}
            <TabsContent value="extras" className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-red-400">Conditions</h3>
                  <div className="space-y-2">
                    {[
                      'Blinded', 'Charmed', 'Deafened', 'Frightened', 
                      'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed',
                      'Petrified', 'Poisoned', 'Prone', 'Restrained',
                      'Stunned', 'Unconscious'
                    ].map(condition => (
                      <div key={condition} className="flex items-center gap-2">
                        <Switch id={condition} />
                        <Label htmlFor={condition} className="text-sm">{condition}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-purple-400">Damage Resistances</h3>
                  <div className="bg-gray-800 rounded p-3">
                    <div className="text-sm text-gray-300">None</div>
                  </div>

                  <h3 className="text-lg font-bold text-green-400">Damage Immunities</h3>
                  <div className="bg-gray-800 rounded p-3">
                    <div className="text-sm text-gray-300">None</div>
                  </div>

                  <h3 className="text-lg font-bold text-yellow-400">Damage Vulnerabilities</h3>
                  <div className="bg-gray-800 rounded p-3">
                    <div className="text-sm text-gray-300">None</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-cyan-400">Senses</h3>
                  <div className="bg-gray-800 rounded p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Passive Perception</span>
                      <span className="font-bold">
                        {10 + getModifier(editedCharacter.stats.WIS) + editedCharacter.proficiencyBonus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Darkvision</span>
                      <span className="text-gray-400">None</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-orange-400">Death Saves</h3>
                  <div className="bg-gray-800 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Successes</span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-4 h-4 rounded border border-green-500"></div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Failures</span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-4 h-4 rounded border border-red-500"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FullCharacterSheet;