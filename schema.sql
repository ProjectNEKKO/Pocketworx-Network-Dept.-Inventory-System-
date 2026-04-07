-- Database Schema for Network Department Inventory System

-- Users table
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

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Example Seed Data
INSERT INTO users (email, password_hash, role) VALUES 
('admin@packetworx.com', '$2b$10$YSRzMb2LJIdwBp8ddcw3l.fxkBjTvGaHLRu032CRV5k71CdRdNTUi', 'admin'),
('admin@packetwokx.com', '$2b$10$YSRzMb2LJIdwBp8ddcw3l.fxkBjTvGaHLRu032CRV5k71CdRdNTUi', 'admin'),
('co-admin@packetworx.com', '$2b$10$YSRzMb2LJIdwBp8ddcw3l.fxkBjTvGaHLRu032CRV5k71CdRdNTUi', 'co-admin'),
('user@packetworx.com', '$2b$10$YSRzMb2LJIdwBp8ddcw3l.fxkBjTvGaHLRu032CRV5k71CdRdNTUi', 'user')
ON CONFLICT (email) DO NOTHING;

-- Inventory Components
CREATE TABLE IF NOT EXISTS inventory_components (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 10,
    category VARCHAR(255),
    warehouse VARCHAR(255) NOT NULL,
    tag VARCHAR(50) DEFAULT 'Local',
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku, warehouse)
);

-- Gateways
CREATE TABLE IF NOT EXISTS gateways (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    quantity INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stock Requests
CREATE TABLE IF NOT EXISTS stock_requests (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'component' or 'gateway'
    item_sku VARCHAR(255) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    requested_qty INTEGER NOT NULL,
    requested_by VARCHAR(255) NOT NULL, -- email
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    is_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id), -- Specific target if needed, else null for broadcast
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'stock_request', 'new_user', etc.
    related_id INTEGER, -- link to stock_request_id or user_id
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_stock_requests_status ON stock_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory_components(sku);

-- Critical Stock Logs
CREATE TABLE IF NOT EXISTS critical_stock_logs (
    id SERIAL PRIMARY KEY,
    item_sku VARCHAR(255) NOT NULL,
    warehouse VARCHAR(255) NOT NULL,
    old_value INTEGER NOT NULL,
    new_value INTEGER NOT NULL,
    changed_by VARCHAR(255) NOT NULL, -- email
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_critical_stock_logs_sku ON critical_stock_logs(item_sku);

