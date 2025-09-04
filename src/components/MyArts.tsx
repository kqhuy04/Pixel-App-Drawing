import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit3, Trash2, Share2, Download, Eye, EyeOff, Search, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useTranslation } from '../hooks/useTranslation';
import { ArtworkService, ArtworkData } from '../services/ArtworkService';
import { useAuth } from '../contexts/AuthContext';

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
  initialFilter?: 'all' | 'published' | 'draft' | 'in_contest';
}

const mockArtworks: Artwork[] = [];

export const MyArts: React.FC<MyArtsProps> = ({ onCreateNew, onEditArt, initialFilter = 'all' }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [artworks, setArtworks] = useState(mockArtworks);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'published' | 'draft' | 'in_contest'>(initialFilter);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      try {
        const data = await ArtworkService.getUserArtworks(currentUser.uid);
        const mapped: Artwork[] = data.map((a: ArtworkData) => ({
          id: a.id,
          title: a.title,
          thumbnail: a.thumbnail || 'https://via.placeholder.com/150x150/CCCCCC/FFFFFF?text=ART',
          createdAt: a.createdAt.toISOString().slice(0,10),
          updatedAt: a.updatedAt.toISOString().slice(0,10),
          likes: a.likes || 0,
          comments: 0,
          views: a.views || 0,
          isPublic: a.isPublic,
          tags: a.tags || [],
          status: 'published'
        }));
        setArtworks(mapped);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [currentUser]);

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
      case 'published': return t('myArts.published');
      case 'draft': return t('myArts.draft');
      case 'in_contest': return t('myArts.competition');
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
          <h2>🎨 {t('myArts.title')}</h2>
          <p className="text-gray-600">{t('myArts.subtitle')}</p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus size={18} />
          Tạo tranh mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { labelKey: 'myArts.total', value: stats.total, color: 'text-blue-600' },
          { labelKey: 'myArts.published', value: stats.published, color: 'text-green-600' },
          { labelKey: 'myArts.draft', value: stats.draft, color: 'text-gray-600' },
          { labelKey: 'myArts.competition', value: stats.in_contest, color: 'text-purple-600' },
          { labelKey: 'myArts.totalLikes', value: stats.totalLikes, color: 'text-red-600' },
          { labelKey: 'myArts.totalViews', value: stats.totalViews, color: 'text-orange-600' }
        ].map((stat, index) => (
          <Card key={stat.labelKey} className="p-4 text-center">
            <div className={`text-2xl ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-sm text-gray-600">{t(stat.labelKey)}</div>
          </Card>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder={t('myArts.searchPlaceholder')}
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
            {t('myArts.all')}
          </Button>
          <Button
            variant={selectedFilter === 'published' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('published')}
          >
            {t('myArts.published')}
          </Button>
          <Button
            variant={selectedFilter === 'draft' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('draft')}
          >
            {t('myArts.draft')}
          </Button>
          <Button
            variant={selectedFilter === 'in_contest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('in_contest')}
          >
            {t('myArts.competition')}
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
              <a href={`/?art=${artwork.id}`} target="_blank" rel="noopener noreferrer">
                <img
                  src={artwork.thumbnail}
                  alt={artwork.title}
                  className="w-full h-40 object-cover cursor-pointer"
                />
              </a>
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
                <div>{t('myArts.created')}: {new Date(artwork.createdAt).toLocaleDateString('vi-VN')}</div>
                <div>{t('myArts.updated')}: {new Date(artwork.updatedAt).toLocaleDateString('vi-VN')}</div>
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
                  {t('myArts.edit')}
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