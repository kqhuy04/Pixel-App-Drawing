export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
  profilePicture?: string;
  bio?: string;
  totalArtworks?: number;
  totalLikes?: number;
  preferences?: {
    theme?: 'light' | 'dark';
    language?: 'vi' | 'en';
    notifications?: boolean;
  };
}

export interface CreateUserData {
  uid: string;
  email: string;
  displayName: string;
}
