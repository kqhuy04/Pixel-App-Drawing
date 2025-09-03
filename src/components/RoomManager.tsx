import React, { useEffect, useState } from 'react';

interface RoomManagerProps {
  onRoomJoin?: (roomId: string) => void;
  onRoomLeave?: () => void;
}

export const useRoomManager = () => {
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  useEffect(() => {
    // Check URL parameters on mount
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    if (roomId) {
      setCurrentRoomId(roomId);
    }
  }, []);

  const joinRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    window.history.pushState({}, '', url.toString());
  };

  const leaveRoom = () => {
    setCurrentRoomId(null);
    // Remove room parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.pushState({}, '', url.toString());
  };

  return {
    currentRoomId,
    joinRoom,
    leaveRoom
  };
};
