"""
Database setup script for Supabase tables migration from MongoDB
Run this script to create the necessary tables in your Supabase project
"""

from supabase_client import supabase
import asyncio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables():
    """
    Create all necessary tables in Supabase
    """
    
    # SQL commands to create tables
    sql_commands = [
        # Users table
        """
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
        """,
        
        # Status checks table
        """
        CREATE TABLE IF NOT EXISTS status_checks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_name TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT NOW()
        );
        """,
        
        # Password reset tokens table
        """
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            used BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW()
        );
        """,
        
        # Chat messages table
        """
        CREATE TABLE IF NOT EXISTS chat_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            session_id TEXT NOT NULL,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            response TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT NOW()
        );
        """,
        
        # Workouts table
        """
        CREATE TABLE IF NOT EXISTS workouts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            exercises JSONB NOT NULL DEFAULT '[]',
            duration TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            created_by_ai BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW()
        );
        """
    ]
    
    # Execute each SQL command
    for i, sql in enumerate(sql_commands):
        try:
            logger.info(f"Executing SQL command {i+1}/{len(sql_commands)}")
            response = supabase.rpc('exec_sql', {'sql': sql}).execute()
            logger.info(f"Successfully executed command {i+1}")
        except Exception as e:
            logger.error(f"Error executing SQL command {i+1}: {str(e)}")
            logger.info("Note: Direct SQL execution might require additional setup. Please run these commands manually in Supabase SQL Editor:")
            logger.info(sql)
            continue
    
    logger.info("Database setup completed!")

def setup_row_level_security():
    """
    Setup Row Level Security (RLS) policies
    """
    
    rls_commands = [
        # Enable RLS on all tables
        "ALTER TABLE users ENABLE ROW LEVEL SECURITY;",
        "ALTER TABLE status_checks ENABLE ROW LEVEL SECURITY;", 
        "ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;",
        "ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;",
        "ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;",
        
        # Create policies for users table
        """
        CREATE POLICY IF NOT EXISTS "Users can view own profile" ON users
            FOR SELECT USING (auth.uid() = id);
        """,
        
        """
        CREATE POLICY IF NOT EXISTS "Users can update own profile" ON users
            FOR UPDATE USING (auth.uid() = id);
        """,
        
        # Create policies for chat_messages table
        """
        CREATE POLICY IF NOT EXISTS "Users can view own messages" ON chat_messages
            FOR SELECT USING (auth.uid() = user_id);
        """,
        
        """
        CREATE POLICY IF NOT EXISTS "Users can insert own messages" ON chat_messages
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        """,
        
        # Create policies for workouts table
        """
        CREATE POLICY IF NOT EXISTS "Users can view own workouts" ON workouts
            FOR SELECT USING (auth.uid() = user_id);
        """,
        
        """
        CREATE POLICY IF NOT EXISTS "Users can manage own workouts" ON workouts
            FOR ALL USING (auth.uid() = user_id);
        """
    ]
    
    for i, sql in enumerate(rls_commands):
        try:
            logger.info(f"Setting up RLS policy {i+1}/{len(rls_commands)}")
            response = supabase.query(sql).execute()
            logger.info(f"Successfully set up RLS policy {i+1}")
        except Exception as e:
            logger.error(f"Error setting up RLS policy {i+1}: {str(e)}")
            continue
    
    logger.info("RLS setup completed!")

if __name__ == "__main__":
    logger.info("Starting Supabase database setup...")
    create_tables()
    # Note: RLS setup might require admin privileges, so commenting out for now
    # setup_row_level_security()
    logger.info("Database setup finished!")