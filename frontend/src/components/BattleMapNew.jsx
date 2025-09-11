import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import PermanentChatWindow from './PermanentChatWindow';
import EnhancedInitiativeTracker from './EnhancedInitiativeTracker';
import ConsolidatedRightPanel from './ConsolidatedRightPanel';
import TokenSelectionModal from './TokenSelectionModal';
import TokenCreationModal from './TokenCreationModal';
import CharacterSheetBeyond from './CharacterSheetBeyond';
import PartyManager from './PartyManager';
import CanvasLayers from './CanvasLayers';
import DraggableWindow from './DraggableWindow';
import { useWindowManager } from './WindowManager';
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
  Settings,
  Triangle,
  Circle,
  Paintbrush,
  UserCheck,
  Layers,
  Target,
  Dice6,
  MessageSquare
} from 'lucide-react';
import { useBattleMapStore } from '../store/battleMapStore';

const BattleMapNew = () => {
  const canvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState('move');
  const [activeTool, setActiveTool] = useState(null);
  const [isPlayerView, setIsPlayerView] = useState(false);
  
  // New UI state
  const [chatHeight, setChatHeight] = useState(300);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [showTokenSelectionModal, setShowTokenSelectionModal] = useState(false);
  const [showConsolidatedPanel, setShowConsolidatedPanel] = useState(false);
  const [selectedTokensForInitiative, setSelectedTokensForInitiative] = useState([]);
  
  const { openWindow, closeWindow, windows } = useWindowManager();
  
  const {
    camera,
    gridSize,
    gridEnabled,
    fogEnabled,
    fogBrushSize,
    fogPaintMode,
    tokens,
    selectedTokenId,
    initiative,
    partyMembers,
    setCamera,
    setGridSize,
    setGridEnabled,
    setFogEnabled,
    setFogBrushSize,
    setFogPaintMode,
    clearAllFog,
    coverAllWithFog,
    loadBackgroundImage,
    selectToken,
    updateToken
  } = useBattleMapStore();

  // Handle file upload for background images
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

  // Open token creation modal in draggable window
  const openTokenCreator = () => {
    openWindow({
      title: 'Token Creator',
      icon: Target,
      content: <TokenCreationModal onClose={() => closeWindow('token-creator')} />,
      defaultWidth: 500,
      defaultHeight: 600,
      canFullscreen: false
    });
  };

  // Open character sheet in draggable window
  const openCharacterSheet = (character) => {
    openWindow({
      title: `${character?.name || 'Character'} Sheet`,
      icon: Users,
      content: <CharacterSheetBeyond character={character} onClose={() => closeWindow('character-sheet')} />,
      defaultWidth: 600,
      defaultHeight: 700,
      canFullscreen: true
    });
  };

  // Open party manager modal
  const openPartyManager = () => {
    openWindow({
      title: 'Party Manager',
      icon: Users,
      content: <PartyManager onClose={() => closeWindow('party-manager')} />,
      defaultWidth: 400,
      defaultHeight: 500,
      canFullscreen: false
    });
  };

  // Handle adding tokens to initiative
  const handleAddTokensToInitiative = () => {
    setShowTokenSelectionModal(true);
  };

  const handleTokenSelectedForInitiative = (initiativeEntry) => {
    // Add to initiative through the store
    const { addToInitiative } = useBattleMapStore.getState();
    addToInitiative(initiativeEntry);
    setSelectedTokensForInitiative(prev => [...prev, initiativeEntry.tokenId]);
  };

  const selectedToken = tokens.find(token => token.id === selectedTokenId);

  return (
    <TooltipProvider>
      <div className="h-screen w-screen bg-gray-900 text-white flex relative overflow-hidden">
        {/* Decorative Vine Borders */}
        <div className="absolute top-0 left-0 right-0 h-3 z-10 pointer-events-none overflow-hidden">
          <div className="text-center text-xs leading-3" style={{
            background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.3) 0%, rgba(220, 38, 38, 0.3) 50%, rgba(16, 185, 129, 0.3) 100%)',
            animation: 'vineGlow 3s ease-in-out infinite alternate'
          }}>
            🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-3 z-10 pointer-events-none overflow-hidden">
          <div className="text-center text-xs leading-3" style={{
            background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.3) 0%, rgba(220, 38, 38, 0.3) 50%, rgba(16, 185, 129, 0.3) 100%)',
            animation: 'vineGlow 3s ease-in-out infinite alternate-reverse'
          }}>
            🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿⚔️🌿
          </div>
        </div>

        {/* Left Sidebar - Gaming Tools */}
        <div className="w-80 bg-gray-900 border-r-2 border-green-500/50 flex flex-col shadow-lg shadow-green-500/10 z-20">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-green-500/30 p-4">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                The Dragon Stones
              </h1>
              <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                {Math.round(camera.scale * 100)}%
              </Badge>
            </div>
            
            {/* Main Toolbar */}
            <div className="grid grid-cols-4 gap-2">
              {/* Selection Tool */}
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

              {/* Ruler Tool */}
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

              {/* Cone Tool */}
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
                <TooltipContent><p>Cone/Triangle</p></TooltipContent>
              </Tooltip>

              {/* Circle Tool */}
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
                <TooltipContent><p>Circle/Radius</p></TooltipContent>
              </Tooltip>

              {/* Fog of War Brush */}
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
                <TooltipContent><p>Fog of War Brush</p></TooltipContent>
              </Tooltip>

              {/* Token Creator */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openTokenCreator}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Create Token</p></TooltipContent>
              </Tooltip>

              {/* Party Manager */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openPartyManager}
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Party Manager</p></TooltipContent>
              </Tooltip>

              {/* Player View Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isPlayerView ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsPlayerView(!isPlayerView)}
                    className={isPlayerView ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    {isPlayerView ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Player View</p></TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Initiative Tracker */}
          <div className="p-4">
            <EnhancedInitiativeTracker 
              onAddTokensFromField={handleAddTokensToInitiative}
              tokens={tokens}
            />
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Canvas */}
          <div className="flex-1 relative">
            <CanvasLayers
              ref={canvasRef}
              selectedTool={selectedTool}
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              onTokenSelect={onTokenSelect}
              isPlayerView={isPlayerView}
            />
          </div>

          {/* Permanent Chat Window */}
          <div className="relative z-30">
            <PermanentChatWindow
              defaultHeight={chatHeight}
              onHeightChange={setChatHeight}
              isMinimized={isChatMinimized}
              onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
            />
          </div>
        </div>

        {/* Right Panel Toggle */}
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-30">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConsolidatedPanel(true)}
                className="bg-gray-800 border-green-500/50 hover:bg-gray-700 shadow-lg"
              >
                <Layers className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Map Management</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Draggable Windows */}
        {windows.map((window) => (
          <DraggableWindow
            key={window.id}
            title={window.title}
            icon={window.icon}
            onClose={() => closeWindow(window.id)}
            defaultWidth={window.defaultWidth}
            defaultHeight={window.defaultHeight}
            minWidth={window.minWidth}
            minHeight={window.minHeight}
            defaultPosition={window.position}
            zIndex={window.zIndex}
            isFullscreen={window.isFullscreen}
            onFullscreenToggle={() => window.onFullscreenToggle?.()} 
            canFullscreen={window.canFullscreen}
          >
            {window.content}
          </DraggableWindow>
        ))}

        {/* Modals */}
        {showConsolidatedPanel && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-end z-40">
            <div className="w-[450px] h-full">
              <ConsolidatedRightPanel onClose={() => setShowConsolidatedPanel(false)} />
            </div>
          </div>
        )}

        {showTokenSelectionModal && (
          <TokenSelectionModal
            tokens={tokens}
            selectedTokenIds={selectedTokensForInitiative}
            onSelectToken={handleTokenSelectedForInitiative}
            onClose={() => setShowTokenSelectionModal(false)}
          />
        )}

        {/* File input for background images */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="background-upload"
        />
      </div>
    </TooltipProvider>
  );
};

export default BattleMapNew;