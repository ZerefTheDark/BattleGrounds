import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { X, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Plus } from 'lucide-react';
import { useBattleMapStore } from '../store/battleMapStore';

const DiceRoller = ({ onClose }) => {
  const { addChatMessage, selectedTokenId, tokens } = useBattleMapStore();
  const [customRoll, setCustomRoll] = useState('');
  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const [modifier, setModifier] = useState(0);

  const selectedToken = tokens.find(t => t.id === selectedTokenId);

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

  const quickDice = [
    { sides: 4, icon: Dice1, color: 'bg-red-600' },
    { sides: 6, icon: Dice2, color: 'bg-orange-600' },
    { sides: 8, icon: Dice3, color: 'bg-yellow-600' },
    { sides: 10, icon: Dice4, color: 'bg-green-600' },
    { sides: 12, icon: Dice5, color: 'bg-blue-600' },
    { sides: 20, icon: Dice6, color: 'bg-purple-600' }
  ];

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Dice Roller</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Dice */}
        <div>
          <h3 className="font-semibold mb-2">Quick Roll</h3>
          <div className="flex gap-2 flex-wrap">
            {quickDice.map(({ sides, icon: Icon, color }) => (
              <Button
                key={sides}
                onClick={() => rollDice(sides, 1, `d${sides}`)}
                className={`${color} hover:opacity-80`}
                size="sm"
              >
                <Icon className="w-4 h-4 mr-1" />
                d{sides}
              </Button>
            ))}
            <Button
              onClick={() => rollDice(100, 1, 'd100')}
              className="bg-gray-600 hover:bg-gray-700"
              size="sm"
            >
              d100
            </Button>
          </div>
        </div>

        {/* Advantage/Disadvantage */}
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="advantage"
              checked={advantage}
              onCheckedChange={(checked) => {
                setAdvantage(checked);
                if (checked) setDisadvantage(false);
              }}
            />
            <label htmlFor="advantage" className="text-sm">Advantage</label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="disadvantage"
              checked={disadvantage}
              onCheckedChange={(checked) => {
                setDisadvantage(checked);
                if (checked) setAdvantage(false);
              }}
            />
            <label htmlFor="disadvantage" className="text-sm">Disadvantage</label>
          </div>
        </div>

        {/* Modifier */}
        <div>
          <label className="text-sm">Modifier</label>
          <div className="flex gap-2 mt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModifier(modifier - 1)}
            >
              -
            </Button>
            <Input
              type="number"
              value={modifier}
              onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
              className="bg-gray-700 border-gray-600 text-center w-20"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModifier(modifier + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Custom Roll */}
        <div>
          <label className="text-sm">Custom Roll (e.g., 2d6+3)</label>
          <div className="flex gap-2 mt-1">
            <Input
              value={customRoll}
              onChange={(e) => setCustomRoll(e.target.value)}
              placeholder="1d20+5"
              className="bg-gray-700 border-gray-600"
              onKeyDown={(e) => e.key === 'Enter' && rollCustom()}
            />
            <Button onClick={rollCustom} className="bg-green-600 hover:bg-green-700">
              Roll
            </Button>
          </div>
        </div>

        {/* Common D20 Rolls */}
        <div>
          <h3 className="font-semibold mb-2">Common Rolls</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => rollDice(20, 1, 'Attack Roll')}
              className="text-sm"
            >
              Attack
            </Button>
            <Button
              variant="outline"
              onClick={() => rollDice(20, 1, 'Saving Throw')}
              className="text-sm"
            >
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => rollDice(20, 1, 'Ability Check')}
              className="text-sm"
            >
              Ability
            </Button>
            <Button
              variant="outline"
              onClick={() => rollDice(20, 1, 'Initiative')}
              className="text-sm"
            >
              Initiative
            </Button>
          </div>
        </div>

        {/* Active Character */}
        {selectedToken && (
          <div className="pt-2 border-t border-gray-600">
            <Badge className="bg-blue-600">
              Rolling as: {selectedToken.name}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiceRoller;