-- =====================================================
-- 1. DROP CÁC BẢNG (Theo thứ tự từ con -> cha)
-- =====================================================
DROP TABLE IF EXISTS system_logs;
DROP TABLE IF EXISTS system_configs;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS admins;
CREATE DATABASE IF NOT EXISTS finance_management
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE finance_management;
-- =====================================================
-- 2. TẠO CÁC BẢNG MỚI
-- =====================================================

-- Bảng 1: Quản trị viên (Dành riêng cho Web Dashboard, không bị khóa, không ví)
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 2: Khách hàng / Người dùng di động (Đăng ký từ app, có số dư ban đầu, có status)
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    initial_balance DECIMAL(15, 2) DEFAULT 0.00,
    status ENUM('active', 'blocked') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 3: Ví tiền của Customer
CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 4: Danh mục chi tiêu (ĐÃ BỎ CỘT TYPE)
-- customer_id IS NULL: Danh mục chi tiêu mặc định hệ thống
-- customer_id CÓ GIÁ TRỊ: Danh mục chi tiêu riêng do người dùng tự tạo
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'pricetag-outline',
    color VARCHAR(20) DEFAULT '#EF4444',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 5: Giao dịch chi tiêu (ĐÃ BỎ CỘT TYPE - Mặc định mọi bản ghi đều là khoản chi)
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    wallet_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    date DATETIME NOT NULL,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 6: Cấu hình hệ thống (Admin quản lý trên Web)
CREATE TABLE system_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng 7: Nhật ký hoạt động & lỗi hệ thống (Admin theo dõi trên Web)
CREATE TABLE system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,
    action VARCHAR(100) NOT NULL,
    level ENUM('INFO', 'WARN', 'ERROR') DEFAULT 'INFO',
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. DỮ LIỆU KHỞI TẠO (SEED DATA)
-- =====================================================

-- 1. Tài khoản Admin khởi tạo (Dùng đăng nhập Web Dashboard)
INSERT INTO admins (id, name, email, password) VALUES
(1, 'Super Admin', 'admin@finance.com', 'admin123');

-- 2. Tài khoản Customer mẫu (Dùng đăng nhập App di động)
INSERT INTO customers (id, name, email, password, initial_balance, status) VALUES
(1, 'Nguyen Van A', 'user@finance.com', '123456', 5000000.00, 'active');

-- 3. Ví tiền mẫu (Số dư ban đầu 5.000.000 VND)
INSERT INTO wallets (id, customer_id, name, balance) VALUES
(1, 1, 'Ví Tiền Mặt', 5000000.00);

-- 4. Danh mục chi tiêu mặc định hệ thống (Chỉ toàn các mục chi)
INSERT INTO categories (id, customer_id, name, icon, color) VALUES
(1, NULL, 'Ăn uống', 'fast-food', '#EF4444'),
(2, NULL, 'Đi lại', 'car', '#F59E0B'),
(3, NULL, 'Mua sắm', 'cart', '#8B5CF6'),
(4, NULL, 'Hóa đơn & Điện nước', 'receipt', '#3B82F6'),
(5, NULL, 'Giải trí', 'game-controller', '#EC4899');

-- 5. Giao dịch chi tiêu mẫu
INSERT INTO transactions (id, customer_id, wallet_id, category_id, title, amount, date, note) VALUES
(1, 1, 1, 1, 'Cơm trưa văn phòng', 40000.00, NOW(), 'Cơm gà xối mỡ'),
(2, 1, 1, 2, 'Đổ xăng xe máy', 70000.00, NOW(), 'Xăng A95');

-- 6. Cấu hình hệ thống mặc định
INSERT INTO system_configs (config_key, config_value, description) VALUES
('DEFAULT_CURRENCY', 'VND', 'Đơn vị tiền tệ hiển thị'),
('APP_VERSION', '1.0.0', 'Phiên bản ứng dụng di động');

-- 7. Nhật ký hệ thống mẫu
INSERT INTO system_logs (customer_id, action, level, details) VALUES
(NULL, 'SYSTEM_STARTUP', 'INFO', 'Hệ thống khởi chạy thành công'),
(1, 'CUSTOMER_REGISTER', 'INFO', 'Customer Nguyen Van A kích hoạt tài khoản');