-- Supabase Database Schema Setup
-- Copy and paste this entire SQL script into your Supabase SQL Editor
-- Navigate to: https://supabase.com/dashboard → Your Project → SQL Editor

-- Enable UUID extension (required for UUID primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Status checks table
CREATE TABLE IF NOT EXISTS status_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- 3. Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- 5. Workouts table
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    exercises JSONB NOT NULL DEFAULT '[]',
    duration TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    created_by_ai BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);

-- Enable Row Level Security (RLS) for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (these allow authenticated users to access their own data)
-- Note: For this demo app, we'll use permissive policies since we're handling auth in the app layer

-- Users policies
CREATE POLICY IF NOT EXISTS "Allow all operations on users" ON users
    FOR ALL USING (true);

-- Status checks policies (admin/system table)
CREATE POLICY IF NOT EXISTS "Allow all operations on status_checks" ON status_checks
    FOR ALL USING (true);

-- Password reset tokens policies
CREATE POLICY IF NOT EXISTS "Allow all operations on password_reset_tokens" ON password_reset_tokens
    FOR ALL USING (true);

-- Chat messages policies
CREATE POLICY IF NOT EXISTS "Allow all operations on chat_messages" ON chat_messages
    FOR ALL USING (true);

-- Workouts policies
CREATE POLICY IF NOT EXISTS "Allow all operations on workouts" ON workouts
    FOR ALL USING (true);

-- Insert some sample data for testing (optional)
-- INSERT INTO users (name, email, password) VALUES 
-- ('Test User', 'test@example.com', 'password123');

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'status_checks', 'password_reset_tokens', 'chat_messages', 'workouts')
ORDER BY table_name;