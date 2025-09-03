import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserData, CreateUserData } from '../types/User';

export class UserService {
  private static readonly COLLECTION_NAME = 'users';

  /**
   * Tạo user mới trong Firestore
   */
  static async createUser(userData: CreateUserData): Promise<void> {
    try {
      console.log('UserService: Starting to create user document...');
      console.log('UserService: User data:', userData);
      console.log('UserService: Database instance:', db);
      
      const userRef = doc(db, this.COLLECTION_NAME, userData.uid);
      console.log('UserService: Document reference created:', userRef);
      
      const newUserData = {
        email: userData.email,
        displayName: userData.displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        totalArtworks: 0,
        totalLikes: 0,
        preferences: {
          theme: 'light',
          language: 'vi',
          notifications: true
        }
      };

      console.log('UserService: About to write to Firestore...');
      await setDoc(userRef, newUserData);
      console.log('UserService: Document written successfully to Firestore');

      console.log('User created successfully:', userData.uid);
    } catch (error) {
      console.error('UserService: Error creating user:', error);
      console.error('UserService: Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw new Error('Không thể tạo tài khoản. Vui lòng thử lại.');
    }
  }

  /**
   * Lấy thông tin user từ Firestore
   */
  static async getUser(uid: string): Promise<UserData | null> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          uid,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserData;
      } else {
        console.log('No user document found');
        return null;
      }
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Không thể lấy thông tin người dùng.');
    }
  }

  /**
   * Cập nhật thông tin user
   */
  static async updateUser(uid: string, updateData: Partial<UserData>): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, uid);
      
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      console.log('User updated successfully:', uid);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Không thể cập nhật thông tin người dùng.');
    }
  }

  /**
   * Kiểm tra user đã tồn tại chưa
   */
  static async userExists(uid: string): Promise<boolean> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, uid);
      const userSnap = await getDoc(userRef);
      return userSnap.exists();
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  /**
   * Tìm user theo email
   */
  static async getUserByEmail(email: string): Promise<UserData | null> {
    try {
      const usersRef = collection(db, this.COLLECTION_NAME);
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          uid: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserData;
      }

      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Không thể tìm người dùng.');
    }
  }

  /**
   * Cập nhật số lượng artwork của user
   */
  static async updateArtworkCount(uid: string, increment: number = 1): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const currentCount = userSnap.data().totalArtworks || 0;
        await updateDoc(userRef, {
          totalArtworks: currentCount + increment,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating artwork count:', error);
    }
  }

  /**
   * Cập nhật số lượng likes của user
   */
  static async updateLikesCount(uid: string, increment: number = 1): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const currentCount = userSnap.data().totalLikes || 0;
        await updateDoc(userRef, {
          totalLikes: currentCount + increment,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating likes count:', error);
    }
  }
}
