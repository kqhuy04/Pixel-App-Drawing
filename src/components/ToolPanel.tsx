import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Pencil, 
  Eraser, 
  PaintBucket, 
  Undo, 
  Redo, 
  Save, 
  Share2, 
  Download,
  Square,
  Circle,
  Move,
  RotateCcw,
  RotateCw,
  Copy,
  Scissors,
  Droplets,
  Sparkles,
  Settings,
  Grid,
  Minus,
  Plus
} from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTranslation } from '../hooks/useTranslation';

interface ToolPanelProps {
  selectedTool: 'pen' | 'eraser' | 'fill' | 'line' | 'rectangle' | 'circle' | 'move' | 'eyedropper' | 'spray';
  onToolSelect: (tool: 'pen' | 'eraser' | 'fill' | 'line' | 'rectangle' | 'circle' | 'move' | 'eyedropper' | 'spray') => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onExport?: () => void;
  onClear?: () => void;
  onRotate?: (direction: 'left' | 'right') => void;
  onFlip?: (direction: 'horizontal' | 'vertical') => void;
  canUndo?: boolean;
  canRedo?: boolean;
  brushSize?: number;
  onBrushSizeChange?: (size: number) => void;
  canvasSize?: { width: number; height: number };
  onCanvasSizeChange?: (size: { width: number; height: number }) => void;
}

export const ToolPanel: React.FC<ToolPanelProps> = ({
  selectedTool,
  onToolSelect,
  onUndo,
  onRedo,
  onSave,
  onShare,
  onExport,
  onClear,
  onRotate,
  onFlip,
  canUndo = false,
  canRedo = false,
  brushSize = 1,
  onBrushSizeChange,
  canvasSize = { width: 32, height: 32 },
  onCanvasSizeChange
}) => {
  const { t } = useTranslation();
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [showCanvasSettings, setShowCanvasSettings] = useState(false);

  const basicTools = [
    { id: 'pen' as const, icon: Pencil, labelKey: 'tools.pen', descriptionKey: 'tools.freeDraw' },
    { id: 'eraser' as const, icon: Eraser, labelKey: 'tools.eraser', descriptionKey: 'tools.erasePixel' },
    { id: 'fill' as const, icon: PaintBucket, labelKey: 'tools.fill', descriptionKey: 'tools.fillArea' },
    { id: 'eyedropper' as const, icon: Droplets, labelKey: 'tools.eyedropper', descriptionKey: 'tools.pickColor' },
    { id: 'spray' as const, icon: Sparkles, labelKey: 'tools.spray', descriptionKey: 'tools.sprayEffect' }
  ];

  const shapeTools = [
    { id: 'line' as const, icon: Minus, labelKey: 'tools.line', descriptionKey: 'tools.drawLine' },
    { id: 'rectangle' as const, icon: Square, labelKey: 'tools.rectangle', descriptionKey: 'tools.drawRectangle' },
    { id: 'circle' as const, icon: Circle, labelKey: 'tools.circle', descriptionKey: 'tools.drawCircle' }
  ];

  const transformTools = [
    { id: 'move' as const, icon: Move, labelKey: 'tools.move', descriptionKey: 'tools.moveSelection' }
  ];

  const canvasSizes = [
    { value: '16x16', width: 16, height: 16, labelKey: '16×16 - {size}', sizeKey: 'tools.small' },
    { value: '24x24', width: 24, height: 24, labelKey: '24×24 - {size}', sizeKey: 'tools.medium' },
    { value: '32x32', width: 32, height: 32, labelKey: '32×32 - {size}', sizeKey: 'tools.default' },
    { value: '48x48', width: 48, height: 48, labelKey: '48×48 - {size}', sizeKey: 'tools.large' },
    { value: '64x64', width: 64, height: 64, labelKey: '64×64 - {size}', sizeKey: 'tools.veryLarge' },
    { value: 'custom', width: 32, height: 32, labelKey: '{size}', sizeKey: 'tools.custom' }
  ];

  const handleCanvasSizeChange = (value: string) => {
    const size = canvasSizes.find(s => s.value === value);
    if (size && onCanvasSizeChange) {
      onCanvasSizeChange({ width: size.width, height: size.height });
    }
  };

  const getCurrentCanvasSize = () => {
    const size = canvasSizes.find(s => s.width === canvasSize.width && s.height === canvasSize.height);
    return size?.value || '32x32';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <h3 className="text-center font-medium">{t('tools.drawingTools')}</h3>
      
      {/* Basic Drawing Tools */}
      <div>
        <Label className="text-sm text-gray-600 mb-2 block">{t('tools.basicTools')}</Label>
        <div className="grid grid-cols-5 gap-1">
          {basicTools.map((tool) => (
            <motion.button
              key={tool.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg border-2 transition-colors relative ${
                selectedTool === tool.id
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => onToolSelect(tool.id)}
              title={`${tool.label} - ${tool.description}`}
            >
              <tool.icon size={16} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Shape Tools */}
      <div>
        <Label className="text-sm text-gray-600 mb-2 block">{t('tools.geometry')}</Label>
        <div className="grid grid-cols-3 gap-1">
          {shapeTools.map((tool) => (
            <motion.button
              key={tool.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg border-2 transition-colors ${
                selectedTool === tool.id
                  ? 'border-green-500 bg-green-50 text-green-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => onToolSelect(tool.id)}
              title={`${tool.label} - ${tool.description}`}
            >
              <tool.icon size={16} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Transform Tools */}
      <div>
        <Label className="text-sm text-gray-600 mb-2 block">{t('tools.transform')}</Label>
        <div className="grid grid-cols-1 gap-1">
          {transformTools.map((tool) => (
            <motion.button
              key={tool.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg border-2 transition-colors ${
                selectedTool === tool.id
                  ? 'border-purple-500 bg-purple-50 text-purple-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => onToolSelect(tool.id)}
              title={`${tool.label} - ${tool.description}`}
            >
              <tool.icon size={16} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Brush Size */}
      {onBrushSizeChange && (
        <div>
          <Label className="text-sm text-gray-600 mb-2 block">
            {t('tools.brushSize')}: {brushSize}px
          </Label>
          <Slider
            value={[brushSize]}
            onValueChange={value => onBrushSizeChange(value[0])}
            max={8}
            min={1}
            step={1}
            className="w-full"
          />
        </div>
      )}

      {/* Canvas Size Settings */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCanvasSettings(!showCanvasSettings)}
          className="w-full flex items-center gap-2"
        >
          <Settings size={16} />
          {t('tools.canvasSize')}
        </Button>
        
        {showCanvasSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-3 bg-gray-50 rounded-lg"
          >
            <Label className="text-sm mb-2 block">{t('tools.selectSize')}</Label>
            <Select value={getCurrentCanvasSize()} onValueChange={handleCanvasSizeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {canvasSizes.map(size => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.labelKey.replace('{size}', t(size.sizeKey))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="mt-2 text-xs text-gray-600">
              {t('tools.currentSize')}: {canvasSize.width} × {canvasSize.height} {t('tools.pixels')}
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex-1"
          >
            <Undo size={16} className="mr-1" />
            {t('tools.undo')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="flex-1"
          >
            <Redo size={16} className="mr-1" />
            {t('tools.redo')}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRotate?.('left')}
            className="flex-1"
          >
            <RotateCcw size={16} className="mr-1" />
            {t('tools.rotateLeft')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRotate?.('right')}
            className="flex-1"
          >
            <RotateCw size={16} className="mr-1" />
            {t('tools.rotateRight')}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFlip?.('horizontal')}
            className="flex-1"
          >
            ↔️ {t('tools.flipHorizontal')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFlip?.('vertical')}
            className="flex-1"
          >
            ↕️ {t('tools.flipVertical')}
          </Button>
        </div>
        
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          className="w-full"
        >
          <Save size={16} className="mr-1" />
          {t('tools.save')}
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="flex-1"
          >
            <Share2 size={16} className="mr-1" />
            {t('tools.share')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex-1"
          >
            <Download size={16} className="mr-1" />
            {t('tools.export')}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="w-full text-red-600 hover:text-red-700"
        >
          <Grid size={16} className="mr-1" />
          {t('tools.clear')}
        </Button>
      </div>
    </div>
  );
};