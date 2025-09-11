import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Users, Target, Shield, Heart } from 'lucide-react';

const TokenSelectionModal = ({ 
  tokens, 
  onSelectToken, 
  onClose, 
  selectedTokenIds = [] 
}) => {
  const [localSelectedIds, setLocalSelectedIds] = useState(new Set(selectedTokenIds));

  const handleTokenSelect = (token) => {
    if (localSelectedIds.has(token.id)) return; // Already selected
    
    const newSelected = new Set(localSelectedIds);
    newSelected.add(token.id);
    setLocalSelectedIds(newSelected);
    
    // Create initiative entry for the token
    const initiativeEntry = {
      id: `token_${token.id}_${Date.now()}`,
      name: token.name || `Token ${token.id}`,
      type: 'token',
      tokenId: token.id,
      initiative: 0,
      hp: {
        current: token.hp?.current || token.hp || 10,
        max: token.hp?.max || token.hp || 10
      },
      ac: token.ac || 10,
      isActive: true,
      conditions: []
    };
    
    onSelectToken(initiativeEntry);
  };

  const availableTokens = tokens.filter(token => token && token.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <Card className="fantasy-card w-[600px] max-h-[80vh] text-white shadow-2xl border-2 border-green-500/50">
        <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-green-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-green-400" />
              <CardTitle className="text-xl dragon-stones-title">
                Add Tokens to Initiative
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="mb-4">
            <p className="text-gray-300 text-sm mb-2">
              Select tokens from the battlefield to add them to initiative order:
            </p>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              {availableTokens.length} tokens available
            </Badge>
          </div>

          {availableTokens.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 text-lg mb-2">No Tokens on Battlefield</p>
              <p className="text-gray-500 text-sm">
                Add some tokens to the map first, then you can add them to initiative.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto fantasy-scrollbar">
              {availableTokens.map((token) => {
                const isSelected = localSelectedIds.has(token.id);
                const wasAlreadySelected = selectedTokenIds.includes(token.id);
                
                return (
                  <div
                    key={token.id}
                    className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                      isSelected || wasAlreadySelected
                        ? 'bg-gray-700 border-gray-500 opacity-60 cursor-not-allowed'
                        : 'bg-gray-800 border-gray-600 hover:border-green-500 hover:bg-gray-750'
                    }`}
                    onClick={() => !isSelected && !wasAlreadySelected && handleTokenSelect(token)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Token Visual */}
                        <div 
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                            token.isDefeated 
                              ? 'bg-red-900 border-red-600 text-red-300'
                              : 'bg-blue-600 border-blue-400 text-white'
                          }`}
                          style={{ 
                            backgroundColor: token.color || '#3b82f6',
                            borderColor: token.color ? `${token.color}80` : '#60a5fa'
                          }}
                        >
                          {token.name ? token.name.charAt(0).toUpperCase() : 'T'}
                        </div>

                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {token.name || `Token ${token.id}`}
                            {token.isDefeated && (
                              <Badge variant="outline" className="text-red-400 border-red-400 text-xs">
                                Defeated
                              </Badge>
                            )}
                            {(isSelected || wasAlreadySelected) && (
                              <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                                Added
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              AC: {token.ac || 10}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              HP: {token.hp?.current || token.hp || 10}/{token.hp?.max || token.hp || 10}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Position Info */}
                      <div className="text-xs text-gray-500">
                        X: {Math.round(token.x || 0)}, Y: {Math.round(token.y || 0)}
                      </div>
                    </div>

                    {/* Health Bar */}
                    <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (token.hp?.current || token.hp || 10) <= 0 
                            ? 'bg-red-900' 
                            : (token.hp?.current || token.hp || 10) <= (token.hp?.max || token.hp || 10) * 0.25
                            ? 'bg-red-500'
                            : (token.hp?.current || token.hp || 10) <= (token.hp?.max || token.hp || 10) * 0.5
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${Math.max(0, Math.min(100, ((token.hp?.current || token.hp || 10) / (token.hp?.max || token.hp || 10)) * 100))}%` 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenSelectionModal;