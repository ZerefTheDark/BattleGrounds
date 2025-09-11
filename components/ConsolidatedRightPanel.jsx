import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Map, 
  Upload, 
  Archive, 
  ChevronDown, 
  ChevronUp,
  Layers,
  FolderOpen,
  FileUp
} from 'lucide-react';
import SubmapManager from './SubmapManager';
import StoragePanel from './StoragePanel';
import UploadExpansion from './UploadExpansion';

const ConsolidatedRightPanel = ({ onClose }) => {
  const [expandedSection, setExpandedSection] = useState('submap'); // 'submap', 'storage', 'upload', or null

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <Card className="fantasy-card w-[400px] text-white h-full shadow-lg shadow-green-500/10 fantasy-scrollbar">
      <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-green-500/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg dragon-stones-title flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-400" />
            Map Management
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-red-400 hover:text-red-300"
            >
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Submap Manager Section */}
        <div className="border-b border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-between p-4 text-left hover:bg-gray-800/50"
            onClick={() => toggleSection('submap')}
          >
            <div className="flex items-center gap-3">
              <Map className="w-5 h-5 text-blue-400" />
              <span className="font-medium">Submap Manager</span>
            </div>
            {expandedSection === 'submap' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          
          {expandedSection === 'submap' && (
            <div className="px-4 pb-4 bg-gray-800/30">
              <SubmapManager />
            </div>
          )}
        </div>

        {/* Storage Panel Section */}
        <div className="border-b border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-between p-4 text-left hover:bg-gray-800/50"
            onClick={() => toggleSection('storage')}
          >
            <div className="flex items-center gap-3">
              <Archive className="w-5 h-5 text-purple-400" />
              <span className="font-medium">Storage Panel</span>
            </div>
            {expandedSection === 'storage' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          
          {expandedSection === 'storage' && (
            <div className="px-4 pb-4 bg-gray-800/30">
              <StoragePanel />
            </div>
          )}
        </div>

        {/* Upload Expansion Section */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 text-left hover:bg-gray-800/50"
            onClick={() => toggleSection('upload')}
          >
            <div className="flex items-center gap-3">
              <FileUp className="w-5 h-5 text-emerald-400" />
              <span className="font-medium">Upload Expansion</span>
            </div>
            {expandedSection === 'upload' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          
          {expandedSection === 'upload' && (
            <div className="px-4 pb-4 bg-gray-800/30">
              <UploadExpansion />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsolidatedRightPanel;