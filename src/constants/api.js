import { Platform } from "react-native";

// Máy ảo Android dùng 10.0.2.2 để gọi localhost của máy tính
// Máy thật thì thay bằng địa chỉ IPv4 WiFi của máy tính (ví dụ: 192.168.1.15)
const HOST = "192.168.2.174";

export const API_BASE_URL = `http://${HOST}:5000/api`;
