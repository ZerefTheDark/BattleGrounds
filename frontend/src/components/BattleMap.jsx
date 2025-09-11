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
  Layers,
  Shield,
  UserPlus
} from 'lucide-react';
import CanvasLayers from './CanvasLayers';
import TokenPanel from './TokenPanel';
import CharacterSheet from './CharacterSheetEnhanced';
import ChatDiceInitiative from './ChatDiceInitiative';
import SubmapManager from './SubmapManager';
import StoragePanel from './StoragePanel';
import UploadExpansion from './UploadExpansion';
import PartyManager from './PartyManager';
import PermanentChatWindow from './PermanentChatWindow';
import EnhancedInitiativeTracker from './EnhancedInitiativeTracker';
import ConsolidatedRightPanel from './ConsolidatedRightPanel';
import TokenSelectionModal from './TokenSelectionModal';
import DraggableWindow from './DraggableWindow';
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
  const [showPartyManager, setShowPartyManager] = useState(false);
  
  // New UI state for redesigned interface
  const [chatHeight, setChatHeight] = useState(300);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [showTokenSelectionModal, setShowTokenSelectionModal] = useState(false);
  const [showConsolidatedPanel, setShowConsolidatedPanel] = useState(false);
  const [selectedTokensForInitiative, setSelectedTokensForInitiative] = useState([]);
  
  // Draggable windows state
  const [draggableWindows, setDraggableWindows] = useState([]);
  
  const {
    camera,
    gridSize,
    gridEnabled,
    fogEnabled,
    fogBrushSize,
    fogPaintMode,
    tokens,
    selectedTokenId,
    submaps,
    ruler,
    setCamera,
    setGridSize,
    setGridEnabled,
    setFogEnabled,
    setFogBrushSize,
    setFogPaintMode,
    clearAllFog,
    coverAllWithFog,
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

  // Handle adding tokens to initiative
  const handleAddTokensToInitiative = () => {
    setShowTokenSelectionModal(true);
  };

  const handleTokenSelectedForInitiative = (initiativeEntry) => {
    const { addCombatant } = useBattleMapStore.getState();
    addCombatant(initiativeEntry);
    setSelectedTokensForInitiative(prev => [...prev, initiativeEntry.tokenId]);
  };

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
            
            <div className="flex items-center gap-1 border border-gray-600 rounded p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedTool === 'fog' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTool('fog')}
                    className="h-7"
                  >
                    <Paintbrush className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fog of War Brush</p>
                </TooltipContent>
              </Tooltip>
              
              {selectedTool === 'fog' && (
                <>
                  <Button
                    variant={fogPaintMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFogPaintMode(!fogPaintMode)}
                    className={`h-7 text-xs px-2 ${
                      fogPaintMode ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {fogPaintMode ? 'Paint' : 'Erase'}
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-300">{fogBrushSize}px</span>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      step="10"
                      value={fogBrushSize}
                      onChange={(e) => setFogBrushSize(parseInt(e.target.value))}
                      className="w-16 h-4 accent-purple-500"
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFog}
                    className="h-7 text-xs px-2 border-green-500 text-green-400 hover:bg-green-900/30"
                  >
                    Clear All
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={coverAllWithFog}
                    className="h-7 text-xs px-2 border-red-500 text-red-400 hover:bg-red-900/30"
                  >
                    Cover All
                  </Button>
                </>
              )}
            </div>
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

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isPlayerView ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setIsPlayerView(!isPlayerView)}
                  className={isPlayerView ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                >
                  {isPlayerView ? <UserCheck className="w-4 h-4 mr-1" /> : <Shield className="w-4 h-4 mr-1" />}
                  {isPlayerView ? 'Player View' : 'GM View'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPlayerView ? 'Switch to GM View' : 'Switch to Player View'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden" style={{ height: 'calc(100vh - 120px)', minHeight: 'calc(100vh - 120px)' }}>
          {/* Canvas Container - Full coverage */}
          <div className="canvas-container">
            <CanvasLayers
              ref={canvasRef}
              selectedTool={selectedTool}
              onTokenSelect={selectToken}
              activeTool={activeTool}
              toolPreview={toolPreview}
              setActiveTool={setActiveTool}
              setToolPreview={setToolPreview}
              isPlayerView={isPlayerView}
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

          {/* Left Sidebar - Gaming Tools */}
          <div className="absolute left-0 top-16 bottom-0 w-80 bg-gray-900/95 backdrop-blur-sm border-r-2 border-green-500/50 z-20 overflow-y-auto fantasy-scrollbar">
            {/* Gaming Tools Header */}
            <div className="p-4 border-b border-green-500/30">
              <h3 className="text-lg font-bold text-green-400">Gaming Console</h3>
              <div className="grid grid-cols-4 gap-2 mt-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={selectedTool === 'move' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTool('move')}
                      className={selectedTool === 'move' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      <Move className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Select/Move</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={selectedTool === 'ruler' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTool('ruler')}
                      className={selectedTool === 'ruler' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    >
                      <Ruler className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Measure Distance</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={selectedTool === 'cone' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTool('cone')}
                      className={selectedTool === 'cone' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                    >
                      <Triangle className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Cone Tool</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={selectedTool === 'circle' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTool('circle')}
                      className={selectedTool === 'circle' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    >
                      <Circle className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Circle Tool</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={selectedTool === 'fog' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTool('fog')}
                      className={selectedTool === 'fog' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                    >
                      <Paintbrush className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Fog Brush</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTokenPanel(!showTokenPanel)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Token Window</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPartyManager(!showPartyManager)}
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Party Manager</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const chatWindow = {
                          id: 'chat-window',
                          title: 'Chat & Dice',
                          icon: MessageSquare,
                          content: <PermanentChatWindow />,
                          position: { x: 100, y: 200 },
                          size: { width: 400, height: 500 },
                          zIndex: 1000
                        };
                        setDraggableWindows(prev => {
                          const exists = prev.find(w => w.id === 'chat-window');
                          if (exists) return prev;
                          return [...prev, chatWindow];
                        });
                      }}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Chat & Dice</p></TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Initiative Tracker in Left Panel */}
            <div className="p-4">
              <EnhancedInitiativeTracker 
                onAddTokensFromField={handleAddTokensToInitiative}
                tokens={tokens}
              />
            </div>
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
                <ChatDiceInitiative 
                  onClose={() => setShowChatPanel(false)} 
                  isPlayerView={isPlayerView} 
                />
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
            {showUploadExpansion && (
              <div className="w-[600px] max-w-[600px] h-full border-l-2 border-green-500/30 bg-gray-900 pointer-events-auto">
                <UploadExpansion onClose={() => setShowUploadExpansion(false)} />
              </div>
            )}

            {/* Party Manager */}
            {showPartyManager && (
              <div className="w-80 max-w-[300px] h-full border-l-2 border-green-500/30 bg-gray-900 pointer-events-auto">
                <PartyManager onClose={() => setShowPartyManager(false)} />
              </div>
            )}

            {/* Consolidated Right Panel */}
            {showConsolidatedPanel && (
              <div className="w-[450px] max-w-[450px] h-full border-l-2 border-green-500/30 bg-gray-900 pointer-events-auto">
                <ConsolidatedRightPanel onClose={() => setShowConsolidatedPanel(false)} />
              </div>
            )}
          </div>

        {/* Side Panel Controls - Moved to right edge */}
        <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-30 space-y-2">
          <div className="bg-gray-900/90 backdrop-blur-sm border-l-2 border-green-500/50 rounded-l-lg shadow-lg shadow-green-500/10">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showConsolidatedPanel ? 'default' : 'ghost'}
                  className="p-3 rounded-none"
                  onClick={() => {
                    setShowConsolidatedPanel(!showConsolidatedPanel);
                    if (showTokenPanel) setShowTokenPanel(false);
                    if (showCharacterSheet) setShowCharacterSheet(false);
                    if (showChatPanel) setShowChatPanel(false);
                    if (showSubmapManager) setShowSubmapManager(false);
                    if (showStoragePanel) setShowStoragePanel(false);
                    if (showUploadExpansion) setShowUploadExpansion(false);
                    if (showPartyManager) setShowPartyManager(false);
                  }}
                >
                  <Layers className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Map Management</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        </div>

        {/* Token Selection Modal */}
        {showTokenSelectionModal && (
          <TokenSelectionModal
            tokens={tokens}
            selectedTokenIds={selectedTokensForInitiative}
            onSelectToken={handleTokenSelectedForInitiative}
            onClose={() => setShowTokenSelectionModal(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
};
export default BattleMap;