import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  MessageCircle, 
  Dice6, 
  Send, 
  Mic, 
  MicOff,
  Minus,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';

const PermanentChatWindow = ({ 
  defaultHeight = 300, 
  minHeight = 200, 
  onHeightChange,
  isMinimized = false,
  onToggleMinimize 
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      content: 'Welcome to The Dragon Stones! Chat and dice rolling enabled.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [height, setHeight] = useState(defaultHeight);
  const [isResizing, setIsResizing] = useState(false);
  
  const chatEndRef = useRef(null);
  const resizeRef = useRef(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(defaultHeight);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Dice rolling function
  const rollDice = useCallback((expression) => {
    try {
      // Parse dice expressions like "2d6+3", "1d20", "3d8-1"
      const diceRegex = /(\d+)?d(\d+)([+\-]\d+)?/gi;
      let match;
      let total = 0;
      let breakdown = [];

      while ((match = diceRegex.exec(expression)) !== null) {
        const count = parseInt(match[1]) || 1;
        const sides = parseInt(match[2]);
        const modifier = parseInt(match[3]) || 0;

        let rolls = [];
        let subtotal = 0;

        for (let i = 0; i < count; i++) {
          const roll = Math.floor(Math.random() * sides) + 1;
          rolls.push(roll);
          subtotal += roll;
        }

        subtotal += modifier;
        total += subtotal;

        const rollString = `${count}d${sides}${modifier >= 0 ? '+' + modifier : modifier}`;
        const rollBreakdown = `[${rolls.join(', ')}]${modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : ''}`;
        breakdown.push(`${rollString}: ${rollBreakdown} = ${subtotal}`);
      }

      return {
        expression,
        total,
        breakdown: breakdown.join('; '),
        success: true
      };
    } catch (error) {
      return {
        expression,
        error: 'Invalid dice expression',
        success: false
      };
    }
  }, []);

  const addMessage = useCallback((content, type = 'user', diceResult = null) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      type,
      content,
      diceResult,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;

    // Check if message contains dice rolls
    const diceRegex = /(\d+)?d(\d+)([+\-]\d+)?/gi;
    if (diceRegex.test(inputValue)) {
      const result = rollDice(inputValue);
      addMessage(inputValue, 'dice', result);
    } else {
      addMessage(inputValue, 'user');
    }

    setInputValue('');
  }, [inputValue, rollDice, addMessage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Quick dice roll buttons
  const quickRolls = [
    { label: 'd20', expression: '1d20' },
    { label: 'd12', expression: '1d12' },
    { label: 'd10', expression: '1d10' },
    { label: 'd8', expression: '1d8' },
    { label: 'd6', expression: '1d6' },
    { label: 'd4', expression: '1d4' },
  ];

  const handleQuickRoll = useCallback((expression) => {
    const result = rollDice(expression);
    addMessage(expression, 'dice', result);
  }, [rollDice, addMessage]);

  // Resizing functionality
  const handleMouseDown = useCallback((e) => {
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    e.preventDefault();
  }, [height]);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    
    const deltaY = startYRef.current - e.clientY;
    const newHeight = Math.max(minHeight, Math.min(600, startHeightRef.current + deltaY));
    setHeight(newHeight);
    onHeightChange?.(newHeight);
  }, [isResizing, minHeight, onHeightChange]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <Card 
      className="fantasy-card text-white shadow-lg shadow-green-500/10 flex flex-col"
      style={{ height: isMinimized ? 'auto' : height }}
    >
      {/* Resize Handle */}
      {!isMinimized && (
        <div
          ref={resizeRef}
          className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize bg-green-500/20 hover:bg-green-500/40 transition-colors"
          onMouseDown={handleMouseDown}
        />
      )}

      <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-green-500/30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-green-400" />
            <CardTitle className="text-lg dragon-stones-title">Chat & Dice</CardTitle>
            <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
              {messages.length - 1} msgs
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="text-blue-400 hover:text-blue-300 w-6 h-6 p-0"
              title={isMinimized ? "Expand Chat" : "Minimize Chat"}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="flex-1 overflow-hidden p-0">
            {/* Messages Area */}
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-3 space-y-3 fantasy-scrollbar">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-1">
                    <div className={`flex items-start gap-2 ${
                      message.type === 'system' ? 'justify-center' : 'justify-start'
                    }`}>
                      <div className={`rounded-lg p-2 max-w-[80%] ${
                        message.type === 'system' 
                          ? 'bg-blue-900/30 border border-blue-700/50 text-center text-sm'
                          : message.type === 'dice'
                          ? 'bg-purple-900/30 border border-purple-700/50'
                          : 'bg-gray-800 border border-gray-700'
                      }`}>
                        {message.type === 'dice' && message.diceResult ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Dice6 className="w-4 h-4 text-purple-400" />
                              <span className="font-mono text-sm">{message.content}</span>
                            </div>
                            {message.diceResult.success ? (
                              <>
                                <div className="text-lg font-bold text-yellow-400">
                                  Total: {message.diceResult.total}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {message.diceResult.breakdown}
                                </div>
                              </>
                            ) : (
                              <div className="text-red-400 text-sm">
                                {message.diceResult.error}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Dice Rolls */}
              <div className="border-t border-gray-700 p-2 bg-gray-900/50">
                <div className="flex gap-1 flex-wrap mb-2">
                  <span className="text-xs text-gray-400 flex items-center gap-1 mr-2">
                    <Dice6 className="w-3 h-3" />
                    Quick:
                  </span>
                  {quickRolls.map((roll) => (
                    <Button
                      key={roll.label}
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickRoll(roll.expression)}
                      className="h-6 px-2 text-xs border-purple-600/50 text-purple-300 hover:bg-purple-900/30"
                    >
                      {roll.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-3 bg-gray-900/30 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type message or dice roll (e.g., 2d6+3)..."
                className="flex-1 bg-gray-800 border-gray-600 focus:border-green-500"
              />
              <Button
                onClick={() => {
                  setIsRecording(!isRecording);
                }}
                size="sm"
                variant="outline"
                className={`${
                  isRecording 
                    ? 'border-red-500 text-red-400 bg-red-900/30' 
                    : 'border-gray-600 text-gray-400'
                }`}
                title="Voice input (coming soon)"
                disabled
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Tip: Use dice notation like "1d20+5", "2d6", "3d8-2" for rolls
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default PermanentChatWindow;