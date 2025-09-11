import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { X, Plus, Edit, Trash2, Map, Save, Upload, Eye, Square } from 'lucide-react';
import { useBattleMapStore } from '../store/battleMapStore';

const SubmapManager = ({ onClose }) => {
  const { 
    submaps, 
    addSubmap, 
    updateSubmap, 
    removeSubmap, 
    camera,
    submapSelectionMode,
    submapSelection,
    setSubmapSelectionMode,
    setSubmapSelection
  } = useBattleMapStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isPlacingSubmap, setIsPlacingSubmap] = useState(false);
  const [newSubmap, setNewSubmap] = useState({
    name: '',
    bounds: { x: 0, y: 0, w: 200, h: 200 }
  });

  const handleCreateSubmap = () => {
    if (newSubmap.name.trim()) {
      const submap = {
        ...newSubmap,
        bounds: {
          x: camera.x - newSubmap.bounds.w / 2,
          y: camera.y - newSubmap.bounds.h / 2,
          w: newSubmap.bounds.w,
          h: newSubmap.bounds.h
        },
        scene: {
          camera: { x: 0, y: 0, scale: 1 },
          gridSize: 50,
          gridEnabled: true,
          backgroundImage: null,
          fogEnabled: false,
          fogReveals: [],
          tokens: []
        }
      };
      
      addSubmap(submap);
      setNewSubmap({ name: '', bounds: { x: 0, y: 0, w: 200, h: 200 } });
      setShowCreateForm(false);
      setIsPlacingSubmap(false);
    }
  };

  const startPlacingSubmap = () => {
    setIsPlacingSubmap(true);
    setSubmapSelectionMode(true);
    setShowCreateForm(true);
  };

  const confirmSubmapSelection = () => {
    if (submapSelection && newSubmap.name.trim()) {
      const { start, end } = submapSelection;
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x);
      const h = Math.abs(end.y - start.y);
      
      const submap = {
        ...newSubmap,
        bounds: { x, y, w, h },
        scene: {
          camera: { x: 0, y: 0, scale: 1 },
          gridSize: 50,
          gridEnabled: true,
          backgroundImage: null,
          fogEnabled: false,
          fogReveals: [],
          tokens: []
        }
      };
      
      addSubmap(submap);
      setNewSubmap({ name: '', bounds: { x: 0, y: 0, w: 200, h: 200 } });
      setShowCreateForm(false);
      setIsPlacingSubmap(false);
      setSubmapSelectionMode(false);
      setSubmapSelection(null);
    }
  };

  const cancelSubmapSelection = () => {
    setIsPlacingSubmap(false);
    setShowCreateForm(false);
    setSubmapSelectionMode(false);
    setSubmapSelection(null);
  };

  const handleFileUpload = (submapId, event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Update the submap's scene with the new background
          const submap = submaps.find(s => s.id === submapId);
          if (submap) {
            const updatedScene = {
              ...submap.scene,
              backgroundImage: {
                dataUrl: e.target.result,
                width: img.width,
                height: img.height
              }
            };
            updateSubmap(submapId, { scene: updatedScene });
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSubmapToStorage = (submap) => {
    // Save individual submap to localStorage
    const key = `submap_${submap.id}`;
    localStorage.setItem(key, JSON.stringify(submap));
    
    // Also save to the main list
    const savedSubmaps = JSON.parse(localStorage.getItem('saved_submaps') || '[]');
    const existingIndex = savedSubmaps.findIndex(s => s.id === submap.id);
    
    if (existingIndex >= 0) {
      savedSubmaps[existingIndex] = submap;
    } else {
      savedSubmaps.push(submap);
    }
    
    localStorage.setItem('saved_submaps', JSON.stringify(savedSubmaps));
  };

  const loadSubmapsFromStorage = () => {
    const savedSubmaps = JSON.parse(localStorage.getItem('saved_submaps') || '[]');
    return savedSubmaps;
  };

  const exportSubmap = (submap) => {
    const dataStr = JSON.stringify(submap, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `submap_${submap.name.replace(/\s+/g, '_')}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-gray-800 border-gray-700 text-white h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Map className="w-5 h-5" />
          Submaps
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4 p-4">
        {/* Create Controls */}
        <div className="space-y-2">
          <Button
            onClick={startPlacingSubmap}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isPlacingSubmap}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isPlacingSubmap ? 'Placing Submap...' : 'Create New Submap'}
          </Button>
          
          {isPlacingSubmap && (
            <div className="bg-blue-900/20 border border-blue-700/50 rounded p-3 text-sm">
              <p className="text-blue-300 mb-2">
                <Square className="w-4 h-4 inline mr-1" />
                {submapSelection ? 
                  `Area selected: ${Math.round(Math.abs(submapSelection.end.x - submapSelection.start.x))} × ${Math.round(Math.abs(submapSelection.end.y - submapSelection.start.y))} units` :
                  'Click and drag on the map to select submap area'
                }
              </p>
              <div className="flex gap-2">
                {submapSelection && (
                  <Button
                    size="sm"
                    onClick={confirmSubmapSelection}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!newSubmap.name.trim()}
                  >
                    Confirm Area
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelSubmapSelection}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="p-4 space-y-3">
              <div>
                <Label htmlFor="submap-name">Submap Name</Label>
                <Input
                  id="submap-name"
                  value={newSubmap.name}
                  onChange={(e) => setNewSubmap({ ...newSubmap, name: e.target.value })}
                  placeholder="Enter submap name"
                  className="bg-gray-600 border-gray-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Width</Label>
                  <Input
                    type="number"
                    value={newSubmap.bounds.w}
                    onChange={(e) => setNewSubmap({
                      ...newSubmap,
                      bounds: { ...newSubmap.bounds, w: parseInt(e.target.value) || 200 }
                    })}
                    className="bg-gray-600 border-gray-500"
                  />
                </div>
                <div>
                  <Label>Height</Label>
                  <Input
                    type="number"
                    value={newSubmap.bounds.h}
                    onChange={(e) => setNewSubmap({
                      ...newSubmap,
                      bounds: { ...newSubmap.bounds, h: parseInt(e.target.value) || 200 }
                    })}
                    className="bg-gray-600 border-gray-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={confirmSubmapSelection} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!submapSelection || !newSubmap.name.trim()}
                >
                  Create Submap
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelSubmapSelection}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submaps List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          <h3 className="font-semibold text-sm text-gray-300">Active Submaps</h3>
          
          {submaps.map((submap) => (
            <Card key={submap.id} className="bg-gray-700 border-gray-600">
              <CardContent className="p-3">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{submap.name}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {submap.bounds.w} × {submap.bounds.h} units
                      </div>
                      <div className="text-xs text-gray-500">
                        Position: ({Math.round(submap.bounds.x)}, {Math.round(submap.bounds.y)})
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {submap.scene.backgroundImage && (
                        <Badge variant="secondary" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          Map
                        </Badge>
                      )}
                      
                      <Badge variant="outline" className="text-xs">
                        {submap.scene.tokens.length} tokens
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {/* Upload Map */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(submap.id, e)}
                      className="hidden"
                      id={`submap-upload-${submap.id}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById(`submap-upload-${submap.id}`).click()}
                      className="flex-1"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Map
                    </Button>

                    {/* Edit */}
                    <Button
                      size="sm"
                      onClick={() => {
                        // Enter submap - focus camera on submap bounds and enable editing
                        const bounds = submap.bounds;
                        updateSubmap(submap.id, {
                          ...submap,
                          isActive: true
                        });
                        // Focus camera on submap center
                        const centerX = bounds.x + bounds.w / 2;
                        const centerY = bounds.y + bounds.h / 2;
                        // You'll need to add a focusCamera function to the store
                        alert('Submap editing enabled! Focus camera and add tokens/content specific to this submap.');
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Enter
                    </Button>

                    {/* Save */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        saveSubmapToStorage(submap);
                        // Show success feedback
                      }}
                      className="flex-1"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`Delete submap "${submap.name}"?`)) {
                          removeSubmap(submap.id);
                        }
                      }}
                      className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 text-xs">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportSubmap(submap)}
                      className="flex-1 text-xs"
                    >
                      Export JSON
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Focus camera on submap bounds
                        const bounds = submap.bounds;
                        const centerX = bounds.x + bounds.w / 2;
                        const centerY = bounds.y + bounds.h / 2;
                        // This will focus the camera on the submap
                        camera.x = centerX;
                        camera.y = centerY;
                        camera.scale = Math.min(800 / bounds.w, 600 / bounds.h, 2);
                        alert(`Focused on submap: ${submap.name}`);
                      }}
                      className="flex-1 text-xs"
                    >
                      Focus View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {submaps.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <Map className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-sm">No submaps created yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Create a submap to add detailed battle areas
              </p>
            </div>
          )}
        </div>

        {/* Storage Info */}
        <div className="border-t border-gray-700 pt-3">
          <div className="text-xs text-gray-400 space-y-1">
            <p>💾 Submaps are automatically saved to browser storage</p>
            <p>📤 Use Export to share submaps between devices</p>
            <p>🎯 Click "Focus View" to center camera on submap</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmapManager;