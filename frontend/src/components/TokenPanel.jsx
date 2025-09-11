import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
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
          onClick={() => {
            console.log('Create Token button clicked, setting showTokenModal to true');
            setShowTokenModal(true);
          }}
          className="fantasy-button-emerald w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Token
        </Button>



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
      
      <TokenCreationModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onCreateToken={(tokenData) => {
          handleCreateToken(tokenData);
          setShowTokenModal(false);
        }}
      />
    </Card>
  );
};

export default TokenPanel;