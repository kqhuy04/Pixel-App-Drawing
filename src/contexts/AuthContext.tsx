import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { UserService } from '../services/UserService';
import { UserData } from '../types/User';

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (updateData: Partial<UserData>) => Promise<void>;
  refreshUserData: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const register = async (email: string, password: string, displayName: string) => {
    try {
      console.log('Starting registration process...');
      
      // Step 1: Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase Auth user created:', userCredential.user.uid);
      
      // Step 2: Update the user's display name in Firebase Auth
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      console.log('Display name updated in Firebase Auth');
      
      // Step 3: Create user document in Firestore
      await UserService.createUser({
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName
      });
      console.log('User document created in Firestore');
      
      console.log('User registered successfully:', userCredential.user);
    } catch (error: any) {
      console.error('Registration error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Provide more specific error messages
      if (error.code) {
        throw new Error(getErrorMessage(error.code));
      } else {
        throw new Error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully:', userCredential.user);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      console.log('User logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  const updateUserData = async (updateData: Partial<UserData>) => {
    if (!currentUser) {
      throw new Error('Người dùng chưa đăng nhập');
    }

    try {
      await UserService.updateUser(currentUser.uid, updateData);
      // Refresh user data after update
      await refreshUserData();
    } catch (error: any) {
      console.error('Update user data error:', error);
      throw error;
    }
  };

  const refreshUserData = async () => {
    if (!currentUser) {
      setUserData(null);
      return;
    }

    try {
      const userData = await UserService.getUser(currentUser.uid);
      setUserData(userData);
    } catch (error: any) {
      console.error('Refresh user data error:', error);
      setUserData(null);
    }
  };

  // Helper function to convert Firebase error codes to Vietnamese messages
  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Email này đã được sử dụng';
      case 'auth/weak-password':
        return 'Mật khẩu quá yếu (ít nhất 6 ký tự)';
      case 'auth/invalid-email':
        return 'Email không hợp lệ';
      case 'auth/user-not-found':
        return 'Không tìm thấy tài khoản với email này';
      case 'auth/wrong-password':
        return 'Mật khẩu không đúng';
      case 'auth/too-many-requests':
        return 'Quá nhiều lần thử. Vui lòng thử lại sau';
      case 'auth/network-request-failed':
        return 'Lỗi kết nối mạng';
      case 'auth/operation-not-allowed':
        return 'Phương thức đăng nhập này không được phép';
      case 'auth/invalid-credential':
        return 'Thông tin đăng nhập không hợp lệ';
      case 'auth/user-disabled':
        return 'Tài khoản này đã bị vô hiệu hóa';
      case 'auth/requires-recent-login':
        return 'Vui lòng đăng nhập lại để thực hiện thao tác này';
      default:
        return `Có lỗi xảy ra: ${errorCode}. Vui lòng thử lại`;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Load user data from Firestore when user logs in
        try {
          const userData = await UserService.getUser(user.uid);
          setUserData(userData);
        } catch (error) {
          console.error('Error loading user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userData,
    login,
    register,
    logout,
    updateUserData,
    refreshUserData,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
