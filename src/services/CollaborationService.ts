import { 
  ref, 
  set, 
  get, 
  push, 
  remove, 
  onValue, 
  off, 
  update,
  serverTimestamp,
  child,
  onDisconnect
} from 'firebase/database';
import { realtimeDb } from '../firebase/config';
import { auth } from '../firebase/config';

export interface CollaborationRoom {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  maxUsers: number;
  currentUsers: number;
  isPublic: boolean;
  createdAt: number;
  lastActivity: number;
  canvasData?: {
    pixels: string[][];
    width: number;
    height: number;
    pixelSize: number;
  };
}

export interface CollaborationUser {
  id: string;
  username: string;
  email: string;
  color: string;
  cursor: { x: number; y: number } | null;
  lastActive: number;
  isOnline: boolean;
  currentTool: string;
  selectedColor: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  type: 'message' | 'system' | 'action';
}

export interface CanvasAction {
  id: string;
  userId: string;
  username: string;
  action: 'draw' | 'erase' | 'fill' | 'clear' | 'undo' | 'redo';
  x?: number;
  y?: number;
  color?: string;
  pixels?: string[][];
  timestamp: number;
}

export class CollaborationService {
  private static readonly ROOMS_PATH = 'collaboration_rooms';
  private static readonly USERS_PATH = 'collaboration_users';
  private static readonly CHAT_PATH = 'collaboration_chat';
  private static readonly CANVAS_PATH = 'collaboration_canvas';
  private static readonly ACTIONS_PATH = 'collaboration_actions';

  /**
   * Tạo room mới
   */
  static async createRoom(roomData: {
    name: string;
    description?: string;
    maxUsers?: number;
    isPublic?: boolean;
  }): Promise<string> {
    try {
      console.log('🔍 Starting room creation...');
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('❌ No current user');
        throw new Error('Người dùng chưa đăng nhập');
      }

      console.log('👤 Current user:', currentUser.uid);
      console.log('📊 Room data:', roomData);

      const roomRef = push(ref(realtimeDb, this.ROOMS_PATH));
      const roomId = roomRef.key!;
      console.log('🆔 Generated room ID:', roomId);

      const newRoom: CollaborationRoom = {
        id: roomId,
        name: roomData.name,
        description: roomData.description || '',
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName || currentUser.email || 'Anonymous',
        maxUsers: roomData.maxUsers || 10,
        currentUsers: 0,
        isPublic: roomData.isPublic !== false,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        canvasData: {
          pixels: Array(32).fill(null).map(() => Array(32).fill('#ffffff')),
          width: 32,
          height: 32,
          pixelSize: 12
        }
      };

      console.log('📝 Room object to save:', newRoom);
      console.log('🔥 Attempting to save to Realtime Database...');

      await set(roomRef, newRoom);
      console.log('✅ Room created successfully!');
      return roomId;
    } catch (error: any) {
      console.error('❌ Error creating room:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      // Provide more specific error messages
      if (error.code === 'PERMISSION_DENIED') {
        throw new Error('Không có quyền tạo phòng. Vui lòng kiểm tra Firebase Realtime Database rules.');
      } else if (error.code === 'UNAVAILABLE') {
        throw new Error('Firebase Realtime Database không khả dụng. Vui lòng kiểm tra kết nối.');
      } else if (error.message.includes('database')) {
        throw new Error('Lỗi kết nối database. Vui lòng kiểm tra cấu hình Firebase.');
      }
      
      throw new Error(`Không thể tạo phòng vẽ chung: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách rooms public
   */
  static async getPublicRooms(): Promise<CollaborationRoom[]> {
    try {
      const roomsRef = ref(realtimeDb, this.ROOMS_PATH);
      const snapshot = await get(roomsRef);
      
      if (snapshot.exists()) {
        const rooms: CollaborationRoom[] = [];
        snapshot.forEach((childSnapshot) => {
          const room = childSnapshot.val() as CollaborationRoom;
          if (room.isPublic && room.currentUsers < room.maxUsers) {
            rooms.push(room);
          }
        });
        
        // Sắp xếp theo lastActivity giảm dần
        return rooms.sort((a, b) => b.lastActivity - a.lastActivity);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting public rooms:', error);
      throw new Error('Không thể lấy danh sách phòng');
    }
  }

  /**
   * Tham gia room
   */
  static async joinRoom(roomId: string): Promise<CollaborationRoom | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      const roomRef = ref(realtimeDb, `${this.ROOMS_PATH}/${roomId}`);
      const roomSnapshot = await get(roomRef);
      
      if (!roomSnapshot.exists()) {
        throw new Error('Phòng không tồn tại');
      }

      const room = roomSnapshot.val() as CollaborationRoom;
      
      if (room.currentUsers >= room.maxUsers) {
        throw new Error('Phòng đã đầy');
      }

      // Tăng số lượng user hiện tại
      await update(roomRef, {
        currentUsers: room.currentUsers + 1,
        lastActivity: Date.now()
      });

      // Thêm user vào room
      const userRef = ref(realtimeDb, `${this.USERS_PATH}/${roomId}/${currentUser.uid}`);
      const userData: CollaborationUser = {
        id: currentUser.uid,
        username: currentUser.displayName || currentUser.email || 'Anonymous',
        email: currentUser.email || '',
        color: this.generateUserColor(),
        cursor: null,
        lastActive: Date.now(),
        isOnline: true,
        currentTool: 'pen',
        selectedColor: '#000000'
      };

      await set(userRef, userData);

      // Setup disconnect handler
      const userOnlineRef = ref(realtimeDb, `${this.USERS_PATH}/${roomId}/${currentUser.uid}/isOnline`);
      onDisconnect(userOnlineRef).set(false);

      return room;
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }

  /**
   * Rời khỏi room
   */
  static async leaveRoom(roomId: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return;
      }

      const userRef = ref(realtimeDb, `${this.USERS_PATH}/${roomId}/${currentUser.uid}`);
      await remove(userRef);

      // Giảm số lượng user hiện tại
      const roomRef = ref(realtimeDb, `${this.ROOMS_PATH}/${roomId}`);
      const roomSnapshot = await get(roomRef);
      
      if (roomSnapshot.exists()) {
        const room = roomSnapshot.val() as CollaborationRoom;
        const newUserCount = Math.max(0, room.currentUsers - 1);
        
        await update(roomRef, {
          currentUsers: newUserCount,
          lastActivity: Date.now()
        });

        // Nếu không còn user nào, xóa room
        if (newUserCount === 0) {
          await remove(roomRef);
          await remove(ref(realtimeDb, `${this.CHAT_PATH}/${roomId}`));
          await remove(ref(realtimeDb, `${this.CANVAS_PATH}/${roomId}`));
          await remove(ref(realtimeDb, `${this.ACTIONS_PATH}/${roomId}`));
        }
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }

  /**
   * Lắng nghe thay đổi users trong room
   */
  static onUsersChange(roomId: string, callback: (users: CollaborationUser[]) => void): () => void {
    const usersRef = ref(realtimeDb, `${this.USERS_PATH}/${roomId}`);
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const users: CollaborationUser[] = [];
        snapshot.forEach((childSnapshot) => {
          const user = childSnapshot.val() as CollaborationUser;
          if (user.isOnline) {
            users.push(user);
          }
        });
        callback(users);
      } else {
        callback([]);
      }
    });

    return () => off(usersRef, 'value', unsubscribe);
  }

  /**
   * Lắng nghe thay đổi canvas
   */
  static onCanvasChange(roomId: string, callback: (canvasData: any) => void): () => void {
    const canvasRef = ref(realtimeDb, `${this.CANVAS_PATH}/${roomId}`);
    
    const unsubscribe = onValue(canvasRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });

    return () => off(canvasRef, 'value', unsubscribe);
  }

  /**
   * Lắng nghe chat messages
   */
  static onChatMessages(roomId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const chatRef = ref(realtimeDb, `${this.CHAT_PATH}/${roomId}`);
    
    const unsubscribe = onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const messages: ChatMessage[] = [];
        snapshot.forEach((childSnapshot) => {
          messages.push(childSnapshot.val() as ChatMessage);
        });
        // Sắp xếp theo timestamp
        messages.sort((a, b) => a.timestamp - b.timestamp);
        callback(messages);
      } else {
        callback([]);
      }
    });

    return () => off(chatRef, 'value', unsubscribe);
  }

  /**
   * Gửi chat message
   */
  static async sendMessage(roomId: string, message: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      const messageRef = push(ref(realtimeDb, `${this.CHAT_PATH}/${roomId}`));
      const messageData: ChatMessage = {
        id: messageRef.key!,
        userId: currentUser.uid,
        username: currentUser.displayName || currentUser.email || 'Anonymous',
        message: message.trim(),
        timestamp: Date.now(),
        type: 'message'
      };

      await set(messageRef, messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Không thể gửi tin nhắn');
    }
  }

  /**
   * Cập nhật canvas
   */
  static async updateCanvas(roomId: string, canvasData: {
    pixels: string[][];
    width: number;
    height: number;
    pixelSize: number;
  }): Promise<void> {
    try {
      const canvasRef = ref(realtimeDb, `${this.CANVAS_PATH}/${roomId}`);
      await set(canvasRef, {
        ...canvasData,
        lastUpdated: Date.now()
      });

      // Cập nhật lastActivity của room
      const roomRef = ref(realtimeDb, `${this.ROOMS_PATH}/${roomId}`);
      await update(roomRef, {
        lastActivity: Date.now()
      });
    } catch (error) {
      console.error('Error updating canvas:', error);
      throw new Error('Không thể cập nhật canvas');
    }
  }

  /**
   * Cập nhật cursor position
   */
  static async updateCursor(roomId: string, cursor: { x: number; y: number } | null): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return;
      }

      const userRef = ref(realtimeDb, `${this.USERS_PATH}/${roomId}/${currentUser.uid}/cursor`);
      await set(userRef, cursor);
    } catch (error) {
      console.error('Error updating cursor:', error);
    }
  }

  /**
   * Cập nhật user tool và color
   */
  static async updateUserTool(roomId: string, tool: string, color: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return;
      }

      const userRef = ref(realtimeDb, `${this.USERS_PATH}/${roomId}/${currentUser.uid}`);
      await update(userRef, {
        currentTool: tool,
        selectedColor: color,
        lastActive: Date.now()
      });
    } catch (error) {
      console.error('Error updating user tool:', error);
    }
  }

  /**
   * Ghi lại canvas action
   */
  static async recordAction(roomId: string, action: Omit<CanvasAction, 'id' | 'timestamp'>): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return;
      }

      const actionRef = push(ref(realtimeDb, `${this.ACTIONS_PATH}/${roomId}`));
      const actionData: CanvasAction = {
        ...action,
        id: actionRef.key!,
        timestamp: Date.now()
      };

      await set(actionRef, actionData);
    } catch (error) {
      console.error('Error recording action:', error);
    }
  }

  /**
   * Tạo màu ngẫu nhiên cho user
   */
  private static generateUserColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#10AC84', '#EE5A24', '#0984E3', '#A29BFE', '#FD79A8'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Lấy room theo ID
   */
  static async getRoom(roomId: string): Promise<CollaborationRoom | null> {
    try {
      const roomRef = ref(realtimeDb, `${this.ROOMS_PATH}/${roomId}`);
      const snapshot = await get(roomRef);
      
      if (snapshot.exists()) {
        return snapshot.val() as CollaborationRoom;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting room:', error);
      return null;
    }
  }

  /**
   * Lưu tranh collaboration vào Firestore
   */
  static async saveCollaborationArtwork(roomId: string, artworkData: {
    title: string;
    description?: string;
    tags: string[];
    isPublic: boolean;
  }): Promise<string> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      // Lấy canvas data từ Realtime Database
      const canvasRef = ref(realtimeDb, `${this.CANVAS_PATH}/${roomId}`);
      const canvasSnapshot = await get(canvasRef);
      
      if (!canvasSnapshot.exists()) {
        throw new Error('Không tìm thấy canvas data');
      }

      const canvasData = canvasSnapshot.val();
      
      // Import ArtworkService để lưu vào Firestore
      const { ArtworkService } = await import('./ArtworkService');
      
      const artworkId = await ArtworkService.createArtwork(
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Anonymous',
        {
          title: artworkData.title,
          description: artworkData.description || '',
          pixels: canvasData.pixels,
          width: canvasData.width,
          height: canvasData.height,
          pixelSize: canvasData.pixelSize,
          tags: artworkData.tags,
          isPublic: artworkData.isPublic
        }
      );

      return artworkId;
    } catch (error) {
      console.error('Error saving collaboration artwork:', error);
      throw new Error('Không thể lưu tác phẩm collaboration');
    }
  }

  /**
   * Lấy danh sách tranh collaboration đã lưu
   */
  static async getCollaborationArtworks(): Promise<any[]> {
    try {
      const { ArtworkService } = await import('./ArtworkService');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      // Lấy tất cả artworks của user
      const artworks = await ArtworkService.getUserArtworks(currentUser.uid);
      
      // Filter chỉ những tranh từ collaboration (có thể thêm field để đánh dấu)
      return artworks.filter(artwork => 
        artwork.tags.includes('collaboration') || 
        artwork.description?.includes('collaboration')
      );
    } catch (error) {
      console.error('Error getting collaboration artworks:', error);
      throw new Error('Không thể lấy danh sách tranh collaboration');
    }
  }

  /**
   * Load tranh từ Firestore vào collaboration room
   */
  static async loadArtworkToRoom(roomId: string, artworkId: string): Promise<void> {
    try {
      const { ArtworkService } = await import('./ArtworkService');
      
      // Lấy artwork từ Firestore
      const artwork = await ArtworkService.getArtwork(artworkId);
      
      if (!artwork) {
        throw new Error('Không tìm thấy tác phẩm');
      }

      // Cập nhật canvas trong Realtime Database
      await this.updateCanvas(roomId, {
        pixels: artwork.pixels,
        width: artwork.width,
        height: artwork.height,
        pixelSize: artwork.pixelSize
      });

      // Gửi thông báo system message
      await this.sendSystemMessage(roomId, `Đã load tác phẩm: ${artwork.title}`);
    } catch (error) {
      console.error('Error loading artwork to room:', error);
      throw new Error('Không thể load tác phẩm vào phòng');
    }
  }

  /**
   * Gửi system message
   */
  private static async sendSystemMessage(roomId: string, message: string): Promise<void> {
    try {
      const messageRef = push(ref(realtimeDb, `${this.CHAT_PATH}/${roomId}`));
      const messageData: ChatMessage = {
        id: messageRef.key!,
        userId: 'system',
        username: 'System',
        message: message,
        timestamp: Date.now(),
        type: 'system'
      };

      await set(messageRef, messageData);
    } catch (error) {
      console.error('Error sending system message:', error);
    }
  }
}
