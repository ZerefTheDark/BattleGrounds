import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { 
  FileText, 
  User, 
  Sword, 
  Shield, 
  Heart, 
  Zap, 
  Save, 
  Eye,
  Edit,
  X
} from 'lucide-react';

const CharacterSheetViewer = ({ characterSheet, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(characterSheet.needsDataEntry || false);
  const [editedCharacter, setEditedCharacter] = useState({ ...characterSheet });

  const handleSave = () => {
    const updatedCharacter = {
      ...editedCharacter,
      needsDataEntry: false,
      lastModified: new Date().toISOString()
    };
    onSave(updatedCharacter);
    setIsEditing(false);
  };

  const updateField = (field, value) => {
    setEditedCharacter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedField = (parentField, childField, value) => {
    setEditedCharacter(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const getAbilityModifier = (score) => {
    return Math.floor((score - 10) / 2);
  };

  const formatModifier = (modifier) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <Card className="fantasy-card w-[800px] text-white h-full shadow-lg shadow-green-500/10 fantasy-scrollbar">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 border-b border-green-500/30">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-green-400" />
          <CardTitle className="text-lg dragon-stones-title">
            {editedCharacter.name} - Character Sheet
          </CardTitle>
          {characterSheet.needsDataEntry && (
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              Needs Data Entry
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm" 
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
          >
            {isEditing ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            {isEditing ? 'View' : 'Edit'}
          </Button>
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="text-green-400 hover:text-green-300 hover:bg-green-900/30"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* PDF Preview */}
        {characterSheet.fileData && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-green-400">Original PDF</h3>
            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-sm font-medium">{characterSheet.fileName}</div>
                    <div className="text-xs text-gray-400">
                      {(characterSheet.fileSize / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(characterSheet.fileData, '_blank')}
                >
                  View PDF
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-green-400 flex items-center gap-2">
            <User className="w-4 h-4" />
            Basic Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Character Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editedCharacter.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="bg-gray-700 border-gray-600"
                />
              ) : (
                <div className="p-2 bg-gray-800 rounded border">{editedCharacter.name}</div>
              )}
            </div>
            <div>
              <Label htmlFor="level">Level</Label>
              {isEditing ? (
                <Input
                  id="level"
                  type="number"
                  value={editedCharacter.level}
                  onChange={(e) => updateField('level', parseInt(e.target.value) || 1)}
                  className="bg-gray-700 border-gray-600"
                />
              ) : (
                <div className="p-2 bg-gray-800 rounded border">{editedCharacter.level}</div>
              )}
            </div>
            <div>
              <Label htmlFor="race">Race</Label>
              {isEditing ? (
                <Input
                  id="race"
                  value={editedCharacter.race}
                  onChange={(e) => updateField('race', e.target.value)}
                  className="bg-gray-700 border-gray-600"
                />
              ) : (
                <div className="p-2 bg-gray-800 rounded border">{editedCharacter.race}</div>
              )}
            </div>
            <div>
              <Label htmlFor="class">Class</Label>
              {isEditing ? (
                <Input
                  id="class"
                  value={editedCharacter.class}
                  onChange={(e) => updateField('class', e.target.value)}
                  className="bg-gray-700 border-gray-600"
                />
              ) : (
                <div className="p-2 bg-gray-800 rounded border">{editedCharacter.class}</div>
              )}
            </div>
            <div className="col-span-2">
              <Label htmlFor="background">Background</Label>
              {isEditing ? (
                <Input
                  id="background"
                  value={editedCharacter.background}
                  onChange={(e) => updateField('background', e.target.value)}
                  className="bg-gray-700 border-gray-600"
                />
              ) : (
                <div className="p-2 bg-gray-800 rounded border">{editedCharacter.background}</div>
              )}
            </div>
          </div>
        </div>

        {/* Ability Scores */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-green-400 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Ability Scores
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(editedCharacter.stats).map(([ability, score]) => (
              <div key={ability} className="text-center">
                <Label className="text-xs font-bold text-gray-300">{ability}</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={score}
                    onChange={(e) => updateNestedField('stats', ability, parseInt(e.target.value) || 10)}
                    className="bg-gray-700 border-gray-600 text-center"
                  />
                ) : (
                  <div className="p-2 bg-gray-800 rounded border text-center">
                    <div className="text-lg font-bold">{score}</div>
                    <div className="text-sm text-gray-400">
                      {formatModifier(getAbilityModifier(score))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Combat Stats */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-green-400 flex items-center gap-2">
            <Sword className="w-4 h-4" />
            Combat Stats
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ac">Armor Class</Label>
              {isEditing ? (
                <Input
                  id="ac"
                  type="number"
                  value={editedCharacter.armorClass}
                  onChange={(e) => updateField('armorClass', parseInt(e.target.value) || 10)}
                  className="bg-gray-700 border-gray-600"
                />
              ) : (
                <div className="p-2 bg-gray-800 rounded border flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  {editedCharacter.armorClass}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="hp-max">Max HP</Label>
              {isEditing ? (
                <Input
                  id="hp-max"
                  type="number"
                  value={editedCharacter.hitPoints.max}
                  onChange={(e) => updateNestedField('hitPoints', 'max', parseInt(e.target.value) || 8)}
                  className="bg-gray-700 border-gray-600"
                />
              ) : (
                <div className="p-2 bg-gray-800 rounded border flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  {editedCharacter.hitPoints.max}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="speed">Speed</Label>
              {isEditing ? (
                <Input
                  id="speed"
                  type="number"
                  value={editedCharacter.speed}
                  onChange={(e) => updateField('speed', parseInt(e.target.value) || 30)}
                  className="bg-gray-700 border-gray-600"
                />
              ) : (
                <div className="p-2 bg-gray-800 rounded border">
                  {editedCharacter.speed} ft
                </div>
              )}
            </div>
          </div>
        </div>

        {/* File Information */}
        <div className="border-t border-gray-700 pt-4">
          <div className="text-xs text-gray-400 space-y-1">
            <p>📄 Original file: {characterSheet.fileName}</p>
            <p>📅 Uploaded: {new Date(characterSheet.uploadDate).toLocaleDateString()}</p>
            {editedCharacter.lastModified && (
              <p>✏️ Last modified: {new Date(editedCharacter.lastModified).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterSheetViewer;