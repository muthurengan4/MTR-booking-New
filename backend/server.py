import os
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from decimal import Decimal
import uuid

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, Column, String, Boolean, DateTime, Integer, Numeric, Text, ForeignKey, Date, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

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
    image_url = Column(String(500))
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
    image_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_reference = Column(String(50), unique=True, nullable=False)
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

class SafariRoute(Base):
    __tablename__ = "safari_routes"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    route_type = Column(String(20), nullable=False)  # jeep, bus, elephant
    icon = Column(String(50), nullable=False)
    color = Column(String(20), nullable=False)
    duration = Column(String(50), nullable=False)
    difficulty = Column(String(50), nullable=False)
    distance = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    highlights = Column(Text)  # JSON string
    best_time = Column(String(100), nullable=False)
    max_capacity = Column(Integer, default=6)
    terrain = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

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
    location: Optional[str]
    is_active: bool

class RoomTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    base_price: float
    max_capacity: int = 2
    amenities: List[str] = []
    image_url: Optional[str] = None
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
    is_active: bool

class ActivityTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    duration: Optional[str] = None
    base_price: float
    max_capacity: int = 10
    location: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True

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

class SafariRouteResponse(BaseModel):
    id: str
    name: str
    route_type: str
    icon: str
    color: str
    duration: str
    difficulty: str
    distance: str
    description: str
    highlights: List[str]
    best_time: str
    max_capacity: int
    terrain: str
    is_active: bool
    waypoints: Optional[List[dict]] = None

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

# Safari Routes Endpoints
@app.get("/api/safari-routes", response_model=List[SafariRouteResponse])
def get_safari_routes(active_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(SafariRoute)
    if active_only:
        query = query.filter(SafariRoute.is_active == True)
    routes = query.all()
    
    result = []
    for r in routes:
        waypoints = db.query(SafariWaypoint).filter(
            SafariWaypoint.route_id == r.id
        ).order_by(SafariWaypoint.sequence_order).all()
        
        result.append(SafariRouteResponse(
            id=r.id,
            name=r.name,
            route_type=r.route_type,
            icon=r.icon,
            color=r.color,
            duration=r.duration,
            difficulty=r.difficulty,
            distance=r.distance,
            description=r.description,
            highlights=parse_json_field(r.highlights),
            best_time=r.best_time,
            max_capacity=r.max_capacity,
            terrain=r.terrain,
            is_active=r.is_active,
            waypoints=[{
                "id": w.id,
                "name": w.name,
                "time": w.time,
                "elevation": w.elevation,
                "description": w.description,
                "sequence_order": w.sequence_order
            } for w in waypoints]
        ))
    return result

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
    
    # Seed safari routes
    jeep_route_id = str(uuid.uuid4())
    bus_route_id = str(uuid.uuid4())
    elephant_route_id = str(uuid.uuid4())
    
    safari_routes_data = [
        {"id": jeep_route_id, "name": "Jeep Safari", "route_type": "jeep", "icon": "Truck", "color": "#2D5016", "duration": "3-4 hours", "difficulty": "Moderate", "distance": "25 km", "description": "Thrilling off-road adventure through dense forests and grasslands", "highlights": '["Tiger sightings", "Elephant herds", "Gaur populations", "Bird watching"]', "best_time": "Early morning (6:00 AM) or late afternoon (3:30 PM)", "max_capacity": 6, "terrain": "Mixed terrain with forest trails"},
        {"id": bus_route_id, "name": "Bus Safari", "route_type": "bus", "icon": "Bus", "color": "#8B4513", "duration": "2-3 hours", "difficulty": "Easy", "distance": "18 km", "description": "Comfortable group safari experience on paved roads", "highlights": '["Spotted deer herds", "Peacock displays", "Langur colonies", "Scenic landscapes"]', "best_time": "Morning (7:00 AM) or afternoon (4:00 PM)", "max_capacity": 45, "terrain": "Paved roads through forest corridors"},
        {"id": elephant_route_id, "name": "Elephant Camp Visit", "route_type": "elephant", "icon": "Mountain", "color": "#FF6B35", "duration": "1.5-2 hours", "difficulty": "Easy", "distance": "5 km", "description": "Educational walking tour of elephant rehabilitation camp", "highlights": '["Elephant feeding", "Bathing sessions", "Conservation education", "Mahout interactions"]', "best_time": "Morning (8:00 AM) for bathing session", "max_capacity": 20, "terrain": "Flat walking paths"},
    ]
    for sr in safari_routes_data:
        existing = db.query(SafariRoute).filter(SafariRoute.name == sr["name"]).first()
        if not existing:
            db.add(SafariRoute(**sr, is_active=True))
    
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
