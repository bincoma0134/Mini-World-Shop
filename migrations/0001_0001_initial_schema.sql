-- Bảng users
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    balance INTEGER DEFAULT 0,
    role TEXT DEFAULT 'USER',
    status TEXT DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng game_accounts
CREATE TABLE game_accounts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    account_username TEXT NOT NULL,
    account_password TEXT NOT NULL,
    images TEXT, -- Lưu mảng URL dưới dạng JSON String
    tags TEXT, -- Lưu mảng Tag dưới dạng JSON String
    status TEXT DEFAULT 'AVAILABLE', -- AVAILABLE, HOLD, SOLD
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng transactions
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- DEPOSIT, PURCHASE
    amount INTEGER NOT NULL,
    payment_method TEXT NOT NULL, -- PAYOS, THESIEURE, SYSTEM
    reference_id TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Bảng orders
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    price_at_purchase INTEGER NOT NULL,
    status TEXT DEFAULT 'COMPLETED', -- PENDING, COMPLETED, CANCELLED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (account_id) REFERENCES game_accounts(id)
);

-- Bảng audit_logs
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT, 
    action TEXT NOT NULL,
    details TEXT, -- Lưu thông tin chi tiết dạng JSON String
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tạo Index để tối ưu Performance (Theo nguyên tắc Performance)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_game_accounts_status ON game_accounts(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);