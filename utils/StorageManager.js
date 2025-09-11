// Centralized Storage Manager for The Dragon Stones Battle Map
export class StorageManager {
  static STORAGE_KEYS = {
    MAPS: 'dragon_stones_maps',
    SUBMAPS: 'dragon_stones_submaps', 
    TOKENS: 'dragon_stones_tokens',
    CHARACTERS: 'dragon_stones_characters',
    SCENARIOS: 'dragon_stones_scenarios'
  };

  // Map Storage
  static saveBattleMap(mapData) {
    const maps = this.getAllMaps();
    const mapToSave = {
      id: mapData.id || Date.now().toString(),
      name: mapData.name || `Map ${new Date().toLocaleDateString()}`,
      image: mapData.image,
      thumbnail: mapData.thumbnail,
      gridSize: mapData.gridSize || 25,
      created: mapData.created || Date.now(),
      updated: Date.now()
    };
    
    const existingIndex = maps.findIndex(m => m.id === mapToSave.id);
    if (existingIndex >= 0) {
      maps[existingIndex] = mapToSave;
    } else {
      maps.push(mapToSave);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.MAPS, JSON.stringify(maps));
    return mapToSave;
  }

  static getAllMaps() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.MAPS) || '[]');
  }

  static getMap(id) {
    const maps = this.getAllMaps();
    return maps.find(m => m.id === id);
  }

  static deleteMap(id) {
    const maps = this.getAllMaps();
    const filtered = maps.filter(m => m.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.MAPS, JSON.stringify(filtered));
  }

  // Submap Storage
  static saveSubmap(submapData) {
    const submaps = this.getAllSubmaps();
    const submapToSave = {
      id: submapData.id || Date.now().toString(),
      name: submapData.name,
      bounds: submapData.bounds,
      scene: submapData.scene,
      parentMapId: submapData.parentMapId,
      created: submapData.created || Date.now(),
      updated: Date.now()
    };
    
    const existingIndex = submaps.findIndex(s => s.id === submapToSave.id);
    if (existingIndex >= 0) {
      submaps[existingIndex] = submapToSave;
    } else {
      submaps.push(submapToSave);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.SUBMAPS, JSON.stringify(submaps));
    return submapToSave;
  }

  static getAllSubmaps() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SUBMAPS) || '[]');
  }

  static getSubmap(id) {
    const submaps = this.getAllSubmaps();
    return submaps.find(s => s.id === id);
  }

  static deleteSubmap(id) {
    const submaps = this.getAllSubmaps();
    const filtered = submaps.filter(s => s.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.SUBMAPS, JSON.stringify(filtered));
  }

  // Token Template Storage
  static saveTokenTemplate(tokenData) {
    const tokens = this.getAllTokenTemplates();
    const tokenToSave = {
      id: tokenData.id || Date.now().toString(),
      name: tokenData.name,
      shape: tokenData.shape,
      size: tokenData.size,
      color: tokenData.color,
      image: tokenData.image,
      category: tokenData.category || 'Custom',
      created: tokenData.created || Date.now()
    };
    
    const existingIndex = tokens.findIndex(t => t.id === tokenToSave.id);
    if (existingIndex >= 0) {
      tokens[existingIndex] = tokenToSave;
    } else {
      tokens.push(tokenToSave);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
    return tokenToSave;
  }

  static getAllTokenTemplates() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.TOKENS) || '[]');
  }

  static getTokenTemplatesByCategory(category) {
    const tokens = this.getAllTokenTemplates();
    return tokens.filter(t => t.category === category);
  }

  static deleteTokenTemplate(id) {
    const tokens = this.getAllTokenTemplates();
    const filtered = tokens.filter(t => t.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.TOKENS, JSON.stringify(filtered));
  }

  // Character Storage
  static saveCharacter(characterData) {
    const characters = this.getAllCharacters();
    const characterToSave = {
      id: characterData.id || Date.now().toString(),
      name: characterData.name,
      class: characterData.class,
      race: characterData.race,
      level: characterData.level,
      data: characterData.data, // Full character data
      portrait: characterData.portrait,
      uploadedSheet: characterData.uploadedSheet,
      created: characterData.created || Date.now(),
      updated: Date.now()
    };
    
    const existingIndex = characters.findIndex(c => c.id === characterToSave.id);
    if (existingIndex >= 0) {
      characters[existingIndex] = characterToSave;
    } else {
      characters.push(characterToSave);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.CHARACTERS, JSON.stringify(characters));
    return characterToSave;
  }

  static getAllCharacters() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CHARACTERS) || '[]');
  }

  static getCharacter(id) {
    const characters = this.getAllCharacters();
    return characters.find(c => c.id === id);
  }

  static deleteCharacter(id) {
    const characters = this.getAllCharacters();
    const filtered = characters.filter(c => c.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.CHARACTERS, JSON.stringify(filtered));
  }

  // Scenario Storage (complete battle map states)
  static saveScenario(scenarioData) {
    const scenarios = this.getAllScenarios();
    const scenarioToSave = {
      id: scenarioData.id || Date.now().toString(),
      name: scenarioData.name || `Scenario ${new Date().toLocaleDateString()}`,
      data: scenarioData.data, // Complete battle map state
      thumbnail: scenarioData.thumbnail,
      created: scenarioData.created || Date.now(),
      updated: Date.now()
    };
    
    const existingIndex = scenarios.findIndex(s => s.id === scenarioToSave.id);
    if (existingIndex >= 0) {
      scenarios[existingIndex] = scenarioToSave;
    } else {
      scenarios.push(scenarioToSave);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.SCENARIOS, JSON.stringify(scenarios));
    return scenarioToSave;
  }

  static getAllScenarios() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SCENARIOS) || '[]');
  }

  static getScenario(id) {
    const scenarios = this.getAllScenarios();
    return scenarios.find(s => s.id === id);
  }

  static deleteScenario(id) {
    const scenarios = this.getAllScenarios();
    const filtered = scenarios.filter(s => s.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.SCENARIOS, JSON.stringify(filtered));
  }

  // Utility Methods
  static exportData(type) {
    const data = {
      type,
      data: localStorage.getItem(this.STORAGE_KEYS[type.toUpperCase()]) || '[]',
      exported: Date.now()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dragon-stones-${type.toLowerCase()}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static importData(file, type) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (imported.type === type) {
            localStorage.setItem(this.STORAGE_KEYS[type.toUpperCase()], imported.data);
            resolve(JSON.parse(imported.data));
          } else {
            reject(new Error('Invalid file type'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }

  static getStorageStats() {
    return {
      maps: this.getAllMaps().length,
      submaps: this.getAllSubmaps().length,
      tokens: this.getAllTokenTemplates().length,
      characters: this.getAllCharacters().length,
      scenarios: this.getAllScenarios().length
    };
  }

  static clearStorage(type) {
    if (confirm(`Are you sure you want to clear all ${type}? This cannot be undone.`)) {
      localStorage.removeItem(this.STORAGE_KEYS[type.toUpperCase()]);
    }
  }
}