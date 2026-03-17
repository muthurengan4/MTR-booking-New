import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InteractiveMap = ({ onLocationSelect, onBookNow }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [activeRegion, setActiveRegion] = useState('all');
  const mapRef = useRef(null);

  // Location data from KML file
  const regions = {
    theppakadu: {
      name: 'Theppakadu',
      color: '#2D5016',
      description: 'Heart of Mudumalai - Elephant Camp & Safari Base',
      center: { x: 35, y: 45 }
    },
    kargudi: {
      name: 'Kargudi',
      color: '#4A7C2E',
      description: 'Peaceful retreat with bird watching opportunities',
      center: { x: 25, y: 55 }
    },
    abhayaranyam: {
      name: 'Abhayaranyam',
      color: '#8B4513',
      description: 'Wildlife sanctuary with diverse fauna',
      center: { x: 30, y: 70 }
    },
    masinagudi: {
      name: 'Masinagudi',
      color: '#FF6B35',
      description: 'Gateway to wilderness - Scenic viewpoints',
      center: { x: 75, y: 50 }
    },
    genepool: {
      name: 'Genepool',
      color: '#D97706',
      description: 'Conservation center with unique accommodations',
      center: { x: 15, y: 85 }
    }
  };

  const locations = [
    // Theppakadu locations
    { id: 'tiger-tusker', name: 'Tiger & Tusker Suite', region: 'theppakadu', coords: { lat: 11.58107, lng: 76.58500 }, position: { x: 38, y: 40 }, type: 'suite', price: 8500, capacity: 4, amenities: ['AC', 'WiFi', 'Room Service', 'Balcony'], image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400' },
    { id: 'theppakadu-dorm', name: 'Theppakadu Dormitory', region: 'theppakadu', coords: { lat: 11.58100, lng: 76.58522 }, position: { x: 42, y: 42 }, type: 'dormitory', price: 800, capacity: 6, amenities: ['Fan', 'Shared Bath', 'Lockers'], image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400' },
    { id: 'theppakadu-log', name: 'Theppakadu Log House', region: 'theppakadu', coords: { lat: 11.58095, lng: 76.58624 }, position: { x: 46, y: 44 }, type: 'log-house', price: 4500, capacity: 3, amenities: ['AC', 'WiFi', 'Fireplace'], image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400' },
    { id: 'minivet-dorm', name: 'Minivet Dormitory', region: 'theppakadu', coords: { lat: 11.58030, lng: 76.58590 }, position: { x: 44, y: 48 }, type: 'dormitory', price: 800, capacity: 8, amenities: ['Fan', 'Shared Bath'], image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400' },
    { id: 'sylvan-log', name: 'Sylvan Log House', region: 'theppakadu', coords: { lat: 11.58005, lng: 76.58658 }, position: { x: 48, y: 50 }, type: 'log-house', price: 5200, capacity: 4, amenities: ['AC', 'WiFi', 'Garden View'], image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400' },
    
    // Kargudi locations
    { id: 'peacock-dorm', name: 'Peacock Dormitory', region: 'kargudi', coords: { lat: 11.57498, lng: 76.55534 }, position: { x: 22, y: 52 }, type: 'dormitory', price: 700, capacity: 10, amenities: ['Fan', 'Bird Watching Deck'], image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400' },
    { id: 'cuckoo-frh', name: 'Cuckoo FRH', region: 'kargudi', coords: { lat: 11.57517, lng: 76.55538 }, position: { x: 26, y: 54 }, type: 'cottage', price: 3500, capacity: 2, amenities: ['AC', 'WiFi', 'Forest View'], image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400' },
    
    // Abhayaranyam locations
    { id: 'dhole-sambar', name: 'Dhole, Sambar & Chital', region: 'abhayaranyam', coords: { lat: 11.56022, lng: 76.56086 }, position: { x: 28, y: 68 }, type: 'cottage', price: 4200, capacity: 3, amenities: ['AC', 'Wildlife Viewing'], image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400' },
    { id: 'abhayaranyam-annexe', name: 'Abhayaranyam Annexe', region: 'abhayaranyam', coords: { lat: 11.56054, lng: 76.56077 }, position: { x: 32, y: 72 }, type: 'room', price: 3800, capacity: 2, amenities: ['AC', 'WiFi'], image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400' },
    
    // Masinagudi locations
    { id: 'maravakandi', name: 'Maravakandi Viewpoint', region: 'masinagudi', coords: { lat: 11.57032, lng: 76.64953 }, position: { x: 72, y: 48 }, type: 'suite', price: 6500, capacity: 4, amenities: ['AC', 'Panoramic View', 'Balcony'], image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400' },
    { id: 'masinagudi-rh', name: 'Masinagudi Rest House', region: 'masinagudi', coords: { lat: 11.57546, lng: 76.64699 }, position: { x: 76, y: 52 }, type: 'room', price: 4500, capacity: 2, amenities: ['AC', 'WiFi', 'Room Service'], image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400' },
    { id: 'masinagudi-log', name: 'Masinagudi Log House', region: 'masinagudi', coords: { lat: 11.57620, lng: 76.64650 }, position: { x: 78, y: 46 }, type: 'log-house', price: 5500, capacity: 3, amenities: ['AC', 'Fireplace', 'Forest View'], image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400' },
    { id: 'trekking-shed', name: 'Trekking Shed', region: 'masinagudi', coords: { lat: 11.56826, lng: 76.63806 }, position: { x: 68, y: 58 }, type: 'shed', price: 600, capacity: 8, amenities: ['Basic', 'Trekking Base'], image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400' },
    
    // Genepool locations
    { id: 'amaravathy', name: 'Amaravathy', region: 'genepool', coords: { lat: 11.46451, lng: 76.41522 }, position: { x: 12, y: 82 }, type: 'room', price: 3200, capacity: 2, amenities: ['AC', 'WiFi'], image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400' },
    { id: 'hornbill', name: 'Hornbill', region: 'genepool', coords: { lat: 11.46511, lng: 76.41477 }, position: { x: 16, y: 86 }, type: 'cottage', price: 3800, capacity: 2, amenities: ['AC', 'Bird Watching'], image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400' },
    { id: 'panther', name: 'Panther', region: 'genepool', coords: { lat: 11.46530, lng: 76.41470 }, position: { x: 18, y: 88 }, type: 'cottage', price: 4000, capacity: 2, amenities: ['AC', 'Wildlife Theme'], image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400' },
    { id: 'nilgiri-tahr', name: 'Nilgiri Tahr', region: 'genepool', coords: { lat: 11.46479, lng: 76.41490 }, position: { x: 14, y: 84 }, type: 'room', price: 3500, capacity: 2, amenities: ['AC', 'Mountain View'], image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400' },
  ];

  const filteredLocations = activeRegion === 'all' 
    ? locations 
    : locations.filter(loc => loc.region === activeRegion);

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const handleBookNow = () => {
    if (selectedLocation && onBookNow) {
      onBookNow(selectedLocation);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'suite': return 'Crown';
      case 'cottage': return 'Home';
      case 'log-house': return 'TreePine';
      case 'dormitory': return 'Users';
      case 'room': return 'Bed';
      case 'shed': return 'Tent';
      default: return 'MapPin';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'suite': return 'Luxury Suite';
      case 'cottage': return 'Forest Cottage';
      case 'log-house': return 'Log House';
      case 'dormitory': return 'Dormitory';
      case 'room': return 'Rest House';
      case 'shed': return 'Trekking Shed';
      default: return 'Accommodation';
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Region Filter Sidebar */}
      <div className="lg:col-span-1 space-y-3">
        <h4 className="font-heading font-semibold text-[#2D5016] mb-4">Filter by Region</h4>
        <button
          onClick={() => setActiveRegion('all')}
          className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
            activeRegion === 'all' 
              ? 'bg-gradient-to-r from-[#2D5016] to-[#4A7C2E] text-white shadow-lg' 
              : 'bg-white hover:bg-[#2D5016]/10 text-[#2D5016] border border-[#2D5016]/20'
          }`}
        >
          <Icon name="Globe" size={18} />
          <span className="font-medium">All Regions</span>
          <span className="ml-auto text-sm opacity-75">{locations.length}</span>
        </button>
        
        {Object.entries(regions).map(([key, region]) => (
          <button
            key={key}
            onClick={() => setActiveRegion(key)}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
              activeRegion === key 
                ? 'text-white shadow-lg' 
                : 'bg-white hover:bg-opacity-20 border border-opacity-20'
            }`}
            style={{
              backgroundColor: activeRegion === key ? region.color : 'white',
              borderColor: region.color
            }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: activeRegion === key ? 'white' : region.color }}
            />
            <span className="font-medium" style={{ color: activeRegion === key ? 'white' : region.color }}>
              {region.name}
            </span>
            <span className="ml-auto text-sm opacity-75" style={{ color: activeRegion === key ? 'white' : region.color }}>
              {locations.filter(l => l.region === key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Interactive Map */}
      <div className="lg:col-span-3">
        <div 
          ref={mapRef}
          className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#2D5016]/10 via-[#4A7C2E]/5 to-[#8B4513]/10 rounded-2xl overflow-hidden border-2 border-[#2D5016]/20 shadow-xl"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Map Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2D5016]/60 via-transparent to-[#8B4513]/40" />
          
          {/* Topographic Lines Effect */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {[20, 35, 50, 65, 80].map((y, i) => (
                <path
                  key={i}
                  d={`M0,${y} Q25,${y + 5} 50,${y - 3} T100,${y + 2}`}
                  fill="none"
                  stroke="#2D5016"
                  strokeWidth="0.3"
                />
              ))}
            </svg>
          </div>

          {/* Region Labels */}
          {Object.entries(regions).map(([key, region]) => (
            <div
              key={key}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                activeRegion === 'all' || activeRegion === key ? 'opacity-100' : 'opacity-30'
              }`}
              style={{ 
                left: `${region.center.x}%`, 
                top: `${region.center.y}%`,
              }}
            >
              <div 
                className="px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg whitespace-nowrap"
                style={{ backgroundColor: region.color }}
              >
                {region.name}
              </div>
            </div>
          ))}

          {/* Location Markers */}
          {filteredLocations.map((location) => (
            <button
              key={location.id}
              onClick={() => handleLocationClick(location)}
              onMouseEnter={() => setHoveredLocation(location)}
              onMouseLeave={() => setHoveredLocation(null)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10 ${
                selectedLocation?.id === location.id 
                  ? 'scale-125 z-20' 
                  : hoveredLocation?.id === location.id 
                    ? 'scale-110' 
                    : 'scale-100'
              }`}
              style={{ 
                left: `${location.position.x}%`, 
                top: `${location.position.y}%` 
              }}
              data-testid={`map-marker-${location.id}`}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all duration-300 ${
                  selectedLocation?.id === location.id 
                    ? 'ring-4 ring-white/50' 
                    : ''
                }`}
                style={{ backgroundColor: regions[location.region]?.color || '#2D5016' }}
              >
                <Icon name={getTypeIcon(location.type)} size={18} className="text-white" />
              </div>
              
              {/* Tooltip on hover */}
              {hoveredLocation?.id === location.id && selectedLocation?.id !== location.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white rounded-lg shadow-xl whitespace-nowrap z-30">
                  <p className="font-semibold text-[#2D5016] text-sm">{location.name}</p>
                  <p className="text-xs text-muted-foreground">₹{location.price.toLocaleString()}/night</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white" />
                </div>
              )}
            </button>
          ))}

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
            <p className="text-xs font-semibold text-[#2D5016] mb-2">Accommodation Types</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[['suite', 'Suite'], ['cottage', 'Cottage'], ['log-house', 'Log House'], ['dormitory', 'Dormitory']].map(([type, label]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <Icon name={getTypeIcon(type)} size={12} className="text-[#2D5016]" />
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compass */}
          <div className="absolute top-4 right-4 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center">
            <Icon name="Compass" size={28} className="text-[#2D5016]" />
          </div>
        </div>
      </div>

      {/* Location Details Panel */}
      <div className="lg:col-span-1">
        {selectedLocation ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#2D5016]/20 sticky top-24">
            <div className="relative h-40">
              <img 
                src={selectedLocation.image} 
                alt={selectedLocation.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span 
                  className="inline-block px-2 py-1 rounded-full text-white text-xs font-medium mb-1"
                  style={{ backgroundColor: regions[selectedLocation.region]?.color }}
                >
                  {regions[selectedLocation.region]?.name}
                </span>
                <h4 className="font-heading font-bold text-white text-lg leading-tight">{selectedLocation.name}</h4>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{getTypeLabel(selectedLocation.type)}</span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#2D5016]">₹{selectedLocation.price.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">per night</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Users" size={16} />
                <span>Max {selectedLocation.capacity} guests</span>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#2D5016] mb-2">Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLocation.amenities.map((amenity, idx) => (
                    <span key={idx} className="px-2 py-1 bg-[#2D5016]/10 text-[#2D5016] text-xs rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#2D5016]/10">
                <p className="text-xs text-muted-foreground mb-1">GPS Coordinates</p>
                <p className="text-xs font-mono text-[#2D5016]">
                  {selectedLocation.coords.lat.toFixed(5)}°N, {selectedLocation.coords.lng.toFixed(5)}°E
                </p>
              </div>

              <Button 
                onClick={handleBookNow}
                className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF8C5A] hover:from-[#FF8C5A] hover:to-[#FF6B35]"
                data-testid="book-location-btn"
              >
                <Icon name="Calendar" size={18} />
                Book This Stay
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-[#2D5016]/20">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#2D5016]/10 rounded-full flex items-center justify-center">
              <Icon name="MousePointer" size={28} className="text-[#2D5016]" />
            </div>
            <h4 className="font-heading font-semibold text-[#2D5016] mb-2">Select a Location</h4>
            <p className="text-sm text-muted-foreground">
              Click on any marker on the map to view accommodation details and book your stay
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveMap;
