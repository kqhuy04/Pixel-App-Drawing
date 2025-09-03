import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';

interface PixelCanvasProps {
  width: number;
  height: number;
  pixelSize: number;
  selectedColor: string;
  tool: 'pen' | 'eraser' | 'fill';
  onPixelChange?: (x: number, y: number, color: string) => void;
}

export const PixelCanvas: React.FC<PixelCanvasProps> = ({
  width,
  height,
  pixelSize,
  selectedColor,
  tool,
  onPixelChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pixels, setPixels] = useState<string[][]>(() => 
    Array(height).fill(null).map(() => Array(width).fill('#ffffff'))
  );
  const [isDrawing, setIsDrawing] = useState(false);

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
  }, [pixels, width, height, drawPixel]);

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
      const newColor = tool === 'eraser' ? '#ffffff' : selectedColor;
      
      setPixels(prev => {
        const newPixels = [...prev];
        newPixels[y] = [...newPixels[y]];
        newPixels[y][x] = newColor;
        return newPixels;
      });

      onPixelChange?.(x, y, newColor);
    }
  }, [width, height, pixelSize, selectedColor, tool, onPixelChange]);

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
  };

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