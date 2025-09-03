import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Image, FileImage, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'png' | 'jpeg', pixelSize: number, quality?: number) => void;
  currentPixelSize: number;
}

const exportFormats = [
  { value: 'png', label: 'PNG', description: 'Chất lượng cao, hỗ trợ trong suốt', icon: <Image size={16} /> },
  { value: 'jpeg', label: 'JPEG', description: 'Kích thước nhỏ, phù hợp chia sẻ', icon: <FileImage size={16} /> }
];

const pixelSizeOptions = [
  { value: 8, label: '8px - Nhỏ gọn' },
  { value: 12, label: '12px - Mặc định' },
  { value: 16, label: '16px - Vừa phải' },
  { value: 24, label: '24px - Lớn' },
  { value: 32, label: '32px - Rất lớn' },
  { value: 48, label: '48px - Khổng lồ' }
];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  currentPixelSize
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpeg'>('png');
  const [exportPixelSize, setExportPixelSize] = useState(currentPixelSize);
  const [jpegQuality, setJpegQuality] = useState(90);

  const handleExport = () => {
    if (selectedFormat === 'jpeg') {
      onExport(selectedFormat, exportPixelSize, jpegQuality);
    } else {
      onExport(selectedFormat, exportPixelSize);
    }
    onClose();
  };

  const getFileSize = () => {
    // Rough estimation of file size
    const baseSize = 32 * 32 * exportPixelSize * exportPixelSize;
    if (selectedFormat === 'png') {
      return `~${Math.round(baseSize / 1000)}KB`;
    } else {
      const qualityFactor = jpegQuality / 100;
      return `~${Math.round((baseSize * qualityFactor) / 1000)}KB`;
    }
  };

  const getImageDimensions = () => {
    const width = 32 * exportPixelSize;
    const height = 32 * exportPixelSize;
    return `${width} × ${height}px`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl flex items-center gap-2">
                <Download className="text-green-600" size={24} />
                Xuất tác phẩm
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <Label className="mb-3 block">Định dạng file</Label>
                <div className="space-y-2">
                  {exportFormats.map(format => (
                    <motion.button
                      key={format.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedFormat(format.value as 'png' | 'jpeg')}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                        selectedFormat === format.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {format.icon}
                        <div>
                          <div className="font-medium">{format.label}</div>
                          <div className="text-sm text-gray-600">{format.description}</div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Pixel Size */}
              <div>
                <Label className="mb-3 block">Kích thước pixel</Label>
                <Select value={exportPixelSize.toString()} onValueChange={value => setExportPixelSize(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pixelSizeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* JPEG Quality */}
              {selectedFormat === 'jpeg' && (
                <div>
                  <Label className="mb-3 block flex items-center gap-2">
                    <Settings size={16} />
                    Chất lượng JPEG: {jpegQuality}%
                  </Label>
                  <Slider
                    value={[jpegQuality]}
                    onValueChange={value => setJpegQuality(value[0])}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Nhỏ hơn</span>
                    <span>Lớn hơn</span>
                  </div>
                </div>
              )}

              {/* Preview Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Thông tin xuất file:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Kích thước: {getImageDimensions()}</div>
                  <div>Định dạng: {selectedFormat.toUpperCase()}</div>
                  <div>Kích thước file: {getFileSize()}</div>
                  {selectedFormat === 'jpeg' && (
                    <div>Chất lượng: {jpegQuality}%</div>
                  )}
                </div>
              </div>

              {/* Quality Warning for JPEG */}
              {selectedFormat === 'jpeg' && jpegQuality < 80 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 text-sm">
                    <Settings size={16} />
                    <span>Chất lượng thấp có thể làm giảm độ sắc nét của tác phẩm</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Hủy
                </Button>
                <Button onClick={handleExport} className="flex-1">
                  <Download size={16} className="mr-2" />
                  Tải xuống
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

