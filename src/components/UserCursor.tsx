import React from 'react';
import { motion } from 'motion/react';
import { CollaborationUser } from '../services/CollaborationService';

interface UserCursorProps {
  user: CollaborationUser;
  pixelSize: number;
}

export const UserCursor: React.FC<UserCursorProps> = ({ user, pixelSize }) => {
  if (!user.cursor) return null;

  const { x, y } = user.cursor;
  const canvasX = x * pixelSize;
  const canvasY = y * pixelSize;

  return (
    <motion.div
      className="absolute pointer-events-none z-10"
      style={{
        left: canvasX,
        top: canvasY,
        transform: 'translate(-2px, -2px)'
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      {/* Cursor */}
      <div
        className="w-4 h-4 border-2 border-white shadow-lg"
        style={{
          backgroundColor: user.color,
          clipPath: 'polygon(0 0, 0 100%, 100% 0)'
        }}
      />
      
      {/* Username label */}
      <div
        className="absolute top-6 left-0 px-2 py-1 rounded text-xs font-medium text-white shadow-lg whitespace-nowrap"
        style={{ backgroundColor: user.color }}
      >
        {user.username}
      </div>
    </motion.div>
  );
};
