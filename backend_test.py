#!/usr/bin/env python3
import requests
import json
import os
import sys
import uuid
from datetime import datetime

# Get the backend URL from the frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.strip().split('=')[1]
    except Exception as e:
        print(f"Error reading .env file: {e}")
        return None

# Main test class
class BackendAPITester:
    def __init__(self):
        self.backend_url = get_backend_url()
        if not self.backend_url:
            print("Error: Could not determine backend URL")
            sys.exit(1)
        
        self.api_url = f"{self.backend_url}/api"
        print(f"Using backend API URL: {self.api_url}")
        
        # Test user data
        self.test_user = {
            "name": f"Test User {uuid.uuid4()}",
            "email": f"test_{uuid.uuid4()}@example.com",
            "password": "Password123!"
        }
        
        # Store test results
        self.results = {
            "health_check": False,
            "register": False,
            "login": False,
            "create_status": False,
            "get_status": False
        }
        
        # Store user ID after registration
        self.user_id = None
    
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("\n=== Starting Backend API Tests ===\n")
        
        # Test health check endpoint
        self.test_health_check()
        
        # Test user registration
        self.test_register()
        
        # Test user login
        self.test_login()
        
        # Test status check creation
        self.test_create_status()
        
        # Test getting status checks
        self.test_get_status()
        
        # Print summary
        self.print_summary()
    
    def test_health_check(self):
        """Test the health check endpoint"""
        print("\n--- Testing Health Check Endpoint ---")
        try:
            response = requests.get(f"{self.api_url}/")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Hello World":
                    print("✅ Health check endpoint working correctly")
                    self.results["health_check"] = True
                else:
                    print("❌ Health check endpoint returned unexpected response")
            else:
                print(f"❌ Health check endpoint failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing health check endpoint: {e}")
    
    def test_register(self):
        """Test user registration"""
        print("\n--- Testing User Registration ---")
        try:
            print(f"Registering user with email: {self.test_user['email']}")
            response = requests.post(
                f"{self.api_url}/register",
                json=self.test_user
            )
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                if "user_id" in data:
                    self.user_id = data["user_id"]
                    print(f"✅ User registration successful. User ID: {self.user_id}")
                    self.results["register"] = True
                else:
                    print("❌ User registration response missing user_id")
            else:
                print(f"❌ User registration failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing user registration: {e}")
    
    def test_login(self):
        """Test user login"""
        print("\n--- Testing User Login ---")
        try:
            login_data = {
                "email": self.test_user["email"],
                "password": self.test_user["password"]
            }
            print(f"Logging in with email: {login_data['email']}")
            
            response = requests.post(
                f"{self.api_url}/login",
                json=login_data
            )
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                if "user_id" in data and data.get("message") == "Login realizado com sucesso":
                    print("✅ User login successful")
                    self.results["login"] = True
                else:
                    print("❌ User login response missing expected fields")
            else:
                print(f"❌ User login failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing user login: {e}")
    
    def test_create_status(self):
        """Test creating a status check"""
        print("\n--- Testing Status Check Creation ---")
        try:
            status_data = {
                "client_name": f"Test Client {uuid.uuid4()}"
            }
            print(f"Creating status check with client name: {status_data['client_name']}")
            
            response = requests.post(
                f"{self.api_url}/status",
                json=status_data
            )
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data.get("client_name") == status_data["client_name"]:
                    print("✅ Status check creation successful")
                    self.results["create_status"] = True
                else:
                    print("❌ Status check creation response missing expected fields")
            else:
                print(f"❌ Status check creation failed with status code {response.status_code}")
                if response.status_code == 500:
                    print("Note: This might be because the 'status_checks' table doesn't exist in Supabase yet.")
                    print("You need to run the SQL in supabase_schema.sql to create the required tables.")
        except Exception as e:
            print(f"❌ Error testing status check creation: {e}")
    
    def test_get_status(self):
        """Test getting status checks"""
        print("\n--- Testing Get Status Checks ---")
        try:
            response = requests.get(f"{self.api_url}/status")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Retrieved {len(data)} status checks")
                print("✅ Get status checks successful")
                self.results["get_status"] = True
            else:
                print(f"❌ Get status checks failed with status code {response.status_code}")
                if response.status_code == 500:
                    print("Note: This might be because the 'status_checks' table doesn't exist in Supabase yet.")
                    print("You need to run the SQL in supabase_schema.sql to create the required tables.")
        except Exception as e:
            print(f"❌ Error testing get status checks: {e}")
    
    def print_summary(self):
        """Print a summary of all test results"""
        print("\n=== Backend API Test Summary ===")
        for test_name, result in self.results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name}: {status}")
        
        # Check if any tests failed due to missing tables
        if not self.results["create_status"] or not self.results["get_status"]:
            print("\n⚠️ IMPORTANT NOTE:")
            print("Some tests may have failed because the required Supabase tables don't exist yet.")
            print("To create the tables, run the SQL in /app/supabase_schema.sql in your Supabase SQL Editor.")
            print("Navigate to: https://supabase.com/dashboard → Your Project → SQL Editor")

if __name__ == "__main__":
    tester = BackendAPITester()
    tester.run_all_tests()