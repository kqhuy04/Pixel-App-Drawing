# Hướng dẫn cấu hình Firebase cho Pixel Art App

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" hoặc "Add project"
3. Nhập tên project (ví dụ: "pixel-art-app")
4. Chọn có/không bật Google Analytics (tùy chọn)
5. Click "Create project"

## Bước 2: Cấu hình Authentication

1. Trong Firebase Console, chọn project vừa tạo
2. Vào **Authentication** > **Sign-in method**
3. Bật **Email/Password** provider:
   - Click vào "Email/Password"
   - Bật "Enable"
   - Click "Save"

## Bước 3: Lấy Firebase Config

1. Vào **Project Settings** (biểu tượng bánh răng)
2. Scroll xuống phần "Your apps"
3. Click "Add app" > chọn biểu tượng web (</>)
4. Nhập tên app (ví dụ: "pixel-art-web")
5. Click "Register app"
6. Copy config object, sẽ trông như này:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

## Bước 4: Cập nhật config trong code

1. Mở file `src/firebase/config.ts`
2. Thay thế config mẫu bằng config thật của bạn:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Thay bằng apiKey thật
  authDomain: "your-project.firebaseapp.com", // Thay bằng authDomain thật
  projectId: "your-project-id", // Thay bằng projectId thật
  storageBucket: "your-project.appspot.com", // Thay bằng storageBucket thật
  messagingSenderId: "123456789", // Thay bằng messagingSenderId thật
  appId: "1:123456789:web:abcdef..." // Thay bằng appId thật
};
```

## Bước 5: Cấu hình Firestore (cho tương lai)

1. Vào **Firestore Database** trong Firebase Console
2. Click "Create database"
3. Chọn "Start in test mode" (để test, sau này sẽ cấu hình security rules)
4. Chọn location gần nhất (ví dụ: asia-southeast1)
5. Click "Done"

## Bước 6: Test Authentication

1. Chạy app: `npm run dev`
2. Thử đăng ký tài khoản mới
3. Thử đăng nhập với tài khoản vừa tạo
4. Kiểm tra trong Firebase Console > Authentication > Users để xem user đã được tạo

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG**: File `src/firebase/config.ts` chứa config public, không chứa thông tin nhạy cảm. Tuy nhiên, bạn nên:

1. Cấu hình **Firestore Security Rules** khi deploy production
2. Cấu hình **Authentication settings** phù hợp
3. Sử dụng **Firebase App Check** cho production

## Cấu hình Firestore Security Rules (sau này)

Khi bạn muốn lưu dữ liệu, cần cấu hình security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users chỉ có thể đọc/ghi dữ liệu của chính họ
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Artworks có thể được đọc bởi tất cả, chỉ tác giả mới có thể sửa
    match /artworks/{artworkId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
      allow create: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Lỗi thường gặp:

1. **"Firebase: Error (auth/network-request-failed)"**
   - Kiểm tra kết nối internet
   - Kiểm tra config có đúng không

2. **"Firebase: Error (auth/invalid-api-key)"**
   - Kiểm tra lại apiKey trong config
   - Đảm bảo đã copy đúng từ Firebase Console

3. **"Firebase: Error (auth/domain-not-authorized)"**
   - Vào Firebase Console > Authentication > Settings
   - Thêm domain vào "Authorized domains"

### Debug:

1. Mở Developer Tools (F12)
2. Vào tab Console để xem lỗi chi tiết
3. Kiểm tra Network tab để xem request có thành công không
