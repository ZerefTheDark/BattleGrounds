import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  MessageSquare, 
  Dice6, 
  Send, 
  Users,
  Settings,
  FileText,
  Swords,
  Shield,
  Sparkles
} from 'lucide-react';
import { useBattleMapStore } from '../store/battleMapStore';
import DraggableWindow from './DraggableWindow';
import InitiativeTracker from './InitiativeTracker';
import TokenPanel from './TokenPanel';
import CharacterSheet from './CharacterSheet';

const UnifiedChatPanel = () => {
  const {
    chatMessages,
    addChatMessage,
    selectedTokenId,
    tokens,
    selectToken
  } = useBattleMapStore();

  // Chat state
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('say');
  const [customRoll, setCustomRoll] = useState('');
  const messagesEndRef = useRef(null);

  // Module windows state
  const [openWindows, setOpenWindows] = useState({
    tokens: false,
    initiative: false,
    characterSheet: false
  });

  // Window management
  const [windowStates, setWindowStates] = useState({
    tokens: { x: 400, y: 100, width: 350, height: 500, zIndex: 1000, minimized: false },
    initiative: { x: 450, y: 150, width: 400, height: 600, zIndex: 1001, minimized: false },
    characterSheet: { x: 500, y: 200, width: 600, height: 700, zIndex: 1002, minimized: false }
  });

  const selectedToken = tokens.find(t => t.id === selectedTokenId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Dice rolling function with critical detection
  const rollDice = useCallback((expression, label = '') => {
    try {
      // Parse dice expression (e.g., "1d20", "2d6+3")
      const match = expression.match(/(\d+)?d(\d+)([+-]\d+)?/i);
      if (!match) {
        addChatMessage({
          type: 'system',
          who: 'System',
          text: `Invalid dice expression: ${expression}`,
          timestamp: Date.now()
        });
        return;
      }

      const count = parseInt(match[1]) || 1;
      const sides = parseInt(match[2]);
      const modifier = parseInt(match[3]) || 0;

      const results = [];
      for (let i = 0; i < count; i++) {
        results.push(Math.floor(Math.random() * sides) + 1);
      }

      const total = results.reduce((sum, roll) => sum + roll, 0) + modifier;
      const isCritical = sides === 20 && results.some(r => r === 1 || r === 20);
      const isNat20 = sides === 20 && results.some(r => r === 20);
      const isNat1 = sides === 20 && results.some(r => r === 1);

      // Show epic display for natural 20s and 1s
      if (isNat20 || isNat1) {
        showEpicD20Display(isNat20 ? 20 : 1);
      }

      const formula = `${count}d${sides}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}`;
      
      addChatMessage({
        type: 'roll',
        who: selectedToken?.name || 'GM',
        formula,
        results,
        total,
        note: label,
        isCritical,
        isNat20,
        isNat1,
        timestamp: Date.now()
      });
    } catch (error) {
      addChatMessage({
        type: 'system',
        who: 'System',
        text: `Error rolling dice: ${error.message}`,
        timestamp: Date.now()
      });
    }
  }, [selectedToken, addChatMessage]);

  // Epic D20 display for critical rolls
  const showEpicD20Display = (value) => {
    const epicDiv = document.createElement('div');
    epicDiv.className = `epic-d20-display ${value === 20 ? 'critical-success' : 'critical-fail'}`;
    epicDiv.textContent = value === 20 ? '🎲 20!' : '🎲 1!';
    document.body.appendChild(epicDiv);

    setTimeout(() => {
      document.body.removeChild(epicDiv);
    }, 3000);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    // Check if message contains dice roll
    const dicePattern = /(\d+)?d(\d+)([+-]\d+)?/i;
    if (dicePattern.test(newMessage)) {
      const matches = newMessage.match(dicePattern);
      if (matches) {
        rollDice(matches[0], newMessage.replace(matches[0], '').trim());
        setNewMessage('');
        return;
      }
    }

    addChatMessage({
      type: messageType,
      who: selectedToken?.name || 'GM',
      text: newMessage,
      timestamp: Date.now()
    });

    setNewMessage('');
  };

  const rollCustomDice = () => {
    if (!customRoll.trim()) return;
    rollDice(customRoll);
    setCustomRoll('');
  };

  // Quick dice roll buttons
  const quickRolls = [
    { label: 'd4', expression: '1d4' },
    { label: 'd6', expression: '1d6' },
    { label: 'd8', expression: '1d8' },
    { label: 'd10', expression: '1d10' },
    { label: 'd12', expression: '1d12' },
    { label: 'd20', expression: '1d20', special: true },
  ];

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const openWindow = (windowType) => {
    setOpenWindows(prev => ({ ...prev, [windowType]: true }));
    // Bring window to front
    setWindowStates(prev => ({
      ...prev,
      [windowType]: {
        ...prev[windowType],
        zIndex: Math.max(...Object.values(prev).map(w => w.zIndex)) + 1
      }
    }));
  };

  const closeWindow = (windowType) => {
    setOpenWindows(prev => ({ ...prev, [windowType]: false }));
  };

  const bringToFront = (windowType) => {
    const maxZ = Math.max(...Object.values(windowStates).map(w => w.zIndex));
    setWindowStates(prev => ({
      ...prev,
      [windowType]: {
        ...prev[windowType],
        zIndex: maxZ + 1
      }
    }));
  };

  const updateWindowState = (windowType, updates) => {
    setWindowStates(prev => ({
      ...prev,
      [windowType]: {
        ...prev[windowType],
        ...updates
      }
    }));
  };

  const renderMessage = (message) => {
    const messageClass = `gothic-chat-message ${
      message.type === 'roll' ? 'dice-roll' : ''
    } ${message.isCritical ? 'critical-roll' : ''}`;

    return (
      <div className={messageClass}>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-gothic-lime-bright">{message.who}</span>
          {message.type === 'roll' && (
            <Badge className="bg-gothic-lime-dark text-onyx-black text-xs">
              Roll
            </Badge>
          )}
          {message.note && (
            <Badge variant="outline" className="text-xs border-gothic-lime text-gothic-lime">
              {message.note}
            </Badge>
          )}
        </div>
        
        {message.type === 'roll' ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Dice6 className="w-4 h-4 text-gothic-lime-bright" />
              <span className="font-mono text-sm">{message.formula}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-300">Rolls:</span>
              <span className="text-gothic-lime-bright font-mono">
                [{message.results.join(', ')}]
              </span>
            </div>
            <div className={`text-lg font-bold ${
              message.isNat20 ? 'text-yellow-400' : 
              message.isNat1 ? 'text-red-400' : 
              'text-gothic-lime-bright'
            }`}>
              Total: {message.total}
              {message.isNat20 && ' ⭐ CRITICAL!'}
              {message.isNat1 && ' 💀 FUMBLE!'}
            </div>
          </div>
        ) : (
          <div className="text-white whitespace-pre-wrap">{message.text}</div>
        )}
        
        <div className="text-xs text-gray-500 text-right mt-2">
          {formatTime(message.timestamp)}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Main Chat Panel - Fixed Left Position */}
      <div className="fixed left-4 top-4 bottom-4 w-96 z-50">
        <Card className="gothic-chat-panel h-full flex flex-col">
          <CardHeader className="gothic-chat-header pb-3">
            <CardTitle className="text-center text-lg text-gothic-lime-bright font-bold">
              ⚔️ Battle Chat & Dice ⚔️
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-4 space-y-4">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto gothic-scrollbar pr-2">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gothic-lime py-8">
                  <Swords className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Ready for battle! Start chatting or rolling dice.</p>
                </div>
              ) : (
                chatMessages.map((message, index) => (
                  <div key={message.id || index}>
                    {renderMessage(message)}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Dice Buttons */}
            <div className="border-t border-gothic-lime-dark pt-3">
              <div className="text-xs text-gothic-lime mb-2 font-bold">Quick Rolls:</div>
              <div className="grid grid-cols-6 gap-1">
                {quickRolls.map((roll) => (
                  <Button
                    key={roll.label}
                    onClick={() => rollDice(roll.expression)}
                    className={`gothic-dice-button text-xs h-8 ${
                      roll.special ? 'd20' : ''
                    }`}
                    variant="outline"
                  >
                    {roll.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Dice Roll */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={customRoll}
                  onChange={(e) => setCustomRoll(e.target.value)}
                  placeholder="1d20+5"
                  className="gothic-input flex-1 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && rollCustomDice()}
                />
                <Button
                  onClick={rollCustomDice}
                  className="gothic-dice-button"
                  disabled={!customRoll.trim()}
                >
                  <Dice6 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Speaking As */}
            {selectedToken && (
              <div className="text-center">
                <Badge className="bg-gothic-lime-dark text-onyx-black text-xs">
                  Speaking as: {selectedToken.name}
                </Badge>
              </div>
            )}

            {/* Message Input */}
            <div className="space-y-2">
              <div className="flex gap-1">
                <Button
                  variant={messageType === 'say' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMessageType('say')}
                  className="gothic-dice-button text-xs"
                >
                  Say
                </Button>
                <Button
                  variant={messageType === 'whisper' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMessageType('whisper')}
                  className="gothic-dice-button text-xs"
                >
                  Whisper
                </Button>
                <Button
                  variant={messageType === 'emote' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMessageType('emote')}
                  className="gothic-dice-button text-xs"
                >
                  Emote
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type message or dice (e.g., 1d20+5)..."
                  className="gothic-input flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button
                  onClick={sendMessage}
                  className="gothic-dice-button"
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module Tabs - Attached to outside of chat box */}
        <div className="absolute -right-16 top-20 space-y-2">
          <Button
            onClick={() => openWindow('tokens')}
            className="gothic-tab w-14 h-14 flex flex-col items-center justify-center text-xs"
            variant="outline"
          >
            <Users className="w-5 h-5 mb-1" />
            Tokens
          </Button>
          
          <Button
            onClick={() => openWindow('initiative')}
            className="gothic-tab w-14 h-14 flex flex-col items-center justify-center text-xs"
            variant="outline"
          >
            <Settings className="w-5 h-5 mb-1" />
            Initiative
          </Button>
          
          <Button
            onClick={() => openWindow('characterSheet')}
            className="gothic-tab w-14 h-14 flex flex-col items-center justify-center text-xs"
            variant="outline"
          >
            <FileText className="w-5 h-5 mb-1" />
            Character
          </Button>
        </div>
      </div>

      {/* Draggable Module Windows */}
      {openWindows.tokens && (
        <DraggableWindow
          title="Token Management"
          onClose={() => closeWindow('tokens')}
          onFocus={() => bringToFront('tokens')}
          initialPosition={{ x: windowStates.tokens.x, y: windowStates.tokens.y }}
          initialSize={{ width: windowStates.tokens.width, height: windowStates.tokens.height }}
          zIndex={windowStates.tokens.zIndex}
          isMinimized={windowStates.tokens.minimized}
          onPositionChange={(pos) => updateWindowState('tokens', pos)}
          onSizeChange={(size) => updateWindowState('tokens', size)}
          onMinimizeChange={(minimized) => updateWindowState('tokens', { minimized })}
          className="gothic-window"
        >
          <TokenPanel />
        </DraggableWindow>
      )}

      {openWindows.initiative && (
        <DraggableWindow
          title="Initiative Tracker"
          onClose={() => closeWindow('initiative')}
          onFocus={() => bringToFront('initiative')}
          initialPosition={{ x: windowStates.initiative.x, y: windowStates.initiative.y }}
          initialSize={{ width: windowStates.initiative.width, height: windowStates.initiative.height }}
          zIndex={windowStates.initiative.zIndex}
          isMinimized={windowStates.initiative.minimized}
          onPositionChange={(pos) => updateWindowState('initiative', pos)}
          onSizeChange={(size) => updateWindowState('initiative', size)}
          onMinimizeChange={(minimized) => updateWindowState('initiative', { minimized })}
          className="gothic-window"
        >
          <InitiativeTracker />
        </DraggableWindow>
      )}

      {openWindows.characterSheet && (
        <DraggableWindow
          title="Character Sheet"
          onClose={() => closeWindow('characterSheet')}
          onFocus={() => bringToFront('characterSheet')}
          initialPosition={{ x: windowStates.characterSheet.x, y: windowStates.characterSheet.y }}
          initialSize={{ width: windowStates.characterSheet.width, height: windowStates.characterSheet.height }}
          zIndex={windowStates.characterSheet.zIndex}
          isMinimized={windowStates.characterSheet.minimized}
          onPositionChange={(pos) => updateWindowState('characterSheet', pos)}
          onSizeChange={(size) => updateWindowState('characterSheet', size)}
          onMinimizeChange={(minimized) => updateWindowState('characterSheet', { minimized })}
          className="gothic-window"
        >
          <CharacterSheet />
        </DraggableWindow>
      )}
    </>
  );
};

export default UnifiedChatPanel;