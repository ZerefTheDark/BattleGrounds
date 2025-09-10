import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, X, Edit, Trash2, Users } from 'lucide-react';
import { useBattleMapStore } from '../store/battleMapStore';
import TokenCreationModal from './TokenCreationModal';

const TokenPanel = ({ onClose }) => {
  const { tokens, addToken, removeToken, updateToken, selectToken, selectedTokenId } = useBattleMapStore();
  
  const [showTokenModal, setShowTokenModal] = useState(false);

  const handleCreateToken = (tokenData) => {
    console.log('Creating token with data:', tokenData);
    addToken(tokenData);
  };

  const tokenColors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Gray', value: '#6b7280' },
    { name: 'Yellow', value: '#eab308' }
  ];

  return (
    <Card className="fantasy-card w-80 text-white h-full shadow-lg shadow-green-500/10 fantasy-scrollbar">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 border-b border-green-500/30">
        <CardTitle className="text-lg dragon-stones-title">Token Manager</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Close button clicked');
            onClose();
          }} 
          className="fantasy-button-emerald p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Create Token button clicked, current state:', showTokenCreator);
            setShowTokenCreator(!showTokenCreator);
          }}
          className="fantasy-button-emerald w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Token
        </Button>

        {showTokenCreator && (
          <Card className="fantasy-card">
            <CardContent className="p-4 space-y-3">
              <div>
                <Label htmlFor="token-name" className="character-stat-label">Name</Label>
                <Input
                  id="token-name"
                  value={newToken.name}
                  onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                  placeholder="Token name"
                  className="fantasy-input"
                />
              </div>
              
              <div>
                <Label className="character-stat-label">Shape</Label>
                <Select value={newToken.shape} onValueChange={(value) => setNewToken({ ...newToken, shape: value })}>
                  <SelectTrigger className="fantasy-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="fantasy-card">
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="character-stat-label">Size: {newToken.size}px</Label>
                <Slider
                  value={[newToken.size]}
                  onValueChange={(value) => setNewToken({ ...newToken, size: value[0] })}
                  max={75}
                  min={10}
                  step={2}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-green-400 mt-1">
                  <span>Tiny</span>
                  <span>Medium</span>
                  <span>Large</span>
                </div>
              </div>
              
              <div>
                <Label className="character-stat-label">Color</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {tokenColors.map((color) => (
                    <button
                      key={color.value}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                        newToken.color === color.value ? 'border-yellow-400 shadow-lg shadow-yellow-400/30' : 'border-gray-500 hover:border-green-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewToken({ ...newToken, color: color.value })}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCreateToken} className="fantasy-button-emerald flex-1">
                  Create
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowTokenCreator(false)}
                  className="fantasy-button flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saved Custom Tokens */}
        <div className="border-t border-gray-700 pt-3">
          <h3 className="text-sm font-semibold text-green-400 mb-2">Saved Token Templates</h3>
          <div className="grid grid-cols-2 gap-2">
            {JSON.parse(localStorage.getItem('custom_tokens') || '[]').slice(-6).map((savedToken) => (
              <Button
                key={savedToken.id}
                variant="outline"
                size="sm"
                className="h-8 text-xs border-gray-600 hover:border-green-500"
                onClick={() => {
                  addToken({
                    ...savedToken,
                    x: 0,
                    y: 0,
                    hp: { current: 100, max: 100 },
                    conditions: []
                  });
                }}
              >
                <div
                  className={`w-3 h-3 mr-1 border ${
                    savedToken.shape === 'circle' ? 'rounded-full' : 'rounded-sm'
                  }`}
                  style={{ backgroundColor: savedToken.color }}
                />
                {savedToken.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto fantasy-scrollbar">
          {tokens.map((token) => (
            <Card
              key={token.id}
              className={`stat-block-premium cursor-pointer transition-all duration-300 ${
                selectedTokenId === token.id ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/20' : ''
              }`}
              onClick={() => selectToken(token.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 border-2 border-gray-400 ${
                        token.shape === 'circle' ? 'rounded-full' : 'rounded-sm'
                      }`}
                      style={{ backgroundColor: token.color }}
                    />
                    <div>
                      <div className="font-medium">{token.name}</div>
                      <div className="text-sm text-gray-400">
                        {token.hp ? `${token.hp.current}/${token.hp.max} HP` : 'No HP set'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle character sheet
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeToken(token.id);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Token Size Control */}
                {selectedTokenId === token.id && (
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <Label className="text-xs">Size: {token.size}px</Label>
                    <Slider
                      value={[token.size]}
                      onValueChange={(value) => updateToken(token.id, { size: value[0] })}
                      max={150}
                      min={20}
                      step={5}
                      className="mt-1"
                    />
                  </div>
                )}
                
                {token.conditions && token.conditions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {token.conditions.map((condition, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-600 text-xs rounded"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {tokens.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No tokens created yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenPanel;