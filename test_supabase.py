"""
Test script to create tables in Supabase and test the connection
"""
import os
import sys
sys.path.append('/app/backend')

from supabase import create_client
from datetime import datetime
import uuid

# Load environment variables manually
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path('/app/backend')
load_dotenv(ROOT_DIR / '.env')

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

print(f"Supabase URL: {SUPABASE_URL}")
print(f"Supabase Key: {SUPABASE_KEY[:20] if SUPABASE_KEY else 'Not found'}...")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing Supabase environment variables!")
    print("Make sure SUPABASE_URL and SUPABASE_KEY are set in backend/.env")
    exit(1)

# Create Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def test_connection():
    """Test basic connection to Supabase"""
    try:
        # Try to create a simple test table entry
        test_data = {
            "id": str(uuid.uuid4()),
            "client_name": "test_connection",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # First, let's try to see what tables exist
        print("Testing Supabase connection...")
        
        # Try to insert a test status check
        response = supabase.table('status_checks').insert(test_data).execute()
        print(f"Insert response: {response}")
        
        if response.data:
            print("✅ Successfully connected to Supabase and inserted test data!")
            
            # Try to fetch the data back
            fetch_response = supabase.table('status_checks').select("*").eq('id', test_data['id']).execute()
            print(f"Fetch response: {fetch_response.data}")
            
            if fetch_response.data:
                print("✅ Successfully fetched data from Supabase!")
            else:
                print("❌ Could not fetch data from Supabase")
                
        else:
            print("❌ Failed to insert data to Supabase")
            print(f"Error: {response}")
            
    except Exception as e:
        print(f"❌ Error testing Supabase connection: {str(e)}")
        print("This might be because the tables don't exist yet.")
        print("You need to create the tables manually in the Supabase dashboard.")

if __name__ == "__main__":
    test_connection()