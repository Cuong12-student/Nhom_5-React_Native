-- 1. Khởi tạo Database
CREATE DATABASE IF NOT EXISTS finance_management
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE finance_management;

-- 2. Xóa bảng cũ nếu tồn tại (theo thứ tự khóa ngoại để tránh lỗi)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS users;

-- 3. Bảng Users (id tự tăng)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    initial_balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Bảng Wallets (id tự tăng)
CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wallets_users 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5. Bảng Categories (id tự tăng)
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    icon VARCHAR(50) NULL,
    color VARCHAR(20) NULL,
    CONSTRAINT fk_categories_users 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. Bảng Transactions (id tự tăng)
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wallet_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    date DATETIME NOT NULL,
    note TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_users 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_transactions_wallets 
        FOREIGN KEY (wallet_id) REFERENCES wallets(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_transactions_categories 
        FOREIGN KEY (category_id) REFERENCES categories(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 7. Dữ liệu mẫu (Không cần điền cột id vì MySQL sẽ tự sinh 1, 2, 3...)
-- Nạp Users -> id tự tăng là 1
INSERT INTO users (name, email, password, initial_balance) VALUES
('Người dùng mẫu', 'demo@finance.com', '123456', 15000000.00);

-- Nạp Wallets -> id tự tăng là 1 (thuộc user_id = 1)
INSERT INTO wallets (user_id, name, balance) VALUES
(1, 'Ví cá nhân', 14965000.00);

-- Nạp Categories -> id tự tăng lần lượt là 1, 2, 3, 4
INSERT INTO categories (user_id, name, type, icon, color) VALUES
(NULL, 'Ăn uống', 'expense', 'fast-food', '#EF4444'),
(NULL, 'Lương', 'income', 'cash', '#10B981'),
(NULL, 'Mua sắm', 'expense', 'cart', '#F59E0B'),
(NULL, 'Giải trí', 'expense', 'film', '#8B5CF6');

-- Nạp Transactions -> id tự tăng lần lượt là 1, 2 (user_id = 1, wallet_id = 1)
INSERT INTO transactions (user_id, wallet_id, category_id, title, amount, type, date, note) VALUES
(1, 1, 2, 'Lương tháng', 15000000.00, 'income', '2026-11-01 08:00:00', 'Thu nhập chính'),
(1, 1, 1, 'Ăn trưa', 35000.00, 'expense', '2026-11-01 12:30:00', 'Cơm văn phòng');