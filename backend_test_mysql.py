#!/usr/bin/env python3
import requests
import json
import os
import sys
import uuid
from datetime import datetime
import time

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

# Main test class for MySQL Backend
class MySQLBackendTester:
    def __init__(self):
        self.backend_url = get_backend_url()
        if not self.backend_url:
            print("Error: Could not determine backend URL")
            sys.exit(1)
        
        self.api_url = f"{self.backend_url}/api"
        print(f"Using backend API URL: {self.api_url}")
        
        # Test user data with realistic information
        unique_id = str(uuid.uuid4())[:8]
        self.test_user = {
            "name": f"Maria Silva {unique_id}",
            "email": f"maria.silva.{unique_id}@gmail.com",
            "password": "MinhaSenh@123"
        }
        
        # Store test results for all endpoints
        self.results = {
            "health_check": False,
            "register": False,
            "login": False,
            "create_status": False,
            "get_status": False,
            "forgot_password": False,
            "validate_reset_token": False,
            "reset_password": False,
            "chat_ai": False,
            "chat_history": False,
            "save_workout": False,
            "get_workouts": False
        }
        
        # Store data for cross-test usage
        self.user_id = None
        self.reset_token = None
        self.session_id = str(uuid.uuid4())
    
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("\n=== Starting MySQL Backend API Tests ===\n")
        print(f"Testing user: {self.test_user['name']} ({self.test_user['email']})")
        
        # Test health check endpoint
        self.test_health_check()
        
        # Test user registration
        self.test_register()
        
        # Test user login
        self.test_login()
        
        # Test status operations
        self.test_create_status()
        self.test_get_status()
        
        # Test password reset flow
        self.test_forgot_password()
        if self.reset_token:
            self.test_validate_reset_token()
            self.test_reset_password()
        
        # Test chat AI functionality
        self.test_chat_ai()
        self.test_chat_history()
        
        # Test workout functionality
        self.test_save_workout()
        if self.user_id:
            self.test_get_workouts()
        
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
            print(f"Registering user: {self.test_user['name']} with email: {self.test_user['email']}")
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
                "client_name": f"Sistema Fitness - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
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
        except Exception as e:
            print(f"❌ Error testing get status checks: {e}")
    
    def test_forgot_password(self):
        """Test forgot password functionality"""
        print("\n--- Testing Forgot Password ---")
        try:
            forgot_data = {
                "email": self.test_user["email"]
            }
            print(f"Requesting password reset for: {forgot_data['email']}")
            
            response = requests.post(
                f"{self.api_url}/forgot-password",
                json=forgot_data
            )
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                if "reset_link" in data:
                    # Extract token from reset link
                    reset_link = data["reset_link"]
                    self.reset_token = reset_link.split("token=")[1] if "token=" in reset_link else None
                    print(f"✅ Forgot password successful. Reset token: {self.reset_token[:20]}...")
                    self.results["forgot_password"] = True
                else:
                    print("✅ Forgot password successful (no reset link in demo)")
                    self.results["forgot_password"] = True
            else:
                print(f"❌ Forgot password failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing forgot password: {e}")
    
    def test_validate_reset_token(self):
        """Test reset token validation"""
        print("\n--- Testing Reset Token Validation ---")
        try:
            if not self.reset_token:
                print("❌ No reset token available for validation")
                return
            
            response = requests.get(f"{self.api_url}/validate-reset-token/{self.reset_token}")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Token válido":
                    print("✅ Reset token validation successful")
                    self.results["validate_reset_token"] = True
                else:
                    print("❌ Reset token validation returned unexpected response")
            else:
                print(f"❌ Reset token validation failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing reset token validation: {e}")
    
    def test_reset_password(self):
        """Test password reset"""
        print("\n--- Testing Password Reset ---")
        try:
            if not self.reset_token:
                print("❌ No reset token available for password reset")
                return
            
            new_password = "NovaSenha@456"
            reset_data = {
                "token": self.reset_token,
                "new_password": new_password,
                "confirm_password": new_password
            }
            
            response = requests.post(
                f"{self.api_url}/reset-password",
                json=reset_data
            )
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Senha alterada com sucesso":
                    print("✅ Password reset successful")
                    self.results["reset_password"] = True
                    # Update test user password for future tests
                    self.test_user["password"] = new_password
                else:
                    print("❌ Password reset returned unexpected response")
            else:
                print(f"❌ Password reset failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing password reset: {e}")
    
    def test_chat_ai(self):
        """Test chat with AI"""
        print("\n--- Testing Chat AI ---")
        try:
            if not self.user_id:
                print("❌ No user ID available for chat test")
                return
            
            chat_data = {
                "session_id": self.session_id,
                "user_id": self.user_id,
                "message": "Olá! Preciso de ajuda para criar um treino de força para iniciantes."
            }
            print(f"Sending chat message: {chat_data['message']}")
            
            response = requests.post(
                f"{self.api_url}/chat",
                json=chat_data
            )
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                if "response" in data and "session_id" in data:
                    print("✅ Chat AI successful")
                    self.results["chat_ai"] = True
                else:
                    print("❌ Chat AI response missing expected fields")
            else:
                print(f"❌ Chat AI failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing chat AI: {e}")
    
    def test_chat_history(self):
        """Test getting chat history"""
        print("\n--- Testing Chat History ---")
        try:
            response = requests.get(f"{self.api_url}/chat/{self.session_id}")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Retrieved {len(data)} chat messages")
                print("✅ Chat history successful")
                self.results["chat_history"] = True
            else:
                print(f"❌ Chat history failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing chat history: {e}")
    
    def test_save_workout(self):
        """Test saving a workout"""
        print("\n--- Testing Save Workout ---")
        try:
            if not self.user_id:
                print("❌ No user ID available for workout test")
                return
            
            workout_data = {
                "user_id": self.user_id,
                "title": "Treino de Força - Iniciante",
                "category": "Força",
                "exercises": [
                    {
                        "name": "Agachamento",
                        "sets": 3,
                        "reps": 12,
                        "weight": "Peso corporal"
                    },
                    {
                        "name": "Flexão de braço",
                        "sets": 3,
                        "reps": 10,
                        "weight": "Peso corporal"
                    },
                    {
                        "name": "Prancha",
                        "sets": 3,
                        "reps": "30 segundos",
                        "weight": "Peso corporal"
                    }
                ],
                "duration": "45 minutos",
                "difficulty": "Iniciante",
                "created_by_ai": False
            }
            print(f"Saving workout: {workout_data['title']}")
            
            response = requests.post(
                f"{self.api_url}/workouts",
                json=workout_data
            )
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                if "workout_id" in data:
                    print("✅ Save workout successful")
                    self.results["save_workout"] = True
                else:
                    print("❌ Save workout response missing workout_id")
            else:
                print(f"❌ Save workout failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing save workout: {e}")
    
    def test_get_workouts(self):
        """Test getting user workouts"""
        print("\n--- Testing Get User Workouts ---")
        try:
            response = requests.get(f"{self.api_url}/workouts/{self.user_id}")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Retrieved {len(data)} workouts for user")
                print("✅ Get user workouts successful")
                self.results["get_workouts"] = True
            else:
                print(f"❌ Get user workouts failed with status code {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing get user workouts: {e}")
    
    def print_summary(self):
        """Print a summary of all test results"""
        print("\n=== MySQL Backend API Test Summary ===")
        
        passed_tests = 0
        total_tests = len(self.results)
        
        for test_name, result in self.results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name}: {status}")
            if result:
                passed_tests += 1
        
        print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
        
        if passed_tests == total_tests:
            print("🎉 All tests passed! MySQL migration is working correctly.")
        elif passed_tests >= total_tests * 0.8:
            print("⚠️ Most tests passed. Minor issues may need attention.")
        else:
            print("❌ Several tests failed. MySQL migration needs investigation.")

if __name__ == "__main__":
    tester = MySQLBackendTester()
    tester.run_all_tests()