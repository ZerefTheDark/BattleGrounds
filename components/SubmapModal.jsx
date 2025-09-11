import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { X, Plus, Edit, Trash2, Map, Save } from 'lucide-react';
import CanvasLayers from './CanvasLayers';
import { useBattleMapStore } from '../store/battleMapStore';

const SubmapModal = ({ onClose }) => {
  const { submaps, addSubmap, updateSubmap, removeSubmap } = useBattleMapStore();
  const [selectedSubmap, setSelectedSubmap] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSubmap, setNewSubmap] = useState({
    name: '',
    bounds: { x: -100, y: -100, w: 200, h: 200 }
  });

  // Submap state (separate from main map)
  const [submapState, setSubmapState] = useState({
    camera: { x: 0, y: 0, scale: 1 },
    gridSize: 50,
    gridEnabled: true,
    backgroundImage: null,
    fogEnabled: false,
    fogReveals: [],
    tokens: []
  });

  const handleCreateSubmap = () => {
    if (newSubmap.name.trim()) {
      const submap = {
        ...newSubmap,
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
      setNewSubmap({ name: '', bounds: { x: -100, y: -100, w: 200, h: 200 } });
      setShowCreateForm(false);
    }
  };

  const openSubmap = (submap) => {
    setSelectedSubmap(submap);
    setSubmapState(submap.scene);
  };

  const closeSubmap = () => {
    setSelectedSubmap(null);
  };

  const saveSubmap = () => {
    if (selectedSubmap) {
      updateSubmap(selectedSubmap.id, {
        scene: submapState
      });
      
      // Show save confirmation
      console.log('Submap saved!');
    }
  };

  const handleSubmapFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setSubmapState({
            ...submapState,
            backgroundImage: {
              dataUrl: e.target.result,
              width: img.width,
              height: img.height
            }
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Submap Manager */}
      <Dialog open={!selectedSubmap} onOpenChange={onClose}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Map className="w-5 h-5" />
              Submaps
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Submap
            </Button>

            {showCreateForm && (
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <Label htmlFor="submap-name">Name</Label>
                    <Input
                      id="submap-name"
                      value={newSubmap.name}
                      onChange={(e) => setNewSubmap({ ...newSubmap, name: e.target.value })}
                      placeholder="Submap name"
                      className="bg-gray-600 border-gray-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label>X</Label>
                      <Input
                        type="number"
                        value={newSubmap.bounds.x}
                        onChange={(e) => setNewSubmap({
                          ...newSubmap,
                          bounds: { ...newSubmap.bounds, x: parseInt(e.target.value) || 0 }
                        })}
                        className="bg-gray-600 border-gray-500"
                      />
                    </div>
                    <div>
                      <Label>Y</Label>
                      <Input
                        type="number"
                        value={newSubmap.bounds.y}
                        onChange={(e) => setNewSubmap({
                          ...newSubmap,
                          bounds: { ...newSubmap.bounds, y: parseInt(e.target.value) || 0 }
                        })}
                        className="bg-gray-600 border-gray-500"
                      />
                    </div>
                    <div>
                      <Label>Width</Label>
                      <Input
                        type="number"
                        value={newSubmap.bounds.w}
                        onChange={(e) => setNewSubmap({
                          ...newSubmap,
                          bounds: { ...newSubmap.bounds, w: parseInt(e.target.value) || 100 }
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
                          bounds: { ...newSubmap.bounds, h: parseInt(e.target.value) || 100 }
                        })}
                        className="bg-gray-600 border-gray-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleCreateSubmap} className="flex-1 bg-green-600 hover:bg-green-700">
                      Create
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submaps List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {submaps.map((submap) => (
                <Card key={submap.id} className="bg-gray-700 border-gray-600">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{submap.name}</div>
                        <div className="text-sm text-gray-400">
                          {submap.bounds.w} × {submap.bounds.h} units
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => openSubmap(submap)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSubmap(submap.id)}
                          className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {submaps.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No submaps created yet
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submap Editor */}
      {selectedSubmap && (
        <Dialog open={true} onOpenChange={closeSubmap}>
          <DialogContent className="max-w-6xl h-[80vh] bg-gray-800 border-gray-700 text-white p-0">
            <div className="h-full flex flex-col">
              {/* Submap Header */}
              <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{selectedSubmap.name}</h2>
                  <span className="text-sm text-gray-400">Submap Editor</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Upload Background */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSubmapFileUpload}
                    className="hidden"
                    id="submap-file-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('submap-file-upload').click()}
                  >
                    Upload Map
                  </Button>
                  
                  <Button
                    onClick={saveSubmap}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={closeSubmap}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Submap Canvas */}
              <div className="flex-1 relative">
                <div className="absolute inset-0">
                  {/* Here we would render a separate canvas instance for the submap */}
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <Map className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Submap Canvas</p>
                      <p className="text-sm text-gray-500">
                        This would contain a separate canvas instance with all the same tools
                      </p>
                      <p className="text-sm text-gray-500">
                        Grid: {submapState.gridEnabled ? 'On' : 'Off'} | 
                        Fog: {submapState.fogEnabled ? 'On' : 'Off'} | 
                        Tokens: {submapState.tokens.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default SubmapModal;