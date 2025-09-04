import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../hooks/useTranslation';

interface ColorPaletteProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const defaultColors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#C0C0C0', '#808080',
  '#9999FF', '#993366', '#FFFFCC', '#CCFFFF', '#660066', '#FF8080', '#0066CC', '#CCCCFF',
  '#FFA500', '#FFB6C1', '#20B2AA', '#87CEEB', '#DDA0DD', '#F0E68C', '#B0E0E6', '#FFDAB9',
  '#00CCFF', '#CCFFCC', '#FFFF99', '#99CCFF', '#FF99CC', '#CC99FF', '#FFCC99', '#E6E6FA'
];

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  selectedColor,
  onColorSelect
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="mb-3 text-center">{t('colorPalette.title')}</h3>
      <div className="grid grid-cols-8 gap-2 max-w-64 mx-auto">
        {defaultColors.map((color, index) => (
          <motion.button
            key={color}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`w-8 h-8 rounded-md border-2 ${
              selectedColor === color ? 'border-gray-800 ring-2 ring-blue-500' : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-sm">{t('colorPalette.selectedColor')}:</span>
        <div 
          className="w-8 h-8 rounded-md border-2 border-gray-300"
          style={{ backgroundColor: selectedColor }}
        />
      </div>
    </div>
  );
};