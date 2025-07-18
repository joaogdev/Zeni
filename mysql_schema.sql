-- MySQL Database Schema for Fitness App
-- Converted from Supabase PostgreSQL schema

-- Use the database
USE fitness_app;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Status checks table  
CREATE TABLE IF NOT EXISTS status_checks (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_name VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id VARCHAR(255) NOT NULL,
    user_id CHAR(36) NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Workouts table
CREATE TABLE IF NOT EXISTS workouts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    exercises JSON NOT NULL,
    duration VARCHAR(255) NOT NULL,
    difficulty VARCHAR(255) NOT NULL,
    created_by_ai BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);

-- Insert sample data for testing (optional)
INSERT INTO users (name, email, password) VALUES 
('Test User', 'test@example.com', 'password123')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Verify tables were created
SELECT TABLE_NAME, TABLE_SCHEMA
FROM information_schema.tables 
WHERE TABLE_SCHEMA = 'fitness_app'
AND TABLE_NAME IN ('users', 'status_checks', 'password_reset_tokens', 'chat_messages', 'workouts')
ORDER BY TABLE_NAME;