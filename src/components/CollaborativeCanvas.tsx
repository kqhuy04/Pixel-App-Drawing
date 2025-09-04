import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Share2, Copy, Clock, Eye, UserPlus, MessageCircle, Send, Plus, Search, Settings, LogOut, Crown, Palette, X, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { CollaborativePixelCanvas } from './CollaborativePixelCanvas';
import { ColorPalette } from './ColorPalette';
import { ToolPanel } from './ToolPanel';
import { useAuth } from '../contexts/AuthContext';
import { CollaborationService, CollaborationRoom, CollaborationUser, ChatMessage } from '../services/CollaborationService';
import { DrawingState } from '../types/Artwork';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';
import { SaveCollaborationModal } from './SaveCollaborationModal';
import { useTranslation } from '../hooks/useTranslation';

interface CollaborativeCanvasProps {
  roomId?: string;
  onCreateRoom?: () => void;
  onJoinRoom?: (roomId: string) => void;
}

type View = 'rooms' | 'canvas' | 'create-room';

export const CollaborativeCanvas: React.FC<CollaborativeCanvasProps> = ({
  roomId: initialRoomId,
  onCreateRoom,
  onJoinRoom
}) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { toasts, removeToast, success, error: showError, info } = useToast();
  const [currentView, setCurrentView] = useState<View>('rooms');
  const [currentRoom, setCurrentRoom] = useState<CollaborationRoom | null>(null);
  const [roomUsers, setRoomUsers] = useState<CollaborationUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [publicRooms, setPublicRooms] = useState<CollaborationRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Canvas state
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedTool, setSelectedTool] = useState<'pen' | 'eraser' | 'fill' | 'line' | 'rectangle' | 'circle' | 'move' | 'eyedropper' | 'spray'>('pen');
  const [brushSize, setBrushSize] = useState(1);
  const [drawingState, setDrawingState] = useState<DrawingState | null>(null);
  
  // Chat state
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Create room form
  const [createRoomForm, setCreateRoomForm] = useState({
    name: '',
    description: '',
    maxUsers: 10,
    isPublic: true
  });

  const [showSaveModal, setShowSaveModal] = useState(false);

  // Reset loading state when component mounts or view changes
  useEffect(() => {
    if (currentView === 'create-room') {
      setLoading(false);
      setError('');
    }
  }, [currentView]);

  // Load public rooms on mount
  useEffect(() => {
    loadPublicRooms();
  }, []);

  // Auto-join room if roomId is provided
  useEffect(() => {
    if (initialRoomId && currentUser) {
      joinRoom(initialRoomId);
    }
  }, [initialRoomId, currentUser]);

  const loadPublicRooms = async () => {
    try {
      setLoading(true);
      const rooms = await CollaborationService.getPublicRooms();
      setPublicRooms(rooms);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!currentUser) {
      showError('Lỗi', 'Vui lòng đăng nhập để tạo phòng');
      return;
    }

    if (!createRoomForm.name.trim()) {
      showError('Lỗi', 'Vui lòng nhập tên phòng');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('🚀 Attempting to create room...');
      const roomId = await CollaborationService.createRoom({
        name: createRoomForm.name.trim(),
        description: createRoomForm.description.trim(),
        maxUsers: createRoomForm.maxUsers,
        isPublic: createRoomForm.isPublic
      });

      console.log('✅ Room created, joining...');
      await joinRoom(roomId);
      success('Thành công', 'Phòng đã được tạo và bạn đã tham gia!');
      onCreateRoom?.();
    } catch (error: any) {
      console.error('❌ Create room error:', error);
      setError(error.message);
      showError('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!currentUser) {
      showError('Lỗi', 'Vui lòng đăng nhập để tham gia phòng');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const room = await CollaborationService.joinRoom(roomId);
      if (room) {
        setCurrentRoom(room);
        setCurrentView('canvas');
        onJoinRoom?.(roomId);
        success('Thành công', `Đã tham gia phòng "${room.name}"`);
        
        // Setup real-time listeners
        setupRoomListeners(roomId);
      }
    } catch (error: any) {
      setError(error.message);
      showError('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  };

  const leaveRoom = async () => {
    if (currentRoom) {
      try {
        await CollaborationService.leaveRoom(currentRoom.id);
        setCurrentRoom(null);
        setRoomUsers([]);
        setChatMessages([]);
        setCurrentView('rooms');
        setDrawingState(null);
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  const setupRoomListeners = (roomId: string) => {
    // Listen to users changes
    const unsubscribeUsers = CollaborationService.onUsersChange(roomId, (users) => {
      setRoomUsers(users);
    });

    // Listen to chat messages
    const unsubscribeChat = CollaborationService.onChatMessages(roomId, (messages) => {
      setChatMessages(messages);
      // Auto scroll to bottom
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    // Listen to canvas changes
    const unsubscribeCanvas = CollaborationService.onCanvasChange(roomId, (canvasData) => {
      if (canvasData && canvasData.pixels) {
        const newDrawingState: DrawingState = {
          pixels: canvasData.pixels,
          history: [{
            pixels: canvasData.pixels.map((row: string[]) => [...row]),
            timestamp: Date.now()
          }],
          historyIndex: 0,
          canUndo: false,
          canRedo: false
        };
        setDrawingState(newDrawingState);
      }
    });

    // Store unsubscribe functions for cleanup
    return () => {
      unsubscribeUsers();
      unsubscribeChat();
      unsubscribeCanvas();
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentRoom) return;

    try {
      await CollaborationService.sendMessage(currentRoom.id, newMessage);
      setNewMessage('');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCanvasChange = useCallback(async (newState: DrawingState) => {
    if (!currentRoom) return;

    setDrawingState(newState);
    
    // Update canvas in real-time
    await CollaborationService.updateCanvas(currentRoom.id, {
      pixels: newState.pixels,
      width: 32,
      height: 32,
      pixelSize: 12
    });
  }, [currentRoom]);

  const handleColorPick = useCallback((color: string) => {
    setSelectedColor(color);
    if (currentRoom) {
      CollaborationService.updateUserTool(currentRoom.id, selectedTool, color);
    }
  }, [selectedTool, currentRoom]);

  const handleToolSelect = useCallback((tool: 'pen' | 'eraser' | 'fill' | 'line' | 'rectangle' | 'circle' | 'move' | 'eyedropper' | 'spray') => {
    setSelectedTool(tool);
    if (currentRoom) {
      CollaborationService.updateUserTool(currentRoom.id, tool, selectedColor);
    }
  }, [selectedColor, currentRoom]);

  const copyRoomLink = () => {
    if (currentRoom) {
      const roomUrl = `${window.location.origin}${window.location.pathname}?room=${currentRoom.id}`;
      navigator.clipboard.writeText(roomUrl);
      success('Đã sao chép', 'Link phòng đã được sao chép vào clipboard');
    }
  };

  const saveCollaborationArtwork = async (data: {
    title: string;
    description: string;
    tags: string[];
    isPublic: boolean;
  }) => {
    if (!currentRoom) return;

    try {
      setLoading(true);
      const artworkId = await CollaborationService.saveCollaborationArtwork(
        currentRoom.id,
        {
          title: data.title,
          description: data.description,
          tags: [...data.tags, 'collaboration'],
          isPublic: data.isPublic
        }
      );

      success('Thành công', `Tác phẩm đã được lưu với ID: ${artworkId}`);
      setShowSaveModal(false);
    } catch (error: any) {
      showError('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  // Rooms List View
  if (currentView === 'rooms') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">🎨 {t('collaborative.title')}</h2>
          <p className="text-gray-600">{t('collaborative.subtitle')}</p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => setCurrentView('create-room')}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
              {t('collaborative.createRoom')}
            </Button>
          <Button 
            variant="outline" 
            onClick={loadPublicRooms}
            className="flex items-center gap-2"
          >
            <Search size={20} />
            {t('collaborative.refresh')}
          </Button>
        </div>



        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {publicRooms.map((room) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{room.name}</h3>
                  {room.description && (
                    <p className="text-gray-600 text-sm mt-1">{room.description}</p>
                  )}
                </div>
                <Badge variant="secondary">
                  {room.currentUsers}/{room.maxUsers}
                </Badge>
          </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Crown size={14} />
                  {room.ownerName}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  {getTimeAgo(room.lastActivity)}
                </div>
              </div>

              <Button 
                onClick={() => joinRoom(room.id)}
                className="w-full"
                disabled={room.currentUsers >= room.maxUsers}
              >
                {room.currentUsers >= room.maxUsers ? 'Room full' : t('collaborative.join')}
              </Button>
            </motion.div>
          ))}
        </div>

        {publicRooms.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>No rooms available. Create the first room!</p>
        </div>
        )}
      </div>
    );
  }

  // Create Room View
  if (currentView === 'create-room') {
  return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Tạo phòng mới</h2>
          <p className="text-gray-600">Tạo phòng để vẽ cùng bạn bè</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tên phòng *</label>
            <Input
              value={createRoomForm.name}
              onChange={(e) => setCreateRoomForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập tên phòng..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mô tả</label>
            <Input
              value={createRoomForm.description}
              onChange={(e) => setCreateRoomForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả phòng (tùy chọn)..."
            />
            </div>

          <div>
            <label className="block text-sm font-medium mb-2">Số người tối đa</label>
            <select
              value={createRoomForm.maxUsers}
              onChange={(e) => setCreateRoomForm(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded-md"
            >
              <option value={5}>5 người</option>
              <option value={10}>10 người</option>
              <option value={15}>15 người</option>
              <option value={20}>20 người</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={createRoomForm.isPublic}
              onChange={(e) => setCreateRoomForm(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="isPublic" className="text-sm">Phòng công khai</label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={createRoom}
              disabled={loading || !createRoomForm.name.trim()}
              className="flex-1"
            >
              {loading ? 'Đang tạo...' : 'Tạo phòng'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentView('rooms');
                setLoading(false);
                setError('');
              }}
              disabled={loading}
            >
              Hủy
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Canvas View
  if (currentView === 'canvas' && currentRoom) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-xl font-bold">{currentRoom.name}</h2>
                <p className="text-sm text-gray-600">
                  {roomUsers.length} người đang online
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                Lưu tranh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyRoomLink}
                className="flex items-center gap-2"
              >
                <Share2 size={16} />
                Chia sẻ
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {roomUsers.length}/{currentRoom.maxUsers}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={leaveRoom}
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                Rời phòng
              </Button>
                  </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Tools */}
          <div className="w-80 bg-white border-r flex flex-col">
            {/* Color Palette */}
            <div className="p-4 border-b">
              <ColorPalette
                selectedColor={selectedColor}
                onColorSelect={handleColorPick}
              />
            </div>
            
            {/* Tool Panel */}
            <div className="p-4 flex-1">
              <ToolPanel
                selectedTool={selectedTool}
                onToolSelect={handleToolSelect}
                brushSize={brushSize}
                onBrushSizeChange={setBrushSize}
                canvasSize={{ width: 32, height: 32 }}
              />
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4 bg-gray-50 overflow-auto">
              <div className="h-full flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Canvas chung</h3>
                    <p className="text-sm text-gray-600">
                      Vẽ cùng {roomUsers.length - 1} người khác
                    </p>
                  </div>

                              <CollaborativePixelCanvas
              width={32}
              height={32}
              pixelSize={12}
              selectedColor={selectedColor}
              tool={selectedTool}
                    brushSize={brushSize}
                    onStateChange={handleCanvasChange}
                    onColorPick={handleColorPick}
                    onCursorMove={(x, y) => {
                      if (currentRoom && x !== null && y !== null) {
                        CollaborationService.updateCursor(currentRoom.id, { x, y });
                      }
                    }}
                    initialPixels={drawingState?.pixels}
                    otherUsers={roomUsers.filter(user => user.id !== currentUser?.uid)}
                    roomId={currentRoom?.id}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-white border-l flex flex-col">
            {/* Users */}
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users size={18} />
                Thành viên ({roomUsers.length})
              </h3>
            <div className="space-y-2">
                {roomUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <div 
                          className="w-full h-full rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: user.color }}
                        >
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      </Avatar>
                      <div 
                        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                        style={{ backgroundColor: user.isOnline ? '#10B981' : '#6B7280' }}
                      />
                  </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.username}</p>
                      <p className="text-xs text-gray-500">
                        {user.currentTool} • {user.selectedColor}
                      </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
            <div className="flex-1 flex flex-col">
                <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle size={18} />
                  Chat
                </h3>
                </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: roomUsers.find(u => u.id === message.userId)?.color }}>
                        {message.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                        </span>
                      </div>
                    <p className="text-sm text-gray-700">{message.message}</p>
                    </div>
                  ))}
                <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                  <Button onClick={sendMessage} size="sm">
                      <Send size={16} />
                    </Button>
                  </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
  }

  return (
    <>
      {null}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Save Collaboration Modal */}
      <SaveCollaborationModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={saveCollaborationArtwork}
        loading={loading}
      />
    </>
  );
};