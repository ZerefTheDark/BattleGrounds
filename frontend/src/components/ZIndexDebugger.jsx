import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Bug } from 'lucide-react';

const ZIndexDebugger = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [elements, setElements] = useState([]);

  const scanForElements = () => {
    const allElements = Array.from(document.querySelectorAll('*'));
    const elementsWithZIndex = allElements
      .filter(el => {
        const computedStyle = window.getComputedStyle(el);
        const zIndex = computedStyle.zIndex;
        const position = computedStyle.position;
        return (zIndex !== 'auto' && zIndex !== '0') || 
               position === 'fixed' || 
               position === 'absolute' ||
               el.classList.contains('draggable-window') ||
               el.classList.contains('canvas-container');
      })
      .map(el => {
        const computedStyle = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          element: el,
          tagName: el.tagName.toLowerCase(),
          className: el.className,
          id: el.id,
          zIndex: computedStyle.zIndex,
          position: computedStyle.position,
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          opacity: computedStyle.opacity,
          visibility: computedStyle.visibility,
          transform: computedStyle.transform
        };
      })
      .sort((a, b) => {
        const aZ = a.zIndex === 'auto' ? 0 : parseInt(a.zIndex);
        const bZ = b.zIndex === 'auto' ? 0 : parseInt(b.zIndex);
        return bZ - aZ; // Sort highest z-index first
      });

    setElements(elementsWithZIndex);
  };

  useEffect(() => {
    if (isVisible) {
      scanForElements();
      const interval = setInterval(scanForElements, 2000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const highlightElement = (element) => {
    element.style.outline = '3px solid red';
    element.style.outlineOffset = '2px';
    setTimeout(() => {
      element.style.outline = '';
      element.style.outlineOffset = '';
    }, 3000);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-20 right-4 z-[10000] bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-md shadow-lg"
        title="Open Z-Index Debugger"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed top-20 right-4 w-96 max-h-96 bg-gray-900 border border-green-500/50 rounded-lg shadow-2xl z-[10000] overflow-hidden">
      <div className="bg-gray-800 p-3 border-b border-green-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-bold">Z-Index Debugger</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          <EyeOff className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-3 max-h-80 overflow-y-auto">
        <div className="mb-3">
          <button
            onClick={scanForElements}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
          >
            Refresh Scan
          </button>
        </div>
        
        <div className="space-y-2">
          {elements.map((el, index) => (
            <div
              key={index}
              className="bg-gray-800 p-2 rounded border border-gray-700 text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-yellow-400 font-mono">
                  z-index: {el.zIndex}
                </span>
                <button
                  onClick={() => highlightElement(el.element)}
                  className="text-blue-400 hover:text-blue-300"
                  title="Highlight element"
                >
                  <Eye className="w-3 h-3" />
                </button>
              </div>
              <div className="text-white">&lt;{el.tagName}&gt;</div>
              {el.className && (
                <div className="text-gray-400 truncate">
                  class: {el.className}
                </div>
              )}
              {el.id && (
                <div className="text-gray-400">
                  id: {el.id}
                </div>
              )}
              <div className="text-gray-500">
                pos: {el.position} | opacity: {el.opacity}
              </div>
              <div className="text-gray-500">
                size: {Math.round(el.width)}x{Math.round(el.height)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ZIndexDebugger;