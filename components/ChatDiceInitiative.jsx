import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { 
  X, 
  Send, 
  Dice6, 
  MessageSquare, 
  Settings, 
  Plus, 
  Trash2, 
  SkipForward, 
  RotateCcw,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5
} from 'lucide-react';
import { useBattleMapStore } from '../store/battleMapStore';

const ChatDiceInitiative = ({ onClose, isPlayerView = false }) => {
  const {
    chatMessages,
    addChatMessage,
    selectedTokenId,
    tokens,
    initiative,
    setInitiative,
    addCombatant,
    removeCombatant,
    selectToken
  } = useBattleMapStore();

  const [activeTab, setActiveTab] = useState('chat');
  const [newMessage, setNewMessage] = useState('');
  const [customRoll, setCustomRoll] = useState('');
  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const [modifier, setModifier] = useState(0);
  const [showAddCombatant, setShowAddCombatant] = useState(false);
  const [newCombatant, setNewCombatant] = useState({
    name: '',
    initiative: '',
    hp: { current: 0, max: 0 }
  });

  const messagesEndRef = useRef(null);
  const selectedToken = tokens.find(t => t.id === selectedTokenId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Chat Functions
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    addChatMessage({
      type: 'say',
      who: selectedToken?.name || 'GM',
      text: newMessage
    });

    setNewMessage('');
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Dice Functions
  const rollDice = (sides, count = 1, label = '') => {
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push(Math.floor(Math.random() * sides) + 1);
    }

    let total = results.reduce((sum, roll) => sum + roll, 0) + modifier;
    let displayResults = results;

    // Handle advantage/disadvantage for d20 rolls
    if (sides === 20 && (advantage || disadvantage)) {
      const secondRoll = Math.floor(Math.random() * 20) + 1;
      displayResults = [results[0], secondRoll];
      
      if (advantage) {
        total = Math.max(results[0], secondRoll) + modifier;
        label = label ? `${label} (Advantage)` : 'Advantage';
      } else if (disadvantage) {
        total = Math.min(results[0], secondRoll) + modifier;
        label = label ? `${label} (Disadvantage)` : 'Disadvantage';
      }
    }

    const formula = `${count}d${sides}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}`;
    
    addChatMessage({
      type: 'roll',
      who: selectedToken?.name || 'GM',
      formula,
      results: displayResults,
      total,
      note: label
    });
  };

  const rollCustom = () => {
    if (!customRoll.trim()) return;

    try {
      // Simple parser for XdY+Z format
      const match = customRoll.match(/(\d+)?d(\d+)([+-]\d+)?/i);
      if (match) {
        const count = parseInt(match[1]) || 1;
        const sides = parseInt(match[2]);
        const mod = parseInt(match[3]) || 0;

        const results = [];
        for (let i = 0; i < count; i++) {
          results.push(Math.floor(Math.random() * sides) + 1);
        }

        const total = results.reduce((sum, roll) => sum + roll, 0) + mod;

        addChatMessage({
          type: 'roll',
          who: selectedToken?.name || 'GM',
          formula: customRoll,
          results,
          total
        });

        setCustomRoll('');
      }
    } catch (error) {
      console.error('Failed to parse dice roll:', error);
    }
  };

  // Initiative Functions
  const handleAddCombatant = () => {
    if (newCombatant.name.trim() && newCombatant.initiative !== '') {
      addCombatant({
        ...newCombatant,
        initiative: parseInt(newCombatant.initiative) || 0
      });
      
      setNewCombatant({ name: '', initiative: '', hp: { current: 0, max: 0 } });
      setShowAddCombatant(false);
      sortCombatants();
    }
  };

  const sortCombatants = () => {
    const sorted = [...initiative.combatants].sort((a, b) => b.initiative - a.initiative);
    setInitiative({ ...initiative, combatants: sorted, turn: 0 });
  };

  const handleNextTurn = () => {
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

  const renderMessage = (message) => {
    switch (message.type) {
      case 'roll':
        return (
          <div className="chat-message-premium roll-message">
            <div className="flex items-center gap-2 mb-1">
              <Dice6 className="w-3 h-3 text-purple-400" />
              <span className="font-medium text-purple-300 text-sm">{message.who}</span>
              {message.note && (
                <Badge variant="secondary" className="text-xs h-4 bg-purple-600">
                  {message.note}
                </Badge>
              )}
            </div>
            <div className="text-xs">
              <span className="text-gray-300">{message.formula}: </span>
              {message.results && (
                <span className="text-gray-400">
                  [{message.results.join(', ')}] = 
                </span>
              )}
              <span className="font-bold text-white ml-1 character-stat-number text-sm">
                {message.total}
              </span>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="stat-block-premium text-center">
            <span className="text-green-400 text-xs italic character-stat-label">{message.text}</span>
          </div>
        );

      default:
        return (
          <div className="chat-message-premium">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-green-300 text-sm">{message.who}</span>
            </div>
            <div className="text-xs text-gray-200">{message.text}</div>
          </div>
        );
    }
  };

  const quickDice = [
    { sides: 4, icon: Dice1, color: 'bg-red-600' },
    { sides: 6, icon: Dice2, color: 'bg-orange-600' },
    { sides: 8, icon: Dice3, color: 'bg-yellow-600' },
    { sides: 10, icon: Dice4, color: 'bg-green-600' },
    { sides: 12, icon: Dice5, color: 'bg-blue-600' },
    { sides: 20, icon: Dice6, color: 'bg-purple-600' }
  ];

  return (
    <Card className="fantasy-card text-white h-full flex flex-col shadow-lg shadow-green-500/10 fantasy-scrollbar">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-green-500/30">
        <CardTitle className="text-lg dragon-stones-title">Game Console</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} className="fantasy-button-emerald p-1">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-3 space-y-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700 border border-green-500/30">
            <TabsTrigger value="chat" className="text-xs data-[state=active]:bg-green-600">
              <MessageSquare className="w-3 h-3 mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="dice" className="text-xs data-[state=active]:bg-purple-600">
              <Dice6 className="w-3 h-3 mr-1" />
              Dice
            </TabsTrigger>
            <TabsTrigger value="initiative" className="text-xs data-[state=active]:bg-yellow-600">
              <Settings className="w-3 h-3 mr-1" />
              Initiative
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="chat" className="h-full flex flex-col mt-2">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-0 p-3 rounded-lg" style={{
                background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)'
              }}>
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-sm mb-2">⚔️ Welcome to the Adventure ⚔️</div>
                    <div className="text-gray-500 text-xs">Chat messages will appear here</div>
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    <div key={message.id || index} className="group">
                      {renderMessage(message)}
                      <div className="text-xs text-gray-500 text-right mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 rounded-lg" style={{
                background: 'linear-gradient(145deg, #1a1a1a, #2a1a1a)',
                border: '2px solid rgba(220, 38, 38, 0.3)',
                boxShadow: '0 4px 10px rgba(220, 38, 38, 0.1)'
              }}>
                {selectedToken && (
                  <div className="mb-3 flex items-center gap-2">
                    <div className="text-xs text-gray-400">Speaking as:</div>
                    <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs px-2 py-1 shadow-lg">
                      🗡️ {selectedToken.name}
                    </Badge>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Speak your words, adventurer..."
                    className="text-sm bg-gray-800 border-gray-600 focus:border-red-400 focus:ring-red-400/20 text-white placeholder-gray-400"
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    style={{
                      background: 'linear-gradient(145deg, #374151, #1f2937)',
                      borderColor: '#dc2626'
                    }}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim()}
                    size="sm"
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-red-500 shadow-lg"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="dice" className="h-full flex flex-col mt-2 space-y-3">
              {/* Quick Dice */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Quick Roll</h4>
                <div className="grid grid-cols-3 gap-1">
                  {quickDice.map(({ sides, icon: Icon, color }) => (
                    <Button
                      key={sides}
                      onClick={() => rollDice(sides, 1, `d${sides}`)}
                      className={`dice-roll-premium text-xs ${color}`}
                      size="sm"
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      d{sides}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Advantage/Disadvantage & Modifier */}
              <div className="space-y-2">
                <div className="flex gap-3 text-xs">
                  <div className="flex items-center space-x-1">
                    <Switch
                      checked={advantage}
                      onCheckedChange={(checked) => {
                        setAdvantage(checked);
                        if (checked) setDisadvantage(false);
                      }}
                      className="scale-75"
                    />
                    <label>Adv</label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Switch
                      checked={disadvantage}
                      onCheckedChange={(checked) => {
                        setDisadvantage(checked);
                        if (checked) setAdvantage(false);
                      }}
                      className="scale-75"
                    />
                    <label>Dis</label>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs">Mod:</span>
                  <Slider
                    value={[modifier]}
                    onValueChange={(value) => setModifier(value[0])}
                    max={10}
                    min={-10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs w-8">{modifier}</span>
                </div>
              </div>

              {/* Custom Roll */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Custom Roll</h4>
                <div className="flex gap-2">
                  <Input
                    value={customRoll}
                    onChange={(e) => setCustomRoll(e.target.value)}
                    placeholder="2d6+3"
                    className="fantasy-input text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && rollCustom()}
                  />
                  <Button onClick={rollCustom} size="sm" className="fantasy-button-emerald">
                    Roll
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="initiative" className="h-full flex flex-col mt-2 space-y-3">
              {/* Round & Turn Info */}
              <div className="flex justify-between items-center stat-block-premium">
                <div className="text-center">
                  <div className="character-stat-label">Round</div>
                  <div className="character-stat-number text-lg">{initiative.round}</div>
                </div>
                <div className="text-center">
                  <div className="character-stat-label">Turn</div>
                  <div className="character-stat-number text-lg">{initiative.turn + 1}</div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-1">
                <Button
                  onClick={() => setShowAddCombatant(!showAddCombatant)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
                
                <Button
                  onClick={handleNextTurn}
                  disabled={initiative.combatants.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <SkipForward className="w-3 h-3 mr-1" />
                  Next
                </Button>
              </div>

              {/* Add Combatant Form */}
              {showAddCombatant && (
                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-3 space-y-2">
                    <Input
                      placeholder="Name"
                      value={newCombatant.name}
                      onChange={(e) => setNewCombatant({ ...newCombatant, name: e.target.value })}
                      className="bg-gray-600 border-gray-500 text-sm"
                    />
                    
                    <Input
                      type="number"
                      placeholder="Initiative"
                      value={newCombatant.initiative}
                      onChange={(e) => setNewCombatant({ ...newCombatant, initiative: e.target.value })}
                      className="bg-gray-600 border-gray-500 text-sm"
                    />
                    
                    <div className="flex gap-1">
                      <Button onClick={handleAddCombatant} className="flex-1 bg-green-600 hover:bg-green-700" size="sm">
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddCombatant(false)}
                        className="flex-1"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Combatants List */}
              <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
                {initiative.combatants.map((combatant, index) => (
                  <Card
                    key={combatant.id}
                    className={`border text-xs ${
                      index === initiative.turn
                        ? 'bg-blue-900/50 border-blue-500'
                        : 'bg-gray-700 border-gray-600'
                    }`}
                  >
                    <CardContent className="p-2">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-sm">
                              {isPlayerView && combatant.hideNameFromPlayers ? 
                                `${combatant.characterClass || 'Creature'} ${index + 1}` : 
                                combatant.name
                              }
                            </span>
                            {index === initiative.turn && (
                              <Badge className="bg-blue-600 text-xs h-4">Current</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-400">
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
                            className="p-1 h-6 w-6"
                          >
                            <Dice6 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCombatant(combatant.id)}
                            className="text-red-400 hover:text-red-300 p-1 h-6 w-6"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {initiative.combatants.length === 0 && (
                  <div className="text-center text-gray-400 py-4 text-sm">
                    No combatants added
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChatDiceInitiative;