import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { X, Plus, Trash2, SkipForward, RotateCcw, Dice6 } from 'lucide-react';
import { useBattleMapStore } from '../store/battleMapStore';

const InitiativeTracker = ({ onClose, isPlayerView = false }) => {
  const {
    initiative,
    tokens,
    setInitiative,
    addCombatant,
    removeCombatant,
    nextTurn,
    addChatMessage,
    selectToken
  } = useBattleMapStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCombatant, setNewCombatant] = useState({
    name: '',
    initiative: '',
    hp: { current: 0, max: 0 }
  });

  const handleAddCombatant = () => {
    if (newCombatant.name.trim() && newCombatant.initiative !== '') {
      addCombatant({
        ...newCombatant,
        initiative: parseInt(newCombatant.initiative) || 0
      });
      
      setNewCombatant({ name: '', initiative: '', hp: { current: 0, max: 0 } });
      setShowAddForm(false);
      
      // Sort combatants by initiative
      sortCombatants();
    }
  };

  const rollInitiative = (combatant) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    const newInitiative = roll + (combatant.initiativeBonus || 0);
    
    const updatedCombatants = initiative.combatants.map(c =>
      c.id === combatant.id ? { ...c, initiative: newInitiative } : c
    );
    
    setInitiative({ ...initiative, combatants: updatedCombatants });
    
    addChatMessage({
      type: 'roll',
      who: combatant.name,
      formula: '1d20',
      results: [roll],
      total: newInitiative,
      note: 'Initiative'
    });
    
    sortCombatants();
  };

  const rollAllInitiatives = () => {
    const updatedCombatants = initiative.combatants.map(combatant => {
      const roll = Math.floor(Math.random() * 20) + 1;
      const newInitiative = roll + (combatant.initiativeBonus || 0);
      
      addChatMessage({
        type: 'roll',
        who: combatant.name,
        formula: '1d20',
        results: [roll],
        total: newInitiative,
        note: 'Initiative'
      });
      
      return { ...combatant, initiative: newInitiative };
    });
    
    setInitiative({ ...initiative, combatants: updatedCombatants });
    sortCombatants();
  };

  const sortCombatants = () => {
    const sorted = [...initiative.combatants].sort((a, b) => b.initiative - a.initiative);
    setInitiative({ ...initiative, combatants: sorted, turn: 0 });
  };

  const handleNextTurn = () => {
    const currentCombatant = initiative.combatants[initiative.turn];
    const nextTurnIndex = (initiative.turn + 1) % initiative.combatants.length;
    const nextRound = nextTurnIndex === 0 ? initiative.round + 1 : initiative.round;
    
    if (nextTurnIndex === 0) {
      addChatMessage({
        type: 'system',
        text: `Round ${nextRound} begins!`
      });
    }
    
    const nextCombatant = initiative.combatants[nextTurnIndex];
    addChatMessage({
      type: 'system',
      text: `It's ${nextCombatant.name}'s turn!`
    });
    
    setInitiative({
      ...initiative,
      turn: nextTurnIndex,
      round: nextRound
    });
    
    // Select the token if it exists
    const token = tokens.find(t => t.name === nextCombatant.name);
    if (token) {
      selectToken(token.id);
    }
  };

  const resetInitiative = () => {
    setInitiative({
      round: 1,
      turn: 0,
      combatants: []
    });
    
    addChatMessage({
      type: 'system',
      text: 'Initiative tracker reset!'
    });
  };

  const currentCombatant = initiative.combatants[initiative.turn];

  return (
    <Card className="w-80 bg-gray-800 border-gray-700 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Initiative</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Round & Turn Info */}
        <div className="flex justify-between items-center bg-gray-700 rounded p-3">
          <div>
            <div className="text-sm text-gray-400">Round</div>
            <div className="text-xl font-bold">{initiative.round}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Turn</div>
            <div className="text-xl font-bold">{initiative.turn + 1}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
          
          <Button
            onClick={rollAllInitiatives}
            variant="outline"
            size="sm"
            disabled={initiative.combatants.length === 0}
          >
            <Dice6 className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={resetInitiative}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Add Combatant Form */}
        {showAddForm && (
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="p-4 space-y-3">
              <Input
                placeholder="Combatant name"
                value={newCombatant.name}
                onChange={(e) => setNewCombatant({ ...newCombatant, name: e.target.value })}
                className="bg-gray-600 border-gray-500"
              />
              
              <Input
                type="number"
                placeholder="Initiative"
                value={newCombatant.initiative}
                onChange={(e) => setNewCombatant({ ...newCombatant, initiative: e.target.value })}
                className="bg-gray-600 border-gray-500"
              />
              
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Current HP"
                  value={newCombatant.hp.current}
                  onChange={(e) => setNewCombatant({
                    ...newCombatant,
                    hp: { ...newCombatant.hp, current: parseInt(e.target.value) || 0 }
                  })}
                  className="bg-gray-600 border-gray-500"
                />
                <Input
                  type="number"
                  placeholder="Max HP"
                  value={newCombatant.hp.max}
                  onChange={(e) => setNewCombatant({
                    ...newCombatant,
                    hp: { ...newCombatant.hp, max: parseInt(e.target.value) || 0 }
                  })}
                  className="bg-gray-600 border-gray-500"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddCombatant} className="flex-1 bg-green-600 hover:bg-green-700">
                  Add
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Combatants List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {initiative.combatants.map((combatant, index) => (
            <Card
              key={combatant.id}
              className={`border ${
                index === initiative.turn
                  ? 'bg-blue-900/50 border-blue-500'
                  : 'bg-gray-700 border-gray-600'
              } transition-colors`}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {isPlayerView && combatant.hideNameFromPlayers ? 
                          `${combatant.characterClass || 'Creature'} ${index + 1}` : 
                          combatant.name
                        }
                      </span>
                      {index === initiative.turn && (
                        <Badge className="bg-blue-600 text-xs">Current</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span>Init: {combatant.initiative}</span>
                      {combatant.hp && (
                        <span>HP: {combatant.hp.current}/{combatant.hp.max}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => rollInitiative(combatant)}
                    >
                      <Dice6 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCombatant(combatant.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {initiative.combatants.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No combatants added yet
            </div>
          )}
        </div>

        {/* Next Turn Button */}
        {initiative.combatants.length > 0 && (
          <Button
            onClick={handleNextTurn}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Next Turn
            {currentCombatant && ` (${currentCombatant.name})`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default InitiativeTracker;