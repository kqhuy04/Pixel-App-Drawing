import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Image, Trophy, Menu, X, User, Folder, Users, Sparkles } from 'lucide-react';
import { Button } from './components/ui/button';
import { PixelCanvas } from './components/PixelCanvas';
import { ColorPalette } from './components/ColorPalette';
import { ToolPanel } from './components/ToolPanel';
import { LoginModal } from './components/LoginModal';
import { SaveArtworkModal } from './components/SaveArtworkModal';
import { ExportModal } from './components/ExportModal';
import { ArtGallery } from './components/ArtGallery';
import { ProfileMenu } from './components/ProfileMenu';
import { CompetitionPanel } from './components/CompetitionPanel';
import { UserProfile } from './components/UserProfile';
import { MyArts } from './components/MyArts';
import { CollaborativeCanvas } from './components/CollaborativeCanvas';
import { useRoomManager } from './components/RoomManager';
import { AIFeatures } from './components/AIFeatures';
import { SearchPanel } from './components/SearchPanel';
import { UserInfo } from './components/UserInfo';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DrawingState } from './types/Artwork';

type View = 'canvas' | 'gallery' | 'competitions' | 'profile' | 'my-arts' | 'collaborative' | 'ai-features';

function AppContent() {
  const { currentUser, userData, logout } = useAuth();
  const { currentRoomId, joinRoom, leaveRoom } = useRoomManager();
  const [currentView, setCurrentView] = useState<View>('canvas');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedTool, setSelectedTool] = useState<'pen' | 'eraser' | 'fill' | 'line' | 'rectangle' | 'circle' | 'move' | 'eyedropper' | 'spray'>('pen');
  const [brushSize, setBrushSize] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 32, height: 32 });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [drawingState, setDrawingState] = useState<DrawingState | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentView('canvas');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSave = () => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsSaveModalOpen(true);
  };

  const handleShare = () => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    // Share functionality - copy canvas as image to clipboard
    if (drawingState) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 32 * 12;
        canvas.height = 32 * 12;
        
        // Draw pixels
        for (let y = 0; y < 32; y++) {
          for (let x = 0; x < 32; x++) {
            ctx.fillStyle = drawingState.pixels[y][x];
            ctx.fillRect(x * 12, y * 12, 12, 12);
          }
        }
        
        canvas.toBlob(blob => {
          if (blob) {
            navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]).then(() => {
              alert('Tác phẩm đã được sao chép vào clipboard!');
            }).catch(() => {
              alert('Không thể sao chép tác phẩm. Vui lòng thử lại.');
            });
          }
        });
      }
    }
  };

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const handleUndo = () => {
    if ((window as any).canvasUndo) {
      (window as any).canvasUndo();
    }
  };

  const handleRedo = () => {
    if ((window as any).canvasRedo) {
      (window as any).canvasRedo();
    }
  };

  const handleClear = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ canvas?')) {
      const newPixels = Array(canvasSize.height).fill(null).map(() => Array(canvasSize.width).fill('#ffffff'));
      const newHistory = {
        pixels: newPixels.map(row => [...row]),
        timestamp: Date.now()
      };
      
      setDrawingState({
        pixels: newPixels,
        history: [newHistory],
        historyIndex: 0,
        canUndo: false,
        canRedo: false
      });
    }
  };

  const handleRotate = (direction: 'left' | 'right') => {
    if (drawingState) {
      const rotatedPixels = direction === 'left' 
        ? rotateCanvasLeft(drawingState.pixels)
        : rotateCanvasRight(drawingState.pixels);
      
      const newHistory = {
        pixels: rotatedPixels.map(row => [...row]),
        timestamp: Date.now()
      };
      
      setDrawingState({
        ...drawingState,
        pixels: rotatedPixels,
        history: [...drawingState.history.slice(0, drawingState.historyIndex + 1), newHistory],
        historyIndex: drawingState.historyIndex + 1,
        canUndo: true,
        canRedo: false
      });
    }
  };

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    if (drawingState) {
      const flippedPixels = direction === 'horizontal'
        ? flipCanvasHorizontal(drawingState.pixels)
        : flipCanvasVertical(drawingState.pixels);
      
      const newHistory = {
        pixels: flippedPixels.map(row => [...row]),
        timestamp: Date.now()
      };
      
      setDrawingState({
        ...drawingState,
        pixels: flippedPixels,
        history: [...drawingState.history.slice(0, drawingState.historyIndex + 1), newHistory],
        historyIndex: drawingState.historyIndex + 1,
        canUndo: true,
        canRedo: false
      });
    }
  };

  const handleColorPick = (color: string) => {
    setSelectedColor(color);
  };

  const handleCanvasSizeChange = (newSize: { width: number; height: number }) => {
    setCanvasSize(newSize);
    // Reset drawing state when canvas size changes
    const newPixels = Array(newSize.height).fill(null).map(() => Array(newSize.width).fill('#ffffff'));
    const newHistory = {
      pixels: newPixels.map(row => [...row]),
      timestamp: Date.now()
    };
    
    setDrawingState({
      pixels: newPixels,
      history: [newHistory],
      historyIndex: 0,
      canUndo: false,
      canRedo: false
    });
  };

  // Helper functions for canvas transformations
  const rotateCanvasLeft = (pixels: string[][]) => {
    const rows = pixels.length;
    const cols = pixels[0].length;
    const rotated = Array(cols).fill(null).map(() => Array(rows).fill(''));
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = pixels[i][j];
      }
    }
    return rotated;
  };

  const rotateCanvasRight = (pixels: string[][]) => {
    const rows = pixels.length;
    const cols = pixels[0].length;
    const rotated = Array(cols).fill(null).map(() => Array(rows).fill(''));
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[cols - 1 - j][i] = pixels[i][j];
      }
    }
    return rotated;
  };

  const flipCanvasHorizontal = (pixels: string[][]) => {
    return pixels.map(row => [...row].reverse());
  };

  const flipCanvasVertical = (pixels: string[][]) => {
    return [...pixels].reverse();
  };

  const handleExportFile = (format: 'png' | 'jpeg', pixelSize: number, quality?: number) => {
    if (drawingState) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 32 * pixelSize;
        canvas.height = 32 * pixelSize;
        
        // Fill background for JPEG
        if (format === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Draw pixels
        for (let y = 0; y < 32; y++) {
          for (let x = 0; x < 32; x++) {
            ctx.fillStyle = drawingState.pixels[y][x];
            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
          }
        }
        
        // Download
        const link = document.createElement('a');
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        link.download = `pixel-art-${Date.now()}.${format}`;
        link.href = canvas.toDataURL(mimeType, quality);
        link.click();
      }
    }
  };

  const handleArtworkSaved = (artworkId: string) => {
    alert(`Tác phẩm đã được lưu thành công với ID: ${artworkId}`);
  };

  const handleNavigationClick = (view: View, requireAuth?: boolean) => {
    if (requireAuth && !currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    setCurrentView(view);
  };

  // ...existing code...
const navigation: {
  id: View;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  view: View;
  requireAuth?: boolean;
}[] = [
  { id: 'canvas', icon: Palette, label: 'Vẽ tranh', view: 'canvas' },
  { id: 'gallery', icon: Image, label: 'Thư viện', view: 'gallery' },
  { id: 'my-arts', icon: Folder, label: 'Tranh của tôi', view: 'my-arts', requireAuth: true },
  { id: 'collaborative', icon: Users, label: 'Vẽ chung', view: 'collaborative' },
  { id: 'ai-features', icon: Sparkles, label: 'AI Studio', view: 'ai-features' },
  { id: 'competitions', icon: Trophy, label: 'Cuộc thi', view: 'competitions' }
];
// ...existing code...

  const MobileMenu = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-72 h-full bg-white shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2>Pixel Art Studio</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-2">
              {navigation.map(nav => (
                <button
                  key={nav.id}
                  onClick={() => {
                    handleNavigationClick(nav.view, nav.requireAuth);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentView === nav.view
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <nav.icon size={20} />
                  {nav.label}
                  {nav.requireAuth && !currentUser && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full ml-auto">
                      Cần đăng nhập
                    </span>
                  )}
                </button>
              ))}
            </div>

            {currentView === 'canvas' && (
              <div className="p-4 space-y-4">
                <ColorPalette
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                />
                <ToolPanel
                  selectedTool={selectedTool}
                  onToolSelect={setSelectedTool}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  onSave={handleSave}
                  onShare={handleShare}
                  onExport={handleExport}
                  onClear={handleClear}
                  onRotate={handleRotate}
                  onFlip={handleFlip}
                  canUndo={drawingState?.canUndo || false}
                  canRedo={drawingState?.canRedo || false}
                  brushSize={brushSize}
                  onBrushSizeChange={setBrushSize}
                  canvasSize={canvasSize}
                  onCanvasSizeChange={setCanvasSize}
                />
              </div>
            )}

            {currentView === 'competitions' && (
              <div className="p-4">
                <CompetitionPanel />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden"
              >
                <Menu size={20} />
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Palette className="text-white" size={18} />
                </div>
                <h1 className="text-xl hidden sm:block">Pixel Art Studio</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {navigation.map(nav => (
                <Button
                  key={nav.id}
                  variant={currentView === nav.view ? 'default' : 'ghost'}
                  onClick={() => handleNavigationClick(nav.view, nav.requireAuth)}
                  className="flex items-center gap-2 relative"
                >
                  <nav.icon size={18} />
                  {nav.label}
                  {nav.requireAuth && !currentUser && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
                  )}
                </Button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {currentUser ? (
                <ProfileMenu 
                  username={userData?.displayName || currentUser.displayName || currentUser.email || 'User'} 
                  onLogout={handleLogout}
                  onViewProfile={() => setCurrentView('profile')}
                />
              ) : (
                <Button onClick={() => setIsLoginModalOpen(true)}>
                  Đăng nhập
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            {currentView === 'canvas' && (
              <>
                <ColorPalette
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                />
                <ToolPanel
                  selectedTool={selectedTool}
                  onToolSelect={setSelectedTool}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  onSave={handleSave}
                  onShare={handleShare}
                  onExport={handleExport}
                  onClear={handleClear}
                  onRotate={handleRotate}
                  onFlip={handleFlip}
                  canUndo={drawingState?.canUndo || false}
                  canRedo={drawingState?.canRedo || false}
                  brushSize={brushSize}
                  onBrushSizeChange={setBrushSize}
                  canvasSize={canvasSize}
                  onCanvasSizeChange={handleCanvasSizeChange}
                />
              </>
            )}
            
            {currentView === 'gallery' && (
              <SearchPanel
                onFiltersChange={(filters) => console.log('Filters changed:', filters)}
                onClearFilters={() => console.log('Filters cleared')}
              />
            )}
            
            {currentView === 'competitions' && <CompetitionPanel />}
            
            {currentUser && <UserInfo />}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {currentView === 'canvas' && (
                <motion.div
                  key="canvas"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h2 className="mb-2">🎨 Tạo tác phẩm pixel art của bạn</h2>
                    <p className="text-gray-600">
                      Canvas: {canvasSize.width} × {canvasSize.height} pixels
                    </p>
                  </div>
                  
                  <PixelCanvas
                    width={canvasSize.width}
                    height={canvasSize.height}
                    pixelSize={12}
                    selectedColor={selectedColor}
                    tool={selectedTool}
                    brushSize={brushSize}
                    onStateChange={setDrawingState}
                    onColorPick={handleColorPick}
                  />

                  <div className="text-center text-sm text-gray-600">
                    <p>💡 Mẹo: Sử dụng chuột hoặc chạm để vẽ. Giữ và kéo để vẽ liên tục.</p>
                    <p>🛠️ Công cụ mới: Đường thẳng, hình chữ nhật, hình tròn, chọn màu, phun sương</p>
                  </div>
                </motion.div>
              )}

              {currentView === 'gallery' && (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ArtGallery onCreateNew={() => setCurrentView('canvas')} />
                </motion.div>
              )}

              {currentView === 'my-arts' && (
                <motion.div
                  key="my-arts"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <MyArts 
                    onCreateNew={() => setCurrentView('canvas')}
                    onEditArt={(id) => {
                      console.log('Edit art:', id);
                      setCurrentView('canvas');
                    }}
                  />
                </motion.div>
              )}

              {currentView === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <UserProfile 
                    username={userData?.displayName || currentUser?.displayName || currentUser?.email || 'Guest'}
                    onUpdateProfile={(data) => console.log('Profile updated:', data)}
                  />
                </motion.div>
              )}

              {currentView === 'collaborative' && (
                <motion.div
                  key="collaborative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <CollaborativeCanvas 
                    roomId={currentRoomId || undefined}
                    onCreateRoom={() => console.log('Create room')}
                    onJoinRoom={(roomId) => joinRoom(roomId)}
                  />
                </motion.div>
              )}

              {currentView === 'ai-features' && (
                <motion.div
                  key="ai-features"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AIFeatures 
                    currentArtwork="https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=Current+Art"
                    onApplyResult={(result) => console.log('Apply AI result:', result)}
                  />
                </motion.div>
              )}

              {currentView === 'competitions' && (
                <motion.div
                  key="competitions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="lg:hidden"
                >
                  <CompetitionPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Menu */}
      <MobileMenu />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Save Artwork Modal */}
      {drawingState && (
        <SaveArtworkModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          onSave={handleArtworkSaved}
          pixels={drawingState.pixels}
          width={32}
          height={32}
          pixelSize={12}
        />
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportFile}
        currentPixelSize={12}
      />

      {/* Welcome Message for New Users */}
      {!currentUser && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <h4 className="mb-2">🎉 Chào mừng đến với Pixel Art Studio!</h4>
          <p className="text-sm mb-3">
            Đăng nhập để lưu trữ tác phẩm, tham gia cuộc thi và chia sẻ với cộng đồng.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full"
          >
            Đăng nhập ngay
          </Button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}