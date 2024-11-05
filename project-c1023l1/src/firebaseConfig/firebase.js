// Import các module cần thiết từ Firebase
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"; // Thêm dòng này để sử dụng Firebase Storage

// Cấu hình Firebase từ Firebase Console

const firebaseConfig = {
    apiKey: "AIzaSyCYAQKRNuV46w27neAHWcye8Scxwa8-X2s",
    authDomain: "quanlycaphe-467b7.firebaseapp.com",
    projectId: "quanlycaphe-467b7",
    storageBucket: "quanlycaphe-467b7.appspot.com",
    messagingSenderId: "349932563319",
    appId: "1:349932563319:web:0db723fa1b0902d59f8f72",
    measurementId: "G-LX9KZ5HSSV"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

const storage = getStorage(app);  // Thêm dòng này

// Export các thành phần cần thiết
export { storage };

