import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Sword, 
  Users, 
  Plus, 
  Trash2, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown,
  Skull,
  Heart,
  Shield
} from 'lucide-react';
import { useBattleMapStore } from '../store/battleMapStore';

const EnhancedInitiativeTracker = ({ onAddTokensFromField, tokens }) => {
  const { 
    initiative, 
    partyMembers, 
    setInitiative, 
    updatePartyMember 
  } = useBattleMapStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [round, setRound] = useState(1);

  // Sort initiative entries by initiative value (highest first)
  const sortedInitiative = [...initiative].sort((a, b) => {
    if (b.initiative === a.initiative) {
      return a.name.localeCompare(b.name);
    }
    return b.initiative - a.initiative;
  });

  const addInitiativeEntry = useCallback((entry) => {
    const newEntry = {
      id: Date.now() + Math.random(),
      name: entry.name,
      initiative: entry.initiative || 0,
      type: entry.type || 'party', // 'party' or 'token'
      tokenId: entry.tokenId || null,
      hp: {
        current: entry.hp?.current || entry.hp || 0,
        max: entry.hp?.max || entry.hp || 0
      },
      conditions: [],
      isActive: entry.hp?.current > 0,
      ac: entry.ac || 10
    };
    
    setInitiative([...initiative, newEntry]);
  }, [initiative, setInitiative]);

  const removeInitiativeEntry = useCallback((id) => {
    setInitiative(initiative.filter(entry => entry.id !== id));
    // Adjust current turn if needed
    if (currentTurn >= sortedInitiative.length - 1) {
      setCurrentTurn(Math.max(0, sortedInitiative.length - 2));
    }
  }, [initiative, setInitiative, currentTurn, sortedInitiative.length]);

  const updateInitiativeEntry = useCallback((id, updates) => {
    setInitiative(initiative.map(entry => {
      if (entry.id === id) {
        const updated = { ...entry, ...updates };
        // Check if HP dropped to 0 or below
        if (updated.hp?.current <= 0 && entry.hp?.current > 0) {
          updated.isActive = false;
        } else if (updated.hp?.current > 0 && entry.hp?.current <= 0) {
          updated.isActive = true;
        }
        return updated;
      }
      return entry;
    }));
  }, [initiative, setInitiative]);

  const rollInitiative = useCallback((id) => {
    const roll = Math.floor(Math.random() * 20) + 1;
    updateInitiativeEntry(id, { initiative: roll });
  }, [updateInitiativeEntry]);

  const nextTurn = useCallback(() => {
    const activeEntries = sortedInitiative.filter(entry => entry.isActive);
    if (activeEntries.length === 0) return;

    let nextTurn = currentTurn + 1;
    if (nextTurn >= activeEntries.length) {
      nextTurn = 0;
      setRound(prev => prev + 1);
    }
    setCurrentTurn(nextTurn);
  }, [sortedInitiative, currentTurn]);

  const previousTurn = useCallback(() => {
    const activeEntries = sortedInitiative.filter(entry => entry.isActive);
    if (activeEntries.length === 0) return;

    let prevTurn = currentTurn - 1;
    if (prevTurn < 0) {
      prevTurn = activeEntries.length - 1;
      setRound(prev => Math.max(1, prev - 1));
    }
    setCurrentTurn(prevTurn);
  }, [sortedInitiative, currentTurn]);

  const resetInitiative = useCallback(() => {
    setInitiative([]);
    setCurrentTurn(0);
    setRound(1);
  }, [setInitiative]);

  // Add party members to initiative
  const addPartyToInitiative = useCallback(() => {
    partyMembers.forEach(member => {
      if (!initiative.find(entry => entry.name === member.name && entry.type === 'party')) {
        addInitiativeEntry({
          name: member.name,
          type: 'party',
          hp: member.hitPoints,
          ac: member.armorClass,
          initiative: 0
        });
      }
    });
  }, [partyMembers, initiative, addInitiativeEntry]);

  const activeInitiative = sortedInitiative.filter(entry => entry.isActive);
  const currentEntry = activeInitiative[currentTurn];

  return (
    <Card className="fantasy-card text-white shadow-lg shadow-green-500/10">
      <CardHeader 
        className="flex flex-row items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Sword className="w-5 h-5 text-red-400" />
          <CardTitle className="text-lg">Initiative Tracker</CardTitle>
          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
            Round {round}
          </Badge>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={addPartyToInitiative}
              className="bg-green-600 hover:bg-green-700"
            >
              <Users className="w-4 h-4 mr-1" />
              Add Party
            </Button>
            
            <Button
              size="sm"
              onClick={() => onAddTokensFromField && onAddTokensFromField()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Tokens
            </Button>
            
            <Button
              size="sm"
              onClick={resetInitiative}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-900/30"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>

          {/* Initiative Order */}
          {sortedInitiative.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-green-400">Combat Order:</h4>
                <div className="flex gap-2">
                  <Button size="sm" onClick={previousTurn} disabled={activeInitiative.length === 0}>
                    Previous
                  </Button>
                  <Button size="sm" onClick={nextTurn} disabled={activeInitiative.length === 0}>
                    Next Turn
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto fantasy-scrollbar">
                {sortedInitiative.map((entry, index) => {
                  const isCurrentTurn = activeInitiative.indexOf(entry) === currentTurn && entry.isActive;
                  const isDefeated = !entry.isActive;
                  
                  return (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        isCurrentTurn 
                          ? 'bg-yellow-900/30 border-yellow-500 ring-2 ring-yellow-500/50' 
                          : isDefeated
                          ? 'bg-gray-900/50 border-gray-700 opacity-60'
                          : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isDefeated && <Skull className="w-4 h-4 text-red-500" />}
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {entry.name}
                              {entry.type === 'token' && (
                                <Badge variant="outline" className="text-xs">Token</Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Sword className="w-3 h-3" />
                                Initiative: {entry.initiative}
                              </span>
                              <span className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                AC: {entry.ac}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Health Bar */}
                          <div className="flex items-center gap-2">
                            <Heart className={`w-4 h-4 ${entry.hp.current <= 0 ? 'text-red-500' : 'text-red-400'}`} />
                            <div className="text-sm">
                              <Input
                                type="number"
                                value={entry.hp.current}
                                onChange={(e) => updateInitiativeEntry(entry.id, {
                                  hp: { ...entry.hp, current: parseInt(e.target.value) || 0 }
                                })}
                                className="w-12 h-6 text-xs text-center bg-gray-700 border-gray-600"
                                min="0"
                                max={entry.hp.max}
                              />
                              <span className="text-gray-400">/{entry.hp.max}</span>
                            </div>
                          </div>

                          {/* Initiative Roll */}
                          <Button
                            size="sm"
                            onClick={() => rollInitiative(entry.id)}
                            className="w-8 h-6 text-xs"
                          >
                            d20
                          </Button>

                          {/* Remove */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeInitiativeEntry(entry.id)}
                            className="w-6 h-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/30"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Health Bar Visual */}
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            entry.hp.current <= 0 
                              ? 'bg-red-900' 
                              : entry.hp.current <= entry.hp.max * 0.25
                              ? 'bg-red-500'
                              : entry.hp.current <= entry.hp.max * 0.5
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.max(0, Math.min(100, (entry.hp.current / entry.hp.max) * 100))}%` 
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {sortedInitiative.length === 0 && (
            <div className="text-center text-gray-400 py-4">
              <Sword className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No combatants in initiative</p>
              <p className="text-xs">Add party members or tokens to begin combat</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default EnhancedInitiativeTracker;