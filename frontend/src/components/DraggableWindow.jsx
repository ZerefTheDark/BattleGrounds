import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { X, Maximize2, Minimize2 } from 'lucide-react';

const DraggableWindow = ({ 
  title, 
  icon: Icon, 
  children, 
  onClose, 
  defaultWidth = 400, 
  defaultHeight = 600,
  minWidth = 300,
  minHeight = 200,
  defaultPosition = { x: 100, y: 100 },
  zIndex = 1000,
  isFullscreen = false,
  onFullscreenToggle,
  canFullscreen = false,
  usePortal = true // Add prop to control portal usage for backwards compatibility
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState(defaultPosition);
  const [lastSize, setLastSize] = useState({ width: defaultWidth, height: defaultHeight });
  
  const windowRef = useRef(null);
  const headerRef = useRef(null);

  // Handle dragging
  // NOTE: This component uses a React Portal to render directly to document.body,
  // ensuring the window position is always relative to the viewport and not affected
  // by parent container transforms, scrolling, or flex/grid layouts.
  // This prevents coordinate system mismatches that cause window jumping on drag start.
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('.resize-handle') || e.target.closest('button') || isFullscreen) return;
    
    setIsDragging(true);
    // Calculate offset based on current position state, not DOM rect
    // This ensures consistent behavior regardless of parent layout changes
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  }, [isFullscreen, position.x, position.y]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && !isFullscreen) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep window within viewport bounds
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      
      setPosition({
        x: Math.max(0, Math.min(maxX, newX)),
        y: Math.max(0, Math.min(maxY, newY))
      });
    }
  }, [isDragging, dragOffset, size, isFullscreen]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Handle resizing
  const handleResizeMouseDown = useCallback((e, direction) => {
    e.stopPropagation();
    setIsResizing(direction);
    e.preventDefault();
  }, []);

  const handleResizeMouseMove = useCallback((e) => {
    if (!isResizing || isFullscreen) return;

    const rect = windowRef.current.getBoundingClientRect();
    let newWidth = size.width;
    let newHeight = size.height;
    let newX = position.x;
    let newY = position.y;

    switch (isResizing) {
      case 'se': // Southeast
        newWidth = Math.max(minWidth, e.clientX - rect.left);
        newHeight = Math.max(minHeight, e.clientY - rect.top);
        break;
      case 'sw': // Southwest
        newWidth = Math.max(minWidth, rect.right - e.clientX);
        newHeight = Math.max(minHeight, e.clientY - rect.top);
        newX = position.x - (newWidth - size.width);
        break;
      case 'ne': // Northeast
        newWidth = Math.max(minWidth, e.clientX - rect.left);
        newHeight = Math.max(minHeight, rect.bottom - e.clientY);
        newY = position.y - (newHeight - size.height);
        break;
      case 'nw': // Northwest
        newWidth = Math.max(minWidth, rect.right - e.clientX);
        newHeight = Math.max(minHeight, rect.bottom - e.clientY);
        newX = position.x - (newWidth - size.width);
        newY = position.y - (newHeight - size.height);
        break;
      case 'n': // North
        newHeight = Math.max(minHeight, rect.bottom - e.clientY);
        newY = position.y - (newHeight - size.height);
        break;
      case 's': // South
        newHeight = Math.max(minHeight, e.clientY - rect.top);
        break;
      case 'e': // East
        newWidth = Math.max(minWidth, e.clientX - rect.left);
        break;
      case 'w': // West
        newWidth = Math.max(minWidth, rect.right - e.clientX);
        newX = position.x - (newWidth - size.width);
        break;
    }

    setSize({ width: newWidth, height: newHeight });
    setPosition({ x: newX, y: newY });
  }, [isResizing, size, position, minWidth, minHeight, isFullscreen]);

  // Global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleResizeMouseMove, handleMouseUp]);

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    if (isFullscreen) {
      // Restore to last position and size
      setPosition(lastPosition);
      setSize(lastSize);
    } else {
      // Save current position and size
      setLastPosition(position);
      setLastSize(size);
    }
    onFullscreenToggle && onFullscreenToggle();
  }, [isFullscreen, position, size, lastPosition, lastSize, onFullscreenToggle]);

  // Window style based on fullscreen state
  // Always use position: fixed to ensure window is positioned relative to viewport
  // when rendered via React Portal to document.body
  const windowStyle = isFullscreen 
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: zIndex + 1000, // Fullscreen gets +1000 boost
        margin: 0,
        isolation: 'isolate', // Create new stacking context
        transform: 'translateZ(0)', // Force hardware acceleration
        willChange: 'transform'
      }
    : {
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: Math.max(1000, zIndex), // Ensure minimum z-index of 1000
        cursor: isDragging ? 'grabbing' : 'default',
        isolation: 'isolate', // Create new stacking context
        transform: 'translateZ(0)', // Force hardware acceleration
        willChange: 'transform',
        contain: 'layout style' // Optimize performance
      };

  // DEBUG: Enhanced logging for diagnostic purposes
  useEffect(() => {
    const actualZIndex = Math.max(1000, zIndex);
    console.log(`[DraggableWindow] ${title}:`, {
      zIndex: actualZIndex,
      isFullscreen,
      usePortal,
      position,
      size,
      windowStyle: {
        zIndex: windowStyle.zIndex,
        position: windowStyle.position,
        isolation: windowStyle.isolation
      }
    });
    
    // Additional debug: Check if element is actually rendered with correct z-index
    setTimeout(() => {
      const windowElement = windowRef.current;
      if (windowElement) {
        const computedStyle = window.getComputedStyle(windowElement);
        console.log(`[DraggableWindow] ${title} Computed Style:`, {
          zIndex: computedStyle.zIndex,
          position: computedStyle.position,
          isolation: computedStyle.isolation,
          transform: computedStyle.transform
        });
        
        // Force apply critical styles if they're not taking effect
        if (computedStyle.zIndex === 'auto' || parseInt(computedStyle.zIndex) < 1000) {
          console.warn(`[DraggableWindow] ${title} - Z-index not applied correctly, forcing inline styles`);
          windowElement.style.zIndex = windowStyle.zIndex;
          windowElement.style.position = 'fixed';
          windowElement.style.isolation = 'isolate';
        }
      }
    }, 100);
  }, [title, zIndex, isFullscreen, usePortal, position, size]);

  // Window content - the actual draggable window element
  const windowContent = (
    <div
      ref={windowRef}
      className="draggable-window fantasy-card text-white shadow-2xl border-2 border-green-500/30"
      style={{
        ...windowStyle,
        // Force these critical styles to override any CSS conflicts
        position: 'fixed',
        zIndex: windowStyle.zIndex,
        isolation: 'isolate',
        // Set CSS custom property for potential CSS usage
        '--draggable-z-index': windowStyle.zIndex
      }}
      data-window-title={title}
      data-z-index={windowStyle.zIndex}
      data-portal={usePortal}
    >
      {/* Window Header */}
      <CardHeader
        ref={headerRef}
        className="flex flex-row items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 border-b border-green-500/30 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-green-400" />}
          <CardTitle className="text-lg dragon-stones-title select-none">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          {canFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFullscreenToggle}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 border border-blue-600/50 rounded w-7 h-7 p-0"
              title={isFullscreen ? "Restore Window" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/30 border border-red-600/50 rounded w-7 h-7 p-0"
            title="Close Window"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Window Content */}
      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="h-full w-full overflow-auto fantasy-scrollbar">
          {children}
        </div>
      </CardContent>

      {/* Resize Handles */}
      {!isFullscreen && (
        <>
          {/* Corner handles */}
          <div
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize resize-handle"
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize resize-handle"
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize resize-handle"
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize resize-handle bg-green-500/20 hover:bg-green-500/40"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />

          {/* Edge handles */}
          <div
            className="absolute top-0 left-3 right-3 h-1 cursor-n-resize resize-handle"
            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
          />
          <div
            className="absolute bottom-0 left-3 right-3 h-1 cursor-s-resize resize-handle"
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
          <div
            className="absolute left-0 top-3 bottom-3 w-1 cursor-w-resize resize-handle"
            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
          />
          <div
            className="absolute right-0 top-3 bottom-3 w-1 cursor-e-resize resize-handle"
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />
        </>
      )}
    </div>
  );

  // Render via Portal to document.body to avoid parent container layout effects
  // This ensures the window is always positioned relative to the viewport
  if (usePortal) {
    return createPortal(windowContent, document.body);
  }

  // Fallback to regular rendering for backwards compatibility
  return windowContent;
};

export default DraggableWindow;