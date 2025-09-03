import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Image, Trophy, Menu, X, User, Folder, Users, Sparkles } from 'lucide-react';
import { Button } from './components/ui/button';
import { PixelCanvas } from './components/PixelCanvas';
import { ColorPalette } from './components/ColorPalette';
import { ToolPanel } from './components/ToolPanel';
import { LoginModal } from './components/LoginModal';
import { ArtGallery } from './components/ArtGallery';
import { ProfileMenu } from './components/ProfileMenu';
import { CompetitionPanel } from './components/CompetitionPanel';
import { UserProfile } from './components/UserProfile';
import { MyArts } from './components/MyArts';
import { CollaborativeCanvas } from './components/CollaborativeCanvas';
import { AIFeatures } from './components/AIFeatures';
import { SearchPanel } from './components/SearchPanel';

type View = 'canvas' | 'gallery' | 'competitions' | 'profile' | 'my-arts' | 'collaborative' | 'ai-features';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('canvas');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedTool, setSelectedTool] = useState<'pen' | 'eraser' | 'fill'>('pen');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = (username: string) => {
    setUser(username);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('canvas');
  };

  const handleSave = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    // Mock save functionality
    alert('Tranh đã được lưu thành công!');
  };

  const handleShare = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    // Mock share functionality
    alert('Tranh đã được chia sẻ!');
  };

  const handleNavigationClick = (view: View, requireAuth?: boolean) => {
    if (requireAuth && !user) {
      setIsLoginModalOpen(true);
      return;
    }
    setCurrentView(view);
  };

  const navigation = [
    { id: 'canvas' as const, icon: Palette, label: 'Vẽ tranh', view: 'canvas' },
    { id: 'gallery' as const, icon: Image, label: 'Thư viện', view: 'gallery' },
    { id: 'my-arts' as const, icon: Folder, label: 'Tranh của tôi', view: 'my-arts', requireAuth: true },
    { id: 'collaborative' as const, icon: Users, label: 'Vẽ chung', view: 'collaborative' },
    { id: 'ai-features' as const, icon: Sparkles, label: 'AI Studio', view: 'ai-features' },
    { id: 'competitions' as const, icon: Trophy, label: 'Cuộc thi', view: 'competitions' }
  ];

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
                  {nav.requireAuth && !user && (
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
                  onSave={handleSave}
                  onShare={handleShare}
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
                  {nav.requireAuth && !user && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
                  )}
                </Button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {user ? (
                <ProfileMenu 
                  username={user} 
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
                  onSave={handleSave}
                  onShare={handleShare}
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
                      Sử dụng bảng màu và công cụ để vẽ những tác phẩm pixel art tuyệt đẹp
                    </p>
                  </div>
                  
                  <PixelCanvas
                    width={32}
                    height={32}
                    pixelSize={12}
                    selectedColor={selectedColor}
                    tool={selectedTool}
                  />

                  <div className="text-center text-sm text-gray-600">
                    <p>💡 Mẹo: Sử dụng chuột hoặc chạm để vẽ. Giữ và kéo để vẽ liên tục.</p>
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
                    username={user || 'Guest'}
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
                    onCreateRoom={() => console.log('Create room')}
                    onJoinRoom={(roomId) => console.log('Join room:', roomId)}
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
        onLogin={handleLogin}
      />

      {/* Welcome Message for New Users */}
      {!user && (
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