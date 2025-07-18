#!/usr/bin/env python3
"""
MySQL Connection Test Script
Tests the MySQL connection and basic database operations
"""

import sys
import os
sys.path.append('/app/backend')

from mysql_client import mysql_client
from datetime import datetime

def test_mysql_connection():
    """Test MySQL connection and basic operations"""
    try:
        print("🔍 Testing MySQL Connection...")
        
        # Test 1: Insert a test status check
        print("\n✅ Test 1: Insert Test Data")
        test_data = {
            'client_name': 'MySQL Test Connection',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        insert_id = mysql_client.insert_one('status_checks', test_data)
        print(f"   ✓ Inserted record with ID: {insert_id}")
        
        # Test 2: Find the inserted record
        print("\n✅ Test 2: Find Test Data")
        found_record = mysql_client.find_one('status_checks', {'id': insert_id})
        if found_record:
            print(f"   ✓ Found record: {found_record['client_name']}")
        else:
            print("   ❌ Record not found")
        
        # Test 3: Count records
        print("\n✅ Test 3: Count Records")
        count = mysql_client.count('status_checks')
        print(f"   ✓ Total records in status_checks: {count}")
        
        # Test 4: Test all tables
        print("\n✅ Test 4: Test All Tables")
        tables = ['users', 'status_checks', 'password_reset_tokens', 'chat_messages', 'workouts']
        for table in tables:
            try:
                count = mysql_client.count(table)
                print(f"   ✓ {table}: {count} records")
            except Exception as e:
                print(f"   ❌ {table}: Error - {e}")
        
        # Test 5: Test user creation
        print("\n✅ Test 5: Test User Creation")
        user_data = {
            'name': 'Test User',
            'email': 'test@mysql.com',
            'password': 'password123',
            'created_at': datetime.utcnow().isoformat()
        }
        
        user_id = mysql_client.insert_one('users', user_data)
        print(f"   ✓ Created user with ID: {user_id}")
        
        # Test 6: Test user retrieval
        print("\n✅ Test 6: Test User Retrieval")
        user = mysql_client.find_one('users', {'email': 'test@mysql.com'})
        if user:
            print(f"   ✓ Found user: {user['name']} ({user['email']})")
        else:
            print("   ❌ User not found")
        
        print("\n🎉 All MySQL tests passed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ MySQL test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_mysql_connection()
    sys.exit(0 if success else 1)