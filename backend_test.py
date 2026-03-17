import requests
import sys
from datetime import datetime

class MTRBookingHubTester:
    def __init__(self, base_url="https://agent-env-6592602e-0b4e-4c50-88b4-6ab626d48e85.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if method == 'GET' and response.status_code == 200:
                    try:
                        response_data = response.json()
                        if isinstance(response_data, list):
                            print(f"   Returned {len(response_data)} items")
                        elif isinstance(response_data, dict):
                            print(f"   Response keys: {list(response_data.keys())}")
                    except:
                        pass
            else:
                self.failed_tests.append({
                    'test': name,
                    'endpoint': endpoint,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200] if response.text else 'No response'
                })
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")

            return success, response.json() if response.content and response.status_code in [200, 201] else {}

        except Exception as e:
            self.failed_tests.append({
                'test': name,
                'endpoint': endpoint,
                'error': str(e)
            })
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        return success

    def test_admin_login(self):
        """Test admin login and get token"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/auth/login",
            200,
            data={"username": "admin", "password": "admin123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token obtained: {self.token[:50]}...")
            return True
        return False

    def test_room_types(self):
        """Test room types endpoint"""
        success, response = self.run_test(
            "Room Types",
            "GET",
            "api/room-types",
            200
        )
        return success

    def test_activity_types(self):
        """Test activity types endpoint"""
        success, response = self.run_test(
            "Activity Types",
            "GET",
            "api/activity-types",
            200
        )
        return success

    def test_bookings(self):
        """Test bookings endpoint"""
        success, response = self.run_test(
            "Bookings",
            "GET",
            "api/bookings",
            200
        )
        return success

    def test_safari_routes(self):
        """Test safari routes endpoint"""
        success, response = self.run_test(
            "Safari Routes",
            "GET",
            "api/safari-routes",
            200
        )
        return success

    def test_analytics(self):
        """Test analytics endpoint"""
        success, response = self.run_test(
            "Analytics",
            "GET",
            "api/analytics",
            200
        )
        return success

    def test_init_database(self):
        """Test database initialization endpoint"""
        success, response = self.run_test(
            "Initialize Database",
            "POST",
            "api/init-db",
            200
        )
        return success

def main():
    print("=== MTR BookingHub Backend API Testing ===")
    print(f"Started at: {datetime.now()}")
    
    # Setup
    tester = MTRBookingHubTester()

    # Run tests in order
    print("\n🚀 Starting Backend API Tests...")

    # Test health check first
    if not tester.test_health_check():
        print("❌ Health check failed, API might be down")
        
    # Initialize database with seed data
    if not tester.test_init_database():
        print("⚠️ Database initialization failed, some data might be missing")

    # Test admin login to get auth token
    if not tester.test_admin_login():
        print("❌ Admin login failed, skipping authenticated endpoints")
    
    # Test all public endpoints
    tester.test_room_types()
    tester.test_activity_types()  
    tester.test_bookings()
    tester.test_safari_routes()
    tester.test_analytics()

    # Print results
    print(f"\n📊 Backend API Test Results:")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests Details:")
        for failure in tester.failed_tests:
            print(f"  - {failure.get('test', 'Unknown')}: {failure}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"\nSuccess Rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())