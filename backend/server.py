import os
import time
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from decimal import Decimal
import uuid

from fastapi import FastAPI, HTTPException, Depends, status, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, Column, String, Boolean, DateTime, Integer, Numeric, Text, ForeignKey, Date, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import cloudinary.utils

load_dotenv()

# Cloudinary Configuration
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True
)

# Database Configuration - Using SQLite for portability
DATABASE_PATH = os.environ.get("DATABASE_PATH", "/app/backend/mtr_bookinghub.db")
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET", "mtr_bookinghub_super_secret_jwt_key_2026")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", "24"))

# SQLAlchemy setup
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# FastAPI app
app = FastAPI(title="MTR BookingHub API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== DATABASE MODELS ====================

class AdminUser(Base):
    __tablename__ = "admin_users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    encrypted_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    last_login_at = Column(DateTime)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class RoomType(Base):
    __tablename__ = "room_types"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    base_price = Column(Numeric(10, 2), nullable=False)
    max_capacity = Column(Integer, default=2)
    amenities = Column(Text)  # JSON string
    image_url = Column(String(500))  # Main/featured image
    images = Column(Text)  # JSON array of image URLs for gallery
    location = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class ActivityType(Base):
    __tablename__ = "activity_types"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    duration = Column(String(50))
    base_price = Column(Numeric(10, 2), nullable=False)
    max_capacity = Column(Integer, default=10)
    location = Column(String(100))
    image_url = Column(String(500))  # Main/featured image
    images = Column(Text)  # JSON array of image URLs for gallery
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class SafariRoute(Base):
    __tablename__ = "safari_routes"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    short_name = Column(String(100))  # e.g., "Route 1", "Route 2"
    description = Column(Text)
    distance_km = Column(Numeric(5, 1))  # e.g., 20.5
    duration_hours = Column(Integer, default=1)  # 1 or 2 hours
    safari_type = Column(String(50))  # "1hr" or "2hr"
    route_color = Column(String(20), default="#FFFF00")  # Hex color for map
    price_per_person = Column(Numeric(10, 2), nullable=False)
    max_capacity = Column(Integer, default=6)
    coordinates = Column(Text)  # JSON array of [lng, lat] coordinates
    highlights = Column(Text)  # JSON array of highlight points
    image_url = Column(String(500))
    images = Column(Text)  # JSON array of image URLs
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class SafariSlot(Base):
    __tablename__ = "safari_slots"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    slot_time = Column(String(20), nullable=False)  # e.g., "06:30 AM"
    slot_period = Column(String(20), nullable=False)  # "Morning" or "Afternoon"
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_reference = Column(String(50), unique=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"))  # Link to user if account exists
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(20))
    booking_type = Column(String(50), nullable=False)  # accommodation, activity, product
    item_id = Column(String(36))
    item_name = Column(String(255), nullable=False)
    booking_date = Column(Date, nullable=False)
    check_in_date = Column(Date)
    check_out_date = Column(Date)
    guests_count = Column(Integer, default=1)
    amount = Column(Numeric(10, 2), nullable=False)
    gst_rate = Column(Numeric(5, 2), default=0)
    gst_amount = Column(Numeric(10, 2), default=0)
    net_amount = Column(Numeric(10, 2), default=0)
    status = Column(String(20), default="confirmed")  # confirmed, cancelled, completed, pending
    payment_status = Column(String(20), default="paid")  # paid, pending, refunded, partial_refund
    cancellation_date = Column(DateTime)
    cancellation_reason = Column(Text)
    refund_amount = Column(Numeric(10, 2), default=0)
    refund_status = Column(String(20))  # none, pending, processed, failed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"))
    transaction_type = Column(String(20), nullable=False)  # payment, refund
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(50))
    transaction_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String(20), default="completed")  # completed, pending, failed
    gst_rate = Column(Numeric(5, 2), default=0)
    gst_amount = Column(Numeric(10, 2), default=0)
    net_amount = Column(Numeric(10, 2), default=0)
    notes = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class RoomBlockedDate(Base):
    __tablename__ = "room_blocked_dates"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    room_type_id = Column(String(36), ForeignKey("room_types.id", ondelete="CASCADE"), nullable=False)
    location = Column(String(100), nullable=False)
    blocked_date = Column(Date, nullable=False)
    reason = Column(Text)
    created_by = Column(String(100))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ActivityBlockedDate(Base):
    __tablename__ = "activity_blocked_dates"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    activity_type_id = Column(String(36), ForeignKey("activity_types.id", ondelete="CASCADE"), nullable=False)
    location = Column(String(100), nullable=False)
    blocked_date = Column(Date, nullable=False)
    reason = Column(Text)
    created_by = Column(String(100))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SafariWaypoint(Base):
    __tablename__ = "safari_waypoints"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    route_id = Column(String(36), ForeignKey("safari_routes.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    time = Column(String(20), nullable=False)
    elevation = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    sequence_order = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class WildlifeZone(Base):
    __tablename__ = "wildlife_zones"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    coordinate_x = Column(Numeric(10, 2), nullable=False)
    coordinate_y = Column(Numeric(10, 2), nullable=False)
    species = Column(Text)  # JSON string
    probability = Column(String(20), nullable=False)  # Very High, High, Medium, Low
    season = Column(String(100), nullable=False)
    best_time = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    safety_tips = Column(Text)  # JSON string
    photo_tips = Column(Text)  # JSON string
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class IntegrationSetting(Base):
    __tablename__ = "integration_settings"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    setting_key = Column(String(100), unique=True, nullable=False)
    setting_value = Column(Text)
    is_enabled = Column(Boolean, default=False)
    description = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(20), unique=True, nullable=False)  # MTR2026001234 format
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20), nullable=False)
    encrypted_password = Column(String(255), nullable=False)
    alternate_phone = Column(String(20))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login_at = Column(DateTime)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(100), nullable=False)  # For guest users
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"))  # For logged in users
    item_type = Column(String(20), nullable=False)  # accommodation, activity, product
    item_id = Column(String(36))
    item_name = Column(String(255), nullable=False)
    item_details = Column(Text)  # JSON with all item specific details
    quantity = Column(Integer, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

# ==================== PYDANTIC MODELS ====================

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class AdminLoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    admin_id: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    message: Optional[str] = None

class RoomTypeResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    base_price: float
    max_capacity: int
    amenities: List[str]
    image_url: Optional[str]
    images: List[str] = []
    location: Optional[str]
    is_active: bool

class RoomTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    base_price: float
    max_capacity: int = 2
    amenities: List[str] = []
    image_url: Optional[str] = None
    images: List[str] = []
    location: Optional[str] = None
    is_active: bool = True

class ActivityTypeResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    duration: Optional[str]
    base_price: float
    max_capacity: int
    location: Optional[str]
    image_url: Optional[str]
    images: List[str] = []
    is_active: bool

class ActivityTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    duration: Optional[str] = None
    base_price: float
    max_capacity: int = 10
    location: Optional[str] = None
    image_url: Optional[str] = None
    images: List[str] = []
    is_active: bool = True

# Safari Route Models
class SafariRouteResponse(BaseModel):
    id: str
    name: str
    short_name: Optional[str]
    description: Optional[str]
    distance_km: float
    duration_hours: int
    safari_type: str
    route_color: str
    price_per_person: float
    max_capacity: int
    coordinates: List[List[float]]  # [[lng, lat], ...]
    highlights: List[str]
    image_url: Optional[str]
    images: List[str]
    is_active: bool
    display_order: int

class SafariRouteCreate(BaseModel):
    name: str
    short_name: Optional[str] = None
    description: Optional[str] = None
    distance_km: float = 0
    duration_hours: int = 1
    safari_type: str = "1hr"
    route_color: str = "#FFFF00"
    price_per_person: float
    max_capacity: int = 6
    coordinates: List[List[float]] = []
    highlights: List[str] = []
    image_url: Optional[str] = None
    images: List[str] = []
    is_active: bool = True
    display_order: int = 0

# Safari Slot Models
class SafariSlotResponse(BaseModel):
    id: str
    slot_time: str
    slot_period: str
    is_active: bool
    display_order: int

class SafariSlotCreate(BaseModel):
    slot_time: str
    slot_period: str
    is_active: bool = True
    display_order: int = 0

class BookingResponse(BaseModel):
    id: str
    booking_reference: str
    customer_name: str
    customer_email: str
    customer_phone: Optional[str]
    booking_type: str
    item_id: Optional[str]
    item_name: str
    booking_date: str
    check_in_date: Optional[str]
    check_out_date: Optional[str]
    guests_count: int
    amount: float
    gst_rate: float
    gst_amount: float
    net_amount: float
    status: str
    payment_status: str
    refund_amount: float
    refund_status: Optional[str]
    created_at: str

class BookingCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    booking_type: str
    item_id: Optional[str] = None
    item_name: str
    booking_date: str
    check_in_date: Optional[str] = None
    check_out_date: Optional[str] = None
    guests_count: int = 1
    amount: float
    gst_rate: float = 12.0

class WildlifeZoneResponse(BaseModel):
    id: str
    name: str
    coordinate_x: float
    coordinate_y: float
    species: List[str]
    probability: str
    season: str
    best_time: str
    description: str
    safety_tips: List[str]
    photo_tips: List[str]
    is_active: bool

class AnalyticsResponse(BaseModel):
    total_bookings: int
    total_revenue: float
    total_gst: float
    net_revenue: float
    bookings_by_type: dict
    bookings_by_status: dict
    recent_bookings: List[dict]

class AvailabilityCheckRequest(BaseModel):
    check_in_date: str
    check_out_date: str
    guests: int = 2
    booking_type: str = "both"  # rooms, safari, both

class LocationAvailability(BaseModel):
    location_id: str
    name: str
    region: str
    is_available: bool
    availability_status: str  # available, limited, fully_booked
    available_units: int
    total_units: int
    price_per_night: float
    blocked_dates: List[str] = []

class AvailabilityCheckResponse(BaseModel):
    check_in_date: str
    check_out_date: str
    guests: int
    booking_type: str
    total_nights: int
    locations: List[LocationAvailability]
    safari_available: bool
    safari_slots: int

# User-related Pydantic models
class UserRegisterRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    password: Optional[str] = None  # Auto-generated if not provided
    alternate_phone: Optional[str] = None
    create_account: bool = True

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    phone: str
    alternate_phone: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    pincode: Optional[str]
    is_verified: bool
    created_at: str
    total_bookings: int = 0
    upcoming_bookings: int = 0
    completed_bookings: int = 0

class UserLoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    user: Optional[UserResponse] = None
    message: Optional[str] = None

class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

class CartItemCreate(BaseModel):
    session_id: str
    item_type: str  # accommodation, activity, product
    item_id: Optional[str] = None
    item_name: str
    item_details: dict
    quantity: int = 1
    unit_price: float
    total_price: float

class CartItemResponse(BaseModel):
    id: str
    item_type: str
    item_id: Optional[str]
    item_name: str
    item_details: dict
    quantity: int
    unit_price: float
    total_price: float

class CheckoutRequest(BaseModel):
    session_id: str
    full_name: str
    email: str
    phone: str
    alternate_phone: Optional[str] = None
    create_account: bool = True
    payment_method: str = "card"
    items: List[dict]  # Cart items with all details

class CheckoutResponse(BaseModel):
    success: bool
    order_id: str
    booking_references: List[str]
    user_id: Optional[str] = None
    user_password: Optional[str] = None  # Only sent if new account created
    total_amount: float
    message: str

# ==================== HELPER FUNCTIONS ====================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def parse_json_field(value: str) -> List[str]:
    if not value:
        return []
    try:
        import json
        return json.loads(value)
    except:
        return []

def serialize_json_field(value: List[str]) -> str:
    import json
    return json.dumps(value)

def generate_booking_reference() -> str:
    import random
    year = datetime.now().year
    num = random.randint(1000, 9999)
    return f"BK-{year}-{num}"

def generate_user_id() -> str:
    import random
    year = datetime.now().year
    number = random.randint(100000, 999999)
    return f"MTR{year}{number}"

def generate_random_password(length: int = 8) -> str:
    import random
    import string
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

# ==================== API ENDPOINTS ====================

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "MTR BookingHub API"}

# Auth Endpoints
@app.post("/api/auth/login", response_model=AdminLoginResponse)
def admin_login(request: AdminLoginRequest, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(
        AdminUser.username == request.username,
        AdminUser.is_active == True
    ).first()
    
    if not admin or not verify_password(request.password, admin.encrypted_password):
        return AdminLoginResponse(success=False, message="Invalid username or password")
    
    admin.last_login_at = datetime.now(timezone.utc)
    db.commit()
    
    token = create_access_token({"sub": admin.id, "username": admin.username})
    
    return AdminLoginResponse(
        success=True,
        token=token,
        admin_id=admin.id,
        username=admin.username,
        email=admin.email,
        full_name=admin.full_name
    )

@app.get("/api/auth/verify")
def verify_auth(payload: dict = Depends(verify_token)):
    return {"valid": True, "user_id": payload.get("sub")}

# Cloudinary Image Upload Endpoints
@app.get("/api/cloudinary/signature")
def generate_cloudinary_signature(
    resource_type: str = Query("image", enum=["image", "video"]),
    folder: str = Query("mtr_uploads")
):
    """Generate a signed upload signature for Cloudinary"""
    ALLOWED_FOLDERS = ("mtr_uploads", "rooms", "safaris", "products", "users")
    
    # Validate folder
    folder_base = folder.split("/")[0] if "/" in folder else folder
    if folder_base not in ALLOWED_FOLDERS:
        raise HTTPException(status_code=400, detail=f"Invalid folder path. Allowed: {ALLOWED_FOLDERS}")
    
    timestamp = int(time.time())
    params = {
        "timestamp": timestamp,
        "folder": folder,
    }
    
    signature = cloudinary.utils.api_sign_request(
        params,
        os.environ.get("CLOUDINARY_API_SECRET")
    )
    
    return {
        "signature": signature,
        "timestamp": timestamp,
        "cloud_name": os.environ.get("CLOUDINARY_CLOUD_NAME"),
        "api_key": os.environ.get("CLOUDINARY_API_KEY"),
        "folder": folder,
        "resource_type": resource_type
    }

@app.delete("/api/cloudinary/delete")
def delete_cloudinary_image(
    public_id: str = Query(..., description="The public ID of the image to delete"),
    resource_type: str = Query("image", enum=["image", "video"]),
    payload: dict = Depends(verify_token)
):
    """Delete an image from Cloudinary (admin only)"""
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type=resource_type, invalidate=True)
        if result.get("result") == "ok":
            return {"success": True, "message": "Image deleted successfully"}
        else:
            return {"success": False, "message": "Image not found or already deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")

# Room Types Endpoints
@app.get("/api/room-types", response_model=List[RoomTypeResponse])
def get_room_types(active_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(RoomType)
    if active_only:
        query = query.filter(RoomType.is_active == True)
    rooms = query.all()
    return [
        RoomTypeResponse(
            id=r.id,
            name=r.name,
            description=r.description,
            base_price=float(r.base_price),
            max_capacity=r.max_capacity,
            amenities=parse_json_field(r.amenities),
            image_url=r.image_url,
            images=parse_json_field(r.images) if r.images else [],
            location=r.location,
            is_active=r.is_active
        ) for r in rooms
    ]

@app.post("/api/room-types", response_model=RoomTypeResponse)
def create_room_type(room: RoomTypeCreate, db: Session = Depends(get_db), _: dict = Depends(verify_token)):
    db_room = RoomType(
        name=room.name,
        description=room.description,
        base_price=room.base_price,
        max_capacity=room.max_capacity,
        amenities=serialize_json_field(room.amenities),
        image_url=room.image_url,
        images=serialize_json_field(room.images) if room.images else None,
        location=room.location,
        is_active=room.is_active
    )
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return RoomTypeResponse(
        id=db_room.id,
        name=db_room.name,
        description=db_room.description,
        base_price=float(db_room.base_price),
        max_capacity=db_room.max_capacity,
        amenities=parse_json_field(db_room.amenities),
        image_url=db_room.image_url,
        images=parse_json_field(db_room.images) if db_room.images else [],
        location=db_room.location,
        is_active=db_room.is_active
    )

@app.put("/api/room-types/{room_id}", response_model=RoomTypeResponse)
def update_room_type(room_id: str, room: RoomTypeCreate, db: Session = Depends(get_db), _: dict = Depends(verify_token)):
    db_room = db.query(RoomType).filter(RoomType.id == room_id).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room type not found")
    
    db_room.name = room.name
    db_room.description = room.description
    db_room.base_price = room.base_price
    db_room.max_capacity = room.max_capacity
    db_room.amenities = serialize_json_field(room.amenities)
    db_room.image_url = room.image_url
    db_room.images = serialize_json_field(room.images) if room.images else None
    db_room.location = room.location
    db_room.is_active = room.is_active
    db.commit()
    db.refresh(db_room)
    
    return RoomTypeResponse(
        id=db_room.id,
        name=db_room.name,
        description=db_room.description,
        base_price=float(db_room.base_price),
        max_capacity=db_room.max_capacity,
        amenities=parse_json_field(db_room.amenities),
        image_url=db_room.image_url,
        images=parse_json_field(db_room.images) if db_room.images else [],
        location=db_room.location,
        is_active=db_room.is_active
    )

@app.delete("/api/room-types/{room_id}")
def delete_room_type(room_id: str, db: Session = Depends(get_db), _: dict = Depends(verify_token)):
    db_room = db.query(RoomType).filter(RoomType.id == room_id).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room type not found")
    db.delete(db_room)
    db.commit()
    return {"success": True, "message": "Room type deleted"}

# Activity Types Endpoints
@app.get("/api/activity-types", response_model=List[ActivityTypeResponse])
def get_activity_types(active_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(ActivityType)
    if active_only:
        query = query.filter(ActivityType.is_active == True)
    activities = query.all()
    return [
        ActivityTypeResponse(
            id=a.id,
            name=a.name,
            description=a.description,
            duration=a.duration,
            base_price=float(a.base_price),
            max_capacity=a.max_capacity,
            location=a.location,
            image_url=a.image_url,
            images=parse_json_field(a.images) if a.images else [],
            is_active=a.is_active
        ) for a in activities
    ]

@app.post("/api/activity-types", response_model=ActivityTypeResponse)
def create_activity_type(activity: ActivityTypeCreate, db: Session = Depends(get_db), _: dict = Depends(verify_token)):
    db_activity = ActivityType(
        name=activity.name,
        description=activity.description,
        duration=activity.duration,
        base_price=activity.base_price,
        max_capacity=activity.max_capacity,
        location=activity.location,
        image_url=activity.image_url,
        images=serialize_json_field(activity.images) if activity.images else None,
        is_active=activity.is_active
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return ActivityTypeResponse(
        id=db_activity.id,
        name=db_activity.name,
        description=db_activity.description,
        duration=db_activity.duration,
        base_price=float(db_activity.base_price),
        max_capacity=db_activity.max_capacity,
        location=db_activity.location,
        image_url=db_activity.image_url,
        images=parse_json_field(db_activity.images) if db_activity.images else [],
        is_active=db_activity.is_active
    )

@app.put("/api/activity-types/{activity_id}", response_model=ActivityTypeResponse)
def update_activity_type(activity_id: str, activity: ActivityTypeCreate, db: Session = Depends(get_db), _: dict = Depends(verify_token)):
    db_activity = db.query(ActivityType).filter(ActivityType.id == activity_id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity type not found")
    
    db_activity.name = activity.name
    db_activity.description = activity.description
    db_activity.duration = activity.duration
    db_activity.base_price = activity.base_price
    db_activity.max_capacity = activity.max_capacity
    db_activity.location = activity.location
    db_activity.image_url = activity.image_url
    db_activity.images = serialize_json_field(activity.images) if activity.images else None
    db_activity.is_active = activity.is_active
    db.commit()
    db.refresh(db_activity)
    
    return ActivityTypeResponse(
        id=db_activity.id,
        name=db_activity.name,
        description=db_activity.description,
        duration=db_activity.duration,
        base_price=float(db_activity.base_price),
        max_capacity=db_activity.max_capacity,
        location=db_activity.location,
        image_url=db_activity.image_url,
        images=parse_json_field(db_activity.images) if db_activity.images else [],
        is_active=db_activity.is_active
    )

@app.delete("/api/activity-types/{activity_id}")
def delete_activity_type(activity_id: str, db: Session = Depends(get_db), _: dict = Depends(verify_token)):
    db_activity = db.query(ActivityType).filter(ActivityType.id == activity_id).first()
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity type not found")
    db.delete(db_activity)
    db.commit()
    return {"success": True, "message": "Activity type deleted"}

# Safari Routes Endpoints
@app.get("/api/safari-routes", response_model=List[SafariRouteResponse])
def get_safari_routes(active_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(SafariRoute)
    if active_only:
        query = query.filter(SafariRoute.is_active == True)
    routes = query.order_by(SafariRoute.display_order).all()
    return [
        SafariRouteResponse(
            id=r.id,
            name=r.name,
            short_name=r.short_name,
            description=r.description,
            distance_km=float(r.distance_km) if r.distance_km else 0,
            duration_hours=r.duration_hours,
            safari_type=r.safari_type,
            route_color=r.route_color,
            price_per_person=float(r.price_per_person),
            max_capacity=r.max_capacity,
            coordinates=parse_json_field(r.coordinates) if r.coordinates else [],
            highlights=parse_json_field(r.highlights) if r.highlights else [],
            image_url=r.image_url,
            images=parse_json_field(r.images) if r.images else [],
            is_active=r.is_active,
            display_order=r.display_order
        ) for r in routes
    ]

@app.get("/api/safari-routes/{route_id}", response_model=SafariRouteResponse)
def get_safari_route(route_id: str, db: Session = Depends(get_db)):
    route = db.query(SafariRoute).filter(SafariRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Safari route not found")
    return SafariRouteResponse(
        id=route.id,
        name=route.name,
        short_name=route.short_name,
        description=route.description,
        distance_km=float(route.distance_km) if route.distance_km else 0,
        duration_hours=route.duration_hours,
        safari_type=route.safari_type,
        route_color=route.route_color,
        price_per_person=float(route.price_per_person),
        max_capacity=route.max_capacity,
        coordinates=parse_json_field(route.coordinates) if route.coordinates else [],
        highlights=parse_json_field(route.highlights) if route.highlights else [],
        image_url=route.image_url,
        images=parse_json_field(route.images) if route.images else [],
        is_active=route.is_active,
        display_order=route.display_order
    )

@app.post("/api/safari-routes", response_model=SafariRouteResponse)
def create_safari_route(route: SafariRouteCreate, db: Session = Depends(get_db), _: dict = Depends(verify_token)):
    db_route = SafariRoute(
        name=route.name,
        short_name=route.short_name,
        description=route.description,
        distance_km=route.distance_km,
        duration_hours=route.duration_hours,
        safari_type=route.safari_type,
        route_color=route.route_color,
        price_per_person=route.price_per_person,
        max_capacity=route.max_capacity,
        coordinates=serialize_json_field(route.coordinates),
        highlights=serialize_json_field(route.highlights),
        image_url=route.image_url,
        images=serialize_json_field(route.images) if route.images else None,
        is_active=route.is_active,
        display_order=route.display_order
    )
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return SafariRouteResponse(
        id=db_route.id,
        name=db_route.name,
        short_name=db_route.short_name,
        description=db_route.description,
        distance_km=float(db_route.distance_km) if db_route.distance_km else 0,
        duration_hours=db_route.duration_hours,
        safari_type=db_route.safari_type,
        route_color=db_route.route_color,
        price_per_person=float(db_route.price_per_person),
        max_capacity=db_route.max_capacity,
        coordinates=parse_json_field(db_route.coordinates) if db_route.coordinates else [],
        highlights=parse_json_field(db_route.highlights) if db_route.highlights else [],
        image_url=db_route.image_url,
        images=parse_json_field(db_route.images) if db_route.images else [],
        is_active=db_route.is_active,
        display_order=db_route.display_order
    )

@app.put("/api/safari-routes/{route_id}", response_model=SafariRouteResponse)
def update_safari_route(route_id: str, route: SafariRouteCreate, db: Session = Depends(get_db), _: dict = Depends(verify_token)):
    db_route = db.query(SafariRoute).filter(SafariRoute.id == route_id).first()
    if not db_route:
        raise HTTPException(status_code=404, detail="Safari route not found")
    
    db_route.name = route.name
    db_route.short_name = route.short_name
    db_route.description = route.description
    db_route.distance_km = route.distance_km
    db_route.duration_hours = route.duration_hours
    db_route.safari_type = route.safari_type
    db_route.route_color = route.route_color
    db_route.price_per_person = route.price_per_person
    db_route.max_capacity = route.max_capacity
    db_route.coordinates = serialize_json_field(route.coordinates)
    db_route.highlights = serialize_json_field(route.highlights)
    db_route.image_url = route.image_url
    db_route.images = serialize_json_field(route.images) if route.images else None
    db_route.is_active = route.is_active
    db_route.display_order = route.display_order
    db.commit()
    db.refresh(db_route)
    
    return SafariRouteResponse(
        id=db_route.id,
        name=db_route.name,
        short_name=db_route.short_name,
        description=db_route.description,
        distance_km=float(db_route.distance_km) if db_route.distance_km else 0,
        duration_hours=db_route.duration_hours,
        safari_type=db_route.safari_type,
        route_color=db_route.route_color,
        price_per_person=float(db_route.price_per_person),
        max_capacity=db_route.max_capacity,
        coordinates=parse_json_field(db_route.coordinates) if db_route.coordinates else [],
        highlights=parse_json_field(db_route.highlights) if db_route.highlights else [],
        image_url=db_route.image_url,
        images=parse_json_field(db_route.images) if db_route.images else [],
        is_active=db_route.is_active,
        display_order=db_route.display_order
    )

@app.delete("/api/safari-routes/{route_id}")
def delete_safari_route(route_id: str, db: Session = Depends(get_db), _: dict = Depends(verify_token)):
    db_route = db.query(SafariRoute).filter(SafariRoute.id == route_id).first()
    if not db_route:
        raise HTTPException(status_code=404, detail="Safari route not found")
    db.delete(db_route)
    db.commit()
    return {"success": True, "message": "Safari route deleted"}

# Safari Slots Endpoints
@app.get("/api/safari-slots", response_model=List[SafariSlotResponse])
def get_safari_slots(active_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(SafariSlot)
    if active_only:
        query = query.filter(SafariSlot.is_active == True)
    slots = query.order_by(SafariSlot.display_order).all()
    return [
        SafariSlotResponse(
            id=s.id,
            slot_time=s.slot_time,
            slot_period=s.slot_period,
            is_active=s.is_active,
            display_order=s.display_order
        ) for s in slots
    ]

@app.post("/api/safari-slots", response_model=SafariSlotResponse)
def create_safari_slot(slot: SafariSlotCreate, db: Session = Depends(get_db), _: dict = Depends(verify_token)):
    db_slot = SafariSlot(
        slot_time=slot.slot_time,
        slot_period=slot.slot_period,
        is_active=slot.is_active,
        display_order=slot.display_order
    )
    db.add(db_slot)
    db.commit()
    db.refresh(db_slot)
    return SafariSlotResponse(
        id=db_slot.id,
        slot_time=db_slot.slot_time,
        slot_period=db_slot.slot_period,
        is_active=db_slot.is_active,
        display_order=db_slot.display_order
    )

@app.put("/api/safari-slots/{slot_id}", response_model=SafariSlotResponse)
def update_safari_slot(slot_id: str, slot: SafariSlotCreate, db: Session = Depends(get_db), _: dict = Depends(verify_token)):
    db_slot = db.query(SafariSlot).filter(SafariSlot.id == slot_id).first()
    if not db_slot:
        raise HTTPException(status_code=404, detail="Safari slot not found")
    db_slot.slot_time = slot.slot_time
    db_slot.slot_period = slot.slot_period
    db_slot.is_active = slot.is_active
    db_slot.display_order = slot.display_order
    db.commit()
    db.refresh(db_slot)
    return SafariSlotResponse(
        id=db_slot.id,
        slot_time=db_slot.slot_time,
        slot_period=db_slot.slot_period,
        is_active=db_slot.is_active,
        display_order=db_slot.display_order
    )

@app.delete("/api/safari-slots/{slot_id}")
def delete_safari_slot(slot_id: str, db: Session = Depends(get_db), _: dict = Depends(verify_token)):
    db_slot = db.query(SafariSlot).filter(SafariSlot.id == slot_id).first()
    if not db_slot:
        raise HTTPException(status_code=404, detail="Safari slot not found")
    db.delete(db_slot)
    db.commit()
    return {"success": True, "message": "Safari slot deleted"}

# Bookings Endpoints
@app.get("/api/bookings", response_model=List[BookingResponse])
def get_bookings(
    status: Optional[str] = None,
    booking_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.status == status)
    if booking_type:
        query = query.filter(Booking.booking_type == booking_type)
    bookings = query.order_by(Booking.created_at.desc()).all()
    
    return [
        BookingResponse(
            id=b.id,
            booking_reference=b.booking_reference,
            customer_name=b.customer_name,
            customer_email=b.customer_email,
            customer_phone=b.customer_phone,
            booking_type=b.booking_type,
            item_id=b.item_id,
            item_name=b.item_name,
            booking_date=str(b.booking_date),
            check_in_date=str(b.check_in_date) if b.check_in_date else None,
            check_out_date=str(b.check_out_date) if b.check_out_date else None,
            guests_count=b.guests_count,
            amount=float(b.amount),
            gst_rate=float(b.gst_rate) if b.gst_rate else 0,
            gst_amount=float(b.gst_amount) if b.gst_amount else 0,
            net_amount=float(b.net_amount) if b.net_amount else 0,
            status=b.status,
            payment_status=b.payment_status,
            refund_amount=float(b.refund_amount) if b.refund_amount else 0,
            refund_status=b.refund_status,
            created_at=str(b.created_at)
        ) for b in bookings
    ]

@app.post("/api/bookings", response_model=BookingResponse)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    gst_amount = round(booking.amount * booking.gst_rate / (100 + booking.gst_rate), 2)
    net_amount = round(booking.amount - gst_amount, 2)
    
    db_booking = Booking(
        booking_reference=generate_booking_reference(),
        customer_name=booking.customer_name,
        customer_email=booking.customer_email,
        customer_phone=booking.customer_phone,
        booking_type=booking.booking_type,
        item_id=booking.item_id,
        item_name=booking.item_name,
        booking_date=datetime.strptime(booking.booking_date, "%Y-%m-%d").date(),
        check_in_date=datetime.strptime(booking.check_in_date, "%Y-%m-%d").date() if booking.check_in_date else None,
        check_out_date=datetime.strptime(booking.check_out_date, "%Y-%m-%d").date() if booking.check_out_date else None,
        guests_count=booking.guests_count,
        amount=booking.amount,
        gst_rate=booking.gst_rate,
        gst_amount=gst_amount,
        net_amount=net_amount,
        status="confirmed",
        payment_status="paid",
        refund_status="none"
    )
    db.add(db_booking)
    
    # Create transaction record
    db_transaction = Transaction(
        booking_id=db_booking.id,
        transaction_type="payment",
        amount=booking.amount,
        payment_method="online",
        status="completed",
        gst_rate=booking.gst_rate,
        gst_amount=gst_amount,
        net_amount=net_amount
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_booking)
    
    return BookingResponse(
        id=db_booking.id,
        booking_reference=db_booking.booking_reference,
        customer_name=db_booking.customer_name,
        customer_email=db_booking.customer_email,
        customer_phone=db_booking.customer_phone,
        booking_type=db_booking.booking_type,
        item_id=db_booking.item_id,
        item_name=db_booking.item_name,
        booking_date=str(db_booking.booking_date),
        check_in_date=str(db_booking.check_in_date) if db_booking.check_in_date else None,
        check_out_date=str(db_booking.check_out_date) if db_booking.check_out_date else None,
        guests_count=db_booking.guests_count,
        amount=float(db_booking.amount),
        gst_rate=float(db_booking.gst_rate),
        gst_amount=float(db_booking.gst_amount),
        net_amount=float(db_booking.net_amount),
        status=db_booking.status,
        payment_status=db_booking.payment_status,
        refund_amount=0,
        refund_status=db_booking.refund_status,
        created_at=str(db_booking.created_at)
    )

@app.put("/api/bookings/{booking_id}/cancel")
def cancel_booking(booking_id: str, reason: str = "", db: Session = Depends(get_db), _: dict = Depends(verify_token)):
    db_booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    refund_amount = float(db_booking.amount) * 0.9
    
    db_booking.status = "cancelled"
    db_booking.payment_status = "refunded"
    db_booking.cancellation_date = datetime.now(timezone.utc)
    db_booking.cancellation_reason = reason
    db_booking.refund_amount = refund_amount
    db_booking.refund_status = "processed"
    
    # Create refund transaction
    db_transaction = Transaction(
        booking_id=db_booking.id,
        transaction_type="refund",
        amount=-refund_amount,
        payment_method="online",
        status="completed",
        notes=reason
    )
    db.add(db_transaction)
    db.commit()
    
    return {"success": True, "message": "Booking cancelled", "refund_amount": refund_amount}

# Availability Check Endpoint
@app.post("/api/check-availability", response_model=AvailabilityCheckResponse)
def check_availability(request: AvailabilityCheckRequest, db: Session = Depends(get_db)):
    """
    Check availability for accommodations and safari based on date range and booking type.
    Returns availability status for all locations with visual indicators.
    """
    try:
        check_in = datetime.strptime(request.check_in_date, "%Y-%m-%d").date()
        check_out = datetime.strptime(request.check_out_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    if check_out <= check_in:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")
    
    total_nights = (check_out - check_in).days
    
    # Define all accommodation locations from the KML data
    all_locations = [
        # Theppakadu region
        {"id": "tiger-tusker", "name": "Tiger & Tusker Suite", "region": "theppakadu", "price": 8500, "total_units": 2, "capacity": 4},
        {"id": "theppakadu-dorm", "name": "Theppakadu Dormitory", "region": "theppakadu", "price": 800, "total_units": 5, "capacity": 6},
        {"id": "theppakadu-log", "name": "Theppakadu Log House", "region": "theppakadu", "price": 4500, "total_units": 3, "capacity": 3},
        {"id": "minivet-dorm", "name": "Minivet Dormitory", "region": "theppakadu", "price": 800, "total_units": 2, "capacity": 8},
        {"id": "sylvan-log", "name": "Sylvan Lodge", "region": "theppakadu", "price": 5200, "total_units": 5, "capacity": 4},
        # Kargudi region
        {"id": "peacock-dorm", "name": "Peacock Dormitory", "region": "kargudi", "price": 700, "total_units": 1, "capacity": 10},
        {"id": "cuckoo-frh", "name": "Cuckoo Forest Rest House", "region": "kargudi", "price": 3500, "total_units": 1, "capacity": 2},
        # Abhayaranyam region
        {"id": "dhole-sambar", "name": "Dhole Sambar Chital", "region": "abhayaranyam", "price": 4200, "total_units": 1, "capacity": 3},
        {"id": "abhayaranyam-annexe", "name": "Abhayaranyam Annexe 1 & 2", "region": "abhayaranyam", "price": 3800, "total_units": 2, "capacity": 2},
        # Masinagudi region
        {"id": "maravakandi", "name": "Maravakandi View 1 & 2", "region": "masinagudi", "price": 6500, "total_units": 2, "capacity": 4},
        {"id": "masinagudi-rh", "name": "Masinagudi Rest House", "region": "masinagudi", "price": 4500, "total_units": 1, "capacity": 2},
        {"id": "masinagudi-log", "name": "Masinagudi Log House", "region": "masinagudi", "price": 5500, "total_units": 1, "capacity": 3},
        {"id": "trekking-shed", "name": "Trekking Shed 1 & 2", "region": "masinagudi", "price": 600, "total_units": 2, "capacity": 8},
        # Genepool region
        {"id": "amaravathy", "name": "Amaravathy", "region": "genepool", "price": 3200, "total_units": 1, "capacity": 2},
        {"id": "mayor", "name": "Mayor", "region": "genepool", "price": 3200, "total_units": 1, "capacity": 2},
        {"id": "bhavani", "name": "Bhavani", "region": "genepool", "price": 3200, "total_units": 1, "capacity": 2},
        {"id": "hornbill", "name": "Hornbill", "region": "genepool", "price": 3800, "total_units": 1, "capacity": 2},
        {"id": "panther", "name": "Panther", "region": "genepool", "price": 4000, "total_units": 1, "capacity": 2},
        {"id": "nilgiri-tahr-1", "name": "Nilgiri Tahr 1", "region": "genepool", "price": 3500, "total_units": 1, "capacity": 2},
        {"id": "nilgiri-tahr-2", "name": "Nilgiri Tahr 2", "region": "genepool", "price": 3500, "total_units": 1, "capacity": 2},
        {"id": "rosewood-1", "name": "Rosewood 1", "region": "genepool", "price": 3500, "total_units": 1, "capacity": 2},
        {"id": "rosewood-2", "name": "Rosewood 2", "region": "genepool", "price": 3500, "total_units": 1, "capacity": 2},
        {"id": "trekking-shed-gp", "name": "Genepool Trekking Shed", "region": "genepool", "price": 500, "total_units": 1, "capacity": 10},
        {"id": "thamirabarani", "name": "Thamirabarani", "region": "genepool", "price": 3200, "total_units": 1, "capacity": 2},
        {"id": "vaigai", "name": "Vaigai", "region": "genepool", "price": 3200, "total_units": 1, "capacity": 2},
    ]
    
    locations_availability = []
    
    for loc in all_locations:
        # Check for blocked dates
        blocked_dates_query = db.query(RoomBlockedDate).filter(
            RoomBlockedDate.location == loc["id"],
            RoomBlockedDate.blocked_date >= check_in,
            RoomBlockedDate.blocked_date < check_out
        ).all()
        blocked_dates = [str(bd.blocked_date) for bd in blocked_dates_query]
        
        # Check existing bookings for this location
        existing_bookings = db.query(Booking).filter(
            Booking.item_id == loc["id"],
            Booking.status.in_(["confirmed", "pending"]),
            Booking.check_in_date < check_out,
            Booking.check_out_date > check_in
        ).count()
        
        available_units = max(0, loc["total_units"] - existing_bookings)
        
        # Check if capacity meets guest requirements
        capacity_ok = loc["capacity"] >= request.guests
        
        # Determine availability status
        if len(blocked_dates) > 0:
            availability_status = "fully_booked"
            is_available = False
        elif available_units == 0:
            availability_status = "fully_booked"
            is_available = False
        elif not capacity_ok:
            availability_status = "limited"
            is_available = False
        elif available_units < loc["total_units"]:
            availability_status = "limited"
            is_available = True
        else:
            availability_status = "available"
            is_available = True
        
        locations_availability.append(LocationAvailability(
            location_id=loc["id"],
            name=loc["name"],
            region=loc["region"],
            is_available=is_available,
            availability_status=availability_status,
            available_units=available_units,
            total_units=loc["total_units"],
            price_per_night=float(loc["price"]),
            blocked_dates=blocked_dates
        ))
    
    # Check safari availability (simplified - assuming 20 slots per day)
    safari_slots = 20
    for day_offset in range(total_nights):
        date = check_in + timedelta(days=day_offset)
        safari_bookings = db.query(Booking).filter(
            Booking.booking_type == "activity",
            Booking.booking_date == date,
            Booking.status.in_(["confirmed", "pending"])
        ).count()
        safari_slots = min(safari_slots, 20 - safari_bookings)
    
    safari_available = safari_slots >= request.guests if request.booking_type in ["safari", "both"] else True
    
    return AvailabilityCheckResponse(
        check_in_date=request.check_in_date,
        check_out_date=request.check_out_date,
        guests=request.guests,
        booking_type=request.booking_type,
        total_nights=total_nights,
        locations=locations_availability,
        safari_available=safari_available,
        safari_slots=max(0, safari_slots)
    )

# Wildlife Zones Endpoints
@app.get("/api/wildlife-zones", response_model=List[WildlifeZoneResponse])
def get_wildlife_zones(active_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(WildlifeZone)
    if active_only:
        query = query.filter(WildlifeZone.is_active == True)
    zones = query.all()
    return [
        WildlifeZoneResponse(
            id=z.id,
            name=z.name,
            coordinate_x=float(z.coordinate_x),
            coordinate_y=float(z.coordinate_y),
            species=parse_json_field(z.species),
            probability=z.probability,
            season=z.season,
            best_time=z.best_time,
            description=z.description,
            safety_tips=parse_json_field(z.safety_tips),
            photo_tips=parse_json_field(z.photo_tips),
            is_active=z.is_active
        ) for z in zones
    ]

# Analytics Endpoint
@app.get("/api/analytics", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    bookings = db.query(Booking).all()
    
    total_revenue = sum(float(b.amount) for b in bookings if b.status != "cancelled")
    total_gst = sum(float(b.gst_amount) if b.gst_amount else 0 for b in bookings if b.status != "cancelled")
    net_revenue = total_revenue - total_gst
    
    bookings_by_type = {}
    for b in bookings:
        if b.booking_type not in bookings_by_type:
            bookings_by_type[b.booking_type] = {"count": 0, "revenue": 0}
        bookings_by_type[b.booking_type]["count"] += 1
        if b.status != "cancelled":
            bookings_by_type[b.booking_type]["revenue"] += float(b.amount)
    
    bookings_by_status = {}
    for b in bookings:
        if b.status not in bookings_by_status:
            bookings_by_status[b.status] = 0
        bookings_by_status[b.status] += 1
    
    recent_bookings = [
        {
            "id": b.id,
            "booking_reference": b.booking_reference,
            "customer_name": b.customer_name,
            "item_name": b.item_name,
            "amount": float(b.amount),
            "status": b.status,
            "created_at": str(b.created_at)
        } for b in sorted(bookings, key=lambda x: x.created_at, reverse=True)[:10]
    ]
    
    return AnalyticsResponse(
        total_bookings=len(bookings),
        total_revenue=total_revenue,
        total_gst=total_gst,
        net_revenue=net_revenue,
        bookings_by_type=bookings_by_type,
        bookings_by_status=bookings_by_status,
        recent_bookings=recent_bookings
    )

# Integration Settings Endpoints
@app.get("/api/integration-settings")
def get_integration_settings(db: Session = Depends(get_db), _: dict = Depends(verify_token)):
    settings = db.query(IntegrationSetting).all()
    return [
        {
            "id": s.id,
            "setting_key": s.setting_key,
            "setting_value": s.setting_value,
            "is_enabled": s.is_enabled,
            "description": s.description
        } for s in settings
    ]

@app.put("/api/integration-settings/{setting_key}")
def update_integration_setting(
    setting_key: str,
    value: str,
    is_enabled: bool,
    db: Session = Depends(get_db),
    _: dict = Depends(verify_token)
):
    setting = db.query(IntegrationSetting).filter(IntegrationSetting.setting_key == setting_key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    setting.setting_value = value
    setting.is_enabled = is_enabled
    db.commit()
    return {"success": True, "message": "Setting updated"}

# Database initialization endpoint (for seeding)
@app.post("/api/init-db")
def init_database(db: Session = Depends(get_db)):
    Base.metadata.create_all(bind=engine)
    
    # Check if admin already exists
    existing_admin = db.query(AdminUser).filter(AdminUser.username == "admin").first()
    if not existing_admin:
        admin = AdminUser(
            username="admin",
            email="admin@mudumalai.gov.in",
            encrypted_password=hash_password("admin123"),
            full_name="System Administrator",
            is_active=True
        )
        db.add(admin)
    
    # Seed room types
    room_types_data = [
        {"name": "Deluxe Room", "description": "Spacious room with modern amenities and forest view", "base_price": 3500.00, "max_capacity": 2, "amenities": '["WiFi", "AC", "TV", "Mini Bar", "Balcony"]', "image_url": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800", "location": "Masinagudi"},
        {"name": "Suite", "description": "Luxurious suite with separate living area and premium facilities", "base_price": 6500.00, "max_capacity": 4, "amenities": '["WiFi", "AC", "TV", "Mini Bar", "Jacuzzi", "Living Room", "Balcony"]', "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800", "location": "Thepakadu"},
        {"name": "Cottage", "description": "Private cottage surrounded by nature with rustic charm", "base_price": 4800.00, "max_capacity": 3, "amenities": '["WiFi", "AC", "Fireplace", "Kitchen", "Garden"]', "image_url": "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800", "location": "Gudalur"},
        {"name": "Dormitory", "description": "Budget-friendly shared accommodation for groups", "base_price": 800.00, "max_capacity": 6, "amenities": '["WiFi", "Shared Bathroom", "Lockers"]', "image_url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800", "location": "Thepakadu"},
        {"name": "Family Room", "description": "Spacious room perfect for families with children", "base_price": 5200.00, "max_capacity": 5, "amenities": '["WiFi", "AC", "TV", "Mini Bar", "Extra Beds", "Play Area"]', "image_url": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800", "location": "Masinagudi"},
    ]
    for rt in room_types_data:
        existing = db.query(RoomType).filter(RoomType.name == rt["name"]).first()
        if not existing:
            db.add(RoomType(**rt, is_active=True))
    
    # Seed activity types
    activity_types_data = [
        {"name": "Jeep Safari", "description": "Thrilling wildlife safari in open jeep through dense forest", "duration": "3 hours", "base_price": 1800.00, "max_capacity": 6, "location": "Mudumalai Core Zone", "image_url": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800"},
        {"name": "Bus Safari", "description": "Comfortable group safari with expert naturalist guide", "duration": "2.5 hours", "base_price": 800.00, "max_capacity": 30, "location": "Mudumalai Buffer Zone", "image_url": "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800"},
        {"name": "Elephant Camp Visit", "description": "Interactive experience with rescued elephants and mahouts", "duration": "2 hours", "base_price": 600.00, "max_capacity": 20, "location": "Thepakadu Elephant Camp", "image_url": "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800"},
        {"name": "Guided Nature Walk", "description": "Educational trek through forest trails with wildlife expert", "duration": "2 hours", "base_price": 500.00, "max_capacity": 12, "location": "Masinagudi Forest Trail", "image_url": "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800"},
        {"name": "Bird Watching Tour", "description": "Early morning birding expedition for enthusiasts", "duration": "3 hours", "base_price": 1200.00, "max_capacity": 8, "location": "Gudalur Wetlands", "image_url": "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800"},
        {"name": "Night Safari", "description": "Exclusive nocturnal wildlife spotting adventure", "duration": "2 hours", "base_price": 2200.00, "max_capacity": 6, "location": "Mudumalai Night Zone", "image_url": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800"},
    ]
    for at in activity_types_data:
        existing = db.query(ActivityType).filter(ActivityType.name == at["name"]).first()
        if not existing:
            db.add(ActivityType(**at, is_active=True))
    
    # Seed sample bookings - convert string dates to date objects
    from datetime import date
    bookings_data = [
        {"booking_reference": "BK-2026-001", "customer_name": "Rajesh Kumar", "customer_email": "rajesh.kumar@email.com", "customer_phone": "9876543210", "booking_type": "accommodation", "item_name": "Deluxe Room - Masinagudi", "booking_date": date(2026, 1, 15), "check_in_date": date(2026, 2, 15), "check_out_date": date(2026, 2, 17), "guests_count": 2, "amount": 7000, "status": "completed", "payment_status": "paid", "gst_rate": 12, "gst_amount": 750, "net_amount": 6250},
        {"booking_reference": "BK-2026-002", "customer_name": "Priya Sharma", "customer_email": "priya.sharma@email.com", "customer_phone": "9123456789", "booking_type": "activity", "item_name": "Jeep Safari", "booking_date": date(2026, 1, 18), "check_in_date": date(2026, 2, 20), "check_out_date": date(2026, 2, 20), "guests_count": 4, "amount": 3600, "status": "completed", "payment_status": "paid", "gst_rate": 12, "gst_amount": 386, "net_amount": 3214},
        {"booking_reference": "BK-2026-003", "customer_name": "Amit Patel", "customer_email": "amit.patel@email.com", "customer_phone": "9988776655", "booking_type": "accommodation", "item_name": "Suite - Gudalur", "booking_date": date(2026, 1, 20), "check_in_date": date(2026, 3, 1), "check_out_date": date(2026, 3, 4), "guests_count": 3, "amount": 14400, "status": "cancelled", "payment_status": "refunded", "gst_rate": 12, "gst_amount": 1543, "net_amount": 12857, "refund_amount": 12960, "refund_status": "processed"},
        {"booking_reference": "BK-2026-004", "customer_name": "Sneha Reddy", "customer_email": "sneha.reddy@email.com", "customer_phone": "9876501234", "booking_type": "activity", "item_name": "Elephant Camp Visit", "booking_date": date(2026, 1, 22), "check_in_date": date(2026, 2, 18), "check_out_date": date(2026, 2, 18), "guests_count": 2, "amount": 1200, "status": "completed", "payment_status": "paid", "gst_rate": 12, "gst_amount": 129, "net_amount": 1071},
        {"booking_reference": "BK-2026-005", "customer_name": "Vikram Singh", "customer_email": "vikram.singh@email.com", "customer_phone": "9123450987", "booking_type": "accommodation", "item_name": "Standard Room - Ooty", "booking_date": date(2026, 1, 25), "check_in_date": date(2026, 2, 25), "check_out_date": date(2026, 2, 27), "guests_count": 2, "amount": 5000, "status": "confirmed", "payment_status": "paid", "gst_rate": 12, "gst_amount": 536, "net_amount": 4464},
    ]
    for bd in bookings_data:
        existing = db.query(Booking).filter(Booking.booking_reference == bd["booking_reference"]).first()
        if not existing:
            db.add(Booking(**bd))
    
    # Seed integration settings
    settings_data = [
        {"setting_key": "email_api_provider", "setting_value": "resend", "is_enabled": False, "description": "Email service provider"},
        {"setting_key": "email_api_key", "setting_value": None, "is_enabled": False, "description": "API key for email service"},
        {"setting_key": "sms_api_provider", "setting_value": "twilio", "is_enabled": False, "description": "SMS service provider"},
        {"setting_key": "sms_api_key", "setting_value": None, "is_enabled": False, "description": "API key for SMS service"},
    ]
    for sd in settings_data:
        existing = db.query(IntegrationSetting).filter(IntegrationSetting.setting_key == sd["setting_key"]).first()
        if not existing:
            db.add(IntegrationSetting(**sd))
    
    # Seed safari routes from KML data - 6 MTR Tourism Routes
    safari_routes_data = [
        # 2-hour routes (20km, Yellow color)
        {
            "name": "Reception-Mandradiyar Road-Reception",
            "short_name": "Route 1 - Mandradiyar",
            "description": "20.5 km route through dense forest with high wildlife sighting probability",
            "distance_km": 20.5,
            "duration_hours": 2,
            "safari_type": "2hr",
            "route_color": "#FFFF00",
            "price_per_person": 800.0,
            "max_capacity": 6,
            "coordinates": '[[76.6228666666667,11.5627361111111],[76.6222666666667,11.5633638888889],[76.6215833333333,11.5649083333333],[76.6209861111111,11.5663111111111],[76.6192972222222,11.5693166666667],[76.6186777777778,11.5699472222222],[76.6180555555556,11.5703833333333],[76.6172166666667,11.5704611111111],[76.6161888888889,11.5705027777778],[76.6154388888889,11.5708888888889],[76.6134777777778,11.5729833333333],[76.612225,11.5747361111111],[76.6107055555556,11.5775],[76.6101805555556,11.579975],[76.6092555555556,11.5831833333333],[76.6087722222222,11.5852166666667],[76.6082916666667,11.586875],[76.6082416666667,11.589325],[76.6082666666667,11.5917944444444],[76.6085222222222,11.593725],[76.6099305555556,11.5965055555556],[76.6111611111111,11.5991861111111],[76.6130972222222,11.6029694444444],[76.6142083333333,11.6045027777778],[76.6156055555556,11.6058888888889],[76.6189083333333,11.6082527777778],[76.6197777777778,11.6093861111111],[76.6198888888889,11.6108777777778],[76.6194194444444,11.6141277777778],[76.6198611111111,11.6165416666667],[76.6201694444444,11.6179694444444]]',
            "highlights": '["Dense forest cover", "Mandradiyar viewpoint", "Wildlife corridors", "Bird watching spots"]',
            "display_order": 1
        },
        {
            "name": "Reception-Gamehut Road-KMR-TMR Junction-Ponnangiri Junction-Ponnangiri Road-Reception",
            "short_name": "Route 2 - Gamehut Circuit",
            "description": "20 km circuit through multiple junctions with diverse terrain",
            "distance_km": 20.0,
            "duration_hours": 2,
            "safari_type": "2hr",
            "route_color": "#00FFFF",
            "price_per_person": 800.0,
            "max_capacity": 6,
            "coordinates": '[[76.6228666666667,11.5627361111111],[76.6232833333333,11.5620694444444],[76.6242666666667,11.5607166666667],[76.6256888888889,11.5596361111111],[76.6266722222222,11.55835],[76.6278333333333,11.5555916666667],[76.6277416666667,11.55455],[76.6270777777778,11.553575],[76.6265166666667,11.5515611111111],[76.6266611111111,11.5496361111111],[76.6272888888889,11.5476388888889],[76.6285,11.54585],[76.630025,11.543675],[76.6320833333333,11.5411833333333],[76.6341111111111,11.5393277777778],[76.6373222222222,11.5368722222222],[76.6389194444444,11.5361333333333],[76.6409527777778,11.5352583333333],[76.6432805555556,11.5350972222222],[76.6455361111111,11.5356944444444],[76.6484777777778,11.5372444444444],[76.6506944444444,11.5385027777778],[76.652425,11.53925],[76.6541611111111,11.5390722222222],[76.6553527777778,11.5374138888889],[76.6563,11.5352333333333],[76.6574527777778,11.5314666666667],[76.6583583333333,11.5282916666667],[76.6608083333333,11.5252472222222],[76.66245,11.5229805555556],[76.6646222222222,11.5193416666667],[76.6658833333333,11.5170666666667],[76.6672888888889,11.5141805555556],[76.6679083333333,11.5106666666667],[76.6683777777778,11.5072416666667]]',
            "highlights": '["Gamehut viewpoint", "KMR junction wildlife", "Ponnangiri forest", "Multiple terrain types"]',
            "display_order": 2
        },
        # 1-hour routes
        {
            "name": "Reception-Circle Road-Waterfalls-Reception",
            "short_name": "Route 3 - Waterfall Circuit",
            "description": "13.2 km scenic route passing through waterfalls",
            "distance_km": 13.2,
            "duration_hours": 1,
            "safari_type": "1hr",
            "route_color": "#00FFFF",
            "price_per_person": 500.0,
            "max_capacity": 6,
            "coordinates": '[[76.6228666666667,11.5627361111111],[76.6232833333333,11.5620694444444],[76.6242666666667,11.5607166666667],[76.6256888888889,11.5596361111111],[76.6266722222222,11.55835],[76.6278333333333,11.5555916666667],[76.6277416666667,11.55455],[76.6270777777778,11.553575],[76.6265166666667,11.5515611111111],[76.6266611111111,11.5496361111111],[76.6272888888889,11.5476388888889],[76.6285,11.54585],[76.630025,11.543675],[76.6274388888889,11.5433194444444],[76.6253833333333,11.5419027777778],[76.6226638888889,11.5411166666667],[76.6194027777778,11.5414111111111],[76.6170583333333,11.5408416666667],[76.6143722222222,11.5406305555556],[76.6119527777778,11.5414666666667],[76.6109611111111,11.5428722222222],[76.6107194444444,11.5451305555556],[76.6093388888889,11.5475027777778],[76.6077833333333,11.5484277777778],[76.6056944444444,11.5481166666667],[76.6043666666667,11.5493305555556],[76.6045833333333,11.5513888888889],[76.6058,11.5541444444444],[76.6074916666667,11.5557333333333],[76.6097944444444,11.5573666666667],[76.6132833333333,11.5582111111111],[76.6169138888889,11.5595972222222],[76.6194527777778,11.5611361111111],[76.6216611111111,11.5621583333333],[76.6228666666667,11.5627361111111]]',
            "highlights": '["Scenic waterfall", "Circle road views", "Forest canopy", "Photo opportunities"]',
            "display_order": 3
        },
        {
            "name": "Reception-Sand Road-Ponnangiri Road-Reception",
            "short_name": "Route 4 - Sand Road",
            "description": "12.4 km route through sandy terrain with unique landscape",
            "distance_km": 12.4,
            "duration_hours": 1,
            "safari_type": "1hr",
            "route_color": "#00FFFF",
            "price_per_person": 500.0,
            "max_capacity": 6,
            "coordinates": '[[76.6228666666667,11.5627361111111],[76.6216611111111,11.5621583333333],[76.6194527777778,11.5611361111111],[76.6169138888889,11.5595972222222],[76.6132833333333,11.5582111111111],[76.6097944444444,11.5573666666667],[76.6074916666667,11.5557333333333],[76.6058,11.5541444444444],[76.6045833333333,11.5513888888889],[76.6043666666667,11.5493305555556],[76.6021166666667,11.5467083333333],[76.5992277777778,11.5457166666667],[76.5965805555556,11.5460027777778],[76.5965638888889,11.5485472222222],[76.5983222222222,11.5499694444444],[76.6010527777778,11.5495638888889],[76.6043666666667,11.5493305555556],[76.6056944444444,11.5481166666667],[76.6077833333333,11.5484277777778],[76.6093388888889,11.5475027777778],[76.6107194444444,11.5451305555556],[76.6109611111111,11.5428722222222],[76.6119527777778,11.5414666666667],[76.6143722222222,11.5406305555556],[76.6170583333333,11.5408416666667],[76.6194027777778,11.5414111111111],[76.6226638888889,11.5411166666667],[76.6253833333333,11.5419027777778],[76.6274388888889,11.5433194444444],[76.630025,11.543675],[76.6285,11.54585],[76.6272888888889,11.5476388888889],[76.6266611111111,11.5496361111111],[76.6265166666667,11.5515611111111],[76.6270777777778,11.553575],[76.6277416666667,11.55455],[76.6278333333333,11.5555916666667],[76.6266722222222,11.55835],[76.6256888888889,11.5596361111111],[76.6242666666667,11.5607166666667],[76.6232833333333,11.5620694444444],[76.6228666666667,11.5627361111111]]',
            "highlights": '["Sandy terrain", "Ponnangiri views", "Unique landscape", "Wildlife tracks"]',
            "display_order": 4
        },
        {
            "name": "TPK Reception-Kargudi-Crosscut Road-TMR Road-Reception",
            "short_name": "Route 5 - Kargudi Circuit",
            "description": "12.4 km route through Kargudi and crosscut roads",
            "distance_km": 12.4,
            "duration_hours": 1,
            "safari_type": "1hr",
            "route_color": "#00FFFF",
            "price_per_person": 500.0,
            "max_capacity": 6,
            "coordinates": '[[76.6683777777778,11.5072416666667],[76.6679083333333,11.5106666666667],[76.6672888888889,11.5141805555556],[76.6658833333333,11.5170666666667],[76.6646222222222,11.5193416666667],[76.66245,11.5229805555556],[76.6608083333333,11.5252472222222],[76.6583583333333,11.5282916666667],[76.6574527777778,11.5314666666667],[76.6563,11.5352333333333],[76.6553527777778,11.5374138888889],[76.6541611111111,11.5390722222222],[76.652425,11.53925],[76.6506944444444,11.5385027777778],[76.6484777777778,11.5372444444444],[76.6455361111111,11.5356944444444],[76.6432805555556,11.5350972222222],[76.6409527777778,11.5352583333333],[76.6389194444444,11.5361333333333],[76.6373222222222,11.5368722222222],[76.6341111111111,11.5393277777778],[76.6320833333333,11.5411833333333],[76.630025,11.543675],[76.6285,11.54585],[76.6272888888889,11.5476388888889],[76.6266611111111,11.5496361111111],[76.6265166666667,11.5515611111111],[76.6270777777778,11.553575],[76.6277416666667,11.55455],[76.6278333333333,11.5555916666667],[76.6266722222222,11.55835],[76.6256888888889,11.5596361111111],[76.6242666666667,11.5607166666667],[76.6232833333333,11.5620694444444],[76.6228666666667,11.5627361111111]]',
            "highlights": '["Kargudi forest", "Crosscut road wildlife", "TMR junction", "Diverse habitats"]',
            "display_order": 5
        },
        {
            "name": "Reception-KMR-TMR-Reception",
            "short_name": "Route 6 - KMR-TMR Loop",
            "description": "16 km loop connecting KMR and TMR areas",
            "distance_km": 16.0,
            "duration_hours": 1,
            "safari_type": "1hr",
            "route_color": "#00FFFF",
            "price_per_person": 500.0,
            "max_capacity": 6,
            "coordinates": '[[76.6228666666667,11.5627361111111],[76.6232833333333,11.5620694444444],[76.6242666666667,11.5607166666667],[76.6256888888889,11.5596361111111],[76.6266722222222,11.55835],[76.6278333333333,11.5555916666667],[76.6277416666667,11.55455],[76.6270777777778,11.553575],[76.6265166666667,11.5515611111111],[76.6266611111111,11.5496361111111],[76.6272888888889,11.5476388888889],[76.6285,11.54585],[76.630025,11.543675],[76.6320833333333,11.5411833333333],[76.6341111111111,11.5393277777778],[76.6373222222222,11.5368722222222],[76.6389194444444,11.5361333333333],[76.6409527777778,11.5352583333333],[76.6432805555556,11.5350972222222],[76.6455361111111,11.5356944444444],[76.6484777777778,11.5372444444444],[76.6506944444444,11.5385027777778],[76.652425,11.53925],[76.6541611111111,11.5390722222222],[76.6553527777778,11.5374138888889],[76.6563,11.5352333333333],[76.6574527777778,11.5314666666667],[76.6583583333333,11.5282916666667],[76.6608083333333,11.5252472222222],[76.66245,11.5229805555556],[76.6646222222222,11.5193416666667],[76.6658833333333,11.5170666666667],[76.6672888888889,11.5141805555556],[76.6679083333333,11.5106666666667],[76.6683777777778,11.5072416666667]]',
            "highlights": '["KMR wildlife zone", "TMR elephant area", "Forest corridors", "Scenic loop"]',
            "display_order": 6
        }
    ]
    for sr in safari_routes_data:
        existing = db.query(SafariRoute).filter(SafariRoute.name == sr["name"]).first()
        if not existing:
            db.add(SafariRoute(**sr, is_active=True))
    
    # Seed safari time slots
    safari_slots_data = [
        # Morning slots
        {"slot_time": "06:30 AM", "slot_period": "Morning", "display_order": 1},
        {"slot_time": "08:00 AM", "slot_period": "Morning", "display_order": 2},
        {"slot_time": "09:30 AM", "slot_period": "Morning", "display_order": 3},
        # Afternoon slots
        {"slot_time": "02:00 PM", "slot_period": "Afternoon", "display_order": 4},
        {"slot_time": "03:30 PM", "slot_period": "Afternoon", "display_order": 5},
        {"slot_time": "05:00 PM", "slot_period": "Afternoon", "display_order": 6},
    ]
    for ss in safari_slots_data:
        existing = db.query(SafariSlot).filter(SafariSlot.slot_time == ss["slot_time"]).first()
        if not existing:
            db.add(SafariSlot(**ss, is_active=True))
    
    # Seed wildlife zones
    wildlife_zones_data = [
        {"name": "Tiger Territory Alpha", "coordinate_x": 35, "coordinate_y": 40, "species": '["Bengal Tiger", "Wild Boar", "Sambar Deer"]', "probability": "High", "season": "Year-round", "best_time": "Early morning", "description": "Core tiger habitat with frequent sightings", "safety_tips": '["Maintain silence", "Stay in vehicle", "No sudden movements"]', "photo_tips": '["Use telephoto lens", "Fast shutter speed"]'},
        {"name": "Elephant Corridor", "coordinate_x": 55, "coordinate_y": 30, "species": '["Asian Elephant", "Gaur", "Spotted Deer"]', "probability": "Very High", "season": "Peak in dry season", "best_time": "Morning and evening", "description": "Traditional elephant migration path", "safety_tips": '["Keep safe distance", "Avoid loud noises", "Follow guide instructions"]', "photo_tips": '["Wide-angle for herds", "Capture interactions"]'},
        {"name": "Grassland Meadow", "coordinate_x": 70, "coordinate_y": 55, "species": '["Gaur", "Wild Dog", "Peacock", "Spotted Deer"]', "probability": "High", "season": "Best in monsoon", "best_time": "Late afternoon", "description": "Open grassland with diverse herbivores", "safety_tips": '["Sun protection required", "Binoculars recommended"]', "photo_tips": '["Landscape shots", "Silhouettes at sunset"]'},
    ]
    for wz in wildlife_zones_data:
        existing = db.query(WildlifeZone).filter(WildlifeZone.name == wz["name"]).first()
        if not existing:
            db.add(WildlifeZone(**wz, is_active=True))
    
    db.commit()
    return {"success": True, "message": "Database initialized with seed data"}

# ==================== USER API ENDPOINTS ====================

@app.post("/api/users/register", response_model=UserLoginResponse)
def register_user(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new user or create account during checkout"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        return UserLoginResponse(success=False, message="User with this email already exists. Please login instead.")
    
    # Generate password if not provided
    password = request.password if request.password else generate_random_password()
    
    # Create user
    user = User(
        user_id=generate_user_id(),
        full_name=request.full_name,
        email=request.email,
        phone=request.phone,
        encrypted_password=hash_password(password),
        alternate_phone=request.alternate_phone,
        is_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create token
    token = create_access_token({"sub": user.id, "user_id": user.user_id, "email": user.email, "type": "user"})
    
    # Get booking counts
    total_bookings = db.query(Booking).filter(Booking.customer_email == user.email).count()
    upcoming = db.query(Booking).filter(
        Booking.customer_email == user.email,
        Booking.status == "confirmed",
        Booking.check_in_date >= datetime.now(timezone.utc).date()
    ).count()
    completed = db.query(Booking).filter(
        Booking.customer_email == user.email,
        Booking.status == "completed"
    ).count()
    
    user_response = UserResponse(
        id=user.id,
        user_id=user.user_id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        alternate_phone=user.alternate_phone,
        address=user.address,
        city=user.city,
        state=user.state,
        pincode=user.pincode,
        is_verified=user.is_verified,
        created_at=user.created_at.isoformat() if user.created_at else "",
        total_bookings=total_bookings,
        upcoming_bookings=upcoming,
        completed_bookings=completed
    )
    
    return UserLoginResponse(
        success=True,
        token=token,
        user=user_response,
        message=f"Account created successfully. Your password is: {password}" if not request.password else "Account created successfully"
    )

@app.post("/api/users/login", response_model=UserLoginResponse)
def login_user(request: UserLoginRequest, db: Session = Depends(get_db)):
    """User login"""
    user = db.query(User).filter(User.email == request.email, User.is_active == True).first()
    
    if not user or not verify_password(request.password, user.encrypted_password):
        return UserLoginResponse(success=False, message="Invalid email or password")
    
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    
    token = create_access_token({"sub": user.id, "user_id": user.user_id, "email": user.email, "type": "user"})
    
    # Get booking counts
    total_bookings = db.query(Booking).filter(Booking.customer_email == user.email).count()
    upcoming = db.query(Booking).filter(
        Booking.customer_email == user.email,
        Booking.status == "confirmed",
        Booking.check_in_date >= datetime.now(timezone.utc).date()
    ).count()
    completed = db.query(Booking).filter(
        Booking.customer_email == user.email,
        Booking.status == "completed"
    ).count()
    
    user_response = UserResponse(
        id=user.id,
        user_id=user.user_id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        alternate_phone=user.alternate_phone,
        address=user.address,
        city=user.city,
        state=user.state,
        pincode=user.pincode,
        is_verified=user.is_verified,
        created_at=user.created_at.isoformat() if user.created_at else "",
        total_bookings=total_bookings,
        upcoming_bookings=upcoming,
        completed_bookings=completed
    )
    
    return UserLoginResponse(success=True, token=token, user=user_response)

@app.get("/api/users/profile")
def get_user_profile(payload: dict = Depends(verify_token), db: Session = Depends(get_db)):
    """Get current user profile"""
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get booking counts
    total_bookings = db.query(Booking).filter(Booking.customer_email == user.email).count()
    upcoming = db.query(Booking).filter(
        Booking.customer_email == user.email,
        Booking.status == "confirmed",
        Booking.check_in_date >= datetime.now(timezone.utc).date()
    ).count()
    completed = db.query(Booking).filter(
        Booking.customer_email == user.email,
        Booking.status == "completed"
    ).count()
    
    return {
        "id": user.id,
        "user_id": user.user_id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "alternate_phone": user.alternate_phone,
        "address": user.address,
        "city": user.city,
        "state": user.state,
        "pincode": user.pincode,
        "is_verified": user.is_verified,
        "member_since": user.created_at.isoformat() if user.created_at else None,
        "total_bookings": total_bookings,
        "upcoming_bookings": upcoming,
        "completed_bookings": completed
    }

@app.put("/api/users/profile")
def update_user_profile(request: UserUpdateRequest, payload: dict = Depends(verify_token), db: Session = Depends(get_db)):
    """Update user profile"""
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if request.full_name:
        user.full_name = request.full_name
    if request.phone:
        user.phone = request.phone
    if request.alternate_phone is not None:
        user.alternate_phone = request.alternate_phone
    if request.address is not None:
        user.address = request.address
    if request.city is not None:
        user.city = request.city
    if request.state is not None:
        user.state = request.state
    if request.pincode is not None:
        user.pincode = request.pincode
    
    db.commit()
    return {"success": True, "message": "Profile updated successfully"}

@app.get("/api/users/bookings")
def get_user_bookings(payload: dict = Depends(verify_token), db: Session = Depends(get_db)):
    """Get all bookings for current user"""
    user_email = payload.get("email")
    
    bookings = db.query(Booking).filter(Booking.customer_email == user_email).order_by(Booking.created_at.desc()).all()
    
    return [{
        "id": b.id,
        "booking_reference": b.booking_reference,
        "booking_type": b.booking_type,
        "item_name": b.item_name,
        "booking_date": str(b.booking_date) if b.booking_date else None,
        "check_in_date": str(b.check_in_date) if b.check_in_date else None,
        "check_out_date": str(b.check_out_date) if b.check_out_date else None,
        "guests_count": b.guests_count,
        "amount": float(b.amount),
        "gst_amount": float(b.gst_amount) if b.gst_amount else 0,
        "net_amount": float(b.net_amount) if b.net_amount else 0,
        "status": b.status,
        "payment_status": b.payment_status,
        "created_at": b.created_at.isoformat() if b.created_at else None
    } for b in bookings]

# ==================== CART API ENDPOINTS ====================

@app.get("/api/cart/{session_id}")
def get_cart(session_id: str, db: Session = Depends(get_db)):
    """Get cart items by session ID"""
    import json
    cart_items = db.query(CartItem).filter(CartItem.session_id == session_id).all()
    
    return [{
        "id": item.id,
        "item_type": item.item_type,
        "item_id": item.item_id,
        "item_name": item.item_name,
        "item_details": json.loads(item.item_details) if item.item_details else {},
        "quantity": item.quantity,
        "unit_price": float(item.unit_price),
        "total_price": float(item.total_price)
    } for item in cart_items]

@app.post("/api/cart/add")
def add_to_cart(item: CartItemCreate, db: Session = Depends(get_db)):
    """Add item to cart"""
    import json
    
    # Check if same item already exists in cart
    existing = db.query(CartItem).filter(
        CartItem.session_id == item.session_id,
        CartItem.item_type == item.item_type,
        CartItem.item_id == item.item_id
    ).first()
    
    if existing and item.item_type == "product":
        # Update quantity for products
        existing.quantity += item.quantity
        existing.total_price = float(existing.unit_price) * existing.quantity
        db.commit()
        return {"success": True, "message": "Cart updated", "cart_item_id": existing.id}
    
    cart_item = CartItem(
        session_id=item.session_id,
        item_type=item.item_type,
        item_id=item.item_id,
        item_name=item.item_name,
        item_details=json.dumps(item.item_details),
        quantity=item.quantity,
        unit_price=item.unit_price,
        total_price=item.total_price
    )
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    
    return {"success": True, "message": "Item added to cart", "cart_item_id": cart_item.id}

@app.put("/api/cart/{cart_item_id}")
def update_cart_item(cart_item_id: str, quantity: int, db: Session = Depends(get_db)):
    """Update cart item quantity"""
    cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    if quantity <= 0:
        db.delete(cart_item)
    else:
        cart_item.quantity = quantity
        cart_item.total_price = float(cart_item.unit_price) * quantity
    
    db.commit()
    return {"success": True, "message": "Cart updated"}

@app.delete("/api/cart/{cart_item_id}")
def remove_from_cart(cart_item_id: str, db: Session = Depends(get_db)):
    """Remove item from cart"""
    cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    return {"success": True, "message": "Item removed from cart"}

@app.delete("/api/cart/clear/{session_id}")
def clear_cart(session_id: str, db: Session = Depends(get_db)):
    """Clear all items from cart"""
    db.query(CartItem).filter(CartItem.session_id == session_id).delete()
    db.commit()
    return {"success": True, "message": "Cart cleared"}

# ==================== CHECKOUT API ====================

@app.post("/api/checkout", response_model=CheckoutResponse)
def process_checkout(request: CheckoutRequest, db: Session = Depends(get_db)):
    """Process checkout - creates bookings and optionally user account"""
    import json
    from datetime import date
    
    # Check if user exists or needs to be created
    user = db.query(User).filter(User.email == request.email).first()
    user_password = None
    
    if not user and request.create_account:
        # Create new user account
        user_password = generate_random_password()
        user = User(
            user_id=generate_user_id(),
            full_name=request.full_name,
            email=request.email,
            phone=request.phone,
            encrypted_password=hash_password(user_password),
            alternate_phone=request.alternate_phone,
            is_verified=False
        )
        db.add(user)
        db.flush()
    
    # Generate order ID
    order_id = f"ORD-{datetime.now().year}-{str(uuid.uuid4())[:8].upper()}"
    booking_references = []
    total_amount = 0
    
    # Create bookings for each cart item
    for item in request.items:
        booking_ref = generate_booking_reference()
        booking_references.append(booking_ref)
        
        item_amount = float(item.get("total_price", item.get("unit_price", 0)))
        gst_rate = 12.0
        gst_amount = round(item_amount * gst_rate / 100, 2)
        net_amount = round(item_amount - gst_amount, 2)
        total_amount += item_amount + gst_amount
        
        # Parse dates
        check_in = None
        check_out = None
        booking_date_val = date.today()
        
        details = item.get("item_details", {})
        if details.get("check_in_date") or details.get("checkIn"):
            try:
                date_str = details.get("check_in_date") or details.get("checkIn")
                check_in = datetime.strptime(date_str, "%Y-%m-%d").date()
                booking_date_val = check_in
            except:
                pass
        if details.get("check_out_date") or details.get("checkOut"):
            try:
                date_str = details.get("check_out_date") or details.get("checkOut")
                check_out = datetime.strptime(date_str, "%Y-%m-%d").date()
            except:
                pass
        if details.get("date"):
            try:
                booking_date_val = datetime.strptime(details.get("date"), "%Y-%m-%d").date()
            except:
                pass
        
        booking = Booking(
            booking_reference=booking_ref,
            customer_name=request.full_name,
            customer_email=request.email,
            customer_phone=request.phone,
            booking_type=item.get("item_type", "product"),
            item_id=item.get("item_id"),
            item_name=item.get("item_name"),
            booking_date=booking_date_val,
            check_in_date=check_in,
            check_out_date=check_out,
            guests_count=details.get("guests", details.get("participants", 1)),
            amount=item_amount,
            gst_rate=gst_rate,
            gst_amount=gst_amount,
            net_amount=net_amount,
            status="confirmed",
            payment_status="paid"
        )
        db.add(booking)
    
    # Clear cart
    db.query(CartItem).filter(CartItem.session_id == request.session_id).delete()
    
    db.commit()
    
    return CheckoutResponse(
        success=True,
        order_id=order_id,
        booking_references=booking_references,
        user_id=user.user_id if user else None,
        user_password=user_password,
        total_amount=round(total_amount, 2),
        message="Booking confirmed successfully!" + (f" Your login credentials have been created." if user_password else "")
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
