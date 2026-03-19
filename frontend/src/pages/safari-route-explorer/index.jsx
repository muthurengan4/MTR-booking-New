import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/navigation/Header';
import Icon from '../../components/AppIcon';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useCart } from '../../contexts/CartContext';
import 'leaflet/dist/leaflet.css';

// Simple toast notification
const showToast = (message, type = 'success') => {
  const toastEl = document.createElement('div');
  toastEl.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all transform ${
    type === 'success' ? 'bg-green-600 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'
  }`;
  toastEl.textContent = message;
  document.body.appendChild(toastEl);
  setTimeout(() => toastEl.remove(), 3000);
};

// Custom marker creator
const createWaypointIcon = (number, color) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
      ">${number}</div>
    `,
    className: 'custom-waypoint-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createStartEndIcon = (type, color) => {
  const icon = type === 'start' ? '🚩' : '🏁';
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        border: 3px solid white;
      ">${icon}</div>
    `,
    className: 'custom-start-end-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Map controller to fit bounds
const MapController = ({ route, isAnimating }) => {
  const map = useMap();
  
  useEffect(() => {
    if (route?.coordinates?.length > 0) {
      const bounds = L.latLngBounds(route.coordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [route, map]);
  
  return null;
};

const SafariRouteExplorer = () => {
  const navigate = useNavigate();
  const { addToCart, isInCart: checkIsInCart, getCartCount } = useCart();
  const [selectedRoute, setSelectedRoute] = useState('jeep');
  const [showWildlifeZones, setShowWildlifeZones] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [safariDate, setSafariDate] = useState('');
  const [participants, setParticipants] = useState(2);
  const [addingToCart, setAddingToCart] = useState(false);

  // Check if safari is in cart
  const isSafariInCart = (routeId) => {
    return checkIsInCart(routeId, 'activity');
  };

  // Real safari routes with actual coordinates in Mudumalai Tiger Reserve
  const safariRoutes = {
    jeep: {
      id: 'jeep',
      name: 'Jeep Safari - Theppakadu Circuit',
      icon: 'Truck',
      color: '#2D5016',
      gradientFrom: '#2D5016',
      gradientTo: '#5A9A3A',
      duration: '3-4 hours',
      distance: '25 km',
      difficulty: 'Moderate',
      terrain: 'Off-road trails',
      bestTime: '6:00 AM - 9:00 AM',
      maxCapacity: 6,
      price: 2500,
      description: 'Experience the raw wilderness on our most popular jeep safari through the core tiger territory. This route offers the best chances of spotting Bengal tigers, elephants, and leopards.',
      highlights: ['Tiger sightings', 'Elephant herds', 'Scenic valleys', 'Bird watching spots'],
      coordinates: [
        [11.5810, 76.5850], // Start - Theppakadu
        [11.5780, 76.5790],
        [11.5720, 76.5720],
        [11.5680, 76.5680],
        [11.5620, 76.5650], // Tiger viewing point
        [11.5580, 76.5700],
        [11.5550, 76.5780],
        [11.5600, 76.5850],
        [11.5650, 76.5900],
        [11.5720, 76.5920], // Elephant corridor
        [11.5780, 76.5880],
        [11.5810, 76.5850], // End - Back to Theppakadu
      ],
      waypoints: [
        { name: 'Theppakadu Base', coords: [11.5810, 76.5850], time: '6:00 AM', description: 'Safari check-in and briefing', elevation: 950 },
        { name: 'Tiger Valley Viewpoint', coords: [11.5620, 76.5650], time: '7:00 AM', description: 'Prime tiger spotting location with panoramic views', elevation: 1020 },
        { name: 'Elephant Corridor', coords: [11.5720, 76.5920], time: '8:00 AM', description: 'Watch elephants cross between feeding grounds', elevation: 980 },
        { name: 'Return to Base', coords: [11.5810, 76.5850], time: '9:30 AM', description: 'Safari conclusion with refreshments', elevation: 950 },
      ]
    },
    bus: {
      id: 'bus',
      name: 'Bus Safari - Scenic Route',
      icon: 'Bus',
      color: '#8B4513',
      gradientFrom: '#8B4513',
      gradientTo: '#A0522D',
      duration: '2-3 hours',
      distance: '18 km',
      difficulty: 'Easy',
      terrain: 'Paved roads',
      bestTime: '7:00 AM - 10:00 AM',
      maxCapacity: 45,
      price: 800,
      description: 'A comfortable group experience perfect for families and seniors. Travel in an open-air bus through scenic forest roads with guaranteed wildlife sightings.',
      highlights: ['Spotted deer herds', 'Peacock displays', 'Langur families', 'Forest views'],
      coordinates: [
        [11.5810, 76.5850], // Start
        [11.5830, 76.5900],
        [11.5860, 76.5950],
        [11.5880, 76.6000],
        [11.5850, 76.6050],
        [11.5800, 76.6080],
        [11.5750, 76.6050],
        [11.5720, 76.6000],
        [11.5700, 76.5950],
        [11.5730, 76.5900],
        [11.5780, 76.5870],
        [11.5810, 76.5850], // End
      ],
      waypoints: [
        { name: 'Theppakadu Bus Stand', coords: [11.5810, 76.5850], time: '7:00 AM', description: 'Board the safari bus', elevation: 950 },
        { name: 'Deer Meadows', coords: [11.5880, 76.6000], time: '7:45 AM', description: 'Open grasslands with spotted deer and sambar', elevation: 920 },
        { name: 'Peacock Point', coords: [11.5750, 76.6050], time: '8:30 AM', description: 'Beautiful peacock display area during mating season', elevation: 900 },
        { name: 'Return Journey', coords: [11.5810, 76.5850], time: '9:30 AM', description: 'Drop-off point', elevation: 950 },
      ]
    },
    elephant: {
      id: 'elephant',
      name: 'Elephant Camp Experience',
      icon: 'Footprints',
      color: '#FF6B35',
      gradientFrom: '#FF6B35',
      gradientTo: '#FF9E6D',
      duration: '1.5-2 hours',
      distance: '5 km',
      difficulty: 'Easy',
      terrain: 'Walking paths',
      bestTime: '8:00 AM - 10:00 AM',
      maxCapacity: 20,
      price: 500,
      description: 'An educational walking experience at the famous Theppakadu Elephant Camp. Watch elephants being bathed, fed, and interact with trained mahouts.',
      highlights: ['Elephant bathing', 'Feeding sessions', 'Mahout interaction', 'Photography'],
      coordinates: [
        [11.5805, 76.5855], // Elephant camp entrance
        [11.5795, 76.5845],
        [11.5785, 76.5840],
        [11.5775, 76.5845], // Bathing area
        [11.5770, 76.5855],
        [11.5775, 76.5865],
        [11.5785, 76.5870], // Feeding area
        [11.5795, 76.5865],
        [11.5805, 76.5855], // Return
      ],
      waypoints: [
        { name: 'Camp Entrance', coords: [11.5805, 76.5855], time: '8:00 AM', description: 'Meet your guide and receive safety briefing', elevation: 950 },
        { name: 'River Bathing Area', coords: [11.5775, 76.5845], time: '8:30 AM', description: 'Watch elephants being bathed in the Moyar river', elevation: 945 },
        { name: 'Feeding Ground', coords: [11.5785, 76.5870], time: '9:15 AM', description: 'Participate in elephant feeding session', elevation: 952 },
        { name: 'Photo Opportunity', coords: [11.5805, 76.5855], time: '10:00 AM', description: 'Get memorable photos with gentle giants', elevation: 950 },
      ]
    }
  };

  // Wildlife zones with real coordinates
  const wildlifeZones = [
    {
      id: 'tiger-alpha',
      name: 'Tiger Territory Alpha',
      coords: [11.5650, 76.5680],
      radius: 800,
      color: '#EF4444',
      species: ['Bengal Tiger', 'Leopard', 'Wild Boar', 'Sambar Deer'],
      probability: 'High',
      bestTime: 'Early morning (6-8 AM)',
      description: 'Core tiger habitat with frequent sightings. Tigers use this corridor for hunting.'
    },
    {
      id: 'elephant-zone',
      name: 'Elephant Gathering Point',
      coords: [11.5750, 76.5920],
      radius: 1000,
      color: '#22C55E',
      species: ['Asian Elephant', 'Gaur', 'Spotted Deer', 'Langur'],
      probability: 'Very High',
      bestTime: 'Morning & Evening',
      description: 'Major elephant crossing zone. Herds of 20-50 elephants regularly seen.'
    },
    {
      id: 'bird-sanctuary',
      name: 'Bird Watching Paradise',
      coords: [11.5820, 76.6020],
      radius: 600,
      color: '#3B82F6',
      species: ['Malabar Pied Hornbill', 'Indian Peafowl', 'Crested Serpent Eagle', 'Paradise Flycatcher'],
      probability: 'High',
      bestTime: 'Early morning',
      description: 'Dense canopy area perfect for bird watching. Over 200 species recorded.'
    },
    {
      id: 'deer-meadows',
      name: 'Deer Meadows',
      coords: [11.5880, 76.5950],
      radius: 700,
      color: '#F59E0B',
      species: ['Spotted Deer', 'Sambar', 'Barking Deer', 'Mouse Deer'],
      probability: 'Very High',
      bestTime: 'Throughout day',
      description: 'Open grasslands where large herds of deer graze. Easy photography opportunities.'
    }
  ];

  const currentRoute = safariRoutes[selectedRoute];
  const mapCenter = [11.5750, 76.5850];

  // Animation handler
  const startAnimation = () => {
    setIsAnimating(true);
    setAnimationProgress(0);
    
    const totalSteps = 100;
    let step = 0;
    
    const interval = setInterval(() => {
      step++;
      setAnimationProgress(step / totalSteps);
      
      if (step >= totalSteps) {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 50);
  };

  // Get animated route portion
  const getAnimatedCoordinates = () => {
    if (!isAnimating || animationProgress === 0) return currentRoute.coordinates;
    
    const totalPoints = currentRoute.coordinates.length;
    const endIndex = Math.floor(animationProgress * totalPoints);
    return currentRoute.coordinates.slice(0, Math.max(2, endIndex + 1));
  };

  return (
    <div className="min-h-screen bg-[#1E3A1E]" data-testid="safari-route-explorer">
      <Header />
      
      <main className="pt-[88px]">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2D5016]/30 via-transparent to-[#FF6B35]/20" />
          <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#5A9A3A] to-[#2D5016] rounded-2xl flex items-center justify-center shadow-lg shadow-[#5A9A3A]/30">
                    <Icon name="Compass" size={28} className="text-white" />
                  </div>
                  <div>
                    <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white">
                      Safari Route Explorer
                    </h1>
                    <p className="text-[#B8C4A8] text-sm md:text-base">
                      Interactive maps • Real-time routes • Wildlife hotspots
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={startAnimation}
                disabled={isAnimating}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  isAnimating 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-[#FF9E6D] to-[#FF6B35] hover:from-[#FFA07A] hover:to-[#FF9E6D] text-white shadow-lg shadow-[#FF9E6D]/30 hover:shadow-xl'
                }`}
              >
                <Icon name={isAnimating ? "Loader2" : "Play"} size={20} className={isAnimating ? "animate-spin" : ""} />
                {isAnimating ? 'Simulating Journey...' : 'Simulate Journey'}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 pb-12">
          {/* Route Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {Object.values(safariRoutes).map((route) => (
              <button
                key={route.id}
                onClick={() => {
                  setSelectedRoute(route.id);
                  setSelectedWaypoint(null);
                }}
                className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 group ${
                  selectedRoute === route.id
                    ? 'ring-2 ring-offset-2 ring-offset-[#1E3A1E]'
                    : 'hover:scale-[1.02]'
                }`}
                style={{
                  background: selectedRoute === route.id 
                    ? `linear-gradient(135deg, ${route.gradientFrom}, ${route.gradientTo})`
                    : '#2A4A2A',
                  ringColor: route.color
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedRoute === route.id ? 'bg-white/20' : 'bg-[#5A9A3A]/20'
                  }`}>
                    <Icon 
                      name={route.icon} 
                      size={24} 
                      className={selectedRoute === route.id ? 'text-white' : 'text-[#5A9A3A]'}
                    />
                  </div>
                  {selectedRoute === route.id && (
                    <div className="bg-white/20 rounded-full p-1">
                      <Icon name="Check" size={16} className="text-white" />
                    </div>
                  )}
                </div>
                <h3 className={`font-heading font-bold text-lg mb-1 ${
                  selectedRoute === route.id ? 'text-white' : 'text-white'
                }`}>
                  {route.name.split(' - ')[0]}
                </h3>
                <p className={`text-sm mb-3 ${
                  selectedRoute === route.id ? 'text-white/80' : 'text-[#B8C4A8]'
                }`}>
                  {route.name.split(' - ')[1] || route.terrain}
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <span className={`flex items-center gap-1 ${
                    selectedRoute === route.id ? 'text-white/70' : 'text-[#B8C4A8]'
                  }`}>
                    <Icon name="Clock" size={14} /> {route.duration}
                  </span>
                  <span className={`flex items-center gap-1 ${
                    selectedRoute === route.id ? 'text-white/70' : 'text-[#B8C4A8]'
                  }`}>
                    <Icon name="Route" size={14} /> {route.distance}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedRoute === route.id ? 'bg-white/20 text-white' : 'bg-[#5A9A3A]/20 text-[#5A9A3A]'
                  }`}>
                    ₹{route.price}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Interactive Map - Takes 3 columns */}
            <div className="lg:col-span-3">
              <div className="bg-[#2A4A2A] rounded-2xl overflow-hidden border border-[#5A9A3A]/30 shadow-2xl">
                <div className="relative h-[500px] md:h-[600px]">
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    <MapController route={currentRoute} isAnimating={isAnimating} />

                    {/* Wildlife Zones */}
                    {showWildlifeZones && wildlifeZones.map((zone) => (
                      <Circle
                        key={zone.id}
                        center={zone.coords}
                        radius={zone.radius}
                        pathOptions={{
                          color: zone.color,
                          fillColor: zone.color,
                          fillOpacity: 0.15,
                          weight: 2,
                          dashArray: '5, 5'
                        }}
                        eventHandlers={{
                          click: () => setSelectedZone(zone)
                        }}
                      >
                        <Popup>
                          <div className="min-w-[200px]">
                            <h4 className="font-bold text-sm" style={{ color: zone.color }}>{zone.name}</h4>
                            <p className="text-xs text-gray-600 mt-1">{zone.probability} probability</p>
                            <p className="text-xs text-gray-500 mt-1">{zone.species.slice(0, 3).join(', ')}</p>
                          </div>
                        </Popup>
                      </Circle>
                    ))}

                    {/* Route Path */}
                    <Polyline
                      positions={isAnimating ? getAnimatedCoordinates() : currentRoute.coordinates}
                      pathOptions={{
                        color: currentRoute.color,
                        weight: 5,
                        opacity: 0.8,
                        lineCap: 'round',
                        lineJoin: 'round'
                      }}
                    />

                    {/* Animated head marker */}
                    {isAnimating && animationProgress > 0 && (
                      <Marker
                        position={getAnimatedCoordinates()[getAnimatedCoordinates().length - 1]}
                        icon={L.divIcon({
                          html: `<div style="
                            background: ${currentRoute.color};
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            border: 3px solid white;
                            box-shadow: 0 0 20px ${currentRoute.color};
                          "></div>`,
                          className: 'animated-marker',
                          iconSize: [20, 20],
                          iconAnchor: [10, 10]
                        })}
                      />
                    )}

                    {/* Waypoint Markers */}
                    {currentRoute.waypoints.map((waypoint, index) => (
                      <Marker
                        key={index}
                        position={waypoint.coords}
                        icon={index === 0 
                          ? createStartEndIcon('start', currentRoute.color)
                          : index === currentRoute.waypoints.length - 1
                            ? createStartEndIcon('end', currentRoute.color)
                            : createWaypointIcon(index + 1, currentRoute.color)
                        }
                        eventHandlers={{
                          click: () => setSelectedWaypoint(waypoint)
                        }}
                      >
                        <Popup>
                          <div className="min-w-[180px]">
                            <h4 className="font-bold text-sm">{waypoint.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{waypoint.time}</p>
                            <p className="text-xs text-gray-600 mt-1">{waypoint.description}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>

                  {/* Map Overlay - Route Info */}
                  <div className="absolute top-4 left-4 bg-[#2A4A2A]/95 backdrop-blur-sm rounded-xl p-4 shadow-lg z-[1000] border border-[#5A9A3A]/30 max-w-xs">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${currentRoute.gradientFrom}, ${currentRoute.gradientTo})` }}
                      >
                        <Icon name={currentRoute.icon} size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-white text-sm">{currentRoute.name.split(' - ')[0]}</h3>
                        <p className="text-xs text-[#B8C4A8]">{currentRoute.waypoints.length} stops</p>
                      </div>
                    </div>
                    {isAnimating && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-[#1E3A1E] rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-100"
                            style={{ 
                              width: `${animationProgress * 100}%`,
                              background: `linear-gradient(90deg, ${currentRoute.gradientFrom}, ${currentRoute.gradientTo})`
                            }}
                          />
                        </div>
                        <p className="text-xs text-[#B8C4A8] mt-1 text-center">
                          {Math.round(animationProgress * 100)}% complete
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Wildlife Toggle */}
                  <button
                    onClick={() => setShowWildlifeZones(!showWildlifeZones)}
                    className={`absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg z-[1000] transition-all ${
                      showWildlifeZones 
                        ? 'bg-[#5A9A3A] text-white' 
                        : 'bg-[#2A4A2A]/95 text-[#B8C4A8] border border-[#5A9A3A]/30'
                    }`}
                  >
                    <Icon name="Binoculars" size={18} />
                    <span className="text-sm font-medium">Wildlife Zones</span>
                  </button>

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-[#2A4A2A]/95 backdrop-blur-sm rounded-xl p-3 shadow-lg z-[1000] border border-[#5A9A3A]/30">
                    <p className="text-xs font-semibold text-[#5A9A3A] mb-2">Wildlife Hotspots</p>
                    <div className="space-y-1.5">
                      {wildlifeZones.map(zone => (
                        <div key={zone.id} className="flex items-center gap-2 text-xs">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }} />
                          <span className="text-[#B8C4A8]">{zone.name.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Journey Timeline */}
              <div className="mt-6 bg-[#2A4A2A] rounded-2xl p-6 border border-[#5A9A3A]/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#5A9A3A]/20 rounded-xl flex items-center justify-center">
                    <Icon name="Route" size={20} className="text-[#5A9A3A]" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-white">Journey Timeline</h3>
                </div>
                
                <div className="relative">
                  {/* Timeline line */}
                  <div 
                    className="absolute top-0 bottom-0 left-5 w-0.5"
                    style={{ background: `linear-gradient(to bottom, ${currentRoute.gradientFrom}, ${currentRoute.gradientTo})` }}
                  />
                  
                  <div className="space-y-4">
                    {currentRoute.waypoints.map((waypoint, index) => (
                      <div 
                        key={index} 
                        className={`relative flex gap-4 cursor-pointer group ${
                          selectedWaypoint?.name === waypoint.name ? 'scale-[1.02]' : ''
                        }`}
                        onClick={() => setSelectedWaypoint(waypoint)}
                      >
                        <div className="relative z-10 flex-shrink-0">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-transform group-hover:scale-110"
                            style={{ 
                              background: `linear-gradient(135deg, ${currentRoute.gradientFrom}, ${currentRoute.gradientTo})`,
                              boxShadow: `0 4px 12px ${currentRoute.color}40`
                            }}
                          >
                            {index === 0 ? '🚩' : index === currentRoute.waypoints.length - 1 ? '🏁' : index + 1}
                          </div>
                        </div>
                        
                        <div className={`flex-1 p-4 rounded-xl transition-all ${
                          selectedWaypoint?.name === waypoint.name 
                            ? 'bg-[#5A9A3A]/20 border border-[#5A9A3A]/50' 
                            : 'bg-[#1E3A1E] hover:bg-[#3A5A3A]'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-heading font-semibold text-white">{waypoint.name}</h4>
                            <span className="px-3 py-1 bg-[#5A9A3A]/20 text-[#5A9A3A] text-xs font-semibold rounded-full">
                              {waypoint.time}
                            </span>
                          </div>
                          <p className="text-sm text-[#B8C4A8] mb-2">{waypoint.description}</p>
                          <div className="flex items-center gap-4 text-xs text-[#B8C4A8]">
                            <span className="flex items-center gap-1">
                              <Icon name="Mountain" size={14} className="text-[#FF9E6D]" />
                              {waypoint.elevation}m elevation
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Route Details Card */}
              <div className="bg-[#2A4A2A] rounded-2xl p-6 border border-[#5A9A3A]/30">
                <h3 className="font-heading font-bold text-lg text-white mb-4">Route Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#5A9A3A]/20 rounded-lg flex items-center justify-center">
                      <Icon name="Clock" size={18} className="text-[#5A9A3A]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#B8C4A8]">Duration</p>
                      <p className="text-white font-semibold">{currentRoute.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#A0522D]/20 rounded-lg flex items-center justify-center">
                      <Icon name="Route" size={18} className="text-[#A0522D]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#B8C4A8]">Distance</p>
                      <p className="text-white font-semibold">{currentRoute.distance}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF9E6D]/20 rounded-lg flex items-center justify-center">
                      <Icon name="TrendingUp" size={18} className="text-[#FF9E6D]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#B8C4A8]">Difficulty</p>
                      <p className="text-white font-semibold">{currentRoute.difficulty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#5A9A3A]/20 rounded-lg flex items-center justify-center">
                      <Icon name="Users" size={18} className="text-[#5A9A3A]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#B8C4A8]">Max Capacity</p>
                      <p className="text-white font-semibold">{currentRoute.maxCapacity} people</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center">
                      <Icon name="Sun" size={18} className="text-[#F59E0B]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#B8C4A8]">Best Time</p>
                      <p className="text-white font-semibold">{currentRoute.bestTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Highlights Card */}
              <div className="bg-[#2A4A2A] rounded-2xl p-6 border border-[#5A9A3A]/30">
                <h3 className="font-heading font-bold text-lg text-white mb-4">Highlights</h3>
                <div className="space-y-2">
                  {currentRoute.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-[#1E3A1E] rounded-lg">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Icon name="Check" size={14} className="text-green-400" />
                      </div>
                      <span className="text-sm text-[#B8C4A8]">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book Safari CTA */}
              <div 
                className="rounded-2xl p-6 text-white"
                style={{ background: `linear-gradient(135deg, ${currentRoute.gradientFrom}, ${currentRoute.gradientTo})` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/70 text-sm">Starting from</p>
                    <p className="text-3xl font-bold">₹{currentRoute.price}</p>
                    <p className="text-white/70 text-xs">per person</p>
                  </div>
                  <Icon name={currentRoute.icon} size={48} className="text-white/30" />
                </div>
                
                {/* Safari Date Selection */}
                <div className="mb-4">
                  <label className="text-white/70 text-xs mb-1 block">Safari Date</label>
                  <input
                    type="date"
                    value={safariDate}
                    onChange={(e) => setSafariDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/40"
                    data-testid="safari-date-input"
                  />
                </div>
                
                {/* Participants */}
                <div className="mb-4">
                  <label className="text-white/70 text-xs mb-1 block">Participants</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setParticipants(Math.max(1, participants - 1))}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
                    >
                      <Icon name="Minus" size={16} />
                    </button>
                    <span className="text-lg font-bold w-8 text-center">{participants}</span>
                    <button
                      onClick={() => setParticipants(Math.min(currentRoute.maxCapacity, participants + 1))}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
                    >
                      <Icon name="Plus" size={16} />
                    </button>
                    <span className="text-white/50 text-xs ml-2">Max {currentRoute.maxCapacity}</span>
                  </div>
                </div>
                
                {/* Total */}
                <div className="flex items-center justify-between py-2 border-t border-white/20 mb-4">
                  <span className="text-white/70">Total</span>
                  <span className="text-xl font-bold">₹{(currentRoute.price * participants).toLocaleString()}</span>
                </div>
                
                {isSafariInCart(currentRoute.id) ? (
                  <div className="space-y-3">
                    <div className="w-full py-3 bg-white/20 text-white rounded-xl text-center font-medium flex items-center justify-center gap-2">
                      <Icon name="CheckCircle" size={18} />
                      Added to Cart
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate('/e-shop')}
                        className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1"
                      >
                        <Icon name="ShoppingBag" size={16} />
                        Add Souvenirs
                      </button>
                      <button
                        onClick={() => navigate('/shopping-cart')}
                        className="flex-1 py-2.5 bg-white hover:bg-white/90 text-gray-900 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1"
                      >
                        <Icon name="CreditCard" size={16} />
                        Checkout
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={async () => {
                      if (!safariDate) {
                        showToast('Please select a date for your safari', 'error');
                        return;
                      }
                      setAddingToCart(true);
                      try {
                        await addToCart({
                          type: 'activity',
                          id: currentRoute.id,
                          name: currentRoute.name,
                          price: currentRoute.price,
                          quantity: participants,
                          totalPrice: currentRoute.price * participants,
                          details: {
                            date: safariDate,
                            participants: participants,
                            duration: currentRoute.duration,
                            distance: currentRoute.distance,
                            difficulty: currentRoute.difficulty,
                            bestTime: currentRoute.bestTime
                          }
                        });
                        showToast(`${currentRoute.name} added to cart!`);
                      } catch (error) {
                        showToast('Failed to add to cart', 'error');
                      } finally {
                        setAddingToCart(false);
                      }
                    }}
                    disabled={addingToCart}
                    className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    data-testid="add-safari-to-cart-btn"
                  >
                    {addingToCart ? (
                      <><Icon name="Loader2" size={18} className="animate-spin" /> Adding...</>
                    ) : (
                      <><Icon name="ShoppingCart" size={18} /> Add to Cart</>
                    )}
                  </button>
                )}
              </div>
              
              {/* Cart Summary */}
              {getCartCount() > 0 && (
                <div className="bg-[#2A4A2A] rounded-2xl p-4 border border-[#5A9A3A]/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#B8C4A8] text-sm">Items in cart</span>
                    <span className="text-white font-bold">{getCartCount()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate('/e-shop')}
                      className="flex-1 py-2 bg-[#5A9A3A]/20 hover:bg-[#5A9A3A]/30 text-[#5A9A3A] rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
                    >
                      <Icon name="ShoppingBag" size={14} />
                      Souvenirs
                    </button>
                    <button
                      onClick={() => navigate('/shopping-cart')}
                      className="flex-1 py-2 bg-[#FF9E6D]/20 hover:bg-[#FF9E6D]/30 text-[#FF9E6D] rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
                    >
                      <Icon name="ShoppingCart" size={14} />
                      View Cart
                    </button>
                  </div>
                </div>
              )}

              {/* Selected Zone Info */}
              {selectedZone && (
                <div className="bg-[#2A4A2A] rounded-2xl p-6 border-2" style={{ borderColor: selectedZone.color }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-white">{selectedZone.name}</h3>
                      <span 
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${selectedZone.color}20`, color: selectedZone.color }}
                      >
                        {selectedZone.probability} Probability
                      </span>
                    </div>
                    <button 
                      onClick={() => setSelectedZone(null)}
                      className="p-1 hover:bg-[#1E3A1E] rounded-lg transition-colors"
                    >
                      <Icon name="X" size={18} className="text-[#B8C4A8]" />
                    </button>
                  </div>
                  <p className="text-sm text-[#B8C4A8] mb-4">{selectedZone.description}</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-[#5A9A3A] font-semibold mb-2">Species Found</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedZone.species.map((species, idx) => (
                          <span key={idx} className="px-2 py-1 bg-[#1E3A1E] text-[#B8C4A8] text-xs rounded-full">
                            {species}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#B8C4A8]">
                      <Icon name="Clock" size={14} className="text-[#5A9A3A]" />
                      {selectedZone.bestTime}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SafariRouteExplorer;
