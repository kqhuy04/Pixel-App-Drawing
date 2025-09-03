import React from 'react';
import { motion } from 'motion/react';
import { Pencil, Eraser, PaintBucket, Undo, Redo, Save, Share2 } from 'lucide-react';
import { Button } from './ui/button';

interface ToolPanelProps {
  selectedTool: 'pen' | 'eraser' | 'fill';
  onToolSelect: (tool: 'pen' | 'eraser' | 'fill') => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const ToolPanel: React.FC<ToolPanelProps> = ({
  selectedTool,
  onToolSelect,
  onUndo,
  onRedo,
  onSave,
  onShare,
  canUndo = false,
  canRedo = false
}) => {
  const tools = [
    { id: 'pen' as const, icon: Pencil, label: 'Bút vẽ' },
    { id: 'eraser' as const, icon: Eraser, label: 'Tẩy' },
    { id: 'fill' as const, icon: PaintBucket, label: 'Tô màu' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="mb-3 text-center">Công cụ</h3>
      
      {/* Drawing Tools */}
      <div className="flex justify-center gap-2 mb-4">
        {tools.map((tool) => (
          <motion.button
            key={tool.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-lg border-2 transition-colors ${
              selectedTool === tool.id
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => onToolSelect(tool.id)}
            title={tool.label}
          >
            <tool.icon size={20} />
          </motion.button>
        ))}
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
        
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          className="w-full"
        >
          <Save size={16} className="mr-1" />
          Lưu tranh
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          className="w-full"
        >
          <Share2 size={16} className="mr-1" />
          Chia sẻ
        </Button>
      </div>
    </div>
  );
};