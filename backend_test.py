#!/usr/bin/env python3
"""
Backend API Testing for Parth Gautam Foundation Citizen Super App
Tests all backend endpoints systematically
"""

import requests
import json
import sys
from datetime import datetime

# Backend configuration
BACKEND_URL = "https://welfare-hub-6.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.results = []
        
    def add_result(self, endpoint, status, message, response_data=None):
        result = {
            "endpoint": endpoint,
            "status": status,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.results.append(result)
        
        if status == "PASS":
            self.passed += 1
            print(f"✅ {endpoint}: {message}")
        else:
            self.failed += 1
            print(f"❌ {endpoint}: {message}")
            if response_data:
                print(f"   Response: {response_data}")
    
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Total Tests: {total}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Success Rate: {(self.passed/total)*100:.1f}%" if total > 0 else "No tests run")
        
        if self.failed > 0:
            print(f"\n{'='*60}")
            print(f"FAILED TESTS:")
            print(f"{'='*60}")
            for result in self.results:
                if result["status"] == "FAIL":
                    print(f"❌ {result['endpoint']}: {result['message']}")
        
        return self.failed == 0


def test_api_endpoint(method, endpoint, data=None, params=None, expected_status=200):
    """Generic API testing function"""
    url = f"{BACKEND_URL}{endpoint}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=HEADERS, params=params, timeout=30)
        elif method.upper() == "POST":
            response = requests.post(url, headers=HEADERS, json=data, params=params, timeout=30)
        else:
            return False, f"Unsupported method: {method}", None
            
        # Check if response is successful
        if response.status_code == expected_status:
            try:
                response_data = response.json()
                return True, f"Success - Status {response.status_code}", response_data
            except json.JSONDecodeError:
                return True, f"Success - Status {response.status_code} (non-JSON response)", response.text
        else:
            try:
                error_data = response.json()
                return False, f"Failed - Status {response.status_code}: {error_data.get('detail', 'Unknown error')}", error_data
            except json.JSONDecodeError:
                return False, f"Failed - Status {response.status_code}: {response.text}", response.text
                
    except requests.exceptions.Timeout:
        return False, "Request timeout", None
    except requests.exceptions.ConnectionError:
        return False, "Connection error - Backend might be down", None
    except Exception as e:
        return False, f"Unexpected error: {str(e)}", None


def run_backend_tests():
    """Run comprehensive backend API tests"""
    results = TestResults()
    
    print("🚀 Starting Parth Gautam Foundation Citizen Super App Backend Tests")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Timestamp: {datetime.now()}")
    print("="*80)
    
    # Global variables for cross-test data sharing
    user_id = None
    
    # Test 1: Seed Database
    print("\n📊 Testing Database Seeding...")
    success, message, response_data = test_api_endpoint("POST", "/seed")
    results.add_result("POST /api/seed", "PASS" if success else "FAIL", message, response_data)
    
    # Test 2: User Registration 
    print("\n👤 Testing User Registration...")
    user_data = {
        "phone": "9876543210",
        "name": "Test User",
        "age_group": "25-35",
        "ward": "12",
        "occupation": "Engineer",
        "interests": ["healthcare", "education"]
    }
    
    success, message, response_data = test_api_endpoint("POST", "/auth/register", data=user_data)
    
    # If user already exists, that's okay - try to get user via login instead
    if not success and "already registered" in message:
        results.add_result("POST /api/auth/register", "PASS", "User already exists (expected in some test runs)", response_data)
        print("   ✓ User already exists, will use existing user for subsequent tests")
    elif success and response_data:
        results.add_result("POST /api/auth/register", "PASS", message, response_data)
        user_id = response_data.get("id") or response_data.get("_id")
        citizen_id = response_data.get("citizen_id")
        if user_id and citizen_id:
            print(f"   ✓ User created with ID: {user_id}, Citizen ID: {citizen_id}")
        else:
            results.add_result("POST /api/auth/register", "FAIL", "User ID or Citizen ID missing from response", response_data)
    else:
        results.add_result("POST /api/auth/register", "FAIL", message, response_data)
    
    # Test 3: User Login
    print("\n🔐 Testing User Login...")
    # Try as query parameter  
    success, message, response_data = test_api_endpoint("POST", "/auth/login", params={"phone": "9876543210"})
    
    results.add_result("POST /api/auth/login", "PASS" if success else "FAIL", message, response_data)
    
    # Get user_id from login response if registration didn't provide it
    if success and response_data and not user_id:
        user_id = response_data.get("id") or response_data.get("_id")
        print(f"   ✓ Logged in user with ID: {user_id}")
    
    # Test 4: Get All Programs
    print("\n📋 Testing Get All Programs...")
    success, message, response_data = test_api_endpoint("GET", "/programs")
    results.add_result("GET /api/programs", "PASS" if success else "FAIL", message, response_data)
    
    if success and response_data:
        program_count = len(response_data)
        print(f"   ✓ Retrieved {program_count} programs")
    
    # Test 5: Get Healthcare Programs
    print("\n🏥 Testing Get Healthcare Programs...")
    success, message, response_data = test_api_endpoint("GET", "/programs", params={"category": "healthcare"})
    results.add_result("GET /api/programs?category=healthcare", "PASS" if success else "FAIL", message, response_data)
    
    if success and response_data:
        healthcare_count = len(response_data)
        print(f"   ✓ Retrieved {healthcare_count} healthcare programs")
    
    # Test 6: Get Community Updates
    print("\n📰 Testing Get Community Updates...")
    success, message, response_data = test_api_endpoint("GET", "/updates")
    results.add_result("GET /api/updates", "PASS" if success else "FAIL", message, response_data)
    
    if success and response_data:
        updates_count = len(response_data)
        print(f"   ✓ Retrieved {updates_count} community updates")
    
    # Test 7: Get User Suggestions (requires user_id)
    if user_id:
        print("\n💡 Testing Get User Suggestions...")
        success, message, response_data = test_api_endpoint("GET", f"/suggestions/{user_id}")
        results.add_result(f"GET /api/suggestions/{user_id}", "PASS" if success else "FAIL", message, response_data)
        
        if success and response_data:
            suggestions_count = len(response_data)
            print(f"   ✓ Retrieved {suggestions_count} suggestions for user")
    else:
        results.add_result("GET /api/suggestions/{user_id}", "FAIL", "Cannot test - no valid user_id from registration", None)
    
    # Test 8: AI Chat (requires user_id)
    if user_id:
        print("\n🤖 Testing AI Chat...")
        chat_data = {
            "user_id": user_id,
            "message": "Where can I get free health checkup?",
            "session_id": "test-session-123"
        }
        success, message, response_data = test_api_endpoint("POST", "/chat", data=chat_data)
        results.add_result("POST /api/chat", "PASS" if success else "FAIL", message, response_data)
        
        if success and response_data:
            chat_response = response_data.get("response", "")
            print(f"   ✓ AI responded with {len(chat_response)} characters")
    else:
        results.add_result("POST /api/chat", "FAIL", "Cannot test - no valid user_id from registration", None)
    
    # Test 9: Report Community Issue (requires user_id)
    if user_id:
        print("\n🚨 Testing Report Community Issue...")
        issue_data = {
            "user_id": user_id,
            "issue_type": "water",
            "description": "Low water pressure in Ward 12",
            "location": "Main Street, Ward 12",
            "ward": "12"
        }
        success, message, response_data = test_api_endpoint("POST", "/issues", data=issue_data)
        results.add_result("POST /api/issues", "PASS" if success else "FAIL", message, response_data)
        
        if success and response_data:
            issue_id = response_data.get("id") or response_data.get("_id")
            print(f"   ✓ Issue reported with ID: {issue_id}")
    else:
        results.add_result("POST /api/issues", "FAIL", "Cannot test - no valid user_id from registration", None)
    
    # Test 10: Test duplicate user registration (should fail)
    print("\n🔄 Testing Duplicate User Registration (should fail)...")
    success, message, response_data = test_api_endpoint("POST", "/auth/register", data=user_data, expected_status=400)
    results.add_result("POST /api/auth/register (duplicate)", "PASS" if success else "FAIL", message, response_data)
    
    # Final summary
    all_passed = results.summary()
    
    # Return exit code based on results
    return 0 if all_passed else 1


if __name__ == "__main__":
    exit_code = run_backend_tests()
    sys.exit(exit_code)