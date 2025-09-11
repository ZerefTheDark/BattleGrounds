import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  Upload, 
  FileText, 
  Map, 
  Users, 
  Wand2, 
  Sword, 
  Shield,
  BookOpen,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const UploadExpansion = ({ onClose }) => {
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, processing, complete, error
  const [progress, setProgress] = useState(0);
  const [parsedContent, setParsedContent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const contentTypes = {
    maps: { icon: Map, label: 'Maps', color: 'bg-blue-600', count: 0 },
    characters: { icon: Users, label: 'Character Images', color: 'bg-green-600', count: 0 },
    characterSheets: { icon: FileText, label: 'Character Sheets', color: 'bg-emerald-600', count: 0 },
    races: { icon: Users, label: 'Races', color: 'bg-purple-600', count: 0 },
    traits: { icon: Shield, label: 'Traits', color: 'bg-orange-600', count: 0 },
    features: { icon: BookOpen, label: 'Features', color: 'bg-cyan-600', count: 0 },
    items: { icon: Sword, label: 'Items', color: 'bg-red-600', count: 0 },
    cantrips: { icon: Wand2, label: 'Cantrips', color: 'bg-yellow-600', count: 0 },
    spells: { icon: Wand2, label: 'Leveled Spells', color: 'bg-indigo-600', count: 0 }
  };

  const parseD5eFile = async (file) => {
    try {
      const parsed = {
        maps: [],
        characters: [],
        characterSheets: [],
        races: [],
        traits: [],
        features: [],
        items: [],
        cantrips: [],
        spells: []
      };

      // Handle PDF files (character sheets)
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const characterSheet = await parsePDFCharacterSheet(file);
        if (characterSheet) {
          parsed.characterSheets.push(characterSheet);
        }
        // Update counts
        Object.keys(parsed).forEach(key => {
          contentTypes[key].count = parsed[key].length;
        });
        return parsed;
      }

      // Handle text-based files (JSON/XML)
      const text = await file.text();
      let data;
      
      // Try parsing as JSON first
      try {
        data = JSON.parse(text);
      } catch {
        // If JSON fails, try XML parsing
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        data = xmlToJson(xmlDoc);
      }

      // Parse different content types
      if (data.compendium || data.root) {
        const content = data.compendium || data.root;
        
        // Parse races
        if (content.race) {
          const races = Array.isArray(content.race) ? content.race : [content.race];
          parsed.races = races.map(race => ({
            id: Date.now() + Math.random(),
            name: race.name || race.title,
            description: race.description || race.text,
            traits: race.trait || [],
            source: file.name
          }));
        }

        // Parse spells
        if (content.spell) {
          const spells = Array.isArray(content.spell) ? content.spell : [content.spell];
          spells.forEach(spell => {
            const spellData = {
              id: Date.now() + Math.random(),
              name: spell.name || spell.title,
              level: parseInt(spell.level) || 0,
              school: spell.school,
              description: spell.description || spell.text,
              range: spell.range,
              duration: spell.duration,
              castingTime: spell.time || spell.castingTime,
              components: spell.components,
              source: file.name
            };

            if (spellData.level === 0) {
              parsed.cantrips.push(spellData);
            } else {
              parsed.spells.push(spellData);
            }
          });
        }

        // Parse items
        if (content.item) {
          const items = Array.isArray(content.item) ? content.item : [content.item];
          parsed.items = items.map(item => ({
            id: Date.now() + Math.random(),
            name: item.name || item.title,
            type: item.type,
            rarity: item.rarity,
            description: item.description || item.text,
            properties: item.property || [],
            source: file.name
          }));
        }

        // Parse features/traits
        if (content.feat || content.feature) {
          const features = Array.isArray(content.feat || content.feature) 
            ? (content.feat || content.feature) 
            : [content.feat || content.feature];
          parsed.features = features.map(feat => ({
            id: Date.now() + Math.random(),
            name: feat.name || feat.title,
            description: feat.description || feat.text,
            prerequisite: feat.prerequisite,
            source: file.name
          }));
        }

        // Parse monsters/characters
        if (content.monster) {
          const monsters = Array.isArray(content.monster) ? content.monster : [content.monster];
          parsed.characters = monsters.map(monster => ({
            id: Date.now() + Math.random(),
            name: monster.name || monster.title,
            type: monster.type,
            size: monster.size,
            alignment: monster.alignment,
            ac: monster.ac,
            hp: monster.hp,
            stats: {
              STR: monster.str || 10,
              DEX: monster.dex || 10,
              CON: monster.con || 10,
              INT: monster.int || 10,
              WIS: monster.wis || 10,
              CHA: monster.cha || 10
            },
            source: file.name
          }));
        }
      }

      // Update counts
      Object.keys(parsed).forEach(key => {
        contentTypes[key].count = parsed[key].length;
      });

      return parsed;
    } catch (error) {
      console.error('Error parsing D&D file:', error);
      throw new Error(`Failed to parse file: ${error.message}`);
    }
  };

  const parsePDFCharacterSheet = async (file) => {
    try {
      // For now, we'll extract basic info from the filename and file properties
      // In a full implementation, you'd use a PDF.js library to extract text
      const fileName = file.name.replace('.pdf', '');
      const characterName = fileName.replace(/[_-]/g, ' ').replace(/\d+/g, '').trim();
      
      // Create a character sheet entry with extracted filename info
      const characterSheet = {
        id: Date.now() + Math.random(),
        name: characterName || 'Unknown Character',
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        type: 'pdf_character_sheet',
        // Store the file as a blob URL for later access
        fileData: URL.createObjectURL(file),
        // Default character fields that could be filled in later
        level: 1,
        race: 'Unknown',
        class: 'Unknown',
        background: 'Unknown',
        stats: {
          STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10
        },
        hitPoints: { max: 8, current: 8 },
        armorClass: 10,
        speed: 30,
        proficiencyBonus: 2,
        source: file.name,
        // Flag to indicate this needs manual data entry
        needsDataEntry: true
      };

      return characterSheet;
    } catch (error) {
      console.error('Error parsing PDF character sheet:', error);
      return null;
    }
  };

  const xmlToJson = (xml) => {
    let obj = {};
    if (xml.nodeType === 1) {
      if (xml.attributes.length > 0) {
        obj['@attributes'] = {};
        for (let j = 0; j < xml.attributes.length; j++) {
          const attribute = xml.attributes.item(j);
          obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType === 3) {
      obj = xml.nodeValue;
    }

    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i);
        const nodeName = item.nodeName;
        if (typeof obj[nodeName] === 'undefined') {
          obj[nodeName] = xmlToJson(item);
        } else {
          if (typeof obj[nodeName].push === 'undefined') {
            const old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(xmlToJson(item));
        }
      }
    }
    return obj;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('idle');
      setParsedContent(null);
      // Reset counts
      Object.keys(contentTypes).forEach(key => {
        contentTypes[key].count = 0;
      });
    }
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setUploadStatus('processing');
    setProgress(0);

    try {
      // Simulate processing steps
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress(50);
      const parsed = await parseD5eFile(selectedFile);
      
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Save to localStorage
      Object.keys(parsed).forEach(type => {
        if (parsed[type].length > 0) {
          const existing = JSON.parse(localStorage.getItem(`dnd_${type}`) || '[]');
          const combined = [...existing, ...parsed[type]];
          localStorage.setItem(`dnd_${type}`, JSON.stringify(combined));
        }
      });

      setProgress(100);
      setParsedContent(parsed);
      setUploadStatus('complete');
    } catch (error) {
      console.error('Processing error:', error);
      setUploadStatus('error');
    }
  };

  const getTotalItems = () => {
    return Object.values(contentTypes).reduce((sum, type) => sum + type.count, 0);
  };

  return (
    <Card className="fantasy-card w-[600px] text-white h-full shadow-lg shadow-green-500/10 fantasy-scrollbar relative z-50" style={{ pointerEvents: 'auto' }}>
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 border-b border-green-500/30">
        <div className="flex items-center gap-3">
          <Upload className="w-6 h-6 text-green-400" />
          <CardTitle className="text-lg dragon-stones-title">Upload D&D Expansion</CardTitle>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Closing upload expansion');
            onClose();
          }}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/30 border border-red-600/50 rounded-full w-8 h-8 p-0"
          title="Close Upload Expansion"
        >
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>

      <CardContent className="p-6 space-y-6 relative z-10" style={{ pointerEvents: 'auto' }}>
        {/* File Upload Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-green-400 mb-2">Select D&D Content File</h3>
            <p className="text-xs text-gray-400 mb-3">
              Supports D&D 5e JSON/XML files, PDF character sheets, homebrew content, and official modules
            </p>
            <div className="relative">
              <input
                type="file"
                accept=".json,.xml,.5e,.pdf"
                onChange={handleFileSelect}
                className="w-full p-3 bg-gray-800 border-2 border-purple-500/50 rounded-lg text-white cursor-pointer hover:bg-gray-700 hover:border-purple-400 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              />
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm font-medium">{selectedFile.name}</div>
                  <div className="text-xs text-gray-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Process File button clicked, selectedFile:', selectedFile);
                  if (selectedFile) {
                    console.log('Starting file processing...');
                    processFile();
                  } else {
                    console.log('No file selected for processing');
                  }
                }}
                disabled={uploadStatus === 'processing' || !selectedFile}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                style={{ 
                  pointerEvents: 'auto',
                  zIndex: 1000,
                  position: 'relative'
                }}
              >
                {uploadStatus === 'processing' ? 'Processing...' : 'Process File'}
              </Button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {uploadStatus === 'processing' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing D&D content...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Status Messages */}
        {uploadStatus === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">Failed to process file. Please check the format.</span>
          </div>
        )}

        {uploadStatus === 'complete' && (
          <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300">
              Successfully processed {getTotalItems()} items!
            </span>
          </div>
        )}

        {/* Content Breakdown */}
        {parsedContent && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-green-400">Content Breakdown</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(contentTypes).map(([key, type]) => {
                const Icon = type.icon;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{type.label}</div>
                      <Badge variant="secondary" className="text-xs">
                        {type.count} items
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Character Sheets Preview */}
            {parsedContent.characterSheets && parsedContent.characterSheets.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-emerald-400">Character Sheets Found</h4>
                <div className="space-y-2">
                  {parsedContent.characterSheets.map((sheet, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-emerald-500/30"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <div>
                          <div className="text-sm font-medium">{sheet.name}</div>
                          <div className="text-xs text-gray-400">
                            {sheet.fileName} • {(sheet.fileSize / 1024).toFixed(1)} KB
                          </div>
                          {sheet.needsDataEntry && (
                            <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400 mt-1">
                              Needs Data Entry
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          // Here you would open the character sheet viewer
                          // For now, we'll just log it
                          console.log('Open character sheet:', sheet);
                          alert(`Character sheet viewer would open for: ${sheet.name}\n\nThis will allow you to:\n- View the original PDF\n- Enter character stats manually\n- Save the character data\n- Import into your battle map`);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        View/Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-3 text-xs text-gray-400">
          <h4 className="font-bold text-green-400">Supported Formats:</h4>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>PDF Character Sheets (fillable PDFs, scanned sheets)</li>
            <li>D&D 5e JSON files (homebrew tools, modules)</li>
            <li>XML compendium files</li>
            <li>Official D&D content exports</li>
            <li>Homebrew collections from popular tools</li>
          </ul>
          <p className="italic">
            Content will be automatically categorized and added to your local storage. PDF character sheets will be processed and allow manual data entry for complete character import.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadExpansion;