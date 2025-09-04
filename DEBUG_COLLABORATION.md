# 🐛 Debug Collaboration Features

## 🔍 **Các bước debug lỗi tạo phòng**

### **1. Kiểm tra Console Logs**
Mở Developer Tools (F12) và xem tab Console khi tạo phòng. Bạn sẽ thấy các log như:
```
🔍 Starting room creation...
👤 Current user: [user-id]
📊 Room data: {name: "Huy", description: "ko có gì", ...}
🆔 Generated room ID: [room-id]
📝 Room object to save: {...}
🔥 Attempting to save to Realtime Database...
```

### **2. Các lỗi thường gặp:**

#### **❌ PERMISSION_DENIED**
```
❌ Error code: PERMISSION_DENIED
❌ Error message: Permission denied
```
**Nguyên nhân:** Firebase Realtime Database rules chưa đúng
**Giải pháp:** Cập nhật security rules (xem bước 3)

#### **❌ UNAVAILABLE**
```
❌ Error code: UNAVAILABLE
❌ Error message: The service is currently unavailable
```
**Nguyên nhân:** Realtime Database chưa được tạo hoặc config sai
**Giải pháp:** Kiểm tra Firebase Console

#### **❌ No current user**
```
❌ No current user
```
**Nguyên nhân:** User chưa đăng nhập
**Giải pháp:** Đăng nhập trước khi tạo phòng

### **3. Kiểm tra Firebase Realtime Database**

#### **Bước 1: Tạo Realtime Database**
1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project `pixel-app-draw`
3. Vào **Realtime Database** (menu bên trái)
4. Nếu chưa có, click **"Create Database"**
5. Chọn **"Start in test mode"**
6. Chọn location: `asia-southeast1`

#### **Bước 2: Cập nhật Security Rules**
Vào tab **Rules** và thay thế bằng:
```json
{
  "rules": {
    "collaboration_rooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "collaboration_users": {
      "$roomId": {
        "$userId": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      }
    },
    "collaboration_chat": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "collaboration_canvas": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "collaboration_actions": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

#### **Bước 3: Lấy Database URL**
1. Vào **Project Settings** (biểu tượng bánh răng)
2. Scroll xuống **Your apps**
3. Chọn app web
4. Copy **Database URL**
5. Cập nhật trong `src/firebase/config.ts`

### **4. Test kết nối**

#### **Test 1: Kiểm tra Authentication**
```javascript
// Mở Console và chạy:
import { auth } from './src/firebase/config';
console.log('Current user:', auth.currentUser);
```

#### **Test 2: Kiểm tra Realtime Database**
```javascript
// Mở Console và chạy:
import { realtimeDb } from './src/firebase/config';
import { ref, set } from 'firebase/database';

const testRef = ref(realtimeDb, 'test');
set(testRef, { message: 'Hello World' })
  .then(() => console.log('✅ Realtime Database working!'))
  .catch((error) => console.error('❌ Realtime Database error:', error));
```

### **5. Các bước khắc phục**

#### **Nếu lỗi PERMISSION_DENIED:**
1. Kiểm tra user đã đăng nhập chưa
2. Cập nhật security rules
3. Đảm bảo rules đã được publish

#### **Nếu lỗi UNAVAILABLE:**
1. Kiểm tra Realtime Database đã được tạo chưa
2. Kiểm tra databaseURL trong config
3. Kiểm tra kết nối internet

#### **Nếu lỗi khác:**
1. Xem chi tiết error trong Console
2. Kiểm tra Firebase project settings
3. Thử tạo project mới nếu cần

### **6. Quick Fix Commands**

#### **Reset Firebase Config:**
```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **Clear Browser Cache:**
```bash
# Hard refresh
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### **7. Alternative Solution**

Nếu vẫn không được, có thể tạm thời disable collaboration và chỉ dùng Firestore:

```typescript
// Trong CollaborativeCanvas.tsx, comment out:
// const roomId = await CollaborationService.createRoom({...});
// Thay bằng mock data:
const roomId = 'mock-room-' + Date.now();
```

---

**Sau khi debug xong, hãy thử tạo phòng lại và xem Console logs!** 🔍
