import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Wand2, Palette, Play, Upload, Download, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTranslation } from '../hooks/useTranslation';

interface AIFeaturesProps {
  currentArtwork?: string; // Base64 or URL of current artwork
  onApplyResult?: (result: string) => void;
}

const artStyles = [
  { id: 'anime', label: 'Anime', preview: '🎌' },
  { id: 'pixel', label: 'Pixel Art', preview: '🎮' },
  { id: 'watercolor', label: 'Watercolor', preview: '🎨' },
  { id: 'oil', label: 'Oil Painting', preview: '🖼️' },
  { id: 'sketch', label: 'Sketch', preview: '✏️' },
  { id: 'cartoon', label: 'Cartoon', preview: '🎪' }
];

const gameStyles = [
  { id: 'retro', label: 'Retro 8-bit', preview: '👾' },
  { id: 'rpg', label: 'RPG Fantasy', preview: '⚔️' },
  { id: 'platformer', label: 'Platformer', preview: '🏃' },
  { id: 'puzzle', label: 'Puzzle Game', preview: '🧩' },
  { id: 'fighting', label: 'Fighting Game', preview: '🥊' },
  { id: 'racing', label: 'Racing Game', preview: '🏎️' }
];

const animationTypes = [
  { id: 'idle', labelKey: 'ai.idle', preview: '🧍' },
  { id: 'walk', labelKey: 'ai.walk', preview: '🚶' },
  { id: 'run', labelKey: 'ai.run', preview: '🏃' },
  { id: 'jump', labelKey: 'ai.jump', preview: '🦘' },
  { id: 'attack', labelKey: 'ai.attack', preview: '⚔️' },
  { id: 'wave', labelKey: 'ai.wave', preview: '👋' }
];

export const AIFeatures: React.FC<AIFeaturesProps> = ({ currentArtwork, onApplyResult }) => {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedGameStyle, setSelectedGameStyle] = useState('');
  const [selectedAnimation, setSelectedAnimation] = useState('');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const mockProcess = async (duration: number = 3000) => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, duration));
    setIsProcessing(false);
    // Mock result
    setResult('https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=AI+Result');
  };

  const handleSketchCompletion = async () => {
    if (!currentArtwork) {
      alert('Vui lòng vẽ một phác thảo trước khi sử dụng tính năng này');
      return;
    }
    await mockProcess();
  };

  const handleStyleTransfer = async () => {
    if (!currentArtwork || !selectedStyle) {
      alert('Vui lòng chọn phong cách và có tác phẩm để chuyển đổi');
      return;
    }
    await mockProcess();
  };

  const handleCreateAnimation = async () => {
    if (!currentArtwork || !selectedAnimation) {
      alert('Vui lòng chọn loại hoạt ảnh và có tác phẩm để tạo animation');
      return;
    }
    await mockProcess(5000); // Animation takes longer
  };

  const handleGameStyleGeneration = async () => {
    if (!prompt || !selectedGameStyle) {
      alert('Vui lòng nhập mô tả và chọn phong cách game');
      return;
    }
    await mockProcess();
  };

  const handleApplyResult = () => {
    if (result) {
      onApplyResult?.(result);
      alert('Đã áp dụng kết quả AI vào canvas!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="text-white" size={24} />
        </div>
        <h2 className="mb-2">🤖 {t('ai.title')}</h2>
        <p className="text-gray-600">
          {t('ai.subtitle')}
        </p>
      </div>

      <Tabs defaultValue="sketch" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sketch">{t('ai.complete')}</TabsTrigger>
          <TabsTrigger value="style">{t('ai.style')}</TabsTrigger>
          <TabsTrigger value="animation">{t('ai.animation')}</TabsTrigger>
          <TabsTrigger value="game">{t('ai.gameStyle')}</TabsTrigger>
        </TabsList>

        {/* Sketch Completion */}
        <TabsContent value="sketch" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wand2 className="text-purple-600" size={20} />
              <h3>{t('ai.completeSketch')}</h3>
            </div>
            <p className="text-gray-600 mb-6">
              {t('ai.completeDescription')}
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="mb-3">{t('ai.currentArtwork')}</h4>
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {currentArtwork ? (
                    <img src={currentArtwork} alt="Current artwork" className="max-w-full h-auto mx-auto" />
                  ) : (
                    <div>
                      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-500">Chưa có tác phẩm</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="mb-3">{t('ai.result')}</h4>
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {isProcessing ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin text-purple-600 mb-2" size={32} />
                      <p className="text-purple-600">AI is processing...</p>
                    </div>
                  ) : result ? (
                    <img src={result} alt="AI result" className="max-w-full h-auto mx-auto" />
                  ) : (
                    <div>
                      <Sparkles className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-500">Kết quả sẽ hiển thị ở đây</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleSketchCompletion} 
                disabled={isProcessing || !currentArtwork}
                className="flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {t('ai.completeWithAI')}
              </Button>
              {result && (
                <Button variant="outline" onClick={handleApplyResult}>
                  <Download size={16} className="mr-1" />
                  Apply result
                </Button>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Style Transfer */}
        <TabsContent value="style" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="text-blue-600" size={20} />
              <h3>AI Chuyển đổi phong cách</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Biến đổi tác phẩm của bạn sang nhiều phong cách nghệ thuật khác nhau
            </p>
            
            <div className="mb-6">
              <Label className="mb-3 block">Chọn phong cách nghệ thuật</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {artStyles.map(style => (
                  <motion.button
                    key={style.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                      selectedStyle === style.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{style.preview}</div>
                    <div className="text-sm">{style.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="mb-3">Tác phẩm gốc</h4>
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {currentArtwork ? (
                    <img src={currentArtwork} alt="Original artwork" className="max-w-full h-auto mx-auto" />
                  ) : (
                    <div>
                      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-500">Chưa có tác phẩm</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="mb-3">Phong cách mới</h4>
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {isProcessing ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                      <p className="text-blue-600">Đang chuyển đổi phong cách...</p>
                    </div>
                  ) : result ? (
                    <img src={result} alt="Styled artwork" className="max-w-full h-auto mx-auto" />
                  ) : (
                    <div>
                      <Palette className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-500">Kết quả sẽ hiển thị ở đây</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleStyleTransfer} 
                disabled={isProcessing || !currentArtwork || !selectedStyle}
                className="flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                Chuyển đổi phong cách
              </Button>
              {result && (
                <Button variant="outline" onClick={handleApplyResult}>
                  <Download size={16} className="mr-1" />
                  Apply result
                </Button>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Animation */}
        <TabsContent value="animation" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Play className="text-green-600" size={20} />
              <h3>AI Tạo hoạt ảnh 2D</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Từ một bức tranh tĩnh, AI sẽ tạo ra những chuyển động sinh động
            </p>
            
            <div className="mb-6">
              <Label className="mb-3 block">Chọn loại hoạt ảnh</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {animationTypes.map(animation => (
                  <motion.button
                    key={animation.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAnimation(animation.id)}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                      selectedAnimation === animation.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{animation.preview}</div>
                    <div className="text-sm">{t(animation.labelKey)}</div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="mb-3">Tranh gốc</h4>
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {currentArtwork ? (
                    <img src={currentArtwork} alt="Static artwork" className="max-w-full h-auto mx-auto" />
                  ) : (
                    <div>
                      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-500">Chưa có tác phẩm</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="mb-3">Hoạt ảnh (GIF)</h4>
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {isProcessing ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin text-green-600 mb-2" size={32} />
                      <p className="text-green-600">Đang tạo hoạt ảnh...</p>
                      <p className="text-xs text-gray-500 mt-1">Có thể mất 30-60 giây</p>
                    </div>
                  ) : result ? (
                    <img src={result} alt="Animated result" className="max-w-full h-auto mx-auto" />
                  ) : (
                    <div>
                      <Play className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-500">Hoạt ảnh sẽ hiển thị ở đây</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleCreateAnimation} 
                disabled={isProcessing || !currentArtwork || !selectedAnimation}
                className="flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                Tạo hoạt ảnh
              </Button>
              {result && (
                <Button variant="outline" onClick={() => {
                  const link = document.createElement('a');
                  link.href = result;
                  link.download = 'animation.gif';
                  link.click();
                }}>
                  <Download size={16} className="mr-1" />
                  Tải về GIF
                </Button>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Game Style Generation */}
        <TabsContent value="game" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-orange-100 text-orange-800">
                🎮 AI Tạo tranh game
              </Badge>
            </div>
            <p className="text-gray-600 mb-6">
              Mô tả ý tưởng của bạn, AI sẽ tạo ra nhân vật/vật thể theo phong cách game
            </p>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="prompt" className="mb-2 block">Mô tả chi tiết</Label>
                <Textarea
                  id="prompt"
                  placeholder="Ví dụ: Một chiến binh có áo giáp màu xanh, cầm kiếm và khiên, phong cách fantasy RPG..."
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label className="mb-3 block">Phong cách game</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {gameStyles.map(style => (
                    <motion.button
                      key={style.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedGameStyle(style.id)}
                      className={`p-4 rounded-lg border-2 text-center transition-colors ${
                        selectedGameStyle === style.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{style.preview}</div>
                      <div className="text-sm">{style.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-orange-600 mb-2" size={32} />
                    <p className="text-orange-600">AI đang tạo tranh...</p>
                  </div>
                ) : result ? (
                  <div>
                    <img src={result} alt="Generated game art" className="max-w-full h-auto mx-auto mb-4" />
                    <Badge variant="secondary">Tạo thành công!</Badge>
                  </div>
                ) : (
                  <div>
                    <Sparkles className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-500">Tranh được tạo sẽ hiển thị ở đây</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleGameStyleGeneration} 
                  disabled={isProcessing || !prompt || !selectedGameStyle}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  Tạo tranh game
                </Button>
                {result && (
                  <Button variant="outline" onClick={handleApplyResult}>
                    <Download size={16} className="mr-1" />
                    Apply result
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};