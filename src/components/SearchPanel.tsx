import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, X, SlidersHorizontal, Calendar, Heart, Eye, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { useTranslation } from '../hooks/useTranslation';

interface SearchFilters {
  query: string;
  tags: string[];
  difficulty: string;
  likes: [number, number];
  views: [number, number];
  dateRange: string;
  sortBy: string;
  artist: string;
}

interface SearchPanelProps {
  onFiltersChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
}

const popularTags = [
  'động vật', 'dễ thương', 'game', 'fantasy', 'robot', 'sci-fi',
  'hoa', 'mùa xuân', 'phong cảnh', 'hoàng hôn', 'không gian',
  'character', 'retro', '8-bit', 'pixel', 'anime', 'chibi'
];

const difficulties = [
  { value: 'all', labelKey: 'search.allDifficulties' },
  { value: 'easy', labelKey: 'gallery.easy' },
  { value: 'medium', labelKey: 'gallery.medium' },
  { value: 'hard', labelKey: 'gallery.hard' }
];

const sortOptions = [
  { value: 'newest', labelKey: 'search.newest' },
  { value: 'oldest', labelKey: 'search.oldest' },
  { value: 'most_liked', labelKey: 'search.mostLiked' },
  { value: 'most_viewed', labelKey: 'search.mostViewed' },
  { value: 'trending', labelKey: 'search.trending' },
  { value: 'random', labelKey: 'search.random' }
];

const dateRanges = [
  { value: 'all', labelKey: 'search.allTime' },
  { value: 'today', labelKey: 'search.today' },
  { value: 'week', labelKey: 'search.week' },
  { value: 'month', labelKey: 'search.month' },
  { value: 'year', labelKey: 'search.year' }
];

export const SearchPanel: React.FC<SearchPanelProps> = ({
  onFiltersChange,
  onClearFilters
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    tags: [],
    difficulty: 'all',
    likes: [0, 1000],
    views: [0, 5000],
    dateRange: 'all',
    sortBy: 'newest',
    artist: ''
  });

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilters({ tags: [...filters.tags, tag] });
    }
  };

  const removeTag = (tag: string) => {
    updateFilters({ tags: filters.tags.filter(t => t !== tag) });
  };

  const clearAllFilters = () => {
    const defaultFilters: SearchFilters = {
      query: '',
      tags: [],
      difficulty: 'all',
      likes: [0, 1000],
      views: [0, 5000],
      dateRange: 'all',
      sortBy: 'newest',
      artist: ''
    };
    setFilters(defaultFilters);
    onClearFilters();
  };

  const hasActiveFilters = filters.query || filters.tags.length > 0 || 
    filters.difficulty !== 'all' || filters.dateRange !== 'all' || 
    filters.artist || filters.sortBy !== 'newest';

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Search Bar */}
      <div className="p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder={t('search.placeholder')}
              value={filters.query}
              onChange={e => updateFilters({ query: e.target.value })}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal size={16} />
            {t('search.filter')}
            {hasActiveFilters && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {[
                  filters.tags.length,
                  filters.difficulty !== 'all' ? 1 : 0,
                  filters.dateRange !== 'all' ? 1 : 0,
                  filters.artist ? 1 : 0,
                  filters.sortBy !== 'newest' ? 1 : 0
                ].reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearAllFilters}>
              <X size={16} />
            </Button>
          )}
        </div>

        {/* Selected Tags */}
        {filters.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button onClick={() => removeTag(tag)}>
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t"
        >
          <div className="p-4 space-y-6">
            {/* Popular Tags */}
            <div>
              <h4 className="mb-3 flex items-center gap-2">
                <Filter size={16} />
                {t('search.popularTags')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    disabled={filters.tags.includes(tag)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      filters.tags.includes(tag)
                        ? 'bg-blue-100 border-blue-300 text-blue-700 cursor-not-allowed'
                        : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Difficulty */}
              <div>
                <label className="block text-sm mb-2">{t('search.difficulty')}</label>
                <Select value={filters.difficulty} onValueChange={value => updateFilters({ difficulty: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map(diff => (
                      <SelectItem key={diff.value} value={diff.value}>
                        {t(diff.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm mb-2 flex items-center gap-1">
                  <Calendar size={14} />
                  {t('search.time')}
                </label>
                <Select value={filters.dateRange} onValueChange={value => updateFilters({ dateRange: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRanges.map(range => (
                      <SelectItem key={range.value} value={range.value}>
                        {t(range.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm mb-2 flex items-center gap-1">
                  <TrendingUp size={14} />
                  {t('search.sortBy')}
                </label>
                <Select value={filters.sortBy} onValueChange={value => updateFilters({ sortBy: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Range Sliders */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Likes Range */}
              <div>
                <label className="block text-sm mb-3 flex items-center gap-1">
                  <Heart size={14} />
                  {t('search.likesCount')}: {filters.likes[0]} - {filters.likes[1]}
                </label>
                <Slider
                  value={filters.likes}
                  onValueChange={value => updateFilters({ likes: value as [number, number] })}
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Views Range */}
              <div>
                <label className="block text-sm mb-3 flex items-center gap-1">
                  <Eye size={14} />
                  {t('search.viewsCount')}: {filters.views[0]} - {filters.views[1]}
                </label>
                <Slider
                  value={filters.views}
                  onValueChange={value => updateFilters({ views: value as [number, number] })}
                  max={5000}
                  step={50}
                  className="w-full"
                />
              </div>
            </div>

            {/* Artist Filter */}
            <div>
              <label className="block text-sm mb-2">{t('search.artist')}</label>
              <Input
                placeholder={t('search.artistPlaceholder')}
                value={filters.artist}
                onChange={e => updateFilters({ artist: e.target.value })}
              />
            </div>

            {/* Quick Filters */}
            <div>
              <h4 className="mb-3">{t('search.quickFilters')}</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilters({ 
                    sortBy: 'trending',
                    dateRange: 'week',
                    likes: [50, 1000]
                  })}
                >
                  🔥 {t('search.trendingWeek')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilters({ 
                    sortBy: 'most_liked',
                    dateRange: 'month',
                    likes: [100, 1000]
                  })}
                >
                  ⭐ {t('search.mostLoved')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilters({ 
                    difficulty: 'easy',
                    sortBy: 'newest'
                  })}
                >
                  🌱 {t('search.forBeginners')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilters({ 
                    difficulty: 'hard',
                    sortBy: 'most_liked'
                  })}
                >
                  🎯 {t('search.challenge')}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};