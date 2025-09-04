import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Settings, Trophy, Share2, LogOut, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';

interface ProfileMenuProps {
  username: string;
  onLogout: () => void;
  onViewProfile?: () => void;
  onViewAchievements?: () => void;
  onViewSharedArts?: () => void;
  onOpenSettings?: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ username, onLogout, onViewProfile, onViewAchievements, onViewSharedArts, onOpenSettings }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: User, label: 'Hồ sơ cá nhân', action: onViewProfile || (() => console.log('Profile')) },
    { icon: Trophy, label: 'Thành tích', action: onViewAchievements || (() => console.log('Achievements')) },
    { icon: Share2, label: 'Tranh đã chia sẻ', action: onViewSharedArts || (() => console.log('Shared art')) },
    { icon: Settings, label: 'Cài đặt', action: onOpenSettings || (() => console.log('Settings')) },
    { icon: LogOut, label: 'Đăng xuất', action: onLogout }
  ];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Avatar className="w-8 h-8">
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm">
            {username.charAt(0).toUpperCase()}
          </div>
        </Avatar>
        <span className="hidden sm:inline">{username}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border z-50"
          >
            <div className="p-3 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                    {username.charAt(0).toUpperCase()}
                  </div>
                </Avatar>
                <div>
                  <div className="text-sm">{username}</div>
                  <div className="text-xs text-gray-600">Nghệ sĩ pixel</div>
                </div>
              </div>
            </div>

            <div className="p-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};