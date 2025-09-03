import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { CanvasHistory, DrawingState } from '../types/Artwork';

interface PixelCanvasProps {
  width: number;
  height: number;
  pixelSize: number;
  selectedColor: string;
  tool: 'pen' | 'eraser' | 'fill' | 'line' | 'rectangle' | 'circle' | 'move' | 'eyedropper' | 'spray';
  brushSize?: number;
  onPixelChange?: (x: number, y: number, color: string) => void;
  onStateChange?: (state: DrawingState) => void;
  onColorPick?: (color: string) => void;
  initialPixels?: string[][];
}

export const PixelCanvas: React.FC<PixelCanvasProps> = ({
  width,
  height,
  pixelSize,
  selectedColor,
  tool,
  brushSize = 1,
  onPixelChange,
  onStateChange,
  onColorPick,
  initialPixels
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

  // Update canvas when width/height changes
  useEffect(() => {
    if (initialPixels) {
      // If initialPixels is provided, use it
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
    } else {
      // Create new canvas with new dimensions
      const newPixelsArray = Array(height).fill(null).map(() => Array(width).fill('#ffffff'));
      const initialHistory: CanvasHistory = {
        pixels: newPixelsArray.map(row => [...row]),
        timestamp: Date.now()
      };
      
      setDrawingState({
        pixels: newPixelsArray,
        history: [initialHistory],
        historyIndex: 0,
        canUndo: false,
        canRedo: false
      });
    }
  }, [width, height, initialPixels]);

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

      // Add adjacent pixels to stack
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    return newPixels;
  }, [pixels, width, height]);

  // Draw line algorithm (Bresenham's line algorithm)
  const drawLine = useCallback((x1: number, y1: number, x2: number, y2: number, color: string) => {
    const newPixels = pixels.map(row => [...row]);
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    let sx = x1 < x2 ? 1 : -1;
    let sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      if (x1 >= 0 && x1 < width && y1 >= 0 && y1 < height) {
        newPixels[y1][x1] = color;
      }

      if (x1 === x2 && y1 === y2) break;
      let e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
    }

    return newPixels;
  }, [pixels, width, height]);

  // Draw rectangle algorithm
  const drawRectangle = useCallback((x1: number, y1: number, x2: number, y2: number, color: string) => {
    const newPixels = pixels.map(row => [...row]);
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          newPixels[y][x] = color;
        }
      }
    }

    return newPixels;
  }, [pixels, width, height]);

  // Draw circle algorithm (Bresenham's circle algorithm)
  const drawCircle = useCallback((centerX: number, centerY: number, radius: number, color: string) => {
    const newPixels = pixels.map(row => [...row]);
    let x = radius;
    let y = 0;
    let err = 0;

    while (x >= y) {
      const points = [
        [centerX + x, centerY + y], [centerX + y, centerY + x],
        [centerX - y, centerY + x], [centerX - x, centerY + y],
        [centerX - x, centerY - y], [centerX - y, centerY - x],
        [centerX + y, centerY - x], [centerX + x, centerY - y]
      ];

      points.forEach(([px, py]) => {
        if (px >= 0 && px < width && py >= 0 && py < height) {
          newPixels[py][px] = color;
        }
      });

      if (err <= 0) {
        y += 1;
        err += 2 * y + 1;
      }
      if (err > 0) {
        x -= 1;
        err -= 2 * x + 1;
      }
    }

    return newPixels;
  }, [pixels, width, height]);

  // Spray tool algorithm
  const sprayPaint = useCallback((centerX: number, centerY: number, color: string, intensity: number = 10) => {
    const newPixels = pixels.map(row => [...row]);
    
    for (let i = 0; i < intensity; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 3;
      const x = Math.round(centerX + Math.cos(angle) * distance);
      const y = Math.round(centerY + Math.sin(angle) * distance);
      
      if (x >= 0 && x < width && y >= 0 && y < height) {
        newPixels[y][x] = color;
      }
    }

    return newPixels;
  }, [pixels, width, height]);

  // Add state to history
  const addToHistory = useCallback((newPixels: string[][]) => {
    setDrawingState(prev => {
      const newHistory: CanvasHistory = {
        pixels: newPixels.map(row => [...row]),
        timestamp: Date.now()
      };

      // Remove any history after current index
      const newHistoryArray = prev.history.slice(0, prev.historyIndex + 1);
      newHistoryArray.push(newHistory);

      // Limit history to 50 states
      if (newHistoryArray.length > 50) {
        newHistoryArray.shift();
      }

      const newState = {
        pixels: newPixels,
        history: newHistoryArray,
        historyIndex: newHistoryArray.length - 1,
        canUndo: newHistoryArray.length > 1,
        canRedo: false
      };

      onStateChange?.(newState);
      return newState;
    });
  }, [onStateChange]);

  // Undo function
  const undo = useCallback(() => {
    setDrawingState(prev => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        const newState = {
          ...prev,
          pixels: prev.history[newIndex].pixels.map(row => [...row]),
          historyIndex: newIndex,
          canUndo: newIndex > 0,
          canRedo: true
        };
        onStateChange?.(newState);
        return newState;
      }
      return prev;
    });
  }, [onStateChange]);

  // Redo function
  const redo = useCallback(() => {
    setDrawingState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1;
        const newState = {
          ...prev,
          pixels: prev.history[newIndex].pixels.map(row => [...row]),
          historyIndex: newIndex,
          canUndo: true,
          canRedo: newIndex < prev.history.length - 1
        };
        onStateChange?.(newState);
        return newState;
      }
      return prev;
    });
  }, [onStateChange]);

  // Expose undo/redo functions
  useEffect(() => {
    // This will be called by parent component
    (window as any).canvasUndo = undo;
    (window as any).canvasRedo = redo;
    (window as any).canvasGetState = () => drawingState;
  }, [undo, redo, drawingState]);

  const drawPixel = useCallback((x: number, y: number, color: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = color;
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    
    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
  }, [pixelSize]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        drawPixel(x, y, pixels[y][x]);
      }
    }

    // Draw start point indicator for shape tools
    if (startPoint && (tool === 'line' || tool === 'rectangle' || tool === 'circle')) {
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(
        startPoint.x * pixelSize - 2, 
        startPoint.y * pixelSize - 2, 
        4, 
        4
      );
    }
  }, [pixels, width, height, drawPixel, startPoint, tool, pixelSize]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const handleCanvasInteraction = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    const x = Math.floor((clientX - rect.left) / pixelSize);
    const y = Math.floor((clientY - rect.top) / pixelSize);

    if (x >= 0 && x < width && y >= 0 && y < height) {
      let newPixels: string[][];

      if (tool === 'fill') {
        // Use flood fill
        const newColor = selectedColor;
        newPixels = floodFill(x, y, newColor);
        if (newPixels) {
          addToHistory(newPixels);
        }
      } else if (tool === 'eyedropper') {
        // Pick color from canvas
        const pickedColor = pixels[y][x];
        onColorPick?.(pickedColor);
        return; // Don't continue with other operations
      } else if (tool === 'spray') {
        // Spray paint tool
        const newColor = selectedColor;
        newPixels = sprayPaint(x, y, newColor);
        if (newPixels) {
          addToHistory(newPixels);
        }
      } else if (tool === 'line' || tool === 'rectangle' || tool === 'circle') {
        // Shape tools - handle start and end points
        if (!startPoint) {
          setStartPoint({ x, y });
          return; // Don't draw anything yet
        } else {
          let shapePixels: string[][];
          const newColor = selectedColor;
          
          if (tool === 'line') {
            shapePixels = drawLine(startPoint.x, startPoint.y, x, y, newColor);
          } else if (tool === 'rectangle') {
            shapePixels = drawRectangle(startPoint.x, startPoint.y, x, y, newColor);
          } else if (tool === 'circle') {
            const radius = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2));
            shapePixels = drawCircle(startPoint.x, startPoint.y, Math.round(radius), newColor);
          }
          
          if (shapePixels) {
            addToHistory(shapePixels);
          }
          setStartPoint(null);
        }
      } else if (tool === 'move') {
        // Move tool - not implemented yet
        return;
      } else {
        // Regular pen or eraser with brush size
        const newColor = tool === 'eraser' ? '#ffffff' : selectedColor;
        newPixels = pixels.map(row => [...row]);
        
        // Apply brush size
        for (let dy = -Math.floor(brushSize / 2); dy <= Math.floor(brushSize / 2); dy++) {
          for (let dx = -Math.floor(brushSize / 2); dx <= Math.floor(brushSize / 2); dx++) {
            const px = x + dx;
            const py = y + dy;
            if (px >= 0 && px < width && py >= 0 && py < height) {
              newPixels[py][px] = newColor;
            }
          }
        }
        
        // Only add to history if this is a new action (not continuous drawing)
        if (!isDrawing) {
          addToHistory(newPixels);
        } else {
          setDrawingState(prev => ({
            ...prev,
            pixels: newPixels
          }));
        }
      }

      onPixelChange?.(x, y, pixels[y][x]);
    }
  }, [width, height, pixelSize, selectedColor, tool, brushSize, onPixelChange, onColorPick, floodFill, sprayPaint, drawLine, drawRectangle, drawCircle, addToHistory, pixels, isDrawing, startPoint]);

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDrawing(true);
    handleCanvasInteraction(event);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDrawing) {
      handleCanvasInteraction(event);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    // Reset start point for shape tools
    if (tool === 'line' || tool === 'rectangle' || tool === 'circle') {
      setStartPoint(null);
    }
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    event.preventDefault();
    setIsDrawing(true);
    handleCanvasInteraction(event);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    event.preventDefault();
    if (isDrawing) {
      handleCanvasInteraction(event);
    }
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    event.preventDefault();
    setIsDrawing(false);
    // Reset start point for shape tools
    if (tool === 'line' || tool === 'rectangle' || tool === 'circle') {
      setStartPoint(null);
    }
  };

  // Export functions
  const exportAsPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return '';

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        ctx.fillStyle = pixels[y][x];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }

    return canvas.toDataURL('image/png');
  }, [pixels, width, height, pixelSize]);

  const exportAsJPEG = useCallback((quality: number = 0.9) => {
    const canvas = canvasRef.current;
    if (!canvas) return '';

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Fill background with white for JPEG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        ctx.fillStyle = pixels[y][x];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }

    return canvas.toDataURL('image/jpeg', quality);
  }, [pixels, width, height, pixelSize]);

  // Expose export functions
  useEffect(() => {
    (window as any).canvasExportPNG = exportAsPNG;
    (window as any).canvasExportJPEG = exportAsJPEG;
  }, [exportAsPNG, exportAsJPEG]);

  return (
    <div className="flex justify-center items-center bg-gray-100 p-4 rounded-lg">
      <canvas
        ref={canvasRef}
        width={width * pixelSize}
        height={height * pixelSize}
        className="border-2 border-gray-300 cursor-crosshair bg-white"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};