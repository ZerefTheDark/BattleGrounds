import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import DraggableWindow from './DraggableWindow';
import '../styles/enhanced-graphics.css';
import '../styles/layering-fixes.css';

const LayeringTest = () => {
  const [draggableWindows, setDraggableWindows] = useState([]);

  useEffect(() => {
    // Create test draggable window
    const testWindow = {
      id: 'test-layering-window',
      title: 'Layering Test Window',
      icon: MessageSquare,
      content: (
        <div className="p-4">
          <h3 className="text-xl font-bold mb-4">Layering Test Window</h3>
          <p className="mb-2">This window should appear ABOVE the map canvas.</p>
          <p className="mb-4">If you can see the map through this window, there's a layering issue.</p>
          <div style={{ 
            height: '200px', 
            backgroundColor: 'rgba(255,0,0,0.5)',
            border: '2px solid red',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            RED TEST AREA - Should be solid
          </div>
          <p className="mt-4">You should be able to drag this window around!</p>
        </div>
      ),
      position: { x: 300, y: 200 },
      size: { width: 400, height: 500 },
      zIndex: 1000
    };
    
    setDraggableWindows([testWindow]);
    console.log('[LayeringTest] Test draggable window created');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Title */}
      <div className="p-4 bg-gray-800 border-b border-green-500/30">
        <h1 className="text-2xl font-bold text-green-400">Layering Test Page</h1>
        <p className="text-gray-300">Testing draggable window layering above canvas</p>
      </div>

      {/* Mock Canvas Area - simulates the map canvas */}
      <div className="canvas-container">
        <div 
          className="absolute inset-0 cursor-crosshair"
          style={{ 
            background: 'linear-gradient(45deg, #1a1a2e, #16213e)',
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 24px,
                rgba(16, 185, 129, 0.1) 25px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 24px,
                rgba(16, 185, 129, 0.1) 25px
              )
            `
          }}
        >
          {/* Mock canvas elements with the same z-indexes as real canvas */}
          <div 
            className="absolute inset-0"
            style={{ 
              zIndex: -3,
              background: 'radial-gradient(circle at center, rgba(0,100,0,0.2), transparent)',
            }}
          />
          <div 
            className="absolute inset-0"
            style={{ 
              zIndex: -2,
              background: 'repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.03) 90deg)',
            }}
          />
          <div 
            className="absolute inset-0"
            style={{ 
              zIndex: -1,
              background: 'radial-gradient(circle at 30% 70%, rgba(255,0,0,0.1), transparent)',
            }}
          />
          <div 
            className="absolute inset-0"
            style={{ 
              zIndex: 0,
              background: 'radial-gradient(circle at 70% 30%, rgba(0,0,255,0.1), transparent)',
            }}
          />
          
          {/* Center text to show canvas is there */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-green-400 mb-4">MOCK MAP CANVAS</h2>
              <p className="text-xl text-white">Draggable window should appear ABOVE this area</p>
              <p className="text-lg text-gray-300 mt-2">Canvas layers: Background (-3), Grid (-2), Tokens (-1), Tools (0)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status info */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-gray-800/90 text-white p-3 rounded border border-green-500/50">
          <p><strong>Test Status:</strong></p>
          <p>Draggable Windows: {draggableWindows.length}</p>
          <p>Expected z-index: 1000</p>
          <p>Canvas z-index: -5 to 0</p>
        </div>
      </div>

      {/* Render draggable windows */}
      {draggableWindows.map((window) => (
        <DraggableWindow
          key={window.id}
          title={window.title}
          icon={window.icon}
          onClose={() => setDraggableWindows(prev => prev.filter(w => w.id !== window.id))}
          defaultWidth={window.size.width}
          defaultHeight={window.size.height}
          defaultPosition={window.position}
          zIndex={window.zIndex}
        >
          {window.content}
        </DraggableWindow>
      ))}
    </div>
  );
};

export default LayeringTest;