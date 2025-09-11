import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  X, 
  Plus, 
  Trash2, 
  Users, 
  UserPlus, 
  Crown,
  Edit,
  Eye,
  EyeOff,
  Dice6
} from 'lucide-react';
import { useBattleMapStore } from '../store/battleMapStore';

const PartyManager = ({ onClose }) => {
  const { 
    tokens, 
    addToken, 
    removeToken, 
    updateToken, 
    addCombatant,
    initiative,
    setInitiative
  } = useBattleMapStore();
  
  const [partyMembers, setPartyMembers] = useState(() => {
    // Load party members from localStorage or initialize empty
    const savedParty = localStorage.getItem('party_members');
    return savedParty ? JSON.parse(savedParty) : [];
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    characterClass: '',
    level: 1,
    isPlayer: true,
    tokenImage: null,
    hp: { current: 0, max: 0 },
    ac: 10,
    initiativeBonus: 0
  });

  // Save party members to localStorage whenever they change
  const savePartyMembers = (members) => {
    setPartyMembers(members);
    localStorage.setItem('party_members', JSON.stringify(members));
  };

  const handleAddMember = () => {
    if (!newMember.name.trim()) {
      alert('Please enter a character name');
      return;
    }

    const member = {
      id: Date.now().toString(),
      ...newMember,
      name: newMember.name.trim(),
      level: parseInt(newMember.level) || 1,
      hp: {
        current: parseInt(newMember.hp.current) || 0,
        max: parseInt(newMember.hp.max) || 0
      },
      ac: parseInt(newMember.ac) || 10,
      initiativeBonus: parseInt(newMember.initiativeBonus) || 0
    };

    const updatedParty = [...partyMembers, member];
    savePartyMembers(updatedParty);
    
    // Reset form
    setNewMember({
      name: '',
      characterClass: '',
      level: 1,
      isPlayer: true,
      tokenImage: null,
      hp: { current: 0, max: 0 },
      ac: 10,
      initiativeBonus: 0
    });
    setShowAddForm(false);
  };

  const handleRemoveMember = (memberId) => {
    const updatedParty = partyMembers.filter(member => member.id !== memberId);
    savePartyMembers(updatedParty);
    
    // Also remove from tokens if exists
    const existingToken = tokens.find(token => token.partyMemberId === memberId);
    if (existingToken) {
      removeToken(existingToken.id);
    }
  };

  const addMemberToMap = (member) => {
    // Check if token already exists for this party member
    const existingToken = tokens.find(token => token.partyMemberId === member.id);
    if (existingToken) {
      alert('This party member is already on the map');
      return;
    }

    // Create token for party member
    const token = {
      id: Date.now().toString(),
      partyMemberId: member.id,
      name: member.name,
      x: 200 + (Math.random() * 100),
      y: 200 + (Math.random() * 100),
      shape: 'circle',
      size: 30,
      color: member.isPlayer ? '#3b82f6' : '#ef4444', // Blue for players, red for NPCs
      appearanceImage: member.tokenImage,
      hp: member.hp,
      ac: member.ac,
      abilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
      conditions: [],
      isPlayerCharacter: member.isPlayer,
      characterClass: member.characterClass,
      level: member.level
    };

    addToken(token);
  };

  const addPartyToInitiative = () => {
    // Add all party members to initiative tracker automatically
    partyMembers.forEach(member => {
      // Check if already in initiative
      const alreadyInInitiative = initiative.combatants.some(c => c.partyMemberId === member.id);
      if (!alreadyInInitiative) {
        const combatant = {
          id: Date.now().toString() + member.id,
          partyMemberId: member.id,
          name: member.name,
          initiative: 0, // Will be rolled later
          initiativeBonus: member.initiativeBonus,
          hp: member.hp,
          isPlayerCharacter: member.isPlayer,
          characterClass: member.characterClass,
          level: member.level,
          hideNameFromPlayers: !member.isPlayer // Hide NPC names from players
        };
        
        addCombatant(combatant);
      }
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewMember({ ...newMember, tokenImage: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const classesList = [
    'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 
    'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard',
    'Artificer', 'Blood Hunter', 'Custom'
  ];

  return (
    <Card className="fantasy-card w-80 text-white h-full shadow-lg shadow-green-500/10 fantasy-scrollbar">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 border-b border-green-500/30">
        <CardTitle className="text-lg dragon-stones-title flex items-center gap-2">
          <Users className="w-5 h-5" />
          Party Manager
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className="fantasy-button-emerald p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddForm(true)}
            className="fantasy-button-emerald flex-1"
            size="sm"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
          
          <Button
            onClick={addPartyToInitiative}
            variant="outline"
            size="sm"
            className="border-purple-500 text-purple-400 hover:bg-purple-900/30"
            disabled={partyMembers.length === 0}
          >
            <Dice6 className="w-4 h-4" />
          </Button>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="p-4 space-y-3">
              <Input
                placeholder="Character name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="bg-gray-600 border-gray-500 text-white"
              />
              
              <div className="flex gap-2">
                <Select
                  value={newMember.characterClass}
                  onValueChange={(value) => setNewMember({ ...newMember, characterClass: value })}
                >
                  <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {classesList.map(cls => (
                      <SelectItem key={cls} value={cls} className="text-white">
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  type="number"
                  placeholder="Level"
                  value={newMember.level}
                  onChange={(e) => setNewMember({ ...newMember, level: e.target.value })}
                  className="bg-gray-600 border-gray-500 text-white w-20"
                  min="1"
                  max="20"
                />
              </div>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Current HP"
                  value={newMember.hp.current}
                  onChange={(e) => setNewMember({
                    ...newMember,
                    hp: { ...newMember.hp, current: e.target.value }
                  })}
                  className="bg-gray-600 border-gray-500 text-white"
                />
                <Input
                  type="number"
                  placeholder="Max HP"
                  value={newMember.hp.max}
                  onChange={(e) => setNewMember({
                    ...newMember,
                    hp: { ...newMember.hp, max: e.target.value }
                  })}
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="AC"
                  value={newMember.ac}
                  onChange={(e) => setNewMember({ ...newMember, ac: e.target.value })}
                  className="bg-gray-600 border-gray-500 text-white"
                />
                <Input
                  type="number"
                  placeholder="Init Bonus"
                  value={newMember.initiativeBonus}
                  onChange={(e) => setNewMember({ ...newMember, initiativeBonus: e.target.value })}
                  className="bg-gray-600 border-gray-500 text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="member-image-upload"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('member-image-upload').click()}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-500 text-gray-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Token Image
                </Button>
                
                <Select
                  value={newMember.isPlayer ? 'player' : 'npc'}
                  onValueChange={(value) => setNewMember({ ...newMember, isPlayer: value === 'player' })}
                >
                  <SelectTrigger className="bg-gray-600 border-gray-500 text-white w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="player" className="text-white">PC</SelectItem>
                    <SelectItem value="npc" className="text-white">NPC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newMember.tokenImage && (
                <div className="mt-2">
                  <img 
                    src={newMember.tokenImage} 
                    alt="Token preview" 
                    className="w-16 h-16 object-cover rounded border border-green-500/30"
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={handleAddMember} className="flex-1 bg-green-600 hover:bg-green-700">
                  Add to Party
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 border-gray-500"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Party Members List */}
        <div className="space-y-2 max-h-96 overflow-y-auto fantasy-scrollbar">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-green-400">
              Party Members ({partyMembers.length})
            </h3>
          </div>

          {partyMembers.map((member) => {
            const isOnMap = tokens.some(token => token.partyMemberId === member.id);
            
            return (
              <Card
                key={member.id}
                className="stat-block-premium border-gray-600 bg-gray-700/50"
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {member.tokenImage ? (
                        <img 
                          src={member.tokenImage} 
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-400"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center"
                          style={{ backgroundColor: member.isPlayer ? '#3b82f6' : '#ef4444' }}
                        >
                          {member.isPlayer ? (
                            <Crown className="w-4 h-4 text-white" />
                          ) : (
                            <Users className="w-4 h-4 text-white" />
                          )}
                        </div>
                      )}
                      
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {member.name}
                          {member.isPlayer && (
                            <Badge className="bg-blue-600 text-xs px-1 py-0">PC</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          {member.characterClass && member.level ? 
                            `${member.characterClass} ${member.level}` : 
                            'No class set'
                          }
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addMemberToMap(member)}
                        disabled={isOnMap}
                        className={isOnMap ? 'text-green-400' : 'text-blue-400 hover:text-blue-300'}
                        title={isOnMap ? 'Already on map' : 'Add to map'}
                      >
                        {isOnMap ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>HP: {member.hp.current}/{member.hp.max}</span>
                    <span>AC: {member.ac}</span>
                    {member.initiativeBonus !== 0 && (
                      <span>Init: {member.initiativeBonus >= 0 ? '+' : ''}{member.initiativeBonus}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {partyMembers.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No party members added yet</p>
              <p className="text-xs mt-1">Click "Add Member" to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PartyManager;