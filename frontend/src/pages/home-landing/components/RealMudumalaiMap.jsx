import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import 'leaflet/dist/leaflet.css';

// Custom marker icons for different accommodation types
const createCustomIcon = (color, iconType) => {
  const iconSvg = {
    suite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>`,
    cottage: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    'log-house': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 10h1a3 3 0 0 1 0 6h-1"/><path d="M7 10H6a3 3 0 0 0 0 6h1"/><path d="M12 2v2"/><path d="M12 20v2"/><rect x="9" y="6" width="6" height="12" rx="2"/></svg>`,
    dormitory: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    room: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`,
    shed: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 21 14 3"/><path d="M20.5 21 10 3"/><path d="M15.5 21 12 15l-3.5 6"/><path d="M2 21h20"/></svg>`
  };

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M20 0 C9 0 0 9 0 20 C0 35 20 50 20 50 C20 50 40 35 40 20 C40 9 31 0 20 0 Z" fill="${color}" filter="url(#shadow)"/>
      <circle cx="20" cy="18" r="12" fill="white" fill-opacity="0.2"/>
      <g transform="translate(8, 6) scale(0.5)">${iconSvg[iconType] || iconSvg.room}</g>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-marker',
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50]
  });
};

// Map bounds fitter component
const MapBoundsFitter = ({ locations, activeRegion }) => {
  const map = useMap();
  
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.coords.lat, loc.coords.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [locations, activeRegion, map]);

  return null;
};

const RealMudumalaiMap = ({ onLocationSelect, onBookNow }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeRegion, setActiveRegion] = useState('all');

  // Region data with colors
  const regions = {
    theppakadu: {
      name: 'Theppakadu',
      color: '#2D5016',
      description: 'Heart of Mudumalai - Elephant Camp & Safari Base',
      center: [11.5805, 76.5855]
    },
    kargudi: {
      name: 'Kargudi',
      color: '#4A7C2E',
      description: 'Peaceful retreat with bird watching opportunities',
      center: [11.5750, 76.5553]
    },
    abhayaranyam: {
      name: 'Abhayaranyam',
      color: '#8B4513',
      description: 'Wildlife sanctuary with diverse fauna',
      center: [11.5603, 76.5608]
    },
    masinagudi: {
      name: 'Masinagudi',
      color: '#FF6B35',
      description: 'Gateway to wilderness - Scenic viewpoints',
      center: [11.5720, 76.6450]
    },
    genepool: {
      name: 'Genepool',
      color: '#D97706',
      description: 'Conservation center with unique accommodations',
      center: [11.4651, 76.4152]
    }
  };

  // Real locations from KML file with actual GPS coordinates
  const locations = [
    // Theppakadu locations
    { id: 'tiger-tusker', name: 'Tiger & Tusker Suite', region: 'theppakadu', coords: { lat: 11.58107154858472, lng: 76.58500181978323 }, type: 'suite', price: 8500, capacity: 4, amenities: ['AC', 'WiFi', 'Room Service', 'Balcony'], image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', description: 'Premium suite with tiger and elephant themed decor' },
    { id: 'theppakadu-dorm', name: 'Theppakadu Dormitory', region: 'theppakadu', coords: { lat: 11.58100807801462, lng: 76.58522875324276 }, type: 'dormitory', price: 800, capacity: 6, amenities: ['Fan', 'Shared Bath', 'Lockers'], image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400', description: 'Kurinji, Mullai, Marutham, Neithal & Palai blocks' },
    { id: 'theppakadu-log', name: 'Theppakadu Log House', region: 'theppakadu', coords: { lat: 11.58095900051155, lng: 76.58624127774993 }, type: 'log-house', price: 4500, capacity: 3, amenities: ['AC', 'WiFi', 'Fireplace'], image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400', description: 'Grewia, Tectona and Gmeliana cottages' },
    { id: 'minivet-dorm', name: 'Minivet Dormitory', region: 'theppakadu', coords: { lat: 11.58030352707645, lng: 76.58590210221823 }, type: 'dormitory', price: 800, capacity: 8, amenities: ['Fan', 'Shared Bath'], image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400', description: 'Rosy & Scarlet wings' },
    { id: 'sylvan-log', name: 'Sylvan Lodge', region: 'theppakadu', coords: { lat: 11.5800546691988, lng: 76.58658224348882 }, type: 'log-house', price: 5200, capacity: 4, amenities: ['AC', 'WiFi', 'Garden View'], image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400', description: 'Barbet, Babbler, Flycatcher, Beeater & Dormitory' },
    
    // Kargudi locations
    { id: 'peacock-dorm', name: 'Peacock Dormitory', region: 'kargudi', coords: { lat: 11.57498754367434, lng: 76.55534658278272 }, type: 'dormitory', price: 700, capacity: 10, amenities: ['Fan', 'Bird Watching Deck'], image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400', description: 'Perfect for bird enthusiasts' },
    { id: 'cuckoo-frh', name: 'Cuckoo Forest Rest House', region: 'kargudi', coords: { lat: 11.57517391886461, lng: 76.55538383124879 }, type: 'cottage', price: 3500, capacity: 2, amenities: ['AC', 'WiFi', 'Forest View'], image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400', description: 'Cozy forest retreat' },
    
    // Abhayaranyam locations
    { id: 'dhole-sambar', name: 'Dhole Sambar Chital', region: 'abhayaranyam', coords: { lat: 11.56022641015413, lng: 76.56086959044092 }, type: 'cottage', price: 4200, capacity: 3, amenities: ['AC', 'Wildlife Viewing'], image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400', description: 'Named after wildlife species' },
    { id: 'abhayaranyam-annexe', name: 'Abhayaranyam Annexe 1 & 2', region: 'abhayaranyam', coords: { lat: 11.56054042427947, lng: 76.56077442781665 }, type: 'room', price: 3800, capacity: 2, amenities: ['AC', 'WiFi'], image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', description: 'Comfortable annexe rooms' },
    
    // Masinagudi locations
    { id: 'maravakandi', name: 'Maravakandi View 1 & 2', region: 'masinagudi', coords: { lat: 11.57032000491323, lng: 76.64953178622835 }, type: 'suite', price: 6500, capacity: 4, amenities: ['AC', 'Panoramic View', 'Balcony'], image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', description: 'Stunning valley viewpoint' },
    { id: 'masinagudi-rh', name: 'Masinagudi Rest House', region: 'masinagudi', coords: { lat: 11.57546435317101, lng: 76.64699697712946 }, type: 'room', price: 4500, capacity: 2, amenities: ['AC', 'WiFi', 'Room Service'], image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', description: 'Classic rest house accommodation' },
    { id: 'masinagudi-log', name: 'Masinagudi Log House', region: 'masinagudi', coords: { lat: 11.57620725810255, lng: 76.64650284232492 }, type: 'log-house', price: 5500, capacity: 3, amenities: ['AC', 'Fireplace', 'Forest View'], image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400', description: 'Rustic log cabin experience' },
    { id: 'trekking-shed', name: 'Trekking Shed 1 & 2', region: 'masinagudi', coords: { lat: 11.5682698310719, lng: 76.63806641877082 }, type: 'shed', price: 600, capacity: 8, amenities: ['Basic', 'Trekking Base'], image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400', description: 'Base camp for trekkers' },
    
    // Genepool locations
    { id: 'amaravathy', name: 'Amaravathy', region: 'genepool', coords: { lat: 11.46451882269386, lng: 76.41522293146495 }, type: 'room', price: 3200, capacity: 2, amenities: ['AC', 'WiFi'], image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', description: 'Named after the river' },
    { id: 'mayor', name: 'Mayor', region: 'genepool', coords: { lat: 11.46453706848979, lng: 76.41528234107425 }, type: 'room', price: 3200, capacity: 2, amenities: ['AC', 'WiFi'], image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', description: 'Cozy room accommodation' },
    { id: 'bhavani', name: 'Bhavani', region: 'genepool', coords: { lat: 11.46458335159393, lng: 76.415200027998 }, type: 'room', price: 3200, capacity: 2, amenities: ['AC', 'WiFi'], image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', description: 'River-themed room' },
    { id: 'hornbill', name: 'Hornbill', region: 'genepool', coords: { lat: 11.46511300158854, lng: 76.4147721691279 }, type: 'cottage', price: 3800, capacity: 2, amenities: ['AC', 'Bird Watching'], image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400', description: 'Bird-themed cottage' },
    { id: 'panther', name: 'Panther', region: 'genepool', coords: { lat: 11.46530904235488, lng: 76.41470224512418 }, type: 'cottage', price: 4000, capacity: 2, amenities: ['AC', 'Wildlife Theme'], image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400', description: 'Panther-themed cottage' },
    { id: 'nilgiri-tahr-1', name: 'Nilgiri Tahr 1', region: 'genepool', coords: { lat: 11.46479539013876, lng: 76.41490386973695 }, type: 'room', price: 3500, capacity: 2, amenities: ['AC', 'Mountain View'], image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', description: 'Mountain goat themed room' },
    { id: 'nilgiri-tahr-2', name: 'Nilgiri Tahr 2', region: 'genepool', coords: { lat: 11.46476969129802, lng: 76.41494768216937 }, type: 'room', price: 3500, capacity: 2, amenities: ['AC', 'Mountain View'], image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', description: 'Mountain goat themed room' },
    { id: 'rosewood-1', name: 'Rosewood 1', region: 'genepool', coords: { lat: 11.46510267874051, lng: 76.41486036696122 }, type: 'room', price: 3500, capacity: 2, amenities: ['AC', 'Garden'], image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', description: 'Tree-themed accommodation' },
    { id: 'rosewood-2', name: 'Rosewood 2', region: 'genepool', coords: { lat: 11.46513608129423, lng: 76.41482654761208 }, type: 'room', price: 3500, capacity: 2, amenities: ['AC', 'Garden'], image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', description: 'Tree-themed accommodation' },
    { id: 'trekking-shed-gp', name: 'Genepool Trekking Shed', region: 'genepool', coords: { lat: 11.46828656071429, lng: 76.41858863241828 }, type: 'shed', price: 500, capacity: 10, amenities: ['Basic', 'Trekking Base'], image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400', description: 'Base for trekking expeditions' },
    { id: 'thamirabarani', name: 'Thamirabarani', region: 'genepool', coords: { lat: 11.46663699127106, lng: 76.41518080564374 }, type: 'room', price: 3200, capacity: 2, amenities: ['AC', 'WiFi'], image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', description: 'River-themed room' },
    { id: 'vaigai', name: 'Vaigai', region: 'genepool', coords: { lat: 11.46666256239003, lng: 76.41524319979213 }, type: 'room', price: 3200, capacity: 2, amenities: ['AC', 'WiFi'], image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400', description: 'River-themed room' },
  ];

  const filteredLocations = activeRegion === 'all' 
    ? locations 
    : locations.filter(loc => loc.region === activeRegion);

  const handleMarkerClick = (location) => {
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

  const getTypeLabel = (type) => {
    const labels = {
      suite: 'Luxury Suite',
      cottage: 'Forest Cottage',
      'log-house': 'Log House',
      dormitory: 'Dormitory',
      room: 'Rest House',
      shed: 'Trekking Shed'
    };
    return labels[type] || 'Accommodation';
  };

  // Map center - Mudumalai Tiger Reserve
  const mapCenter = [11.5650, 76.5500];

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Region Filter Sidebar */}
      <div className="lg:col-span-1 space-y-3">
        <h4 className="font-heading font-semibold text-[#4A7C2E] mb-4">Filter by Region</h4>
        <button
          onClick={() => setActiveRegion('all')}
          className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
            activeRegion === 'all' 
              ? 'bg-gradient-to-r from-[#4A7C2E] to-[#2D5016] text-white shadow-lg shadow-[#4A7C2E]/30' 
              : 'bg-[#152415] hover:bg-[#1E2E1E] text-[#9CA38B] border border-[#4A7C2E]/20'
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
                : 'bg-[#152415] hover:bg-[#1E2E1E] border'
            }`}
            style={{
              backgroundColor: activeRegion === key ? region.color : undefined,
              borderColor: activeRegion === key ? region.color : 'rgba(74, 124, 46, 0.2)',
              boxShadow: activeRegion === key ? `0 10px 25px ${region.color}40` : undefined
            }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: activeRegion === key ? 'white' : region.color }}
            />
            <span className="font-medium" style={{ color: activeRegion === key ? 'white' : region.color }}>
              {region.name}
            </span>
            <span className="ml-auto text-sm opacity-75" style={{ color: activeRegion === key ? 'white' : '#9CA38B' }}>
              {locations.filter(l => l.region === key).length}
            </span>
          </button>
        ))}

        {/* Map Legend */}
        <div className="mt-6 p-4 bg-[#152415] rounded-xl border border-[#4A7C2E]/20">
          <p className="text-xs font-semibold text-[#4A7C2E] mb-3">Accommodation Types</p>
          <div className="space-y-2 text-xs">
            {[
              { type: 'suite', label: 'Luxury Suite', color: '#4A7C2E' },
              { type: 'cottage', label: 'Forest Cottage', color: '#5A8C3E' },
              { type: 'log-house', label: 'Log House', color: '#A0522D' },
              { type: 'dormitory', label: 'Dormitory', color: '#FF8C5A' },
              { type: 'room', label: 'Rest House', color: '#F0AD4E' },
              { type: 'shed', label: 'Trekking Shed', color: '#9CA38B' }
            ].map(item => (
              <div key={item.type} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: item.color }}
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <span className="text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real Interactive Map */}
      <div className="lg:col-span-3">
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-[#4A7C2E]/30 shadow-2xl shadow-black/30">
          <MapContainer
            center={mapCenter}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ZoomControl position="topright" />
            
            <MapBoundsFitter locations={filteredLocations} activeRegion={activeRegion} />

            {filteredLocations.map((location) => (
              <Marker
                key={location.id}
                position={[location.coords.lat, location.coords.lng]}
                icon={createCustomIcon(regions[location.region]?.color || '#4A7C2E', location.type)}
                eventHandlers={{
                  click: () => handleMarkerClick(location)
                }}
              >
                <Popup className="custom-popup">
                  <div className="min-w-[200px]">
                    <img 
                      src={location.image} 
                      alt={location.name}
                      className="w-full h-24 object-cover rounded-t-lg -mt-3 -mx-3 mb-2"
                      style={{ width: 'calc(100% + 24px)' }}
                    />
                    <h4 className="font-bold text-[#4A7C2E] text-sm">{location.name}</h4>
                    <p className="text-xs text-[#9CA38B] mb-2">{location.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#9CA38B]">{getTypeLabel(location.type)}</span>
                      <span className="font-bold text-[#FF8C5A]">₹{location.price.toLocaleString()}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Title Overlay */}
          <div className="absolute top-4 left-4 bg-[#152415]/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg shadow-black/30 z-[1000] border border-[#4A7C2E]/30">
            <h4 className="font-heading font-bold text-[#4A7C2E] text-sm">Mudumalai Tiger Reserve</h4>
            <p className="text-xs text-[#9CA38B]">Interactive Accommodation Map</p>
          </div>

          {/* Location Count Badge */}
          <div className="absolute bottom-4 left-4 bg-gradient-to-r from-[#4A7C2E] to-[#2D5016] text-white rounded-full px-4 py-2 shadow-lg shadow-[#4A7C2E]/30 z-[1000] flex items-center gap-2">
            <Icon name="MapPin" size={16} />
            <span className="text-sm font-medium">{filteredLocations.length} Locations</span>
          </div>
        </div>
      </div>

      {/* Location Details Panel */}
      <div className="lg:col-span-1">
        {selectedLocation ? (
          <div className="bg-[#152415] rounded-2xl shadow-2xl shadow-black/30 overflow-hidden border border-[#4A7C2E]/30 sticky top-24">
            <div className="relative h-40">
              <img 
                src={selectedLocation.image} 
                alt={selectedLocation.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1A0D] via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span 
                  className="inline-block px-2 py-1 rounded-full text-white text-xs font-medium mb-1 shadow-lg"
                  style={{ backgroundColor: regions[selectedLocation.region]?.color }}
                >
                  {regions[selectedLocation.region]?.name}
                </span>
                <h4 className="font-heading font-bold text-white text-lg leading-tight drop-shadow-lg">{selectedLocation.name}</h4>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <p className="text-sm text-[#9CA38B]">{selectedLocation.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#9CA38B]">{getTypeLabel(selectedLocation.type)}</span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#4A7C2E]">₹{selectedLocation.price.toLocaleString()}</p>
                  <p className="text-xs text-[#9CA38B]">per night</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-[#9CA38B]">
                <Icon name="Users" size={16} className="text-[#4A7C2E]" />
                <span>Max {selectedLocation.capacity} guests</span>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#4A7C2E] mb-2">Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLocation.amenities.map((amenity, idx) => (
                    <span key={idx} className="px-2 py-1 bg-[#4A7C2E]/20 text-[#4A7C2E] text-xs rounded-full border border-[#4A7C2E]/30">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#4A7C2E]/20">
                <p className="text-xs text-[#9CA38B] mb-1">GPS Coordinates</p>
                <p className="text-xs font-mono text-[#4A7C2E]">
                  {selectedLocation.coords.lat.toFixed(5)}°N, {selectedLocation.coords.lng.toFixed(5)}°E
                </p>
              </div>

              <Button 
                onClick={handleBookNow}
                className="w-full bg-gradient-to-r from-[#FF8C5A] to-[#FF6B35] hover:from-[#FFA07A] hover:to-[#FF8C5A] shadow-lg shadow-[#FF8C5A]/30"
                data-testid="book-location-btn"
              >
                <Icon name="Calendar" size={18} />
                Book This Stay
              </Button>

              <a 
                href={`https://www.google.com/maps?q=${selectedLocation.coords.lat},${selectedLocation.coords.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-[#4A7C2E] hover:text-[#5A8C3E] transition-colors"
              >
                <Icon name="ExternalLink" size={14} />
                View on Google Maps
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-[#152415]/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-[#4A7C2E]/20">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#4A7C2E]/20 rounded-full flex items-center justify-center">
              <Icon name="MousePointer" size={28} className="text-[#4A7C2E]" />
            </div>
            <h4 className="font-heading font-semibold text-[#4A7C2E] mb-2">Select a Location</h4>
            <p className="text-sm text-[#9CA38B]">
              Click on any marker on the map to view accommodation details and book your stay
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealMudumalaiMap;
