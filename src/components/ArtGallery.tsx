import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Share2, Crown, Trophy, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useTranslation } from '../hooks/useTranslation';

interface ArtPiece {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  tags: string[];
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  rank?: number;
}

interface ArtGalleryProps {
  onCreateNew: () => void;
}

const mockArtPieces: ArtPiece[] = [
  {
    id: '1',
    title: 'Pixel Cat',
    artist: 'NguyenArt',
    thumbnail: 'https://via.placeholder.com/150x150/FF6B6B/FFFFFF?text=🐱',
    likes: 124,
    comments: 23,
    isLiked: false,
    tags: ['động vật', 'dễ thương'],
    difficulty: 'Dễ',
    rank: 1
  },
  {
    id: '2',
    title: 'Sunset City',
    artist: 'PixelMaster',
    thumbnail: 'https://via.placeholder.com/150x150/4ECDC4/FFFFFF?text=🏙️',
    likes: 89,
    comments: 15,
    isLiked: true,
    tags: ['phong cảnh', 'hoàng hôn'],
    difficulty: 'Trung bình',
    rank: 2
  },
  {
    id: '3',
    title: 'Dragon Warrior',
    artist: 'GameArtist',
    thumbnail: 'https://via.placeholder.com/150x150/45B7D1/FFFFFF?text=🐉',
    likes: 256,
    comments: 42,
    isLiked: false,
    tags: ['game', 'fantasy'],
    difficulty: 'Khó',
    rank: 3
  },
  {
    id: '4',
    title: 'Cute Robot',
    artist: 'TechDrawer',
    thumbnail: 'https://via.placeholder.com/150x150/96CEB4/FFFFFF?text=🤖',
    likes: 67,
    comments: 8,
    isLiked: false,
    tags: ['robot', 'sci-fi'],
    difficulty: 'Dễ'
  },
  {
    id: '5',
    title: 'Cherry Blossom',
    artist: 'NaturePixel',
    thumbnail: 'https://via.placeholder.com/150x150/FECA57/FFFFFF?text=🌸',
    likes: 143,
    comments: 31,
    isLiked: true,
    tags: ['hoa', 'mùa xuân'],
    difficulty: 'Trung bình'
  },
  {
    id: '6',
    title: 'Space Ship',
    artist: 'CosmicArt',
    thumbnail: 'https://via.placeholder.com/150x150/6C5CE7/FFFFFF?text=🚀',
    likes: 98,
    comments: 19,
    isLiked: false,
    tags: ['không gian', 'tàu vũ trụ'],
    difficulty: 'Khó'
  }
];

export const ArtGallery: React.FC<ArtGalleryProps> = ({ onCreateNew }) => {
  const { t } = useTranslation();
  const [artPieces, setArtPieces] = useState(mockArtPieces);
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard' | 'trending'>('all');

  const handleLike = (id: string) => {
    setArtPieces(prev => prev.map(piece => 
      piece.id === id 
        ? { 
            ...piece, 
            isLiked: !piece.isLiked,
            likes: piece.isLiked ? piece.likes - 1 : piece.likes + 1
          }
        : piece
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Dễ': return 'bg-green-100 text-green-800';
      case 'Trung bình': return 'bg-yellow-100 text-yellow-800';
      case 'Khó': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyTranslation = (difficulty: string) => {
    switch (difficulty) {
      case 'Dễ': return t('gallery.easy');
      case 'Trung bình': return t('gallery.medium');
      case 'Khó': return t('gallery.hard');
      default: return difficulty;
    }
  };

  const getRankIcon = (rank?: number) => {
    if (!rank) return null;
    if (rank === 1) return <Crown className="text-yellow-500" size={16} />;
    if (rank === 2) return <Trophy className="text-gray-400" size={16} />;
    if (rank === 3) return <Star className="text-orange-500" size={16} />;
    return null;
  };

  const filteredArt = artPieces.filter(piece => {
    switch (filter) {
      case 'easy': return piece.difficulty === 'Dễ';
      case 'medium': return piece.difficulty === 'Trung bình';
      case 'hard': return piece.difficulty === 'Khó';
      case 'trending': return piece.likes > 100;
      default: return true;
    }
  });

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2>{t('gallery.title')}</h2>
        <Button onClick={onCreateNew}>
          + {t('gallery.createNew')}
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { key: 'all', labelKey: 'gallery.all' },
          { key: 'trending', labelKey: 'gallery.trending' },
          { key: 'easy', labelKey: 'gallery.easy' },
          { key: 'medium', labelKey: 'gallery.medium' },
          { key: 'hard', labelKey: 'gallery.hard' }
        ].map(tab => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(tab.key as any)}
            className="whitespace-nowrap"
          >
            {t(tab.labelKey)}
          </Button>
        ))}
      </div>

      {/* Top Rankings */}
      {filter === 'all' && (
        <div className="mb-6">
          <h3 className="mb-3">🏆 {t('gallery.leaderboard')}</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {artPieces
              .filter(piece => piece.rank)
              .sort((a, b) => (a.rank || 0) - (b.rank || 0))
              .slice(0, 3)
              .map(piece => (
                <motion.div
                  key={piece.id}
                  className="flex-shrink-0 bg-white rounded-lg p-3 border-2 border-yellow-200 min-w-48"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getRankIcon(piece.rank)}
                    <span className="text-sm">#{piece.rank}</span>
                  </div>
                  <img
                    src={piece.thumbnail}
                    alt={piece.title}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                  <div className="text-sm">
                    <div>{piece.title}</div>
                    <div className="text-gray-600">{t('gallery.by')} {piece.artist}</div>
                    <div className="text-red-500">❤️ {piece.likes}</div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* Art Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredArt.map((piece, index) => (
          <motion.div
            key={piece.id}
            className="bg-white rounded-lg overflow-hidden shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, shadow: "0 8px 25px rgba(0,0,0,0.1)" }}
          >
            <div className="relative">
              <img
                src={piece.thumbnail}
                alt={piece.title}
                className="w-full h-32 object-cover"
              />
              {piece.rank && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
                  {getRankIcon(piece.rank)}
                  <span className="text-xs">#{piece.rank}</span>
                </div>
              )}
              <Badge 
                className={`absolute top-2 right-2 text-xs ${getDifficultyColor(piece.difficulty)}`}
              >
                {getDifficultyTranslation(piece.difficulty)}
              </Badge>
            </div>
            
            <div className="p-3">
              <h4 className="text-sm truncate mb-1">{piece.title}</h4>
              <p className="text-xs text-gray-600 mb-2">{t('gallery.by')} {piece.artist}</p>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {piece.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleLike(piece.id)}
                    className={`flex items-center gap-1 ${
                      piece.isLiked ? 'text-red-500' : 'hover:text-red-500'
                    }`}
                  >
                    <Heart 
                      size={14} 
                      fill={piece.isLiked ? 'currentColor' : 'none'} 
                    />
                    {piece.likes}
                  </button>
                  <div className="flex items-center gap-1">
                    <MessageCircle size={14} />
                    {piece.comments}
                  </div>
                </div>
                <button className="hover:text-blue-500">
                  <Share2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};