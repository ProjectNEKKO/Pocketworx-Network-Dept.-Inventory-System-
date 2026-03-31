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
