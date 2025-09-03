import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Tag, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { useAuth } from '../contexts/AuthContext';
import { ArtworkService } from '../services/ArtworkService';
import { CreateArtworkData } from '../types/Artwork';

interface SaveArtworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (artworkId: string) => void;
  pixels: string[][];
  width: number;
  height: number;
  pixelSize: number;
}

const popularTags = [
  'động vật', 'dễ thương', 'game', 'fantasy', 'robot', 'sci-fi',
  'hoa', 'mùa xuân', 'phong cảnh', 'hoàng hôn', 'không gian',
  'character', 'retro', '8-bit', 'pixel', 'anime', 'chibi',
  'food', 'nature', 'abstract', 'portrait', 'landscape'
];

export const SaveArtworkModal: React.FC<SaveArtworkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  pixels,
  width,
  height,
  pixelSize
}) => {
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    isPublic: true
  });
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userData) {
      setError('Vui lòng đăng nhập để lưu tác phẩm');
      return;
    }

    if (!formData.title.trim()) {
      setError('Vui lòng nhập tên tác phẩm');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const artworkData: CreateArtworkData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        pixels,
        width,
        height,
        pixelSize,
        tags: formData.tags,
        isPublic: formData.isPublic
      };

      const artworkId = await ArtworkService.createArtwork(
        currentUser.uid,
        userData.displayName,
        artworkData
      );

      onSave(artworkId);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        tags: [],
        isPublic: true
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
  };

  const handleNewTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTag(newTag);
    setNewTag('');
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
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl flex items-center gap-2">
                <Save className="text-blue-600" size={24} />
                Lưu tác phẩm
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              {/* Title */}
              <div>
                <Label htmlFor="title">Tên tác phẩm *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Nhập tên tác phẩm..."
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả về tác phẩm của bạn..."
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="space-y-3">
                  {/* Selected Tags */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add New Tag */}
                  <form onSubmit={handleNewTagSubmit} className="flex gap-2">
                    <Input
                      placeholder="Thêm tag mới..."
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      disabled={formData.tags.length >= 10}
                    />
                    <Button type="submit" variant="outline" disabled={!newTag.trim() || formData.tags.length >= 10}>
                      <Tag size={16} />
                    </Button>
                  </form>

                  {/* Popular Tags */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Tags phổ biến:</Label>
                    <div className="flex flex-wrap gap-2">
                      {popularTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          disabled={formData.tags.includes(tag) || formData.tags.length >= 10}
                          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                            formData.tags.includes(tag)
                              ? 'bg-blue-100 border-blue-300 text-blue-700 cursor-not-allowed'
                              : formData.tags.length >= 10
                              ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Public/Private */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {formData.isPublic ? <Eye size={20} className="text-green-600" /> : <EyeOff size={20} className="text-gray-600" />}
                  <div>
                    <Label className="text-base">Công khai</Label>
                    <p className="text-sm text-gray-600">
                      {formData.isPublic 
                        ? 'Tác phẩm sẽ hiển thị trong thư viện công khai' 
                        : 'Chỉ bạn mới có thể xem tác phẩm này'
                      }
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                />
              </div>

              {/* Canvas Info */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Thông tin canvas:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                  <div>Kích thước: {width} × {height} pixels</div>
                  <div>Pixel size: {pixelSize}px</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Hủy
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Đang lưu...' : 'Lưu tác phẩm'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

