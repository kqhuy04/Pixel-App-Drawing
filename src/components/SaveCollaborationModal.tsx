import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Tag, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';

interface SaveCollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    tags: string[];
    isPublic: boolean;
  }) => void;
  loading?: boolean;
}

const popularTags = [
  'collaboration', 'teamwork', 'creative', 'pixel-art', 'art',
  'động vật', 'dễ thương', 'game', 'fantasy', 'robot', 'sci-fi',
  'hoa', 'mùa xuân', 'phong cảnh', 'hoàng hôn', 'không gian',
  'character', 'retro', '8-bit', 'pixel', 'anime', 'chibi'
];

export const SaveCollaborationModal: React.FC<SaveCollaborationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    isPublic: true
  });
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onSave({
      title: formData.title.trim(),
      description: formData.description.trim(),
      tags: formData.tags,
      isPublic: formData.isPublic
    });
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleNewTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag('');
    }
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
                <Save className="text-green-600" size={24} />
                Lưu tác phẩm collaboration
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Tên tác phẩm *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nhập tên tác phẩm..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả tác phẩm..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <form onSubmit={handleNewTagSubmit} className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Thêm tag..."
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" disabled={!newTag.trim()}>
                    Thêm
                  </Button>
                </form>

                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Tags phổ biến:</p>
                  <div className="flex flex-wrap gap-1">
                    {popularTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        disabled={formData.tags.includes(tag) || formData.tags.length >= 10}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                />
                <Label htmlFor="isPublic" className="flex items-center gap-2">
                  {formData.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                  {formData.isPublic ? 'Công khai' : 'Riêng tư'}
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading || !formData.title.trim()}
                  className="flex-1"
                >
                  {loading ? 'Đang lưu...' : 'Lưu tác phẩm'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Hủy
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
