import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Edit3, Trophy, Heart, MessageCircle, Share2, Calendar, Star, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { UserService } from '../services/UserService';
import { ArtworkService } from '../services/ArtworkService';

interface UserProfileProps {
  onUpdateProfile?: (data: any) => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  date?: string;
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Nghệ sĩ mới',
    description: 'Tạo tác phẩm đầu tiên',
    icon: <Star className="text-yellow-500" size={20} />,
    earned: true,
    date: '2024-01-15'
  },
  {
    id: '2',
    title: 'Người chia sẻ',
    description: 'Chia sẻ 5 tác phẩm',
    icon: <Share2 className="text-blue-500" size={20} />,
    earned: true,
    date: '2024-02-01'
  },
  {
    id: '3',
    title: 'Tay đua cuộc thi',
    description: 'Tham gia 3 cuộc thi',
    icon: <Trophy className="text-gold-500" size={20} />,
    earned: false
  },
  {
    id: '4',
    title: 'Nghệ sĩ được yêu thích',
    description: 'Nhận 100 like',
    icon: <Heart className="text-red-500" size={20} />,
    earned: true,
    date: '2024-02-10'
  }
];

export const UserProfile: React.FC<UserProfileProps> = ({ onUpdateProfile }) => {
  const { currentUser, userData, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
    joinDate: '',
    location: ''
  });

  const [stats, setStats] = useState({
    totalArtworks: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    totalCompetitions: 0,
    rank: 0
  });

  const [userArtworks, setUserArtworks] = useState<any[]>([]);

  // Load user data and statistics
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        
        // Load user profile data
        if (userData) {
          setProfileData({
            username: userData.displayName || currentUser.displayName || currentUser.email || 'User',
            email: userData.email || currentUser.email || '',
            bio: userData.bio || '',
            joinDate: userData.createdAt ? userData.createdAt.toISOString().split('T')[0] : '',
            location: userData.location || ''
          });
        }

        // Load user artworks to calculate statistics
        const artworks = await ArtworkService.getUserArtworks(currentUser.uid);
        setUserArtworks(artworks);

        // Calculate statistics from real data
        const totalLikes = artworks.reduce((sum, artwork) => sum + (artwork.likes || 0), 0);
        const totalViews = artworks.reduce((sum, artwork) => sum + (artwork.views || 0), 0);
        
        setStats({
          totalArtworks: artworks.length,
          totalLikes: totalLikes,
          totalComments: 0, // TODO: Implement comments system
          totalShares: 0, // TODO: Implement shares tracking
          totalCompetitions: 0, // TODO: Implement competitions system
          rank: Math.max(1, Math.floor(Math.random() * 100)) // TODO: Calculate real rank
        });

      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser, userData]);

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      // Update user data in Firestore
      await updateUserData({
        displayName: profileData.username,
        bio: profileData.bio,
        location: profileData.location
      });

      setIsEditing(false);
      onUpdateProfile?.(profileData);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin cá nhân...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center md:items-start">
            <Avatar className="w-24 h-24 mb-4">
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl">
                {profileData.username.charAt(0).toUpperCase()}
              </div>
            </Avatar>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              <Edit3 size={16} />
              {isEditing ? 'Hủy' : 'Chỉnh sửa'}
            </Button>
          </div>

          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Tên người dùng</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={e => handleInputChange('username', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Vị trí</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={e => handleInputChange('location', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Giới thiệu</Label>
                  <Input
                    id="bio"
                    value={profileData.bio}
                    onChange={e => handleInputChange('bio', e.target.value)}
                    placeholder="Viết một chút về bản thân..."
                  />
                </div>
                <Button onClick={handleSave}>Lưu thay đổi</Button>
              </div>
            ) : (
              <div>
                <h2 className="mb-2">{profileData.username}</h2>
                <p className="text-gray-600 mb-4">{profileData.bio}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    Tham gia: {new Date(profileData.joinDate).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={16} />
                    {profileData.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy size={16} />
                    Hạng #{stats.rank}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats">Thống kê</TabsTrigger>
          <TabsTrigger value="achievements">Thành tích</TabsTrigger>
          <TabsTrigger value="activity">Hoạt động</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { label: 'Tác phẩm', value: stats.totalArtworks, icon: <User className="text-blue-500" size={20} /> },
              { label: 'Lượt thích', value: stats.totalLikes, icon: <Heart className="text-red-500" size={20} /> },
              { label: 'Bình luận', value: stats.totalComments, icon: <MessageCircle className="text-green-500" size={20} /> },
              { label: 'Chia sẻ', value: stats.totalShares, icon: <Share2 className="text-purple-500" size={20} /> },
              { label: 'Cuộc thi', value: stats.totalCompetitions, icon: <Trophy className="text-yellow-500" size={20} /> },
              { label: 'Xếp hạng', value: `#${stats.rank}`, icon: <Award className="text-orange-500" size={20} /> }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-4 rounded-lg border text-center"
              >
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="text-2xl mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {mockAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  achievement.earned 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    achievement.earned ? 'bg-white' : 'bg-gray-200'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={achievement.earned ? 'text-yellow-800' : 'text-gray-500'}>
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    {achievement.earned ? (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Đã đạt được {achievement.date && `• ${new Date(achievement.date).toLocaleDateString('vi-VN')}`}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Chưa đạt được
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="space-y-3">
            {userArtworks.length > 0 ? (
              userArtworks.slice(0, 10).map((artwork, index) => {
                const timeAgo = getTimeAgo(artwork.createdAt);
                return (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <User className="text-white" size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">Đã tạo tác phẩm "{artwork.title}"</p>
                      <p className="text-xs text-gray-500">{timeAgo}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {artwork.likes || 0} ❤️
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <User className="mx-auto mb-2" size={32} />
                <p>Chưa có hoạt động nào</p>
                <p className="text-sm">Hãy tạo tác phẩm đầu tiên của bạn!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};