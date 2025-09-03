import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { flattenPixels, unflattenPixels } from '../utils/pixelConversion';

export interface ArtworkData {
  id: string;
  title: string;
  description?: string;
  pixels: string[][]; // 2D array of color strings (converted from 1D when loaded from Firestore)
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

// Interface for Firestore document (with 1D pixels array)
export interface FirestoreArtworkData {
  id: string;
  title: string;
  description?: string;
  pixels: string[]; // 1D array for Firestore storage
  width: number;
  height: number;
  pixelSize: number;
  authorId: string;
  authorName: string;
  tags: string[];
  isPublic: boolean;
  likes: number;
  views: number;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  thumbnail?: string;
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

export class ArtworkService {
  private static readonly COLLECTION_NAME = 'pictures';

  /**
   * Tạo artwork mới trong Firestore
   */
  static async createArtwork(authorId: string, authorName: string, artworkData: CreateArtworkData): Promise<string> {
    try {
      console.log('ArtworkService: Starting to create artwork...');
      
      // Generate unique ID
      const artworkId = `${authorId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      // Create thumbnail from pixels
      const thumbnail = this.createThumbnail(artworkData.pixels, artworkData.width, artworkData.height);
      
      // Convert 2D pixels array to 1D array for Firestore compatibility
      const pixelsFlat = flattenPixels(artworkData.pixels);
      
      const newArtwork = {
        id: artworkId,
        title: artworkData.title,
        description: artworkData.description || '',
        pixels: pixelsFlat, // Store as 1D array
        width: artworkData.width,
        height: artworkData.height,
        pixelSize: artworkData.pixelSize,
        authorId,
        authorName,
        tags: artworkData.tags,
        isPublic: artworkData.isPublic,
        likes: 0,
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        thumbnail
      };

      const artworkRef = doc(db, this.COLLECTION_NAME, artworkId);
      await setDoc(artworkRef, newArtwork);

      console.log('Artwork created successfully:', artworkId);
      return artworkId;
    } catch (error) {
      console.error('ArtworkService: Error creating artwork:', error);
      throw new Error('Không thể lưu tác phẩm. Vui lòng thử lại.');
    }
  }

  /**
   * Lấy artwork theo ID
   */
  static async getArtwork(artworkId: string): Promise<ArtworkData | null> {
    try {
      const artworkRef = doc(db, this.COLLECTION_NAME, artworkId);
      const artworkSnap = await getDoc(artworkRef);

      if (artworkSnap.exists()) {
        const data = artworkSnap.data();
        
        // Convert 1D pixels array back to 2D array
        const pixels2D = unflattenPixels(data.pixels, data.width, data.height);
        
        return {
          ...data,
          pixels: pixels2D,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ArtworkData;
      } else {
        console.log('No artwork found with ID:', artworkId);
        return null;
      }
    } catch (error) {
      console.error('Error getting artwork:', error);
      throw new Error('Không thể lấy tác phẩm.');
    }
  }

  /**
   * Lấy danh sách artwork của user
   */
  static async getUserArtworks(authorId: string): Promise<ArtworkData[]> {
    try {
      const artworksRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        artworksRef, 
        where('authorId', '==', authorId),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const artworks: ArtworkData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Convert 1D pixels array back to 2D array
        const pixels2D = unflattenPixels(data.pixels, data.width, data.height);
        
        artworks.push({
          ...data,
          pixels: pixels2D,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ArtworkData);
      });

      return artworks;
    } catch (error) {
      console.error('Error getting user artworks:', error);
      throw new Error('Không thể lấy danh sách tác phẩm.');
    }
  }

  /**
   * Lấy danh sách artwork public
   */
  static async getPublicArtworks(limitCount: number = 20): Promise<ArtworkData[]> {
    try {
      const artworksRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        artworksRef, 
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);

      const artworks: ArtworkData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Convert 1D pixels array back to 2D array
        const pixels2D = unflattenPixels(data.pixels, data.width, data.height);
        
        artworks.push({
          ...data,
          pixels: pixels2D,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ArtworkData);
      });

      return artworks;
    } catch (error) {
      console.error('Error getting public artworks:', error);
      throw new Error('Không thể lấy danh sách tác phẩm công khai.');
    }
  }

  /**
   * Cập nhật artwork
   */
  static async updateArtwork(artworkId: string, updateData: Partial<ArtworkData>): Promise<void> {
    try {
      const artworkRef = doc(db, this.COLLECTION_NAME, artworkId);
      
      // Prepare update data
      const updatePayload: any = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      // Create new thumbnail if pixels are updated
      if (updateData.pixels) {
        updatePayload.thumbnail = this.createThumbnail(
          updateData.pixels, 
          updateData.width || 32, 
          updateData.height || 32
        );
        // Convert 2D pixels array to 1D array for Firestore
        updatePayload.pixels = flattenPixels(updateData.pixels);
      }
      
      await updateDoc(artworkRef, updatePayload);

      console.log('Artwork updated successfully:', artworkId);
    } catch (error) {
      console.error('Error updating artwork:', error);
      throw new Error('Không thể cập nhật tác phẩm.');
    }
  }

  /**
   * Xóa artwork
   */
  static async deleteArtwork(artworkId: string): Promise<void> {
    try {
      const artworkRef = doc(db, this.COLLECTION_NAME, artworkId);
      await deleteDoc(artworkRef);
      console.log('Artwork deleted successfully:', artworkId);
    } catch (error) {
      console.error('Error deleting artwork:', error);
      throw new Error('Không thể xóa tác phẩm.');
    }
  }

  /**
   * Tăng số lượt xem
   */
  static async incrementViews(artworkId: string): Promise<void> {
    try {
      const artworkRef = doc(db, this.COLLECTION_NAME, artworkId);
      const artworkSnap = await getDoc(artworkRef);
      
      if (artworkSnap.exists()) {
        const currentViews = artworkSnap.data().views || 0;
        await updateDoc(artworkRef, {
          views: currentViews + 1,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  /**
   * Tăng số lượt thích
   */
  static async incrementLikes(artworkId: string): Promise<void> {
    try {
      const artworkRef = doc(db, this.COLLECTION_NAME, artworkId);
      const artworkSnap = await getDoc(artworkRef);
      
      if (artworkSnap.exists()) {
        const currentLikes = artworkSnap.data().likes || 0;
        await updateDoc(artworkRef, {
          likes: currentLikes + 1,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error incrementing likes:', error);
    }
  }



  /**
   * Tạo thumbnail từ pixels array
   */
  private static createThumbnail(pixels: string[][], width: number, height: number): string {
    try {
      // Create a small canvas for thumbnail
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      // Set thumbnail size (64x64 max)
      const thumbnailSize = 64;
      const scale = Math.min(thumbnailSize / width, thumbnailSize / height);
      const thumbWidth = Math.floor(width * scale);
      const thumbHeight = Math.floor(height * scale);

      canvas.width = thumbWidth;
      canvas.height = thumbHeight;

      // Draw pixels
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          ctx.fillStyle = pixels[y][x];
          ctx.fillRect(
            Math.floor(x * scale), 
            Math.floor(y * scale), 
            Math.ceil(scale), 
            Math.ceil(scale)
          );
        }
      }

      return canvas.toDataURL('image/png', 0.8);
    } catch (error) {
      console.error('Error creating thumbnail:', error);
      return '';
    }
  }

  /**
   * Export artwork as PNG
   */
  static exportAsPNG(pixels: string[][], width: number, height: number, pixelSize: number = 12): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = width * pixelSize;
    canvas.height = height * pixelSize;

    // Draw pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        ctx.fillStyle = pixels[y][x];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }

    return canvas.toDataURL('image/png');
  }

  /**
   * Export artwork as JPEG
   */
  static exportAsJPEG(pixels: string[][], width: number, height: number, pixelSize: number = 12, quality: number = 0.9): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = width * pixelSize;
    canvas.height = height * pixelSize;

    // Fill background with white for JPEG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        ctx.fillStyle = pixels[y][x];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }

    return canvas.toDataURL('image/jpeg', quality);
  }
}
