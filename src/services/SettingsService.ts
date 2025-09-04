import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface UserSettings {
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  notifications: boolean;
  autoSave: boolean;
  gridLines: boolean;
  soundEffects: boolean;
  highContrast: boolean;
}

export class SettingsService {
  private static readonly COLLECTION_NAME = 'settings';

  /**
   * Lưu cài đặt của user vào Firestore
   */
  static async saveSettings(uid: string, settings: UserSettings): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION_NAME, uid);
      
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.log('Settings saved successfully for user:', uid);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Không thể lưu cài đặt. Vui lòng thử lại.');
    }
  }

  /**
   * Lấy cài đặt của user từ Firestore
   */
  static async getSettings(uid: string): Promise<UserSettings | null> {
    try {
      const settingsRef = doc(db, this.COLLECTION_NAME, uid);
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        return {
          theme: data.theme || 'light',
          language: data.language || 'vi',
          notifications: data.notifications !== false,
          autoSave: data.autoSave !== false,
          gridLines: data.gridLines !== false,
          soundEffects: data.soundEffects || false,
          highContrast: data.highContrast || false
        } as UserSettings;
      } else {
        // Return default settings if no settings found
        return {
          theme: 'light',
          language: 'vi',
          notifications: true,
          autoSave: true,
          gridLines: true,
          soundEffects: false,
          highContrast: false
        };
      }
    } catch (error) {
      console.error('Error getting settings:', error);
      throw new Error('Không thể tải cài đặt.');
    }
  }

  /**
   * Cập nhật một phần cài đặt
   */
  static async updateSettings(uid: string, partialSettings: Partial<UserSettings>): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION_NAME, uid);
      
      await updateDoc(settingsRef, {
        ...partialSettings,
        updatedAt: serverTimestamp()
      });

      console.log('Settings updated successfully for user:', uid);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw new Error('Không thể cập nhật cài đặt. Vui lòng thử lại.');
    }
  }

  /**
   * Xóa cài đặt của user
   */
  static async deleteSettings(uid: string): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION_NAME, uid);
      await setDoc(settingsRef, {}, { merge: false });
      console.log('Settings deleted successfully for user:', uid);
    } catch (error) {
      console.error('Error deleting settings:', error);
      throw new Error('Không thể xóa cài đặt.');
    }
  }
}
