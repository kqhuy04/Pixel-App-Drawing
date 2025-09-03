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
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [showCanvasSettings, setShowCanvasSettings] = useState(false);

  const basicTools = [
    { id: 'pen' as const, icon: Pencil, label: 'Bút vẽ', description: 'Vẽ tự do' },
    { id: 'eraser' as const, icon: Eraser, label: 'Tẩy', description: 'Xóa pixel' },
    { id: 'fill' as const, icon: PaintBucket, label: 'Tô màu', description: 'Tô vùng cùng màu' },
    { id: 'eyedropper' as const, icon: Droplets, label: 'Chọn màu', description: 'Lấy màu từ canvas' },
    { id: 'spray' as const, icon: Sparkles, label: 'Phun sương', description: 'Tạo hiệu ứng phun sương' }
  ];

  const shapeTools = [
    { id: 'line' as const, icon: Minus, label: 'Đường thẳng', description: 'Vẽ đường thẳng' },
    { id: 'rectangle' as const, icon: Square, label: 'Hình chữ nhật', description: 'Vẽ hình chữ nhật' },
    { id: 'circle' as const, icon: Circle, label: 'Hình tròn', description: 'Vẽ hình tròn' }
  ];

  const transformTools = [
    { id: 'move' as const, icon: Move, label: 'Di chuyển', description: 'Di chuyển vùng chọn' }
  ];

  const canvasSizes = [
    { value: '16x16', width: 16, height: 16, label: '16×16 - Nhỏ' },
    { value: '24x24', width: 24, height: 24, label: '24×24 - Vừa' },
    { value: '32x32', width: 32, height: 32, label: '32×32 - Mặc định' },
    { value: '48x48', width: 48, height: 48, label: '48×48 - Lớn' },
    { value: '64x64', width: 64, height: 64, label: '64×64 - Rất lớn' },
    { value: 'custom', width: 32, height: 32, label: 'Tùy chỉnh' }
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
      <h3 className="text-center font-medium">Công cụ vẽ</h3>
      
      {/* Basic Drawing Tools */}
      <div>
        <Label className="text-sm text-gray-600 mb-2 block">Công cụ cơ bản</Label>
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
        <Label className="text-sm text-gray-600 mb-2 block">Hình học</Label>
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
        <Label className="text-sm text-gray-600 mb-2 block">Biến đổi</Label>
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
            Kích thước bút: {brushSize}px
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
          Kích thước canvas
        </Button>
        
        {showCanvasSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-3 bg-gray-50 rounded-lg"
          >
            <Label className="text-sm mb-2 block">Chọn kích thước</Label>
            <Select value={getCurrentCanvasSize()} onValueChange={handleCanvasSizeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {canvasSizes.map(size => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="mt-2 text-xs text-gray-600">
              Hiện tại: {canvasSize.width} × {canvasSize.height} pixels
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
            Hoàn tác
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="flex-1"
          >
            <Redo size={16} className="mr-1" />
            Làm lại
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
            Xoay trái
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRotate?.('right')}
            className="flex-1"
          >
            <RotateCw size={16} className="mr-1" />
            Xoay phải
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFlip?.('horizontal')}
            className="flex-1"
          >
            ↔️ Lật ngang
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFlip?.('vertical')}
            className="flex-1"
          >
            ↕️ Lật dọc
          </Button>
        </div>
        
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          className="w-full"
        >
          <Save size={16} className="mr-1" />
          Lưu tranh
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="flex-1"
          >
            <Share2 size={16} className="mr-1" />
            Chia sẻ
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex-1"
          >
            <Download size={16} className="mr-1" />
            Xuất file
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="w-full text-red-600 hover:text-red-700"
        >
          <Grid size={16} className="mr-1" />
          Xóa canvas
        </Button>
      </div>
    </div>
  );
};