# MTR BookingHub - Product Requirements Document

## Project Overview
**Application**: MTR BookingHub - Mudumalai Tiger Reserve Booking System
**Original Stack**: React + Vite + Supabase
**Migrated Stack**: React + Vite + FastAPI + SQLite (with JWT Authentication)

## Original Problem Statement
Compile and build the existing codebase and change the tech stack from React + Supabase to React, FastAPI, and MySQL backend. Due to environment constraints, MySQL was replaced with SQLite.

## User Personas
1. **Tourists/Visitors** - Book accommodations, safari activities, and wildlife experiences
2. **Admin Staff** - Manage bookings, room types, activity types, pricing, and analytics

## Core Requirements (Static)
1. ✅ User-facing landing page with booking options
2. ✅ Accommodation booking system
3. ✅ Activity/Safari booking system
4. ✅ Safari route explorer with interactive maps
5. ✅ Admin dashboard with JWT authentication
6. ✅ Booking management system
7. ✅ Analytics and reporting
8. ✅ GST calculation and financial tracking

## Tech Stack
- **Frontend**: React 18 + Vite + TailwindCSS + Recharts + Leaflet.js
- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Authentication**: JWT-based custom auth
- **Styling**: TailwindCSS with custom dark naturalistic theme
- **Maps**: Leaflet.js with OpenStreetMap tiles

## What's Been Implemented

### March 18, 2026 - Real-time Availability Checking
- ✅ Added `/api/check-availability` backend endpoint
- ✅ Map markers show color-coded availability (green=available, amber=limited, red=booked)
- ✅ Header displays booking search parameters when checking availability
- ✅ Map title changes to "Real-time Availability Map" during availability check
- ✅ Availability status legend in sidebar
- ✅ Location details panel shows availability badge and booking estimate
- ✅ Safari availability badge shows available slots
- ✅ "Book This Stay" button disabled for unavailable locations
- ✅ Region filters show available/total counts

### March 18, 2026 - Booking Widget Integration
- ✅ Integrated booking widget directly into homepage hero carousel
- ✅ Booking type selector (Rooms Only, Safari Only, Rooms + Safari)
- ✅ Date pickers for check-in/check-out
- ✅ Guest selector (1-10 guests)
- ✅ "Check Availability" button scrolls to map section
- ✅ "Book Stay" navigation link scrolls to homepage booking widget
- ✅ Removed old /interactive-map-booking route
- ✅ All features tested and verified (100% test pass rate)

### March 17, 2026 - UI Enhancements & Interactive Map
- ✅ Dark naturalistic theme with forest-inspired color palette
- ✅ Custom header with gradient stripe
- ✅ Auto-playing hero carousel with 6 wildlife images
- ✅ Interactive Leaflet map with OpenStreetMap
- ✅ 25 real accommodation locations from KML file
- ✅ Region filtering (Theppakadu, Kargudi, Abhayaranyam, Masinagudi, Genepool)
- ✅ Custom map markers with popup details

### Backend (FastAPI)
- ✅ Complete REST API with 15+ endpoints
- ✅ JWT authentication system (login, verify)
- ✅ Room types CRUD operations
- ✅ Activity types CRUD operations
- ✅ Bookings management (create, list, cancel with refunds)
- ✅ Safari routes and waypoints API
- ✅ Wildlife zones API
- ✅ Analytics and reporting API
- ✅ Integration settings management
- ✅ Database seeding with sample data
- ✅ GST calculation (12%)

### Frontend (React)
- ✅ Home landing page with integrated booking widget
- ✅ Interactive Leaflet map with real GPS locations
- ✅ Admin login page with JWT auth
- ✅ Admin dashboard with multiple tabs
- ✅ Room type management UI
- ✅ Activity type management UI
- ✅ Booking management UI
- ✅ Analytics dashboard with charts
- ✅ Safari route explorer
- ✅ Financial management with GST breakdown
- ✅ Reports download (CSV/PDF)

### Database Schema
- admin_users
- room_types
- activity_types
- bookings
- transactions
- room_blocked_dates
- activity_blocked_dates
- safari_routes
- safari_waypoints
- wildlife_zones
- integration_settings

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| POST | /api/auth/login | Admin login |
| GET | /api/auth/verify | Verify token |
| GET/POST | /api/room-types | Room types CRUD |
| PUT/DELETE | /api/room-types/{id} | Update/delete room |
| GET/POST | /api/activity-types | Activity types CRUD |
| PUT/DELETE | /api/activity-types/{id} | Update/delete activity |
| GET/POST | /api/bookings | Bookings list/create |
| PUT | /api/bookings/{id}/cancel | Cancel booking |
| GET | /api/safari-routes | Safari routes list |
| GET | /api/wildlife-zones | Wildlife zones list |
| GET | /api/analytics | Dashboard analytics |
| GET | /api/integration-settings | Integration configs |
| POST | /api/init-db | Initialize/seed database |

## Admin Credentials
- **Email**: admin@mtr.nic.in
- **Password**: Admin@123

## Prioritized Backlog

### P0 (Critical)
- ✅ Booking widget integration into homepage (COMPLETED)
- ✅ Remove old booking page (COMPLETED)
- ✅ Real-time availability checking with visual map indicators (COMPLETED)

### P1 (High Priority)
- [ ] Complete booking flow - link map selections to booking confirmation
- [ ] Add pagination to all list endpoints
- [ ] Implement booking date blocking functionality (admin feature)
- [ ] Add email/SMS notification integration
- [ ] User registration and public booking flow

### P2 (Medium Priority)
- [ ] Connect admin dashboard components to live backend (currently using mock data)
- [ ] E-shop product management
- [ ] Shopping cart functionality
- [ ] User dashboard for booking history
- [ ] Payment gateway integration (Stripe/Razorpay)

### P3 (Future)
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] Dynamic pricing based on season
- [ ] Advanced analytics with ML predictions

## Known Limitations
1. **Database**: Using SQLite instead of MySQL/MongoDB (Emergent platform limitation)
2. **Preview URL**: External preview may show unavailable due to platform routing
3. **Admin Dashboard**: Several components still use mock data instead of live API
4. **Pagination**: Not implemented on all endpoints (performance optimization needed)

## Next Tasks
1. Connect booking widget to backend availability check API
2. Complete booking confirmation flow after user selects accommodation
3. Connect admin dashboard components to live backend APIs
4. Add email notification system using Resend/SendGrid
