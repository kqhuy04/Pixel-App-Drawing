import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Share2, Copy, Clock, Eye, UserPlus, MessageCircle, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { PixelCanvas } from './PixelCanvas';
import { ColorPalette } from './ColorPalette';
import { ToolPanel } from './ToolPanel';

interface CollaborativeUser {
  id: string;
  username: string;
  color: string;
  cursor: { x: number; y: number } | null;
  lastActive: Date;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
}

interface CollaborativeCanvasProps {
  roomId?: string;
  onCreateRoom?: () => void;
  onJoinRoom?: (roomId: string) => void;
}

const mockUsers: CollaborativeUser[] = [
  {
    id: '1',
    username: 'Artist1',
    color: '#FF6B6B',
    cursor: { x: 120, y: 80 },
    lastActive: new Date()
  },
  {
    id: '2',
    username: 'PixelMaster',
    color: '#4ECDC4',
    cursor: { x: 200, y: 150 },
    lastActive: new Date(Date.now() - 30000)
  },
  {
    id: '3',
    username: 'CreativeUser',
    color: '#45B7D1',
    cursor: null,
    lastActive: new Date(Date.now() - 120000)
  }
];

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    username: 'Artist1',
    message: 'Chào mọi người! Cùng vẽ một cái gì đó thú vị nào!',
    timestamp: new Date(Date.now() - 300000)
  },
  {
    id: '2',
    username: 'PixelMaster',
    message: 'Ý kiến hay đấy! Mình sẽ vẽ phần background nhé',
    timestamp: new Date(Date.now() - 240000)
  },
  {
    id: '3',
    username: 'CreativeUser',
    message: 'Tuyệt! Mình sẽ thêm một số chi tiết',
    timestamp: new Date(Date.now() - 180000)
  }
];

export const CollaborativeCanvas: React.FC<CollaborativeCanvasProps> = ({
  roomId,
  onCreateRoom,
  onJoinRoom
}) => {
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedTool, setSelectedTool] = useState<'pen' | 'eraser' | 'fill'>('pen');
  const [users, setUsers] = useState(mockUsers);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isInRoom, setIsInRoom] = useState(!!roomId);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        username: 'You',
        message: newMessage.trim(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setIsInRoom(true);
    onCreateRoom?.();
    alert(`Phòng mới đã được tạo: ${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (joinRoomId.trim()) {
      setIsInRoom(true);
      onJoinRoom?.(joinRoomId);
      setJoinRoomId('');
    }
  };

  const handleShareRoom = () => {
    const roomUrl = `${window.location.origin}/room/${roomId || 'ABC123'}`;
    navigator.clipboard.writeText(roomUrl);
    alert('Link phòng đã được sao chép!');
  };

  const getTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  if (!isInRoom) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-white" size={32} />
          </div>
          <h2 className="mb-4">🎨 Vẽ chung cùng bạn bè</h2>
          <p className="text-gray-600 mb-8">
            Tạo phòng vẽ mới hoặc tham gia phòng có sẵn để cùng tạo tác phẩm với nhiều người
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="mb-4">Tạo phòng mới</h3>
            <p className="text-gray-600 mb-4">Tạo một phòng vẽ mới và mời bạn bè tham gia</p>
            <Button onClick={handleCreateRoom} className="w-full">
              <UserPlus size={18} className="mr-2" />
              Tạo phòng mới
            </Button>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="mb-4">Tham gia phòng</h3>
            <p className="text-gray-600 mb-4">Nhập mã phòng để tham gia vẽ cùng người khác</p>
            <div className="flex gap-2">
              <Input
                placeholder="Nhập mã phòng (ví dụ: ABC123)"
                value={joinRoomId}
                onChange={e => setJoinRoomId(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button onClick={handleJoinRoom} disabled={!joinRoomId.trim()}>
                Tham gia
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h4 className="mb-2">💡 Mẹo sử dụng</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Tối đa 10 người có thể vẽ cùng lúc trong một phòng</li>
            <li>• Mỗi người sẽ có màu cursor riêng để dễ phân biệt</li>
            <li>• Sử dụng chat để trao đổi ý tưởng với nhau</li>
            <li>• Tác phẩm sẽ được lưu tự động</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Room Header */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="text-purple-600" size={20} />
              <h3>Phòng vẽ: {roomId || 'ABC123'}</h3>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Eye size={14} />
              {users.length} người
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShareRoom}>
              <Share2 size={16} className="mr-1" />
              Chia sẻ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="lg:hidden"
            >
              <MessageCircle size={16} />
            </Button>
          </div>
        </div>

        {/* Active Users */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-gray-600">Đang hoạt động:</span>
          <div className="flex -space-x-2">
            {users.map(user => (
              <motion.div
                key={user.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                <Avatar className="w-8 h-8 border-2 border-white">
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.username.charAt(0)}
                  </div>
                </Avatar>
                {user.cursor && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative">
            <PixelCanvas
              width={32}
              height={32}
              pixelSize={12}
              selectedColor={selectedColor}
              tool={selectedTool}
            />
            
            {/* User Cursors */}
            {users.map(user => user.cursor && (
              <motion.div
                key={user.id}
                className="absolute pointer-events-none z-10"
                style={{
                  left: user.cursor.x,
                  top: user.cursor.y,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: user.color }}
                  />
                  <div className="bg-black text-white text-xs px-2 py-1 rounded shadow-md">
                    {user.username}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <ColorPalette
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
          />
          
          <ToolPanel
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
            onSave={() => alert('Tác phẩm đã được lưu!')}
            onShare={() => alert('Tác phẩm đã được chia sẻ!')}
          />

          {/* Users List */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="mb-3">👥 Thành viên ({users.length}/10)</h4>
            <div className="space-y-2">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: user.color }}
                    />
                    <span className="text-sm">{user.username}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} />
                    {getTimeAgo(user.lastActive)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <AnimatePresence>
            {(showChat || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg border"
              >
                <div className="p-4 border-b">
                  <h4>💬 Chat</h4>
                </div>
                <div
                  ref={chatRef}
                  className="h-48 overflow-y-auto p-4 space-y-2"
                >
                  {messages.map(message => (
                    <div key={message.id} className="text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-purple-600 text-xs min-w-fit">
                          {message.username}:
                        </span>
                        <span>{message.message}</span>
                      </div>
                      <div className="text-xs text-gray-500 ml-2">
                        {message.timestamp.toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập tin nhắn..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleSendMessage}>
                      <Send size={16} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};