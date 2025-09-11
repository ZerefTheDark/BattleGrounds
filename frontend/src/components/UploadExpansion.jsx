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
      console.log('Starting to parse file:', file.name, 'type:', file.type);
      
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
        console.log('Processing PDF character sheet');
        const characterSheet = await parsePDFCharacterSheet(file);
        if (characterSheet) {
          parsed.characterSheets.push(characterSheet);
        }
        Object.keys(parsed).forEach(key => {
          contentTypes[key].count = parsed[key].length;
        });
        return parsed;
      }

      // Handle character sheet template JSON
      if (file.name.toLowerCase().includes('character_sheet_template')) {
        console.log('Processing character sheet template JSON');
        const text = await file.text();
        const characterData = JSON.parse(text);
        
        const characterSheet = {
          id: Date.now() + Math.random(),
          name: characterData.character?.name || 'Template Character',
          type: 'json_character_template',
          level: characterData.character?.level || 1,
          race: characterData.character?.species || 'Unknown',
          class: characterData.character?.class || 'Unknown',
          background: characterData.character?.background || 'Unknown',
          stats: {
            STR: characterData.stats?.strength || 10,
            DEX: characterData.stats?.dexterity || 10,
            CON: characterData.stats?.constitution || 10,
            INT: characterData.stats?.intelligence || 10,
            WIS: characterData.stats?.wisdom || 10,
            CHA: characterData.stats?.charisma || 10
          },
          hitPoints: {
            max: characterData.combat?.hit_points?.max || 8,
            current: characterData.combat?.hit_points?.current || 8
          },
          armorClass: characterData.combat?.armor_class || 10,
          speed: characterData.combat?.speed || 30,
          source: file.name,
          rawData: characterData
        };
        
        parsed.characterSheets.push(characterSheet);
        Object.keys(parsed).forEach(key => {
          contentTypes[key].count = parsed[key].length;
        });
        return parsed;
      }

      // Handle text-based files (JSON/XML)
      const text = await file.text();
      console.log('File text length:', text.length);
      
      let data;
      try {
        data = JSON.parse(text);
        console.log('Successfully parsed JSON, keys:', Object.keys(data));
      } catch (jsonError) {
        console.log('JSON parsing failed, trying XML');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        data = xmlToJson(xmlDoc);
      }

      // Handle PDF text extraction format (like dnd_Everything.full.json)
      if (data.version === 'verbatim-pdf-export-bundle' || data.sources) {
        console.log('Detected PDF text extraction format - cannot parse structured data from this format');
        alert('This file appears to be a PDF text extraction bundle, not structured D&D data. To use this content:\n\n1. You need a structured D&D JSON file with spell/monster/item objects\n2. This file contains raw text from PDFs which cannot be automatically parsed\n3. Try downloading a structured D&D compendium file instead');
        throw new Error('PDF text extraction format cannot be parsed');
      }

      // Find the content structure
      let content = data;
      if (data.compendium) content = data.compendium;
      else if (data.root) content = data.root;
      else if (data.spell || data.monster || data.item || data.race) content = data;

      console.log('Content structure found:', Object.keys(content));

      // Parse spells
      if (content.spell) {
        const spells = Array.isArray(content.spell) ? content.spell : [content.spell];
        spells.forEach(spell => {
          const spellData = {
            id: Date.now() + Math.random(),
            name: spell.name || 'Unknown Spell',
            level: parseInt(spell.level) || 0,
            school: spell.school || 'Unknown',
            description: spell.description || spell.text || 'No description',
            source: file.name
          };
          if (spellData.level === 0) {
            parsed.cantrips.push(spellData);
          } else {
            parsed.spells.push(spellData);
          }
        });
        console.log(`Parsed ${parsed.cantrips.length} cantrips and ${parsed.spells.length} spells`);
      }

      // Parse monsters
      if (content.monster) {
        const monsters = Array.isArray(content.monster) ? content.monster : [content.monster];
        parsed.characters = monsters.map(monster => ({
          id: Date.now() + Math.random(),
          name: monster.name || 'Unknown Monster',
          type: monster.type || 'Unknown',
          size: monster.size || 'Medium',
          source: file.name
        }));
        console.log(`Parsed ${parsed.characters.length} monsters`);
      }

      // Parse items
      if (content.item) {
        const items = Array.isArray(content.item) ? content.item : [content.item];
        parsed.items = items.map(item => ({
          id: Date.now() + Math.random(),
          name: item.name || 'Unknown Item',
          type: item.type || 'Unknown',
          source: file.name
        }));
        console.log(`Parsed ${parsed.items.length} items`);
      }

      // Update counts
      Object.keys(parsed).forEach(key => {
        contentTypes[key].count = parsed[key].length;
      });

      console.log('Final parsed result:', parsed);
      return parsed;
    } catch (error) {
      console.error('Error parsing D&D file:', error);
      throw new Error(`Failed to parse file: ${error.message}`);
    }
  };

  const parsePDFCharacterSheet = async (file) => {
    try {
      console.log('Starting PDF text extraction for:', file.name);
      
      // Dynamic import of PDF.js
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set up PDF.js worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.js`;
      
      // Read the PDF file
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      console.log(`PDF has ${pdf.numPages} pages`);
      
      let fullText = '';
      
      // Extract text from all pages
      for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) { // Limit to first 5 pages
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      console.log('Extracted text length:', fullText.length);
      console.log('First 500 characters:', fullText.substring(0, 500));
      
      // Parse character information from the extracted text
      const characterData = parseCharacterFromText(fullText);
      
      const characterSheet = {
        id: Date.now() + Math.random(),
        name: characterData.name || file.name.replace('.pdf', '').replace(/[_-]/g, ' ').replace(/\d+/g, '').trim(),
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        type: 'pdf_character_sheet',
        fileData: URL.createObjectURL(file),
        level: characterData.level || 1,
        race: characterData.race || 'Unknown',
        class: characterData.class || 'Unknown',
        background: characterData.background || 'Unknown',
        stats: characterData.stats || {
          STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10
        },
        hitPoints: characterData.hitPoints || { max: 8, current: 8 },
        armorClass: characterData.armorClass || 10,
        speed: characterData.speed || 30,
        proficiencyBonus: characterData.proficiencyBonus || 2,
        source: file.name,
        extractedText: fullText, // Store full text for debugging
        needsDataEntry: !characterData.name // Only needs manual entry if we couldn't extract name
      };

      console.log('Parsed character data:', characterData);
      return characterSheet;
    } catch (error) {
      console.error('Error parsing PDF character sheet:', error);
      
      // Fallback to filename-based parsing
      const fileName = file.name.replace('.pdf', '');
      const characterName = fileName.replace(/[_-]/g, ' ').replace(/\d+/g, '').trim();
      
      return {
        id: Date.now() + Math.random(),
        name: characterName || 'Unknown Character',
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        type: 'pdf_character_sheet',
        fileData: URL.createObjectURL(file),
        level: 1,
        race: 'Unknown',
        class: 'Unknown',
        background: 'Unknown',
        stats: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
        hitPoints: { max: 8, current: 8 },
        armorClass: 10,
        speed: 30,
        proficiencyBonus: 2,
        source: file.name,
        needsDataEntry: true,
        error: error.message
      };
    }
  };

  const parseCharacterFromText = (text) => {
    const characterData = {};
    
    try {
      // Extract character name (look for common patterns)
      const namePatterns = [
        /Character Name[:\s]+([A-Za-z\s]+)/i,
        /Name[:\s]+([A-Za-z\s]+)/i,
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/m // First capitalized words
      ];
      
      for (const pattern of namePatterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].trim().length > 2) {
          characterData.name = match[1].trim();
          break;
        }
      }
      
      // Extract level
      const levelMatch = text.match(/Level[:\s]+(\d+)/i);
      if (levelMatch) {
        characterData.level = parseInt(levelMatch[1]);
      }
      
      // Extract class
      const classPatterns = [
        /Class[:\s]+([A-Za-z]+)/i,
        /(?:Fighter|Wizard|Rogue|Cleric|Ranger|Paladin|Barbarian|Bard|Druid|Monk|Sorcerer|Warlock)/i
      ];
      
      for (const pattern of classPatterns) {
        const match = text.match(pattern);
        if (match) {
          characterData.class = match[1] || match[0];
          break;
        }
      }
      
      // Extract race
      const racePatterns = [
        /Race[:\s]+([A-Za-z\s]+)/i,
        /(?:Human|Elf|Dwarf|Halfling|Dragonborn|Gnome|Half-Elf|Half-Orc|Tiefling)/i
      ];
      
      for (const pattern of racePatterns) {
        const match = text.match(pattern);
        if (match) {
          characterData.race = match[1] || match[0];
          break;
        }
      }
      
      // Extract ability scores
      const stats = {};
      const abilityPatterns = {
        STR: /(?:Strength|STR)[:\s]*(\d+)/i,
        DEX: /(?:Dexterity|DEX)[:\s]*(\d+)/i,
        CON: /(?:Constitution|CON)[:\s]*(\d+)/i,
        INT: /(?:Intelligence|INT)[:\s]*(\d+)/i,
        WIS: /(?:Wisdom|WIS)[:\s]*(\d+)/i,
        CHA: /(?:Charisma|CHA)[:\s]*(\d+)/i
      };
      
      let foundStats = false;
      for (const [ability, pattern] of Object.entries(abilityPatterns)) {
        const match = text.match(pattern);
        if (match && match[1]) {
          const score = parseInt(match[1]);
          if (score >= 3 && score <= 20) { // Valid ability score range
            stats[ability] = score;
            foundStats = true;
          }
        }
      }
      
      if (foundStats) {
        characterData.stats = { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10, ...stats };
      }
      
      // Extract AC
      const acMatch = text.match(/(?:Armor Class|AC)[:\s]*(\d+)/i);
      if (acMatch) {
        characterData.armorClass = parseInt(acMatch[1]);
      }
      
      // Extract HP
      const hpMatch = text.match(/(?:Hit Points|HP)[:\s]*(\d+)/i);
      if (hpMatch) {
        const hp = parseInt(hpMatch[1]);
        characterData.hitPoints = { max: hp, current: hp };
      }
      
      // Extract Speed
      const speedMatch = text.match(/Speed[:\s]*(\d+)/i);
      if (speedMatch) {
        characterData.speed = parseInt(speedMatch[1]);
      }
      
      console.log('Extracted character data:', characterData);
      
    } catch (error) {
      console.error('Error parsing character text:', error);
    }
    
    return characterData;
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
      
      // Show more helpful error message
      if (selectedFile.name.toLowerCase().endsWith('.pdf')) {
        alert('PDF character sheet processed, but manual data entry is required. Please use the View/Edit button to enter character details.');
      } else {
        alert(`Error processing file: ${error.message}\n\nThis might be due to an unsupported file format or structure. Please check that your file is a valid D&D 5e JSON/XML file.`);
      }
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