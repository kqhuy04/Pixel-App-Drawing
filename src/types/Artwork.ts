export interface ArtworkData {
  id: string;
  title: string;
  description?: string;
  pixels: string[][]; // 2D array of color strings
  width: number;
  height: number;
  pixelSize: number;
  authorId: string;
  authorName: string;
  tags: string[];
  isPublic: boolean;
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string; // Base64 thumbnail for quick preview
}

export interface CreateArtworkData {
  title: string;
  description?: string;
  pixels: string[][];
  width: number;
  height: number;
  pixelSize: number;
  tags: string[];
  isPublic: boolean;
}

export interface CanvasHistory {
  pixels: string[][];
  timestamp: number;
}

export interface DrawingState {
  pixels: string[][];
  history: CanvasHistory[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
}

