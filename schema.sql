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
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE finance_management;

-- 1. Bảng Quản trị viên (Đăng nhập Web Dashboard)
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Khách hàng (Định danh người dùng App Mobile)
-- Đã bỏ cột initial_balance để tập trung tiền bạc về bảng wallets
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status ENUM('active', 'blocked') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng Ví tiền (Nơi DUY NHẤT lưu trữ số dư tiền tệ)
CREATE TABLE IF NOT EXISTS wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    name VARCHAR(100) DEFAULT 'Ví cá nhân',
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 4. Bảng Danh mục chi tiêu
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL, -- NULL là danh mục mặc định của hệ thống
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'tag',
    color VARCHAR(20) DEFAULT '#10B981',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 5. Bảng Giao dịch chi tiêu
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    wallet_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- 6. Bảng Cấu hình hệ thống (Quản lý tại system.html)
CREATE TABLE IF NOT EXISTS system_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Bảng Nhật ký hệ thống (System Logs)
CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,
    action VARCHAR(100) NOT NULL,
    level ENUM('INFO', 'WARN', 'ERROR') DEFAULT 'INFO',
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- ========================================================
-- SEED DATA (DỮ LIỆU KHỞI TẠO MẶC ĐỊNH)
-- ========================================================

-- Tài khoản Admin mặc định (Web)
INSERT INTO admins (id, name, email, password) VALUES
(1, 'Administrator', 'admin@finance.com', 'admin123')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Tài khoản Khách hàng mẫu (App Mobile)
INSERT INTO customers (id, name, email, password, status) VALUES
(1, 'Nguyen Van A', 'user@finance.com', '123456', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Ví mặc định cho khách hàng mẫu (Số dư 5.000.000 đ)
INSERT INTO wallets (id, customer_id, name, balance) VALUES
(1, 1, 'Ví cá nhân', 5000000.00)
ON DUPLICATE KEY UPDATE balance=VALUES(balance);

-- Danh mục chi tiêu mặc định của hệ thống
INSERT INTO categories (id, customer_id, name, icon, color) VALUES
(1, NULL, 'Ăn uống', 'fast-food', '#EF4444'),
(2, NULL, 'Đi lại', 'car', '#F59E0B'),
(3, NULL, 'Mua sắm', 'cart', '#8B5CF6'),
(4, NULL, 'Hóa đơn & Tiện ích', 'receipt', '#3B82F6'),
(5, NULL, 'Giải trí', 'game-controller', '#EC4899')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Giao dịch mẫu
INSERT INTO transactions (id, customer_id, wallet_id, category_id, title, amount, date, note) VALUES
(1, 1, 1, 1, 'Cơm trưa văn phòng', 40000.00, NOW(), 'Cơm gà xối mỡ'),
(2, 1, 1, 2, 'Đổ xăng xe máy', 70000.00, NOW(), 'Xăng A95')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Cấu hình hệ thống mặc định
INSERT INTO system_configs (config_key, config_value, description) VALUES
('DEFAULT_CURRENCY', 'VND', 'Đơn vị tiền tệ hiển thị'),
('APP_VERSION', '1.0.0', 'Phiên bản ứng dụng di động')
ON DUPLICATE KEY UPDATE config_value=VALUES(config_value);

-- Nhật ký hệ thống ban đầu
INSERT INTO system_logs (customer_id, action, level, details) VALUES
(NULL, 'SYSTEM_STARTUP', 'INFO', 'Hệ thống khởi chạy thành công'),
(1, 'CUSTOMER_REGISTER', 'INFO', 'Customer Nguyen Van A kích hoạt tài khoản');