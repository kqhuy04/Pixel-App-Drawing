import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CanvasHistory, DrawingState } from '../types/Artwork';
import { CollaborationUser } from '../services/CollaborationService';
import { UserCursor } from './UserCursor';

interface CollaborativePixelCanvasProps {
  width: number;
  height: number;
  pixelSize: number;
  selectedColor: string;
  tool: 'pen' | 'eraser' | 'fill' | 'line' | 'rectangle' | 'circle' | 'move' | 'eyedropper' | 'spray';
  brushSize?: number;
  onPixelChange?: (x: number, y: number, color: string) => void;
  onStateChange?: (state: DrawingState) => void;
  onColorPick?: (color: string) => void;
  onCursorMove?: (x: number, y: number) => void;
  initialPixels?: string[][];
  otherUsers?: CollaborationUser[];
  roomId?: string;
}

export const CollaborativePixelCanvas: React.FC<CollaborativePixelCanvasProps> = ({
  width,
  height,
  pixelSize,
  selectedColor,
  tool,
  brushSize = 1,
  onPixelChange,
  onStateChange,
  onColorPick,
  onCursorMove,
  initialPixels,
  otherUsers = [],
  roomId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  
  // Initialize drawing state with history
  const [drawingState, setDrawingState] = useState<DrawingState>(() => {
    const initialPixelsArray = initialPixels || Array(height).fill(null).map(() => Array(width).fill('#ffffff'));
    const initialHistory: CanvasHistory = {
      pixels: initialPixelsArray.map(row => [...row]),
      timestamp: Date.now()
    };
    
    return {
      pixels: initialPixelsArray,
      history: [initialHistory],
      historyIndex: 0,
      canUndo: false,
      canRedo: false
    };
  });

  // Update canvas when initialPixels changes
  useEffect(() => {
    if (initialPixels) {
      const initialHistory: CanvasHistory = {
        pixels: initialPixels.map(row => [...row]),
        timestamp: Date.now()
      };
      
      setDrawingState({
        pixels: initialPixels.map(row => [...row]),
        history: [initialHistory],
        historyIndex: 0,
        canUndo: false,
        canRedo: false
      });
    }
  }, [initialPixels]);

  const { pixels, history, historyIndex } = drawingState;

  // Flood fill algorithm
  const floodFill = useCallback((startX: number, startY: number, newColor: string) => {
    const targetColor = pixels[startY][startX];
    if (targetColor === newColor) return;

    const stack: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();
    const newPixels = pixels.map(row => [...row]);

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;
      
      if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) continue;
      if (newPixels[y][x] !== targetColor) continue;
      
      visited.add(key);
      newPixels[y][x] = newColor;
      
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    return newPixels;
  }, [pixels, width, height]);

  // Update drawing state and notify parent
  const updateDrawingState = useCallback((newPixels: string[][], addToHistory: boolean = true) => {
    const newHistory: CanvasHistory = {
      pixels: newPixels.map(row => [...row]),
      timestamp: Date.now()
    };

    const newState: DrawingState = {
      pixels: newPixels,
      history: addToHistory 
        ? [...history.slice(0, historyIndex + 1), newHistory]
        : [newHistory],
      historyIndex: addToHistory ? historyIndex + 1 : 0,
      canUndo: addToHistory ? true : false,
      canRedo: false
    };

    setDrawingState(newState);
    onStateChange?.(newState);
  }, [history, historyIndex, onStateChange]);

  // Get mouse position relative to canvas
  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);
    
    return { x: Math.max(0, Math.min(x, width - 1)), y: Math.max(0, Math.min(y, height - 1)) };
  }, [pixelSize, width, height]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e);
    setIsDrawing(true);
    setStartPoint({ x, y });

    if (tool === 'eyedropper') {
      const color = pixels[y][x];
      onColorPick?.(color);
      return;
    }

    if (tool === 'fill') {
      const newPixels = floodFill(x, y, selectedColor);
      updateDrawingState(newPixels);
      return;
    }

    // For other tools, start drawing
    const newPixels = pixels.map(row => [...row]);
    
    if (tool === 'pen') {
      for (let dy = 0; dy < brushSize; dy++) {
        for (let dx = 0; dx < brushSize; dx++) {
          const px = x + dx;
          const py = y + dy;
          if (px < width && py < height) {
            newPixels[py][px] = selectedColor;
          }
        }
      }
    } else if (tool === 'eraser') {
      for (let dy = 0; dy < brushSize; dy++) {
        for (let dx = 0; dx < brushSize; dx++) {
          const px = x + dx;
          const py = y + dy;
          if (px < width && py < height) {
            newPixels[py][px] = '#ffffff';
          }
        }
      }
    }

    updateDrawingState(newPixels);
  }, [getMousePos, tool, pixels, selectedColor, brushSize, width, height, floodFill, onColorPick, updateDrawingState]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e);
    
    // Update cursor position for other users
    onCursorMove?.(x, y);

    if (!isDrawing || !startPoint) return;

    const newPixels = pixels.map(row => [...row]);

    if (tool === 'pen') {
      // Draw line from startPoint to current position
      const dx = Math.abs(x - startPoint.x);
      const dy = Math.abs(y - startPoint.y);
      const sx = startPoint.x < x ? 1 : -1;
      const sy = startPoint.y < y ? 1 : -1;
      let err = dx - dy;

      let currentX = startPoint.x;
      let currentY = startPoint.y;

      while (true) {
        for (let dy = 0; dy < brushSize; dy++) {
          for (let dx = 0; dx < brushSize; dx++) {
            const px = currentX + dx;
            const py = currentY + dy;
            if (px < width && py < height) {
              newPixels[py][px] = selectedColor;
            }
          }
        }

        if (currentX === x && currentY === y) break;

        const e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          currentX += sx;
        }
        if (e2 < dx) {
          err += dx;
          currentY += sy;
        }
      }
    } else if (tool === 'eraser') {
      // Erase line from startPoint to current position
      const dx = Math.abs(x - startPoint.x);
      const dy = Math.abs(y - startPoint.y);
      const sx = startPoint.x < x ? 1 : -1;
      const sy = startPoint.y < y ? 1 : -1;
      let err = dx - dy;

      let currentX = startPoint.x;
      let currentY = startPoint.y;

      while (true) {
        for (let dy = 0; dy < brushSize; dy++) {
          for (let dx = 0; dx < brushSize; dx++) {
            const px = currentX + dx;
            const py = currentY + dy;
            if (px < width && py < height) {
              newPixels[py][px] = '#ffffff';
            }
          }
        }

        if (currentX === x && currentY === y) break;

        const e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          currentX += sx;
        }
        if (e2 < dx) {
          err += dx;
          currentY += sy;
        }
      }
    }

    updateDrawingState(newPixels, false);
  }, [isDrawing, startPoint, getMousePos, tool, pixels, selectedColor, brushSize, width, height, onCursorMove, updateDrawingState]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setStartPoint(null);
      // Final state update with history
      updateDrawingState(pixels, true);
    }
  }, [isDrawing, pixels, updateDrawingState]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsDrawing(false);
    setStartPoint(null);
    onCursorMove?.(null, null);
  }, [onCursorMove]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        ctx.fillStyle = pixels[y][x];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * pixelSize, 0);
      ctx.lineTo(x * pixelSize, height * pixelSize);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * pixelSize);
      ctx.lineTo(width * pixelSize, y * pixelSize);
      ctx.stroke();
    }
  }, [pixels, width, height, pixelSize]);

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        width={width * pixelSize}
        height={height * pixelSize}
        className="border border-gray-300 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Other users' cursors */}
      <AnimatePresence>
        {otherUsers.map((user) => (
          <UserCursor
            key={user.id}
            user={user}
            pixelSize={pixelSize}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
