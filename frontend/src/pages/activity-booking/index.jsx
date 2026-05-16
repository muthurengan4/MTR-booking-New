import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/navigation/Header';
import Icon from '../../components/AppIcon';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useCart } from '../../contexts/CartContext';
import api from '../../lib/api';
import 'leaflet/dist/leaflet.css';

// Toast notification
const showToast = (message, type = 'success') => {
  const toastEl = document.createElement('div');
  toastEl.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all transform ${
    type === 'success' ? 'bg-green-600 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'
  }`;
  toastEl.textContent = message;
  document.body.appendChild(toastEl);
  setTimeout(() => toastEl.remove(), 3000);
};

// Custom marker icons
const createWaypointIcon = (number, color) => {
  return L.divIcon({
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">${number}</div>`,
    className: 'custom-waypoint-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const createStartEndIcon = (type, color) => {
  const icon = type === 'start' ? '🚩' : '🏁';
  return L.divIcon({
    html: `<div style="background:${color};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(0,0,0,0.4);border:2px solid white;">${icon}</div>`,
    className: 'custom-start-end-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Map controller
const MapController = ({ coordinates }) => {
  const map = useMap();
  useEffect(() => {
    if (coordinates?.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
    }
  }, [coordinates, map]);
  return null;
};

const ActivityBooking = () => {
  const navigate = useNavigate();
  const { addToCart, isInCart: checkIsInCart } = useCart();
  
  // State
  const [safariRoutes, setSafariRoutes] = useState([]);
  const [safariSlots, setSafariSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [participants, setParticipants] = useState(2);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch safari routes and slots from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [routesRes, slotsRes] = await Promise.all([
          api.get('/api/safari-routes?active_only=true'),
          api.get('/api/safari-slots?active_only=true')
        ]);
        setSafariRoutes(routesRes.data || []);
        setSafariSlots(slotsRes.data || []);
        
        // Select first route by default
        if (routesRes.data?.length > 0) {
          setSelectedRoute(routesRes.data[0]);
        }
      } catch (error) {
        console.error('Error fetching safari data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Get coordinates for selected route
  const getRouteCoordinates = useCallback(() => {
    if (!selectedRoute?.coordinates?.length) return [];
    return selectedRoute.coordinates.map(coord => [coord[1], coord[0]]); // [lat, lng]
  }, [selectedRoute]);

  // Animate journey
  const startAnimation = useCallback(() => {
    if (!selectedRoute || isAnimating) return;
    setIsAnimating(true);
    setAnimationProgress(0);
    
    const duration = 5000; // 5 seconds
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  }, [selectedRoute, isAnimating]);

  // Add to cart
  const handleAddToCart = async () => {
    if (!selectedRoute || !selectedDate || !selectedSlot) {
      showToast('Please select date and time slot', 'error');
      return;
    }

    setAddingToCart(true);
    try {
      const cartItem = {
        item_type: 'activity',
        item_id: selectedRoute.id,
        name: `${selectedRoute.short_name || selectedRoute.name}`,
        quantity: participants,
        price: selectedRoute.price_per_person,
        details: {
          route_name: selectedRoute.name,
          safari_type: selectedRoute.safari_type,
          date: selectedDate,
          time_slot: selectedSlot.slot_time,
          participants: participants,
          distance_km: selectedRoute.distance_km,
          duration_hours: selectedRoute.duration_hours
        }
      };

      await addToCart(cartItem);
      showToast(`${selectedRoute.short_name || selectedRoute.name} added to cart!`, 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add to cart', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const isInCart = selectedRoute ? checkIsInCart(selectedRoute.id, 'activity') : false;
  const totalPrice = selectedRoute ? selectedRoute.price_per_person * participants : 0;

  // Group routes by type
  const twoHourRoutes = safariRoutes.filter(r => r.safari_type === '2hr');
  const oneHourRoutes = safariRoutes.filter(r => r.safari_type === '1hr');

  // Group slots by period
  const morningSlots = safariSlots.filter(s => s.slot_period === 'Morning');
  const afternoonSlots = safariSlots.filter(s => s.slot_period === 'Afternoon');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E3A1E]">
        <Header />
        <div className="pt-[88px] flex items-center justify-center min-h-[60vh]">
          <Icon name="Loader" size={48} className="animate-spin text-[#5A9A3A]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E3A1E]">
      <Header />
      
      <main className="pt-[88px]">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-[#5A9A3A]/20 rounded-xl flex items-center justify-center">
                <Icon name="Compass" size={28} className="text-[#5A9A3A]" />
              </div>
              <div>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
                  Safari Activities
                </h1>
                <p className="text-[#B8C4A8]">
                  Book your wildlife safari adventure • {safariRoutes.length} Routes Available
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Route Selection & Booking */}
            <div className="lg:col-span-1 space-y-6">
              {/* Safari Type Selection */}
              <div className="bg-[#2A4A2A] rounded-2xl border border-[#5A9A3A]/30 p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Icon name="Route" size={20} className="text-[#5A9A3A]" />
                  Select Safari Route
                </h2>

                {/* 2-Hour Safari Routes */}
                {twoHourRoutes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-[#FF9E6D] uppercase tracking-wider mb-2">
                      2-Hour Safari (20km) - ₹800/person
                    </p>
                    <div className="space-y-2">
                      {twoHourRoutes.map(route => (
                        <button
                          key={route.id}
                          onClick={() => {
                            setSelectedRoute(route);
                            setShowRouteDetails(true);
                          }}
                          className={`w-full p-3 rounded-xl text-left transition-all ${
                            selectedRoute?.id === route.id
                              ? 'bg-[#5A9A3A]/30 border-2 border-[#5A9A3A]'
                              : 'bg-[#1E3A1E] border border-[#5A9A3A]/20 hover:border-[#5A9A3A]/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-8 rounded-full"
                              style={{ backgroundColor: route.route_color }}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-white text-sm">{route.short_name || route.name}</p>
                              <p className="text-xs text-[#B8C4A8]">{route.distance_km} km • {route.duration_hours}hr</p>
                            </div>
                            {selectedRoute?.id === route.id && (
                              <Icon name="Check" size={18} className="text-[#5A9A3A]" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1-Hour Safari Routes */}
                {oneHourRoutes.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#5A9A3A] uppercase tracking-wider mb-2">
                      1-Hour Safari - ₹500/person
                    </p>
                    <div className="space-y-2">
                      {oneHourRoutes.map(route => (
                        <button
                          key={route.id}
                          onClick={() => {
                            setSelectedRoute(route);
                            setShowRouteDetails(true);
                          }}
                          className={`w-full p-3 rounded-xl text-left transition-all ${
                            selectedRoute?.id === route.id
                              ? 'bg-[#5A9A3A]/30 border-2 border-[#5A9A3A]'
                              : 'bg-[#1E3A1E] border border-[#5A9A3A]/20 hover:border-[#5A9A3A]/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-8 rounded-full"
                              style={{ backgroundColor: route.route_color }}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-white text-sm">{route.short_name || route.name}</p>
                              <p className="text-xs text-[#B8C4A8]">{route.distance_km} km • {route.duration_hours}hr</p>
                            </div>
                            {selectedRoute?.id === route.id && (
                              <Icon name="Check" size={18} className="text-[#5A9A3A]" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Date & Time Selection */}
              <div className="bg-[#2A4A2A] rounded-2xl border border-[#5A9A3A]/30 p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Icon name="Calendar" size={20} className="text-[#5A9A3A]" />
                  Select Date & Time
                </h2>

                {/* Date Picker */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#B8C4A8] uppercase tracking-wider mb-2">
                    Safari Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-[#1E3A1E] border border-[#5A9A3A]/30 rounded-xl text-white focus:outline-none focus:border-[#5A9A3A]"
                  />
                </div>

                {/* Time Slots */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-[#B8C4A8] uppercase tracking-wider mb-2">
                    Time Slot
                  </label>
                  
                  {/* Morning Slots */}
                  {morningSlots.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-[#FF9E6D] mb-2 flex items-center gap-1">
                        <Icon name="Sun" size={14} /> Morning
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {morningSlots.map(slot => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              selectedSlot?.id === slot.id
                                ? 'bg-[#5A9A3A] text-white'
                                : 'bg-[#1E3A1E] text-[#B8C4A8] hover:bg-[#5A9A3A]/20'
                            }`}
                          >
                            {slot.slot_time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Afternoon Slots */}
                  {afternoonSlots.length > 0 && (
                    <div>
                      <p className="text-xs text-[#FF9E6D] mb-2 flex items-center gap-1">
                        <Icon name="Sunset" size={14} /> Afternoon
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {afternoonSlots.map(slot => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              selectedSlot?.id === slot.id
                                ? 'bg-[#5A9A3A] text-white'
                                : 'bg-[#1E3A1E] text-[#B8C4A8] hover:bg-[#5A9A3A]/20'
                            }`}
                          >
                            {slot.slot_time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Participants */}
                <div>
                  <label className="block text-xs font-medium text-[#B8C4A8] uppercase tracking-wider mb-2">
                    Participants
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setParticipants(Math.max(1, participants - 1))}
                      className="w-10 h-10 bg-[#1E3A1E] rounded-lg flex items-center justify-center text-white hover:bg-[#5A9A3A]/20"
                    >
                      <Icon name="Minus" size={18} />
                    </button>
                    <span className="text-xl font-bold text-white w-12 text-center">{participants}</span>
                    <button
                      onClick={() => setParticipants(Math.min(selectedRoute?.max_capacity || 6, participants + 1))}
                      className="w-10 h-10 bg-[#1E3A1E] rounded-lg flex items-center justify-center text-white hover:bg-[#5A9A3A]/20"
                    >
                      <Icon name="Plus" size={18} />
                    </button>
                    <span className="text-sm text-[#B8C4A8]">Max {selectedRoute?.max_capacity || 6}</span>
                  </div>
                </div>
              </div>

              {/* Price & Book Button */}
              <div className="bg-gradient-to-br from-[#5A9A3A]/20 to-[#2A4A2A] rounded-2xl border border-[#5A9A3A]/30 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-[#B8C4A8]">Total Price</p>
                    <p className="text-3xl font-bold text-white">₹{totalPrice.toLocaleString()}</p>
                    <p className="text-xs text-[#B8C4A8]">
                      ₹{selectedRoute?.price_per_person || 0} × {participants} {participants === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#B8C4A8]">{selectedRoute?.safari_type === '2hr' ? '2 Hour' : '1 Hour'} Safari</p>
                    <p className="text-sm text-[#5A9A3A]">{selectedRoute?.distance_km} km route</p>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!selectedRoute || !selectedDate || !selectedSlot || addingToCart || isInCart}
                  className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
                    isInCart
                      ? 'bg-green-600 text-white cursor-default'
                      : !selectedRoute || !selectedDate || !selectedSlot
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#FF9E6D] to-[#FF6B35] text-white hover:shadow-lg hover:shadow-[#FF9E6D]/30'
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <Icon name="Loader" size={20} className="animate-spin" />
                      Adding...
                    </>
                  ) : isInCart ? (
                    <>
                      <Icon name="Check" size={20} />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <Icon name="ShoppingCart" size={20} />
                      Add to Cart
                    </>
                  )}
                </button>

                {isInCart && (
                  <button
                    onClick={() => navigate('/shopping-cart')}
                    className="w-full mt-3 py-3 bg-[#5A9A3A] text-white rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <Icon name="ShoppingBag" size={18} />
                    View Cart & Checkout
                  </button>
                )}
              </div>
            </div>

            {/* Right Column - Map & Route Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Route Map */}
              <div className="bg-[#2A4A2A] rounded-2xl border border-[#5A9A3A]/30 overflow-hidden">
                <div className="p-4 border-b border-[#5A9A3A]/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="Map" size={20} className="text-[#5A9A3A]" />
                    <div>
                      <h3 className="font-semibold text-white">{selectedRoute?.short_name || selectedRoute?.name || 'Select a Route'}</h3>
                      <p className="text-xs text-[#B8C4A8]">{selectedRoute?.description?.substring(0, 60)}...</p>
                    </div>
                  </div>
                  <button
                    onClick={startAnimation}
                    disabled={!selectedRoute || isAnimating}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                      isAnimating
                        ? 'bg-[#FF9E6D] text-white'
                        : 'bg-[#5A9A3A] text-white hover:bg-[#4A8A2A]'
                    }`}
                  >
                    <Icon name={isAnimating ? 'Loader' : 'Play'} size={18} className={isAnimating ? 'animate-spin' : ''} />
                    {isAnimating ? 'Simulating...' : 'Simulate Journey'}
                  </button>
                </div>

                {/* Map Container */}
                <div className="h-[400px] relative">
                  {selectedRoute && getRouteCoordinates().length > 0 ? (
                    <MapContainer
                      center={getRouteCoordinates()[0]}
                      zoom={12}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapController coordinates={getRouteCoordinates()} />
                      
                      {/* Route Line */}
                      <Polyline
                        positions={getRouteCoordinates()}
                        pathOptions={{
                          color: selectedRoute.route_color || '#FFFF00',
                          weight: 5,
                          opacity: 0.8,
                          dashArray: isAnimating ? '10, 10' : null
                        }}
                      />

                      {/* Animated progress line */}
                      {isAnimating && animationProgress > 0 && (
                        <Polyline
                          positions={getRouteCoordinates().slice(0, Math.floor(getRouteCoordinates().length * animationProgress) + 1)}
                          pathOptions={{
                            color: '#FF6B35',
                            weight: 7,
                            opacity: 1
                          }}
                        />
                      )}

                      {/* Start Marker */}
                      <Marker
                        position={getRouteCoordinates()[0]}
                        icon={createStartEndIcon('start', selectedRoute.route_color || '#5A9A3A')}
                      >
                        <Popup>
                          <div className="text-center p-2">
                            <p className="font-bold">Start Point</p>
                            <p className="text-sm">Reception</p>
                          </div>
                        </Popup>
                      </Marker>

                      {/* End Marker */}
                      <Marker
                        position={getRouteCoordinates()[getRouteCoordinates().length - 1]}
                        icon={createStartEndIcon('end', selectedRoute.route_color || '#5A9A3A')}
                      >
                        <Popup>
                          <div className="text-center p-2">
                            <p className="font-bold">End Point</p>
                            <p className="text-sm">Back to Reception</p>
                          </div>
                        </Popup>
                      </Marker>

                      {/* Current position during animation */}
                      {isAnimating && (
                        <Marker
                          position={getRouteCoordinates()[Math.floor(getRouteCoordinates().length * animationProgress)]}
                          icon={L.divIcon({
                            html: '<div style="width:20px;height:20px;background:#FF6B35;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(255,107,53,0.8);"></div>',
                            className: 'current-position-marker',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10],
                          })}
                        />
                      )}
                    </MapContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-[#1E3A1E]">
                      <div className="text-center">
                        <Icon name="Map" size={48} className="mx-auto mb-4 text-[#5A9A3A]/50" />
                        <p className="text-[#B8C4A8]">Select a route to view the map</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Animation Progress */}
                {isAnimating && (
                  <div className="px-4 py-3 bg-[#1E3A1E] border-t border-[#5A9A3A]/30">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#B8C4A8]">Journey Progress</span>
                      <div className="flex-1 h-2 bg-[#2A4A2A] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#5A9A3A] to-[#FF9E6D] transition-all duration-100"
                          style={{ width: `${animationProgress * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-white">{Math.round(animationProgress * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Route Details & Highlights */}
              {selectedRoute && (
                <div className="bg-[#2A4A2A] rounded-2xl border border-[#5A9A3A]/30 p-5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Icon name="Info" size={20} className="text-[#5A9A3A]" />
                    Route Details
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#1E3A1E] rounded-xl p-4 text-center">
                      <Icon name="Route" size={24} className="mx-auto mb-2 text-[#5A9A3A]" />
                      <p className="text-2xl font-bold text-white">{selectedRoute.distance_km}</p>
                      <p className="text-xs text-[#B8C4A8]">Kilometers</p>
                    </div>
                    <div className="bg-[#1E3A1E] rounded-xl p-4 text-center">
                      <Icon name="Clock" size={24} className="mx-auto mb-2 text-[#5A9A3A]" />
                      <p className="text-2xl font-bold text-white">{selectedRoute.duration_hours}</p>
                      <p className="text-xs text-[#B8C4A8]">Hour(s)</p>
                    </div>
                    <div className="bg-[#1E3A1E] rounded-xl p-4 text-center">
                      <Icon name="Users" size={24} className="mx-auto mb-2 text-[#5A9A3A]" />
                      <p className="text-2xl font-bold text-white">{selectedRoute.max_capacity}</p>
                      <p className="text-xs text-[#B8C4A8]">Max Capacity</p>
                    </div>
                    <div className="bg-[#1E3A1E] rounded-xl p-4 text-center">
                      <Icon name="IndianRupee" size={24} className="mx-auto mb-2 text-[#5A9A3A]" />
                      <p className="text-2xl font-bold text-white">₹{selectedRoute.price_per_person}</p>
                      <p className="text-xs text-[#B8C4A8]">Per Person</p>
                    </div>
                  </div>

                  {/* Highlights */}
                  {selectedRoute.highlights?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-[#B8C4A8] uppercase tracking-wider mb-3">
                        Route Highlights
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedRoute.highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-white">
                            <Icon name="CheckCircle" size={16} className="text-[#5A9A3A]" />
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Other Activities */}
              <div className="bg-[#2A4A2A] rounded-2xl border border-[#5A9A3A]/30 p-5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Icon name="Compass" size={20} className="text-[#5A9A3A]" />
                  Other Wildlife Experiences
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#1E3A1E] rounded-xl p-4 border border-[#5A9A3A]/20">
                    <img 
                      src="https://images.unsplash.com/photo-1533631278779-d722ded4c7df?w=400"
                      alt="Elephant Camp"
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-semibold text-white">Elephant Camp Visit</h4>
                    <p className="text-sm text-[#B8C4A8] mb-2">Watch elephant bathing and feeding sessions</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#5A9A3A] font-bold">₹500/person</span>
                      <span className="text-xs text-[#B8C4A8]">2 hours</span>
                    </div>
                  </div>

                  <div className="bg-[#1E3A1E] rounded-xl p-4 border border-[#5A9A3A]/20">
                    <img 
                      src="https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400"
                      alt="Bird Watching"
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-semibold text-white">Bird Watching Trail</h4>
                    <p className="text-sm text-[#B8C4A8] mb-2">Spot exotic birds with expert guides</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#5A9A3A] font-bold">₹400/person</span>
                      <span className="text-xs text-[#B8C4A8]">3 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivityBooking;
