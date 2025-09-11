import React, { useState, useCallback, createContext, useContext } from 'react';

const WindowManagerContext = createContext();

export const useWindowManager = () => {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error('useWindowManager must be used within a WindowManagerProvider');
  }
  return context;
};

export const WindowManagerProvider = ({ children }) => {
  const [windows, setWindows] = useState([]);
  const [topZIndex, setTopZIndex] = useState(1000);

  const openWindow = useCallback((windowConfig) => {
    const newWindow = {
      id: Date.now().toString(),
      zIndex: topZIndex + 1,
      position: { x: 100, y: 100 },
      ...windowConfig
    };

    setWindows(prev => [...prev, newWindow]);
    setTopZIndex(prev => prev + 1);
    return newWindow.id;
  }, [topZIndex]);

  const closeWindow = useCallback((windowId) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
  }, []);

  const bringToFront = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId 
        ? { ...w, zIndex: topZIndex + 1 }
        : w
    ));
    setTopZIndex(prev => prev + 1);
  }, [topZIndex]);

  const updateWindow = useCallback((windowId, updates) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId 
        ? { ...w, ...updates }
        : w
    ));
  }, []);

  const toggleFullscreen = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId 
        ? { ...w, isFullscreen: !w.isFullscreen, zIndex: w.isFullscreen ? w.zIndex : topZIndex + 1 }
        : w
    ));
    if (!windows.find(w => w.id === windowId)?.isFullscreen) {
      setTopZIndex(prev => prev + 1);
    }
  }, [windows, topZIndex]);

  const value = {
    windows,
    openWindow,
    closeWindow,
    bringToFront,
    updateWindow,
    toggleFullscreen
  };

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
};

export default WindowManagerProvider;