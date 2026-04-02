-- Database Schema for Network Department Inventory System

-- It is recommended to create an extension for cryptographically secure UUIDs 
-- if migrating to uuid primary keys, but we'll stick to simple auto-increment IDs 
-- to match the prior mock database structure perfectly.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for the email column since we query by it constantly during login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Example Seed Data (Passwords are bcrypt hashed equivalent to 'packetworx' with salt 10)
-- WARNING: These are exactly the hashes from the prior mock database!
INSERT INTO users (email, password_hash, role) VALUES 
('admin@packetworx.com', '$2b$10$hiO8Za0CmgIUFNZw69XSu.GC7IA48H.cwVHoRo2pjkgWGHZ5kpaja', 'admin'),
('co-admin@packetworx.com', '$2b$10$hiO8Za0CmgIUFNZw69XSu.GC7IA48H.cwVHoRo2pjkgWGHZ5kpaja', 'co-admin'),
('user@packetworx.com', '$2b$10$hiO8Za0CmgIUFNZw69XSu.GC7IA48H.cwVHoRo2pjkgWGHZ5kpaja', 'user')
ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS stock_requests (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'component' or 'gateway'
    item_sku VARCHAR(255) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    requested_qty INTEGER NOT NULL,
    requested_by VARCHAR(255) NOT NULL, -- email
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id), -- Specific target if needed, else null for broadcast
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'stock_request', 'new_user', etc.
    related_id INTEGER, -- link to stock_request_id or user_id
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_stock_requests_status ON stock_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
