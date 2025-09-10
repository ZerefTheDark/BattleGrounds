import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Shield
} from 'lucide-react';
import CanvasLayers from './CanvasLayers';
import TokenPanel from './TokenPanel';
import CharacterSheet from './CharacterSheetBeyond';
import ChatDiceInitiative from './ChatDiceInitiative';
import SubmapManager from './SubmapManager';
import StoragePanel from './StoragePanel';
import UploadExpansion from './UploadExpansion';
import { useBattleMapStore } from '../store/battleMapStore';

const BattleMap = () => {
  const canvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState('move');
  const [activeTool, setActiveTool] = useState(null); // For cone/circle drawing
  const [toolPreview, setToolPreview] = useState(null); // Preview shape while drawing
  const [isPlayerView, setIsPlayerView] = useState(false); // Player view toggle
  const [showTokenPanel, setShowTokenPanel] = useState(false);
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [showSubmapManager, setShowSubmapManager] = useState(false);
  const [showStoragePanel, setShowStoragePanel] = useState(false);
  const [showUploadExpansion, setShowUploadExpansion] = useState(false);
  
  const {
    camera,
    gridSize,
    gridEnabled,
    fogEnabled,
    tokens,
    selectedTokenId,
    submaps,
    ruler,
    setCamera,
    setGridSize,
    setGridEnabled,
    setFogEnabled,
    selectToken,
    loadBackgroundImage,
    saveScenario,
    loadScenario,
    newScenario
  } = useBattleMapStore();

  const handleFileUpload = useCallback((event) => {
    console.log('File upload triggered:', event.target.files);
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      console.log('Valid image file selected:', file.name, file.type);
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('Image loaded, calling loadBackgroundImage');
        loadBackgroundImage(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('Invalid file type or no file selected');
    }
  }, [loadBackgroundImage]);

  const selectedToken = tokens.find(token => token.id === selectedTokenId);

  // Auto-open character sheet when token is selected
  useEffect(() => {
    if (selectedToken && !showCharacterSheet) {
      setShowCharacterSheet(true);
    }
  }, [selectedToken, showCharacterSheet]);

  return (
    <TooltipProvider>
      <div className="h-screen w-screen bg-gray-900 text-white flex flex-col relative overflow-hidden">
        {/* Decorative Vine Borders - Non-interfering */}
        <div className="absolute top-0 left-0 right-0 h-5 z-10 pointer-events-none overflow-hidden">
          <div className="text-center text-xs leading-5" style={{
            background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.3) 0%, rgba(220, 38, 38, 0.3) 50%, rgba(16, 185, 129, 0.3) 100%)',
            animation: 'vineGlow 3s ease-in-out infinite alternate'
          }}>
            🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-5 z-10 pointer-events-none overflow-hidden">
          <div className="text-center text-xs leading-5" style={{
            background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.3) 0%, rgba(220, 38, 38, 0.3) 50%, rgba(16, 185, 129, 0.3) 100%)',
            animation: 'vineGlow 3s ease-in-out infinite alternate-reverse'
          }}>
            🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️
          </div>
        </div>

        {/* Top Toolbar */}
        <div className="bg-gray-900 border-b-2 border-green-500 shadow-lg shadow-green-500/20 p-3 flex items-center justify-between gap-4 relative">
          {/* Decorative thorns */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-yellow-500 via-green-500 to-yellow-500"></div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-green-400 shadow-green-400/50 shadow-sm"></div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                The Dragon Stones
              </h1>
              <p className="text-sm text-gray-400 font-serif italic -mt-1">Chris Marshall</p>
            </div>
            <Badge variant="outline" className="text-xs border-green-500 text-green-400">
              {Math.round(camera.scale * 100)}%
            </Badge>
          </div>
          
          {/* Tool Selection */}
          <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
            {[
              { id: 'move', icon: Move, label: 'Pan & Move' },
              { id: 'ruler', icon: Ruler, label: 'Ruler Tool' },
              { id: 'fog', icon: Paintbrush, label: 'Fog of War Brush' },
              { id: 'cone', icon: Triangle, label: 'Cone Tool' },
              { id: 'circle', icon: Circle, label: 'Circle Tool' },
              { id: 'token', icon: Users, label: 'Add Token' }
            ].map(tool => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedTool === tool.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedTool(tool.id)}
                    className={selectedTool === tool.id ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    <tool.icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  <Switch
                    checked={gridEnabled}
                    onCheckedChange={setGridEnabled}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Grid</p>
              </TooltipContent>
            </Tooltip>
            
            <div className="flex items-center gap-2">
              <span className="text-sm">Grid:</span>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGridSize(Math.max(5, gridSize - 5))}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Decrease Grid Size</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-xs text-gray-300 min-w-[40px] text-center">{gridSize}px</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGridSize(Math.min(100, gridSize + 5))}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Increase Grid Size</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  {fogEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <Switch
                    checked={fogEnabled}
                    onCheckedChange={setFogEnabled}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fog of War</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* File Operations */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Load Map
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload Background Map</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={saveScenario}>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save Scenario</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={newScenario}>
                  <Plus className="w-4 h-4 mr-1" />
                  New
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Scenario</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Upload Expansion clicked, current state:', showUploadExpansion);
                    setShowUploadExpansion(true);
                    console.log('Set showUploadExpansion to true');
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-purple-500 relative z-10"
                  style={{ pointerEvents: 'auto' }}
                >
                  <PackagePlus className="w-4 h-4 mr-1" />
                  Upload Expansion
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload D&D Content Files</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden" style={{ height: 'calc(100vh - 120px)', minHeight: 'calc(100vh - 120px)' }}>
          {/* Canvas Container - Absolute positioning for full coverage */}
          <div className="canvas-container">
            <CanvasLayers
              ref={canvasRef}
              selectedTool={selectedTool}
              onTokenSelect={selectToken}
            />
            
            {/* Scale Badge */}
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-gray-800/80 text-white border border-green-500/50">
                Scale: {Math.round(camera.scale * 100)}%
              </Badge>
            </div>
            
            {/* Ruler Measurement Display */}
            {ruler.active && ruler.start && ruler.end && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-red-600/90 text-white border border-red-400/50 text-lg px-4 py-2">
                  {(() => {
                    const dx = ruler.end.x - ruler.start.x;
                    const dy = ruler.end.y - ruler.start.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const squares = Math.round(distance / gridSize);
                    const feet = squares * 5;
                    return `${feet} ft`;
                  })()}
                </Badge>
              </div>
            )}
          </div>

          {/* Right Side Panels - Fixed positioning with max width constraints */}
          <div 
            className="absolute top-0 right-0 h-full flex z-20 pointer-events-none panel-container"
            style={{ maxWidth: '70vw' }} // Maximum 70% of viewport width
          >
            {/* Token Panel */}
            {showTokenPanel && (
              <div className="w-80 max-w-[300px] h-full border-l-2 border-green-500/30 bg-gray-900 pointer-events-auto">
                <TokenPanel onClose={() => setShowTokenPanel(false)} />
              </div>
            )}

            {/* Character Sheet */}
            {showCharacterSheet && selectedToken && (
              <div className="w-[800px] max-w-[750px] h-full border-l-2 border-red-500/30 bg-gray-900 pointer-events-auto">
                <CharacterSheet
                  token={selectedToken}
                  onClose={() => {
                    setShowCharacterSheet(false);
                    selectToken(null); // Unselect the token
                  }}
                />
              </div>
            )}

            {/* Chat/Dice/Initiative Combined Panel */}
            {showChatPanel && (
              <div className="w-80 max-w-[320px] h-full border-l-2 border-green-500/30 bg-gray-900 pointer-events-auto">
                <ChatDiceInitiative onClose={() => setShowChatPanel(false)} />
              </div>
            )}

            {/* Submap Manager */}
            {showSubmapManager && (
              <div className="w-80 max-w-[300px] h-full border-l-2 border-green-500/30 bg-gray-900 pointer-events-auto">
                <SubmapManager onClose={() => setShowSubmapManager(false)} />
              </div>
            )}

            {/* Storage Panel */}
            {showStoragePanel && (
              <div className="w-80 max-w-[300px] h-full border-l-2 border-green-500/30 bg-gray-900 pointer-events-auto">
                <StoragePanel onClose={() => setShowStoragePanel(false)} />
              </div>
            )}

            {/* Upload Expansion Panel */}
            {console.log('Rendering panels, showUploadExpansion:', showUploadExpansion)}
            {showUploadExpansion && (
              <div className="w-[600px] max-w-[500px] h-full border-l-2 border-purple-500/30 bg-gray-900 pointer-events-auto">
                <UploadExpansion onClose={() => {
                  console.log('Closing Upload Expansion');
                  setShowUploadExpansion(false);
                }} />
              </div>
            )}
          </div>

          {/* Side Panel Controls */}
          <div className="bg-gray-800 border-l border-gray-700 flex flex-col">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showTokenPanel ? 'default' : 'ghost'}
                  className="p-3 rounded-none border-b border-gray-700"
                  onClick={() => {
                    setShowTokenPanel(!showTokenPanel);
                    if (showCharacterSheet) setShowCharacterSheet(false);
                    if (showChatPanel) setShowChatPanel(false);
                    if (showSubmapManager) setShowSubmapManager(false);
                  }}
                >
                  <Users className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Token Manager</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showCharacterSheet ? 'default' : 'ghost'}
                  className="p-3 rounded-none border-b border-gray-700"
                  onClick={() => {
                    if (selectedToken) {
                      setShowCharacterSheet(!showCharacterSheet);
                      if (showTokenPanel) setShowTokenPanel(false);
                      if (showChatPanel) setShowChatPanel(false);
                      if (showSubmapManager) setShowSubmapManager(false);
                      if (showStoragePanel) setShowStoragePanel(false);
                    }
                  }}
                  disabled={!selectedToken}
                >
                  <FileText className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{selectedToken ? 'Character Sheet' : 'Select a token first'}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showChatPanel ? 'default' : 'ghost'}
                  className="p-3 rounded-none border-b border-gray-700"
                  onClick={() => {
                    setShowChatPanel(!showChatPanel);
                    if (showTokenPanel) setShowTokenPanel(false);
                    if (showCharacterSheet) setShowCharacterSheet(false);
                    if (showSubmapManager) setShowSubmapManager(false);
                    if (showStoragePanel) setShowStoragePanel(false);
                  }}
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Chat, Dice & Initiative</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showSubmapManager ? 'default' : 'ghost'}
                  className="p-3 rounded-none border-b border-gray-700"
                  onClick={() => {
                    setShowSubmapManager(!showSubmapManager);
                    if (showTokenPanel) setShowTokenPanel(false);
                    if (showCharacterSheet) setShowCharacterSheet(false);
                    if (showChatPanel) setShowChatPanel(false);
                    if (showStoragePanel) setShowStoragePanel(false);
                  }}
                >
                  <Map className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Submap Manager</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showStoragePanel ? 'default' : 'ghost'}
                  className="p-3 rounded-none border-b border-gray-700"
                  onClick={() => {
                    setShowStoragePanel(!showStoragePanel);
                    if (showTokenPanel) setShowTokenPanel(false);
                    if (showCharacterSheet) setShowCharacterSheet(false);
                    if (showChatPanel) setShowChatPanel(false);
                    if (showSubmapManager) setShowSubmapManager(false);
                  }}
                >
                  <Database className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Storage Manager</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
export default BattleMap;