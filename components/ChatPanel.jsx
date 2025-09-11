import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { X, Send, Dice6 } from 'lucide-react';
import { useBattleMapStore } from '../store/battleMapStore';

const ChatPanel = ({ onClose }) => {
  const { chatMessages, addChatMessage, selectedTokenId, tokens } = useBattleMapStore();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const selectedToken = tokens.find(t => t.id === selectedTokenId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

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

  const renderMessage = (message) => {
    switch (message.type) {
      case 'roll':
        return (
          <div className="bg-blue-900/50 border border-blue-700 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <Dice6 className="w-4 h-4 text-blue-400" />
              <span className="font-medium text-blue-300">{message.who}</span>
              {message.note && (
                <Badge variant="secondary" className="text-xs">
                  {message.note}
                </Badge>
              )}
            </div>
            <div className="text-sm">
              <span className="text-gray-300">{message.formula}: </span>
              {message.results && (
                <span className="text-gray-400">
                  [{message.results.join(', ')}] = 
                </span>
              )}
              <span className="font-bold text-white text-lg ml-1">
                {message.total}
              </span>
            </div>
          </div>
        );

      case 'spell':
        return (
          <div className="bg-purple-900/50 border border-purple-700 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-purple-400">✨</span>
              <span className="font-medium text-purple-300">{message.who}</span>
            </div>
            <div className="text-sm text-gray-300">{message.text}</div>
          </div>
        );

      case 'system':
        return (
          <div className="bg-gray-700/50 border border-gray-600 rounded p-2 text-center">
            <span className="text-gray-400 text-sm italic">{message.text}</span>
          </div>
        );

      default:
        return (
          <div className="bg-gray-800 border border-gray-700 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-300">{message.who}</span>
            </div>
            <div className="text-sm text-gray-200">{message.text}</div>
          </div>
        );
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 text-white h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Chat</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            chatMessages.map((message, index) => (
              <div key={message.id || index} className="space-y-1">
                {renderMessage(message)}
                <div className="text-xs text-gray-500 text-right">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-700 p-4">
          {selectedToken && (
            <div className="mb-2">
              <Badge className="bg-blue-600 text-xs">
                Speaking as: {selectedToken.name}
              </Badge>
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="bg-gray-700 border-gray-600"
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;