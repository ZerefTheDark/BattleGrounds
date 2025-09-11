import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  X, 
  Save, 
  Upload, 
  Download, 
  Trash2, 
  FolderOpen,
  Map,
  Users,
  FileText,
  Camera,
  Database,
  Plus
} from 'lucide-react';
import { StorageManager } from '../utils/StorageManager';
import { useBattleMapStore } from '../store/battleMapStore';

const StoragePanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('maps');
  const [stats, setStats] = useState({});
  const { 
    loadBackgroundImage, 
    tokens, 
    addToken, 
    camera,
    gridSize,
    backgroundImage,
    fogEnabled,
    fogReveals
  } = useBattleMapStore();

  useEffect(() => {
    setStats(StorageManager.getStorageStats());
  }, []);

  const refreshStats = () => {
    setStats(StorageManager.getStorageStats());
  };

  const handleSaveCurrentMap = () => {
    if (backgroundImage) {
      const mapData = {
        name: prompt('Enter map name:') || 'Untitled Map',
        image: backgroundImage.dataUrl,
        gridSize,
        created: Date.now()
      };
      StorageManager.saveBattleMap(mapData);
      refreshStats();
    }
  };

  const handleLoadMap = (map) => {
    loadBackgroundImage(map.image);
  };

  const handleSaveCurrentScenario = () => {
    const scenarioData = {
      name: prompt('Enter scenario name:') || 'Untitled Scenario',
      data: {
        camera,
        gridSize,
        backgroundImage,
        fogEnabled,
        fogReveals,
        tokens
      }
    };
    StorageManager.saveScenario(scenarioData);
    refreshStats();
  };

  const renderMapsTab = () => {
    const maps = StorageManager.getAllMaps();
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-green-400 font-semibold">Battle Maps ({maps.length})</h3>
          <Button onClick={handleSaveCurrentMap} size="sm" className="bg-green-600 hover:bg-green-700">
            <Save className="w-3 h-3 mr-1" />
            Save Current
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
          {maps.map((map) => (
            <Card key={map.id} className="bg-gray-700 border-gray-600">
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{map.name}</div>
                    <div className="text-xs text-gray-400">
                      Created: {new Date(map.created).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Grid: {map.gridSize || 25}px
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleLoadMap(map)}
                      className="bg-blue-600 hover:bg-blue-700 h-6 w-6 p-0"
                    >
                      <FolderOpen className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        StorageManager.deleteMap(map.id);
                        refreshStats();
                      }}
                      className="bg-red-600 hover:bg-red-700 h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {maps.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <Map className="w-12 h-12 mx-auto mb-2 text-gray-600" />
              <p className="text-sm">No saved maps yet</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => StorageManager.exportData('maps')}
            className="flex-1"
          >
            <Download className="w-3 h-3 mr-1" />
            Export All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => StorageManager.clearStorage('maps')}
            className="flex-1 text-red-400 border-red-400"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        </div>
      </div>
    );
  };

  const renderTokensTab = () => {
    const tokenTemplates = StorageManager.getAllTokenTemplates();
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-green-400 font-semibold">Token Templates ({tokenTemplates.length})</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {tokenTemplates.map((template) => (
            <Card key={template.id} className="bg-gray-700 border-gray-600">
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 border ${
                        template.shape === 'circle' ? 'rounded-full' : 'rounded-sm'
                      }`}
                      style={{ backgroundColor: template.color }}
                    />
                    <div>
                      <div className="text-xs font-medium">{template.name}</div>
                      <div className="text-xs text-gray-400">{template.size}px</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => {
                        addToken({
                          ...template,
                          x: 0,
                          y: 0,
                          hp: { current: 100, max: 100 },
                          id: Date.now().toString()
                        });
                      }}
                      className="bg-blue-600 hover:bg-blue-700 h-5 w-5 p-0"
                    >
                      <Plus className="w-2 h-2" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        StorageManager.deleteTokenTemplate(template.id);
                        refreshStats();
                      }}
                      className="bg-red-600 hover:bg-red-700 h-5 w-5 p-0"
                    >
                      <Trash2 className="w-2 h-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {tokenTemplates.length === 0 && (
            <div className="text-center text-gray-400 py-8 col-span-2">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-600" />
              <p className="text-sm">No saved token templates</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => StorageManager.exportData('tokens')}
            className="flex-1"
          >
            <Download className="w-3 h-3 mr-1" />
            Export All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => StorageManager.clearStorage('tokens')}
            className="flex-1 text-red-400 border-red-400"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        </div>
      </div>
    );
  };

  const renderCharactersTab = () => {
    const characters = StorageManager.getAllCharacters();
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-green-400 font-semibold">Characters ({characters.length})</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
          {characters.map((character) => (
            <Card key={character.id} className="bg-gray-700 border-gray-600">
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    {character.portrait && (
                      <img 
                        src={character.portrait} 
                        alt={character.name}
                        className="w-10 h-10 rounded border border-yellow-500/50"
                      />
                    )}
                    <div>
                      <div className="font-medium text-sm text-yellow-400">{character.name}</div>
                      <div className="text-xs text-gray-400">
                        {character.race} {character.class} • Level {character.level || 1}
                      </div>
                      <div className="text-xs text-gray-500">
                        Saved: {new Date(character.created).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => {
                        // Load character data into a token
                        addToken({
                          name: character.name,
                          x: 0,
                          y: 0,
                          size: 25,
                          color: '#8b5cf6',
                          shape: 'circle',
                          ...character.data,
                          id: Date.now().toString()
                        });
                      }}
                      className="bg-purple-600 hover:bg-purple-700 h-6 w-6 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        StorageManager.deleteCharacter(character.id);
                        refreshStats();
                      }}
                      className="bg-red-600 hover:bg-red-700 h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {characters.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-600" />
              <p className="text-sm">No saved characters</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => StorageManager.exportData('characters')}
            className="flex-1"
          >
            <Download className="w-3 h-3 mr-1" />
            Export All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => StorageManager.clearStorage('characters')}
            className="flex-1 text-red-400 border-red-400"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        </div>
      </div>
    );
  };

  const renderScenariosTab = () => {
    const scenarios = StorageManager.getAllScenarios();
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-green-400 font-semibold">Scenarios ({scenarios.length})</h3>
          <Button onClick={handleSaveCurrentScenario} size="sm" className="bg-green-600 hover:bg-green-700">
            <Save className="w-3 h-3 mr-1" />
            Save Current
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
          {scenarios.map((scenario) => (
            <Card key={scenario.id} className="bg-gray-700 border-gray-600">
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{scenario.name}</div>
                    <div className="text-xs text-gray-400">
                      Created: {new Date(scenario.created).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {scenario.data?.tokens?.length || 0} tokens
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => {
                        // This would load the full scenario
                        console.log('Load scenario:', scenario);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 h-6 w-6 p-0"
                    >
                      <FolderOpen className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        StorageManager.deleteScenario(scenario.id);
                        refreshStats();
                      }}
                      className="bg-red-600 hover:bg-red-700 h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {scenarios.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <Camera className="w-12 h-12 mx-auto mb-2 text-gray-600" />
              <p className="text-sm">No saved scenarios</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => StorageManager.exportData('scenarios')}
            className="flex-1"
          >
            <Download className="w-3 h-3 mr-1" />
            Export All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => StorageManager.clearStorage('scenarios')}
            className="flex-1 text-red-400 border-red-400"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-gray-800 border-2 border-green-500/50 text-white h-full flex flex-col shadow-lg shadow-green-500/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-green-500/30">
        <CardTitle className="text-lg text-green-400 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Storage Manager
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid grid-cols-4 bg-gray-700 mb-3">
            <TabsTrigger value="maps" className="text-xs data-[state=active]:bg-green-600">
              <Map className="w-3 h-3 mr-1" />
              Maps
              <Badge variant="secondary" className="ml-1 text-xs h-4">
                {stats.maps || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="tokens" className="text-xs data-[state=active]:bg-green-600">
              <Users className="w-3 h-3 mr-1" />
              Tokens
              <Badge variant="secondary" className="ml-1 text-xs h-4">
                {stats.tokens || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="characters" className="text-xs data-[state=active]:bg-green-600">
              <FileText className="w-3 h-3 mr-1" />
              Characters
              <Badge variant="secondary" className="ml-1 text-xs h-4">
                {stats.characters || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="text-xs data-[state=active]:bg-green-600">
              <Camera className="w-3 h-3 mr-1" />
              Scenarios
              <Badge variant="secondary" className="ml-1 text-xs h-4">
                {stats.scenarios || 0}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="maps" className="h-full mt-0">
              {renderMapsTab()}
            </TabsContent>
            <TabsContent value="tokens" className="h-full mt-0">
              {renderTokensTab()}
            </TabsContent>
            <TabsContent value="characters" className="h-full mt-0">
              {renderCharactersTab()}
            </TabsContent>
            <TabsContent value="scenarios" className="h-full mt-0">
              {renderScenariosTab()}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StoragePanel;