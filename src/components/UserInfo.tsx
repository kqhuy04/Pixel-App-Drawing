import React from 'react';
import { motion } from 'motion/react';
import { User, Mail, Calendar, Palette, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const UserInfo: React.FC = () => {
  const { userData, currentUser } = useAuth();

  if (!userData || !currentUser) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-lg shadow-sm"
    >
      <h3 className="mb-3 text-center">Thông tin cá nhân</h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <User className="text-gray-500" size={18} />
          <div>
            <div className="text-sm text-gray-600">Tên hiển thị</div>
            <div className="font-medium">{userData.displayName}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="text-gray-500" size={18} />
          <div>
            <div className="text-sm text-gray-600">Email</div>
            <div className="font-medium">{userData.email}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="text-gray-500" size={18} />
          <div>
            <div className="text-sm text-gray-600">Tham gia từ</div>
            <div className="font-medium">
              {userData.createdAt.toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Palette className="text-blue-500" size={16} />
              <span className="text-sm text-gray-600">Tác phẩm</span>
            </div>
            <div className="text-xl font-bold text-blue-600">
              {userData.totalArtworks || 0}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart className="text-red-500" size={16} />
              <span className="text-sm text-gray-600">Lượt thích</span>
            </div>
            <div className="text-xl font-bold text-red-600">
              {userData.totalLikes || 0}
            </div>
          </div>
        </div>

        {userData.bio && (
          <div className="pt-3 border-t">
            <div className="text-sm text-gray-600 mb-1">Giới thiệu</div>
            <div className="text-sm">{userData.bio}</div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
