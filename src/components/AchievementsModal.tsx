import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Trophy, X } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockAchievements = [
  { id: 1, title: 'Bức tranh đầu tiên', desc: 'Lưu một tác phẩm đầu tiên', points: 10 },
  { id: 2, title: 'Họa sĩ chăm chỉ', desc: 'Tạo 10 tác phẩm', points: 50 },
  { id: 3, title: 'Họa sĩ cộng đồng', desc: 'Chia sẻ 1 tác phẩm công khai', points: 20 }
];

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-white rounded-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Trophy size={18} /> Thành tích</h3>
              <Button variant="ghost" size="sm" onClick={onClose}><X size={18} /></Button>
            </div>

            <div className="space-y-3">
              {mockAchievements.map(a => (
                <div key={a.id} className="p-3 border rounded-lg flex items-start justify-between">
                  <div>
                    <div className="font-medium">{a.title}</div>
                    <div className="text-sm text-gray-600">{a.desc}</div>
                  </div>
                  <div className="text-sm text-purple-600">+{a.points} điểm</div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};



