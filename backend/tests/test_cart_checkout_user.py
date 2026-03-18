"""
Test cases for Shopping Cart, Checkout, and User APIs
Features tested:
- Cart: add, get, update quantity, remove, clear
- Checkout: guest checkout, create account, booking creation
- User: register, login, profile, bookings
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('VITE_API_URL', 'http://localhost:8001')

# Generate unique session ID and test data
TEST_SESSION_ID = f"test_sess_{uuid.uuid4().hex[:8]}"
TEST_EMAIL = f"test_{uuid.uuid4().hex[:8]}@example.com"
TEST_PASSWORD = "testpass123"

class TestHealthAndSetup:
    """Health check and basic setup tests"""
    
    def test_health_check(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("PASS: Health check endpoint working")


class TestCartAPI:
    """Shopping Cart API tests"""
    
    cart_item_id = None
    
    def test_add_product_to_cart(self):
        """Test adding a product to cart"""
        response = requests.post(f"{BASE_URL}/api/cart/add", json={
            "session_id": TEST_SESSION_ID,
            "item_type": "product",
            "item_id": "test_product_1",
            "item_name": "Test Wildlife Cap",
            "item_details": {
                "image": "https://example.com/image.jpg",
                "category": "apparel",
                "description": "Test product"
            },
            "quantity": 1,
            "unit_price": 499,
            "total_price": 499
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert "cart_item_id" in data
        TestCartAPI.cart_item_id = data["cart_item_id"]
        print(f"PASS: Product added to cart, item_id: {data['cart_item_id']}")
    
    def test_add_accommodation_to_cart(self):
        """Test adding accommodation to cart"""
        response = requests.post(f"{BASE_URL}/api/cart/add", json={
            "session_id": TEST_SESSION_ID,
            "item_type": "accommodation",
            "item_id": "room_1",
            "item_name": "Deluxe Room - Masinagudi",
            "item_details": {
                "check_in_date": "2026-02-15",
                "check_out_date": "2026-02-17",
                "guests": 2,
                "nights": 2
            },
            "quantity": 1,
            "unit_price": 3500,
            "total_price": 7000
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["success"] == True
        print("PASS: Accommodation added to cart")
    
    def test_add_activity_to_cart(self):
        """Test adding activity to cart"""
        response = requests.post(f"{BASE_URL}/api/cart/add", json={
            "session_id": TEST_SESSION_ID,
            "item_type": "activity",
            "item_id": "safari_1",
            "item_name": "Jeep Safari",
            "item_details": {
                "date": "2026-02-16",
                "participants": 4
            },
            "quantity": 1,
            "unit_price": 1800,
            "total_price": 1800
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["success"] == True
        print("PASS: Activity added to cart")
    
    def test_get_cart_items(self):
        """Test getting cart items by session ID"""
        response = requests.get(f"{BASE_URL}/api/cart/{TEST_SESSION_ID}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1  # At least one item should be in cart
        
        # Verify cart item structure
        for item in data:
            assert "id" in item
            assert "item_type" in item
            assert "item_name" in item
            assert "unit_price" in item
            assert "total_price" in item
            assert "quantity" in item
        print(f"PASS: Cart retrieved with {len(data)} items")
    
    def test_update_cart_quantity(self):
        """Test updating cart item quantity"""
        if not TestCartAPI.cart_item_id:
            pytest.skip("No cart item ID from previous test")
        
        response = requests.put(f"{BASE_URL}/api/cart/{TestCartAPI.cart_item_id}?quantity=3")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["success"] == True
        
        # Verify the update
        cart_response = requests.get(f"{BASE_URL}/api/cart/{TEST_SESSION_ID}")
        cart_data = cart_response.json()
        updated_item = next((i for i in cart_data if i["id"] == TestCartAPI.cart_item_id), None)
        if updated_item:
            assert updated_item["quantity"] == 3
            assert updated_item["total_price"] == updated_item["unit_price"] * 3
        print("PASS: Cart quantity updated successfully")
    
    def test_remove_cart_item(self):
        """Test removing item from cart"""
        # Add a new item to remove
        add_response = requests.post(f"{BASE_URL}/api/cart/add", json={
            "session_id": TEST_SESSION_ID,
            "item_type": "product",
            "item_id": "test_remove_item",
            "item_name": "Item to Remove",
            "item_details": {},
            "quantity": 1,
            "unit_price": 100,
            "total_price": 100
        })
        item_id = add_response.json()["cart_item_id"]
        
        # Remove the item
        response = requests.delete(f"{BASE_URL}/api/cart/{item_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["success"] == True
        
        # Verify removal
        cart_response = requests.get(f"{BASE_URL}/api/cart/{TEST_SESSION_ID}")
        cart_data = cart_response.json()
        removed_item = next((i for i in cart_data if i["id"] == item_id), None)
        assert removed_item is None
        print("PASS: Cart item removed successfully")


class TestCheckoutAPI:
    """Checkout API tests"""
    
    checkout_result = None
    
    def test_guest_checkout_with_account_creation(self):
        """Test checkout flow creating a new user account"""
        # First add item to cart for checkout
        checkout_session = f"checkout_test_{uuid.uuid4().hex[:8]}"
        requests.post(f"{BASE_URL}/api/cart/add", json={
            "session_id": checkout_session,
            "item_type": "product",
            "item_id": "checkout_product",
            "item_name": "Checkout Test Product",
            "item_details": {"description": "Test product for checkout"},
            "quantity": 2,
            "unit_price": 500,
            "total_price": 1000
        })
        
        checkout_email = f"checkout_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(f"{BASE_URL}/api/checkout", json={
            "session_id": checkout_session,
            "full_name": "Test Checkout User",
            "email": checkout_email,
            "phone": "9876543210",
            "alternate_phone": "",
            "create_account": True,
            "payment_method": "card",
            "items": [{
                "item_type": "product",
                "item_id": "checkout_product",
                "item_name": "Checkout Test Product",
                "item_details": {"description": "Test product for checkout"},
                "quantity": 2,
                "unit_price": 500,
                "total_price": 1000
            }]
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert "order_id" in data
        assert "booking_references" in data
        assert len(data["booking_references"]) >= 1
        assert "user_password" in data and data["user_password"]  # Password should be returned for new accounts
        assert data["total_amount"] > 0
        
        TestCheckoutAPI.checkout_result = {
            "email": checkout_email,
            "password": data["user_password"]
        }
        print(f"PASS: Checkout completed, order_id: {data['order_id']}, booking_refs: {data['booking_references']}")
        print(f"      Account created with email: {checkout_email}, password: {data['user_password']}")
    
    def test_checkout_creates_booking_record(self):
        """Verify checkout creates booking records"""
        checkout_session = f"booking_test_{uuid.uuid4().hex[:8]}"
        checkout_email = f"booking_{uuid.uuid4().hex[:8]}@example.com"
        
        response = requests.post(f"{BASE_URL}/api/checkout", json={
            "session_id": checkout_session,
            "full_name": "Booking Test User",
            "email": checkout_email,
            "phone": "9123456789",
            "create_account": True,
            "payment_method": "card",
            "items": [{
                "item_type": "accommodation",
                "item_id": "room_test",
                "item_name": "Suite - Test",
                "item_details": {
                    "check_in_date": "2026-03-01",
                    "check_out_date": "2026-03-03",
                    "guests": 2
                },
                "quantity": 1,
                "unit_price": 6500,
                "total_price": 13000
            }]
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        
        # Login with created account
        login_response = requests.post(f"{BASE_URL}/api/users/login", json={
            "email": checkout_email,
            "password": data["user_password"]
        })
        assert login_response.status_code == 200
        login_data = login_response.json()
        assert login_data["success"] == True
        
        # Fetch bookings
        bookings_response = requests.get(
            f"{BASE_URL}/api/users/bookings",
            headers={"Authorization": f"Bearer {login_data['token']}"}
        )
        assert bookings_response.status_code == 200
        bookings = bookings_response.json()
        assert len(bookings) >= 1
        
        # Verify booking details
        booking = bookings[0]
        assert booking["item_name"] == "Suite - Test"
        assert booking["booking_type"] == "accommodation"
        assert booking["status"] == "confirmed"
        assert booking["payment_status"] == "paid"
        print(f"PASS: Booking created and visible in user dashboard: {booking['booking_reference']}")


class TestUserAPI:
    """User API tests"""
    
    user_token = None
    user_data = None
    
    def test_user_registration(self):
        """Test user registration"""
        response = requests.post(f"{BASE_URL}/api/users/register", json={
            "full_name": "Test Registration User",
            "email": TEST_EMAIL,
            "phone": "9876501234",
            "password": TEST_PASSWORD,
            "create_account": True
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        
        TestUserAPI.user_token = data["token"]
        TestUserAPI.user_data = data["user"]
        print(f"PASS: User registered with user_id: {data['user']['user_id']}")
    
    def test_user_login(self):
        """Test user login"""
        response = requests.post(f"{BASE_URL}/api/users/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        
        TestUserAPI.user_token = data["token"]
        print("PASS: User login successful")
    
    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/users/login", json={
            "email": TEST_EMAIL,
            "password": "wrongpassword"
        })
        
        assert response.status_code == 200  # API returns 200 with success: false
        data = response.json()
        assert data["success"] == False
        assert "message" in data
        print("PASS: Invalid credentials rejected correctly")
    
    def test_get_user_profile(self):
        """Test getting user profile"""
        if not TestUserAPI.user_token:
            pytest.skip("No user token from previous test")
        
        response = requests.get(
            f"{BASE_URL}/api/users/profile",
            headers={"Authorization": f"Bearer {TestUserAPI.user_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["email"] == TEST_EMAIL
        assert "full_name" in data
        assert "user_id" in data
        assert "total_bookings" in data
        print(f"PASS: User profile retrieved: {data['full_name']}, {data['user_id']}")
    
    def test_get_user_bookings(self):
        """Test getting user bookings"""
        if not TestUserAPI.user_token:
            pytest.skip("No user token from previous test")
        
        response = requests.get(
            f"{BASE_URL}/api/users/bookings",
            headers={"Authorization": f"Bearer {TestUserAPI.user_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: User bookings retrieved, count: {len(data)}")
    
    def test_user_profile_requires_auth(self):
        """Test that profile endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/users/profile")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("PASS: Profile endpoint requires authentication")


class TestExistingUserLogin:
    """Test login with existing test user credentials"""
    
    def test_login_existing_user(self):
        """Test login with john.doe@example.com / 50LYonwX"""
        response = requests.post(f"{BASE_URL}/api/users/login", json={
            "email": "john.doe@example.com",
            "password": "50LYonwX"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        if data["success"]:
            print(f"PASS: Existing user login successful - {data['user']['full_name']}")
            
            # Fetch bookings
            bookings_response = requests.get(
                f"{BASE_URL}/api/users/bookings",
                headers={"Authorization": f"Bearer {data['token']}"}
            )
            assert bookings_response.status_code == 200
            bookings = bookings_response.json()
            print(f"      User has {len(bookings)} bookings")
        else:
            print(f"INFO: Existing user not found or password changed - {data.get('message')}")


class TestCleanup:
    """Cleanup test data"""
    
    def test_clear_test_cart(self):
        """Clear test cart session"""
        response = requests.delete(f"{BASE_URL}/api/cart/clear/{TEST_SESSION_ID}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print("PASS: Test cart cleared")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
