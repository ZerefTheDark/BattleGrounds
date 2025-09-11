import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { 
  User, 
  Heart, 
  Maximize2, 
  Sword, 
  Wand2,
  Shield
} from 'lucide-react';

const CompactCharacterSheet = ({ character, onOpenFullSheet, onClose, onUpdateCharacter }) => {
  const [showSpells, setShowSpells] = useState(false);
  const [currentHP, setCurrentHP] = useState(character?.hitPoints?.current || character?.hitPoints?.max || 8);

  const updateHP = (newHP) => {
    setCurrentHP(newHP);
    if (onUpdateCharacter) {
      onUpdateCharacter({
        ...character,
        hitPoints: {
          ...character.hitPoints,
          current: newHP
        }
      });
    }
  };

  const getModifier = (score) => {
    return Math.floor((score - 10) / 2);
  };

  const formatModifier = (modifier) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const maxHP = character?.hitPoints?.max || 8;
  const hpPercentage = (currentHP / maxHP) * 100;

  return (
    <Card className="fantasy-card w-[350px] text-white shadow-lg shadow-green-500/10">
      <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-green-500/30 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-green-400" />
            <CardTitle className="text-lg dragon-stones-title">
              {character?.name || 'Unknown Character'}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenFullSheet}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 text-xs px-2"
            >
              <Maximize2 className="w-3 h-3 mr-1" />
              Full
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/30 w-6 h-6 p-0"
              >
                ×
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Health Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-400" />
              Hit Points
            </span>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={currentHP}
                onChange={(e) => updateHP(parseInt(e.target.value) || 0)}
                className="w-16 h-6 text-xs text-center bg-gray-700 border-gray-600"
                min="0"
                max={maxHP}
              />
              <span className="text-sm text-gray-400">/ {maxHP}</span>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                hpPercentage <= 0 
                  ? 'bg-red-900' 
                  : hpPercentage <= 25
                  ? 'bg-red-500'
                  : hpPercentage <= 50
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, hpPercentage))}%` }}
            />
          </div>
        </div>

        {/* Ability Scores */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-green-400">Ability Scores</h4>
          <div className="grid grid-cols-3 gap-2">
            {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((ability) => {
              const score = character?.stats?.[ability] || 10;
              const modifier = getModifier(score);
              return (
                <div key={ability} className="text-center bg-gray-800 rounded p-2">
                  <div className="text-xs font-bold text-gray-300">{ability}</div>
                  <div className="text-lg font-bold">{score}</div>
                  <div className="text-xs text-gray-400">
                    {formatModifier(modifier)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Combat/Spells Toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sword className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium">Attacks</span>
              <Switch
                checked={showSpells}
                onCheckedChange={setShowSpells}
                className="mx-2"
              />
              <span className="text-sm font-medium">Spells</span>
              <Wand2 className="w-4 h-4 text-purple-400" />
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-gray-800 rounded p-3 min-h-[120px]">
            {!showSpells ? (
              // Attacks Section
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-orange-400 uppercase">Attacks</h5>
                {character?.attacks && character.attacks.length > 0 ? (
                  character.attacks.map((attack, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded text-sm">
                      <div>
                        <div className="font-medium">{attack.name}</div>
                        <div className="text-xs text-gray-400">
                          {attack.attackBonus ? `+${attack.attackBonus} to hit` : ''} • {attack.damage || 'No damage'}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {attack.range || 'Melee'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 text-sm py-4">
                    <Sword className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p>No attacks configured</p>
                    <p className="text-xs">Use "Full" sheet to add attacks</p>
                  </div>
                )}
              </div>
            ) : (
              // Spells Section
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-purple-400 uppercase">Spells</h5>
                  {character?.spellSlots && (
                    <div className="text-xs text-gray-400">
                      Slots: {Object.entries(character.spellSlots).map(([level, slots]) => 
                        `L${level}:${slots.current}/${slots.max}`
                      ).join(' • ')}
                    </div>
                  )}
                </div>
                
                {character?.spells && character.spells.length > 0 ? (
                  character.spells.slice(0, 4).map((spell, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded text-sm">
                      <div>
                        <div className="font-medium">{spell.name}</div>
                        <div className="text-xs text-gray-400">
                          Level {spell.level} • {spell.school}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {spell.castingTime || 'Action'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 text-sm py-4">
                    <Wand2 className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p>No spells configured</p>
                    <p className="text-xs">Use "Full" sheet to add spells</p>
                  </div>
                )}
                
                {character?.spells && character.spells.length > 4 && (
                  <div className="text-center text-xs text-gray-500 pt-2">
                    +{character.spells.length - 4} more spells...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Key Abilities */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-green-400">Key Abilities</h4>
          <div className="bg-gray-800 rounded p-3 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-400" />
                AC
              </span>
              <span>{character?.armorClass || 10}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Speed</span>
              <span>{character?.speed || 30} ft</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Prof. Bonus</span>
              <span>+{character?.proficiencyBonus || 2}</span>
            </div>
            {character?.features && character.features.slice(0, 2).map((feature, index) => (
              <div key={index} className="text-xs text-gray-400 border-t border-gray-700 pt-1 mt-1">
                <span className="font-medium">{feature.name}:</span> {feature.description?.substring(0, 60)}...
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactCharacterSheet;