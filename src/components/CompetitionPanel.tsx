import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Clock, Users, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface Competition {
  id: string;
  title: string;
  theme: string;
  timeLeft: string;
  participants: number;
  prize: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  progress: number;
}

const mockCompetitions: Competition[] = [
  {
    id: '1',
    title: 'Cuộc thi Pixel Art mùa Xuân',
    theme: 'Hoa anh đào và thiên nhiên',
    timeLeft: '3 ngày 14 giờ',
    participants: 1247,
    prize: '1.000.000 VNĐ',
    difficulty: 'Trung bình',
    progress: 65
  },
  {
    id: '2',
    title: 'Character Design Challenge',
    theme: 'Nhân vật game retro',
    timeLeft: '1 ngày 8 giờ',
    participants: 892,
    prize: '500.000 VNĐ',
    difficulty: 'Khó',
    progress: 80
  },
  {
    id: '3',
    title: 'Beginner Pixel Contest',
    theme: 'Động vật dễ thương',
    timeLeft: '5 ngày 2 giờ',
    participants: 2156,
    prize: '200.000 VNĐ',
    difficulty: 'Dễ',
    progress: 45
  }
];

export const CompetitionPanel: React.FC = () => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Dễ': return 'bg-green-100 text-green-800';
      case 'Trung bình': return 'bg-yellow-100 text-yellow-800';
      case 'Khó': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-red-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-yellow-600" size={24} />
        <h3>🏆 Cuộc thi đang diễn ra</h3>
      </div>

      <div className="space-y-4">
        {mockCompetitions.map((competition, index) => (
          <motion.div
            key={competition.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-l-purple-500"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="mb-1">{competition.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{competition.theme}</p>
                <Badge className={getDifficultyColor(competition.difficulty)}>
                  {competition.difficulty}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-lg text-purple-600 mb-1">
                  {competition.prize}
                </div>
                <div className="text-xs text-gray-500">Giải thưởng</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-orange-500" />
                <span>Còn lại: {competition.timeLeft}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                <span>{competition.participants.toLocaleString()} người tham gia</span>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Thời gian còn lại</span>
                <span className="text-xs text-gray-600">{competition.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${competition.progress}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  className={`h-2 rounded-full ${getProgressColor(competition.progress)}`}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                Tham gia ngay
              </Button>
              <Button variant="outline" size="sm">
                Chi tiết
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Star className="text-yellow-600" size={20} />
          <span className="text-sm">Mẹo thành công</span>
        </div>
        <p className="text-xs text-gray-700">
          Tham gia cuộc thi thường xuyên để nâng cao kỹ năng và có cơ hội nhận giải thưởng hấp dẫn!
        </p>
      </div>
    </div>
  );
};