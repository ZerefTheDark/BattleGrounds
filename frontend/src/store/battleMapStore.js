import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useBattleMapStore = create(
  persist(
    (set, get) => ({
      // Camera state
      camera: { x: 0, y: 0, scale: 1 },
      setCamera: (camera) => set({ camera }),

      // Grid settings
      gridSize: 25,
      gridEnabled: true,
      setGridSize: (size) => set({ gridSize: size }),
      setGridEnabled: (enabled) => set({ gridEnabled: enabled }),

      // Background
      backgroundImage: null,
      setBackgroundImage: (image) => set({ backgroundImage: image }),

      // Fog of War
      fogEnabled: false,
      fogReveals: [],
      setFogEnabled: (enabled) => set({ fogEnabled: enabled }),
      addFogReveal: (reveal) => set((state) => ({
        fogReveals: [...state.fogReveals, reveal]
      })),
      clearFogReveals: () => set({ fogReveals: [] }),

      // Ruler
      ruler: { active: false, start: null, end: null },
      setRuler: (ruler) => set({ ruler }),

      // Tokens
      tokens: [],
      selectedTokenId: null,
      addToken: (token) => set((state) => ({
        tokens: [...state.tokens, { ...token, id: Date.now().toString() }]
      })),
      updateToken: (id, updates) => set((state) => ({
        tokens: state.tokens.map(token =>
          token.id === id ? { ...token, ...updates } : token
        )
      })),
      removeToken: (id) => set((state) => ({
        tokens: state.tokens.filter(token => token.id !== id),
        selectedTokenId: state.selectedTokenId === id ? null : state.selectedTokenId
      })),
      selectToken: (id) => set({ selectedTokenId: id }),

      // Chat
      chatMessages: [],
      addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages, {
          ...message,
          id: Date.now().toString(),
          timestamp: Date.now()
        }]
      })),

      // Initiative
      initiative: {
        round: 1,
        turn: 0,
        combatants: []
      },
      setInitiative: (initiative) => set({ initiative }),
      addCombatant: (combatant) => set((state) => ({
        initiative: {
          ...state.initiative,
          combatants: [...state.initiative.combatants, {
            ...combatant,
            id: Date.now().toString()
          }]
        }
      })),
      removeCombatant: (id) => set((state) => ({
        initiative: {
          ...state.initiative,
          combatants: state.initiative.combatants.filter(c => c.id !== id)
        }
      })),
      nextTurn: () => set((state) => {
        const { combatants, turn, round } = state.initiative;
        const nextTurn = turn + 1;
        if (nextTurn >= combatants.length) {
          return {
            initiative: {
              ...state.initiative,
              turn: 0,
              round: round + 1
            }
          };
        }
        return {
          initiative: {
            ...state.initiative,
            turn: nextTurn
          }
        };
      }),

      // Submaps
      submaps: [],
      addSubmap: (submap) => set((state) => ({
        submaps: [...state.submaps, { ...submap, id: Date.now().toString() }]
      })),
      updateSubmap: (id, updates) => set((state) => ({
        submaps: state.submaps.map(submap =>
          submap.id === id ? { ...submap, ...updates } : submap
        )
      })),
      removeSubmap: (id) => set((state) => ({
        submaps: state.submaps.filter(submap => submap.id !== id)
      })),

      // Party management
      partyMembers: [],
      addPartyMember: (member) => set((state) => ({
        partyMembers: [...state.partyMembers, { ...member, id: Date.now().toString() }]
      })),
      updatePartyMember: (id, updates) => set((state) => ({
        partyMembers: state.partyMembers.map(member =>
          member.id === id ? { ...member, ...updates } : member
        )
      })),
      removePartyMember: (id) => set((state) => ({
        partyMembers: state.partyMembers.filter(member => member.id !== id)
      })),

      // File operations
      loadBackgroundImage: (dataUrl) => {
        const img = new Image();
        img.onload = () => {
          set({ 
            backgroundImage: { 
              dataUrl, 
              width: img.width, 
              height: img.height,
              scale: 1.2 // 20% larger by default
            } 
          });
        };
        img.src = dataUrl;
      },

      saveScenario: () => {
        const state = get();
        const scenario = {
          version: 1,
          name: `Battle Map ${new Date().toLocaleDateString()}`,
          created: Date.now(),
          camera: state.camera,
          gridSize: state.gridSize,
          gridEnabled: state.gridEnabled,
          backgroundImage: state.backgroundImage,
          fogEnabled: state.fogEnabled,
          fogReveals: state.fogReveals,
          tokens: state.tokens,
          chatMessages: state.chatMessages,
          initiative: state.initiative,
          submaps: state.submaps,
          partyMembers: state.partyMembers
        };
        
        // Save to localStorage
        const savedScenarios = JSON.parse(localStorage.getItem('saved_scenarios') || '[]');
        savedScenarios.push(scenario);
        localStorage.setItem('saved_scenarios', JSON.stringify(savedScenarios));
        
        // Also download as file
        const blob = new Blob([JSON.stringify(scenario, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `battle-map-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },

      loadScenario: (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const scenario = JSON.parse(e.target.result);
            set({
              camera: scenario.camera || { x: 0, y: 0, scale: 1 },
              gridSize: scenario.gridSize || 50,
              gridEnabled: scenario.gridEnabled !== false,
              backgroundImage: scenario.backgroundImage,
              fogEnabled: scenario.fogEnabled || false,
              fogReveals: scenario.fogReveals || [],
              tokens: scenario.tokens || [],
              chatMessages: scenario.chatMessages || [],
              initiative: scenario.initiative || { round: 1, turn: 0, combatants: [] },
              submaps: scenario.submaps || [],
              partyMembers: scenario.partyMembers || []
            });
          } catch (error) {
            console.error('Failed to load scenario:', error);
          }
        };
        reader.readAsText(file);
      },

      getSavedScenarios: () => {
        return JSON.parse(localStorage.getItem('saved_scenarios') || '[]');
      },

      loadSavedScenario: (scenario) => {
        set({
          camera: scenario.camera || { x: 0, y: 0, scale: 1 },
          gridSize: scenario.gridSize || 50,
          gridEnabled: scenario.gridEnabled !== false,
          backgroundImage: scenario.backgroundImage,
          fogEnabled: scenario.fogEnabled || false,
          fogReveals: scenario.fogReveals || [],
          tokens: scenario.tokens || [],
          chatMessages: scenario.chatMessages || [],
          initiative: scenario.initiative || { round: 1, turn: 0, combatants: [] },
          submaps: scenario.submaps || [],
          partyMembers: scenario.partyMembers || []
        });
      },

      deleteSavedScenario: (index) => {
        const savedScenarios = JSON.parse(localStorage.getItem('saved_scenarios') || '[]');
        savedScenarios.splice(index, 1);
        localStorage.setItem('saved_scenarios', JSON.stringify(savedScenarios));
      },

      newScenario: () => set({
        camera: { x: 0, y: 0, scale: 1 },
        gridSize: 50,
        gridEnabled: true,
        backgroundImage: null,
        fogEnabled: false,
        fogReveals: [],
        tokens: [],
        selectedTokenId: null,
        chatMessages: [],
        initiative: { round: 1, turn: 0, combatants: [] },
        submaps: [],
        partyMembers: []
      })
    }),
    {
      name: 'battle-map-storage',
      partialize: (state) => ({
        camera: state.camera,
        gridSize: state.gridSize,
        gridEnabled: state.gridEnabled,
        backgroundImage: state.backgroundImage,
        fogEnabled: state.fogEnabled,
        fogReveals: state.fogReveals,
        tokens: state.tokens,
        chatMessages: state.chatMessages,
        initiative: state.initiative,
        submaps: state.submaps
      })
    }
  )
);

export { useBattleMapStore };