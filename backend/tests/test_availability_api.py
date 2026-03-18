"""
Backend API tests for Wildlife Reserve Booking System
Testing the real-time availability feature and related endpoints
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

# Use localhost for testing since nginx is configured
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001').rstrip('/')

# If PUBLIC URL fails, use localhost
if 'emergentagent.com' in BASE_URL:
    # Try public URL first, fallback to localhost
    try:
        r = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if r.status_code != 200:
            BASE_URL = 'http://localhost:8001'
    except:
        BASE_URL = 'http://localhost:8001'

class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_check(self):
        """Test basic health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "MTR BookingHub API"
        print("✓ Health check passed")


class TestAvailabilityAPI:
    """Tests for /api/check-availability endpoint"""
    
    def test_availability_valid_request(self):
        """Test availability check with valid dates"""
        payload = {
            "check_in_date": "2026-03-20",
            "check_out_date": "2026-03-22",
            "guests": 2,
            "booking_type": "both"
        }
        response = requests.post(f"{BASE_URL}/api/check-availability", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "check_in_date" in data
        assert "check_out_date" in data
        assert "guests" in data
        assert "booking_type" in data
        assert "total_nights" in data
        assert "locations" in data
        assert "safari_available" in data
        assert "safari_slots" in data
        
        # Verify data values
        assert data["check_in_date"] == "2026-03-20"
        assert data["check_out_date"] == "2026-03-22"
        assert data["guests"] == 2
        assert data["total_nights"] == 2
        
        # Verify locations data
        assert len(data["locations"]) == 25  # 25 locations in the system
        print(f"✓ Availability check returned {len(data['locations'])} locations")
    
    def test_availability_location_structure(self):
        """Test that location availability has correct structure"""
        payload = {
            "check_in_date": "2026-04-01",
            "check_out_date": "2026-04-03",
            "guests": 2,
            "booking_type": "rooms"
        }
        response = requests.post(f"{BASE_URL}/api/check-availability", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Check first location structure
        first_location = data["locations"][0]
        assert "location_id" in first_location
        assert "name" in first_location
        assert "region" in first_location
        assert "is_available" in first_location
        assert "availability_status" in first_location
        assert "available_units" in first_location
        assert "total_units" in first_location
        assert "price_per_night" in first_location
        assert "blocked_dates" in first_location
        
        # Verify availability_status is one of expected values
        valid_statuses = ["available", "limited", "fully_booked"]
        assert first_location["availability_status"] in valid_statuses
        print(f"✓ Location structure verified: {first_location['name']} - {first_location['availability_status']}")
    
    def test_availability_with_high_guests(self):
        """Test availability with high guest count - should show limited for small capacity rooms"""
        payload = {
            "check_in_date": "2026-05-01",
            "check_out_date": "2026-05-03",
            "guests": 10,
            "booking_type": "both"
        }
        response = requests.post(f"{BASE_URL}/api/check-availability", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Some locations should be limited or unavailable due to capacity
        limited_or_unavailable = [loc for loc in data["locations"] 
                                   if loc["availability_status"] in ["limited", "fully_booked"]]
        # Small capacity rooms should show as limited for 10 guests
        assert len(limited_or_unavailable) > 0, "Expected some locations to be unavailable for 10 guests"
        print(f"✓ High guest count test: {len(limited_or_unavailable)} locations limited/unavailable")
    
    def test_availability_invalid_date_format(self):
        """Test availability with invalid date format"""
        payload = {
            "check_in_date": "20-03-2026",  # Wrong format
            "check_out_date": "22-03-2026",
            "guests": 2,
            "booking_type": "both"
        }
        response = requests.post(f"{BASE_URL}/api/check-availability", json=payload)
        assert response.status_code == 400
        print("✓ Invalid date format correctly rejected")
    
    def test_availability_checkout_before_checkin(self):
        """Test availability with checkout before checkin"""
        payload = {
            "check_in_date": "2026-03-22",
            "check_out_date": "2026-03-20",  # Before check-in
            "guests": 2,
            "booking_type": "both"
        }
        response = requests.post(f"{BASE_URL}/api/check-availability", json=payload)
        assert response.status_code == 400
        print("✓ Checkout before checkin correctly rejected")
    
    def test_availability_safari_only(self):
        """Test availability for safari only booking type"""
        payload = {
            "check_in_date": "2026-06-01",
            "check_out_date": "2026-06-03",
            "guests": 4,
            "booking_type": "safari"
        }
        response = requests.post(f"{BASE_URL}/api/check-availability", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["booking_type"] == "safari"
        assert "safari_available" in data
        assert "safari_slots" in data
        assert isinstance(data["safari_slots"], int)
        print(f"✓ Safari availability: {data['safari_slots']} slots available")
    
    def test_availability_all_regions(self):
        """Test that all 5 regions are represented in availability response"""
        payload = {
            "check_in_date": "2026-07-01",
            "check_out_date": "2026-07-03",
            "guests": 2,
            "booking_type": "both"
        }
        response = requests.post(f"{BASE_URL}/api/check-availability", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify all 5 regions are present
        regions = set(loc["region"] for loc in data["locations"])
        expected_regions = {"theppakadu", "kargudi", "abhayaranyam", "masinagudi", "genepool"}
        assert regions == expected_regions, f"Missing regions: {expected_regions - regions}"
        print(f"✓ All 5 regions present: {regions}")


class TestRoomTypesAPI:
    """Tests for room types endpoint"""
    
    def test_get_room_types(self):
        """Test fetching room types"""
        response = requests.get(f"{BASE_URL}/api/room-types")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Verify structure
        first_room = data[0]
        assert "id" in first_room
        assert "name" in first_room
        assert "base_price" in first_room
        assert "max_capacity" in first_room
        print(f"✓ Room types: {len(data)} types available")


class TestActivityTypesAPI:
    """Tests for activity types endpoint"""
    
    def test_get_activity_types(self):
        """Test fetching activity types"""
        response = requests.get(f"{BASE_URL}/api/activity-types")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        
        first_activity = data[0]
        assert "id" in first_activity
        assert "name" in first_activity
        assert "base_price" in first_activity
        print(f"✓ Activity types: {len(data)} activities available")


class TestSafariRoutesAPI:
    """Tests for safari routes endpoint"""
    
    def test_get_safari_routes(self):
        """Test fetching safari routes"""
        response = requests.get(f"{BASE_URL}/api/safari-routes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Safari routes: {len(data)} routes available")


class TestBookingsAPI:
    """Tests for bookings endpoint"""
    
    def test_get_bookings(self):
        """Test fetching bookings list"""
        response = requests.get(f"{BASE_URL}/api/bookings")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Bookings: {len(data)} bookings in system")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
