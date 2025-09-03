import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit3, Trash2, Share2, Download, Eye, EyeOff, Search, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface Artwork {
  id: string;
  title: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  views: number;
  isPublic: boolean;
  tags: string[];
  status: 'draft' | 'published' | 'in_contest';
}

interface MyArtsProps {
  onCreateNew: () => void;
  onEditArt: (id: string) => void;
}

const mockArtworks: Artwork[] = [
  {
    id: '1',
    title: 'My Pixel Cat',
    thumbnail: 'https://via.placeholder.com/150x150/FF6B6B/FFFFFF?text=🐱',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-16',
    likes: 45,
    comments: 8,
    views: 123,
    isPublic: true,
    tags: ['động vật', 'dễ thương'],
    status: 'published'
  },
  {
    id: '2',
    title: 'Work in Progress',
    thumbnail: 'https://via.placeholder.com/150x150/CCCCCC/FFFFFF?text=WIP',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
    likes: 0,
    comments: 0,
    views: 5,
    isPublic: false,
    tags: ['draft'],
    status: 'draft'
  },
  {
    id: '3',
    title: 'Contest Entry - Spring',
    thumbnail: 'https://via.placeholder.com/150x150/4ECDC4/FFFFFF?text=🌸',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-12',
    likes: 89,
    comments: 15,
    views: 234,
    isPublic: true,
    tags: ['cuộc thi', 'mùa xuân'],
    status: 'in_contest'
  },
  {
    id: '4',
    title: 'Robot Character',
    thumbnail: 'https://via.placeholder.com/150x150/96CEB4/FFFFFF?text=🤖',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-25',
    likes: 67,
    comments: 12,
    views: 156,
    isPublic: true,
    tags: ['robot', 'character'],
    status: 'published'
  }
];

export const MyArts: React.FC<MyArtsProps> = ({ onCreateNew, onEditArt }) => {
  const [artworks, setArtworks] = useState(mockArtworks);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'published' | 'draft' | 'in_contest'>('all');

  const handleToggleVisibility = (id: string) => {
    setArtworks(prev => prev.map(art => 
      art.id === id ? { ...art, isPublic: !art.isPublic } : art
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tác phẩm này?')) {
      setArtworks(prev => prev.filter(art => art.id !== id));
    }
  };

  const handleShare = (artwork: Artwork) => {
    // Mock share functionality
    alert(`Đã chia sẻ tác phẩm "${artwork.title}"!`);
  };

  const handleDownload = (artwork: Artwork) => {
    // Mock download functionality
    alert(`Đang tải xuống "${artwork.title}"...`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_contest': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Đã xuất bản';
      case 'draft': return 'Bản nháp';
      case 'in_contest': return 'Thi đấu';
      default: return status;
    }
  };

  const filteredArtworks = artworks.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         art.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || art.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: artworks.length,
    published: artworks.filter(art => art.status === 'published').length,
    draft: artworks.filter(art => art.status === 'draft').length,
    in_contest: artworks.filter(art => art.status === 'in_contest').length,
    totalLikes: artworks.reduce((sum, art) => sum + art.likes, 0),
    totalViews: artworks.reduce((sum, art) => sum + art.views, 0)
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2>🎨 Tác phẩm của tôi</h2>
          <p className="text-gray-600">Quản lý và theo dõi tất cả tác phẩm của bạn</p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus size={18} />
          Tạo tranh mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Tổng cộng', value: stats.total, color: 'text-blue-600' },
          { label: 'Đã xuất bản', value: stats.published, color: 'text-green-600' },
          { label: 'Bản nháp', value: stats.draft, color: 'text-gray-600' },
          { label: 'Thi đấu', value: stats.in_contest, color: 'text-purple-600' },
          { label: 'Tổng like', value: stats.totalLikes, color: 'text-red-600' },
          { label: 'Tổng view', value: stats.totalViews, color: 'text-orange-600' }
        ].map((stat, index) => (
          <Card key={stat.label} className="p-4 text-center">
            <div className={`text-2xl ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Tìm kiếm theo tên hoặc tag..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('all')}
          >
            Tất cả
          </Button>
          <Button
            variant={selectedFilter === 'published' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('published')}
          >
            Đã xuất bản
          </Button>
          <Button
            variant={selectedFilter === 'draft' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('draft')}
          >
            Bản nháp
          </Button>
          <Button
            variant={selectedFilter === 'in_contest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('in_contest')}
          >
            Thi đấu
          </Button>
        </div>
      </div>

      {/* Artworks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredArtworks.map((artwork, index) => (
          <motion.div
            key={artwork.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <img
                src={artwork.thumbnail}
                alt={artwork.title}
                className="w-full h-40 object-cover"
              />
              <div className="absolute top-2 left-2">
                <Badge className={getStatusColor(artwork.status)}>
                  {getStatusLabel(artwork.status)}
                </Badge>
              </div>
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleVisibility(artwork.id)}
                  className="bg-white/80 hover:bg-white"
                >
                  {artwork.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              <h4 className="mb-2 truncate">{artwork.title}</h4>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {artwork.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {artwork.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{artwork.tags.length - 2}
                  </Badge>
                )}
              </div>
              
              <div className="text-xs text-gray-600 mb-3 space-y-1">
                <div>Tạo: {new Date(artwork.createdAt).toLocaleDateString('vi-VN')}</div>
                <div>Cập nhật: {new Date(artwork.updatedAt).toLocaleDateString('vi-VN')}</div>
                <div className="flex justify-between">
                  <span>👀 {artwork.views}</span>
                  <span>❤️ {artwork.likes}</span>
                  <span>💬 {artwork.comments}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditArt(artwork.id)}
                  className="flex-1"
                >
                  <Edit3 size={14} className="mr-1" />
                  Sửa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare(artwork)}
                >
                  <Share2 size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(artwork)}
                >
                  <Download size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(artwork.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredArtworks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="mb-2">Không tìm thấy tác phẩm nào</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedFilter !== 'all' 
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
              : 'Bạn chưa có tác phẩm nào. Hãy tạo tác phẩm đầu tiên!'
            }
          </p>
          <Button onClick={onCreateNew}>
            <Plus size={18} className="mr-2" />
            Tạo tranh mới
          </Button>
        </div>
      )}
    </div>
  );
};