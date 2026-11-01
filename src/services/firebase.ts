/**
 * Firebase Integration Module & Configuration Guide
 * OnVienChucBacNinh - Hệ thống Ôn Thi Viên Chức Bắc Ninh
 *
 * Hướng dẫn tích hợp Firebase từng bước:
 * 1. Truy cập https://console.firebase.google.com/
 * 2. Tạo một Dự án Firebase mới (ví dụ: onvienchucbacninh-edu)
 * 3. Kích hoạt Authentication:
 *    - Chọn mục Authentication > Sign-in method > Bật Email/Password.
 * 4. Kích hoạt Cloud Firestore:
 *    - Chọn mục Firestore Database > Create database.
 *    - Chọn chế độ Production Mode hoặc Test Mode ban đầu.
 *    - Triển khai Security Rules (xem mẫu bên dưới).
 * 5. Kích hoạt Firebase Storage (để lưu trữ tệp Excel tải lên).
 * 6. Lấy cấu hình SDK (Firebase Config):
 *    - Vào Project Settings > General > Your apps > Web app (</>) > Sao chép cấu hình firebaseConfig.
 * 7. Nhập thông tin cấu hình vào phần "Cài đặt hệ thống" trong trang Quản trị Admin.
 */

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

const FIREBASE_CONFIG_KEY = 'ovc_bn_firebase_config';

export function getStoredFirebaseConfig(): FirebaseClientConfig | null {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveFirebaseConfig(config: FirebaseClientConfig): void {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
}

export function isFirebaseConfigured(): boolean {
  const config = getStoredFirebaseConfig();
  return Boolean(config && config.apiKey && config.projectId);
}

/**
 * Mẫu Firestore Security Rules bảo mật tiêu chuẩn cho OnVienChucBacNinh
 */
export const RECOMMENDED_FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Hàm kiểm tra người dùng đã xác thực
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Hàm kiểm tra vai trò Quản trị viên (Admin)
    function isAdmin() {
      return isAuthenticated() && (
        request.auth.token.role == 'admin' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }
    
    // 1. users: Mỗi người dùng chỉ đọc/sửa thông tin cá nhân của mình, trừ role
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow create: if isAuthenticated() && request.auth.uid == userId && request.resource.data.role == 'user';
      allow update: if isAuthenticated() && (
        (request.auth.uid == userId && request.resource.data.role == resource.data.role) ||
        isAdmin()
      );
      allow delete: if isAdmin();
    }
    
    // 2. topics: Mọi người dùng đã đăng nhập đều xem được; chỉ Admin được sửa
    match /topics/{topicId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // 3. questions: Xem ngân hàng câu hỏi
    match /questions/{questionId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // 4. attempts: Lịch sử làm bài thi
    match /attempts/{attemptId} {
      allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if isAdmin();
    }
    
    // 5. userWrongQuestions: Danh sách câu sai riêng tư của từng học viên
    match /userWrongQuestions/{docId} {
      allow read, write: if isAuthenticated() && (
        resource == null || resource.data.userId == request.auth.uid
      );
    }
    
    // 6. userTopicProgress: Tiến độ & mức độ thành thạo cá nhân
    match /userTopicProgress/{docId} {
      allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
      allow write: if isAuthenticated() && (
        resource == null || resource.data.userId == request.auth.uid || isAdmin()
      );
    }
    
    // 7. importHistory: Nhật ký nhập Excel (Chỉ Admin)
    match /importHistory/{importId} {
      allow read, write: if isAdmin();
    }
  }
}`;
