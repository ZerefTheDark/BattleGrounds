import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
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
  Map,
  Settings,
  FileText,
  Database,
  ChevronUp,
  ChevronDown,
  PackagePlus,
  Triangle,
  Circle,
  Paintbrush,
  UserCheck,
  User,
  Layers,
  Shield,
  UserPlus
} from 'lucide-react';
import CanvasLayers from './CanvasLayers';
import ChatDiceInitiative from './ChatDiceInitiative';
import PartyManager from './PartyManager';
import CharacterSheet from './CharacterSheet';
import { useBattleMapStore } from '../store/battleMapStore';

const BattleMapSimple = () => {
  const canvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState('move');
  const [showGameConsole, setShowGameConsole] = useState(false);
  const [showPartyManager, setShowPartyManager] = useState(false);
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [toolPreview, setToolPreview] = useState(null);
  const [isPlayerView, setIsPlayerView] = useState(false);

  const {
    camera,
    gridSize,
    gridEnabled,
    fogEnabled,
    tokens,
    selectedTokenId,
    setCamera,
    setGridSize,
    setGridEnabled,
    setFogEnabled,
    selectToken,
    loadBackgroundImage,
    saveScenario,
    newScenario
  } = useBattleMapStore();

  // Handle token selection
  const handleTokenSelect = useCallback((tokenId) => {
    selectToken(tokenId);
  }, [selectToken]);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        loadBackgroundImage(e.target.result);
      };
      reader.readAsDataURL(file);
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
                    variant={selectedTool === 'cone' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedTool('cone')}
                  >
                    <Triangle className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cone Tool</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedTool === 'circle' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedTool('circle')}
                  >
                    <Circle className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Circle Tool</TooltipContent>
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

        {/* Main Content Area */}
        <div className="flex-1 flex relative">
          {/* Left Sidebar - Gaming Tools */}
          <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showGameConsole ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setShowGameConsole(!showGameConsole)}
                  className="w-12 h-12"
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Game Console</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showPartyManager ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setShowPartyManager(!showPartyManager)}
                  className="w-12 h-12"
                >
                  <Users className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Party Manager</TooltipContent>
            </Tooltip>
          </div>

          {/* Center Canvas Area */}
          <div className="flex-1 relative">
            {/* Canvas Container - constrains the canvas to this area */}
            <div className="absolute inset-0 overflow-hidden">
              <CanvasLayers
                ref={canvasRef}
                selectedTool={selectedTool}
                onTokenSelect={handleTokenSelect}
                activeTool={activeTool}
                toolPreview={toolPreview}
                setActiveTool={setActiveTool}
                setToolPreview={setToolPreview}
                isPlayerView={isPlayerView}
              />
            </div>

            {/* Grid Size Slider - elevated to avoid layering issues */}
            {gridEnabled && (
              <Card className="absolute top-4 left-4 p-3 bg-gray-800/95 border-gray-700 z-10">
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

            {/* Status - elevated to avoid layering issues */}
            <Card className="absolute bottom-4 right-4 p-2 bg-gray-800/95 border-gray-700 z-10">
              <div className="text-sm">
                <div>Tokens: {tokens.length}</div>
                <div>Zoom: {Math.round(camera.scale * 100)}%</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Left Side Panel - Game Console */}
        {showGameConsole && (
          <div className="absolute left-16 top-20 bottom-0 w-80 z-40 pointer-events-auto">
            <ChatDiceInitiative onClose={() => setShowGameConsole(false)} />
          </div>
        )}

        {/* Left Side Panel - Party Manager */}
        {showPartyManager && (
          <div className="absolute left-16 top-20 bottom-0 w-80 z-40 pointer-events-auto">
            <PartyManager onClose={() => setShowPartyManager(false)} />
          </div>
        )}

        {/* Right Side Panel - Character Sheet */}
        {showCharacterSheet && selectedToken && (
          <div className="absolute right-0 top-20 bottom-0 w-96 z-40 bg-gray-900 border-l border-gray-700 pointer-events-auto">
            <CharacterSheet
              token={selectedToken}
              onClose={() => {
                setShowCharacterSheet(false);
                selectToken(null); // Unselect the token
              }}
            />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default BattleMapSimple;