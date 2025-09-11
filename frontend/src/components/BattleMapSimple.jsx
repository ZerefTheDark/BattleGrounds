import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Move, 
  Ruler, 
  Eye, 
  EyeOff, 
  Grid3X3, 
  Plus, 
  Save, 
  Upload,
  Users,
  MessageSquare,
  Dice6,
  Map
} from 'lucide-react';
import CanvasLayers from './CanvasLayers';
import { useBattleMapStore } from '../store/battleMapStore';

const BattleMapSimple = () => {
  const canvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState('move');

  const {
    camera,
    gridSize,
    gridEnabled,
    fogEnabled,
    tokens,
    setCamera,
    setGridSize,
    setGridEnabled,
    setFogEnabled,
    loadBackgroundImage,
    saveScenario,
    newScenario
  } = useBattleMapStore();

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      loadBackgroundImage(file);
    }
  }, [loadBackgroundImage]);

  return (
    <TooltipProvider>
      <div className="h-screen w-screen bg-gray-900 text-white flex flex-col relative overflow-hidden">
        {/* Header/Toolbar */}
        <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-green-400">D&D Battle Map</h1>
            
            {/* Tools */}
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedTool === 'move' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedTool('move')}
                  >
                    <Move className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Pan & Move</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedTool === 'ruler' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedTool('ruler')}
                  >
                    <Ruler className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ruler</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedTool === 'token' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedTool('token')}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add Token</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm">Grid</label>
              <Switch 
                checked={gridEnabled} 
                onCheckedChange={setGridEnabled}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm">Fog</label>
              <Switch 
                checked={fogEnabled} 
                onCheckedChange={setFogEnabled}
              />
            </div>

            <Button size="sm" onClick={() => document.getElementById('file-upload').click()}>
              <Upload className="w-4 h-4 mr-2" />
              Load Map
            </Button>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />

            <Button size="sm" onClick={saveScenario}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>

            <Button size="sm" onClick={newScenario}>
              New
            </Button>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          <CanvasLayers
            ref={canvasRef}
            selectedTool={selectedTool}
            onToolChange={setSelectedTool}
          />

          {/* Grid Size Slider */}
          {gridEnabled && (
            <Card className="absolute top-4 left-4 p-3 bg-gray-800/95 border-gray-700">
              <div className="flex items-center gap-3">
                <Grid3X3 className="w-4 h-4" />
                <span className="text-sm">Grid: {gridSize}px</span>
                <Slider
                  value={[gridSize]}
                  onValueChange={(value) => setGridSize(value[0])}
                  min={10}
                  max={200}
                  step={5}
                  className="w-24"
                />
              </div>
            </Card>
          )}

          {/* Status */}
          <Card className="absolute bottom-4 right-4 p-2 bg-gray-800/95 border-gray-700">
            <div className="text-sm">
              <div>Tokens: {tokens.length}</div>
              <div>Zoom: {Math.round(camera.scale * 100)}%</div>
            </div>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BattleMapSimple;