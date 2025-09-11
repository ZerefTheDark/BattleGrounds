import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  X, 
  Upload, 
  Image, 
  FileText,
  User,
  Scroll
} from 'lucide-react';

const TokenCreationModal = ({ isOpen, onClose, onCreateToken }) => {
  const [tokenData, setTokenData] = useState({
    name: '',
    size: 25,
    shape: 'circle',
    color: '#3b82f6',
    appearanceImage: null,
    statBlockImage: null
  });
  
  const [imagePreview, setImagePreview] = useState({
    appearance: null,
    statBlock: null
  });

  const handleImageUpload = (type, event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setTokenData({ 
          ...tokenData, 
          [type === 'appearance' ? 'appearanceImage' : 'statBlockImage']: imageUrl 
        });
        setImagePreview({ 
          ...imagePreview, 
          [type]: imageUrl 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = () => {
    if (!tokenData.name.trim()) {
      alert('Please enter a token name');
      return;
    }

    const newToken = {
      id: Date.now().toString(),
      name: tokenData.name,
      x: 200,
      y: 200,
      shape: tokenData.shape,
      size: tokenData.size,
      color: tokenData.color,
      appearanceImage: tokenData.appearanceImage,
      statBlockImage: tokenData.statBlockImage,
      abilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
      hp: { current: 10, max: 10 },
      ac: 10,
      conditions: []
    };

    onCreateToken(newToken);
    
    // Reset form
    setTokenData({
      name: '',
      size: 25,
      shape: 'circle',
      color: '#3b82f6',
      appearanceImage: null,
      statBlockImage: null
    });
    setImagePreview({
      appearance: null,
      statBlock: null
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card className="w-[500px] bg-gray-900 border-2 border-green-500 shadow-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-green-500/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-green-400 font-bold">Create New Token</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-full w-8 h-8 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          {/* Token Name */}
          <div>
            <Label className="text-green-400 font-medium">Token Name *</Label>
            <Input
              value={tokenData.name}
              onChange={(e) => setTokenData({ ...tokenData, name: e.target.value })}
              placeholder="Enter character/creature name"
              className="bg-gray-800 border-green-500/30 text-white mt-1"
            />
          </div>

          {/* Token Properties */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-green-400 font-medium">Shape</Label>
              <Select value={tokenData.shape} onValueChange={(value) => setTokenData({ ...tokenData, shape: value })}>
                <SelectTrigger className="bg-gray-800 border-green-500/30 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-green-500/30">
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-green-400 font-medium">Size: {tokenData.size}px</Label>
              <input
                type="range"
                min="15"
                max="75"
                step="5"
                value={tokenData.size}
                onChange={(e) => setTokenData({ ...tokenData, size: parseInt(e.target.value) })}
                className="w-full mt-2 accent-green-500"
              />
            </div>
          </div>

          {/* Image Uploads */}
          <div className="grid grid-cols-2 gap-4">
            {/* Appearance Image */}
            <div>
              <Label className="text-green-400 font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Appearance Image
              </Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('appearance', e)}
                  className="hidden"
                  id="appearance-upload"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('appearance-upload').click()}
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Appearance
                </Button>
                {imagePreview.appearance && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview.appearance} 
                      alt="Appearance preview" 
                      className="w-full h-24 object-cover rounded border border-green-500/30"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Stat Block Image */}
            <div>
              <Label className="text-green-400 font-medium flex items-center gap-2">
                <Scroll className="w-4 h-4" />
                Stat Block Image
              </Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('statBlock', e)}
                  className="hidden"
                  id="statblock-upload"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('statblock-upload').click()}
                  className="w-full bg-purple-700 hover:bg-purple-600 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Stat Block
                </Button>
                {imagePreview.statBlock && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview.statBlock} 
                      alt="Stat block preview" 
                      className="w-full h-24 object-cover rounded border border-green-500/30"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <Label className="text-green-400 font-medium">Border Color</Label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="color"
                value={tokenData.color}
                onChange={(e) => setTokenData({ ...tokenData, color: e.target.value })}
                className="w-12 h-8 rounded border border-green-500/30 cursor-pointer"
              />
              <span className="text-gray-300 text-sm">{tokenData.color}</span>
            </div>
          </div>

          {/* Create Button */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreate}
              className="flex-1 bg-green-700 hover:bg-green-600 text-white font-medium relative z-10 pointer-events-auto"
            >
              Create Token
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 relative z-10 pointer-events-auto"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenCreationModal;