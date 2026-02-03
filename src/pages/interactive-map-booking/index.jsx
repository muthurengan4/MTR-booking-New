import React, { useState } from 'react';
import Header from '../../components/navigation/Header';
import BookingProgress from '../../components/navigation/BookingProgress';
import MapPanel from './components/MapPanel';
import BookingFilters from './components/BookingFilters';
import RoomTypeCard from './components/RoomTypeCard';
import AvailabilityCalendar from './components/AvailabilityCalendar';
import BookingSummary from './components/BookingSummary';
import Icon from '../../components/AppIcon';

const InteractiveMapBooking = () => {
  const [activeTab, setActiveTab] = useState('map');

  const mockLocations = [
  {
    id: 1,
    name: 'Masinagudi',
    description: 'Nestled in the heart of Mudumalai, Masinagudi offers stunning valley views and proximity to core safari zones with abundant wildlife sightings.',
    distanceToSafari: '2.5 km',
    coordinates: { lat: 11.5667, lng: 76.6333 },
    roomTypes: [
    {
      id: 101,
      type: 'Deluxe Room',
      capacity: 2,
      startingPrice: 3500,
      available: true,
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_10a0f4ace-1767530147750.png",
      imageAlt: 'Spacious deluxe hotel room with king-size bed, wooden furniture, warm lighting, and large windows overlooking forest landscape',
      description: 'Spacious room with modern amenities and forest views',
      amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Balcony'],
      discount: 10
    },
    {
      id: 102,
      type: 'Suite',
      capacity: 4,
      startingPrice: 6500,
      available: true,
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1fede7eb4-1767531331863.png",
      imageAlt: 'Luxurious suite with separate living area, premium furnishings, chandelier lighting, and panoramic mountain views through floor-to-ceiling windows',
      description: 'Premium suite with separate living area and premium amenities',
      amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Balcony', 'Room Service'],
      discount: 15
    },
    {
      id: 103,
      type: 'Cottage',
      capacity: 3,
      startingPrice: 4800,
      available: true,
      image: "https://images.unsplash.com/photo-1731154986176-3429b96340f3",
      imageAlt: 'Rustic wooden cottage exterior surrounded by lush green forest, stone pathway, and traditional architecture with sloped roof',
      description: 'Private cottage surrounded by nature with all modern comforts',
      amenities: ['WiFi', 'AC', 'Hot Water', 'Parking', 'Balcony']
    }]

  },
  {
    id: 2,
    name: 'Thepakadu',
    description: 'Located at the entrance of Mudumalai Tiger Reserve, Thepakadu provides easy access to elephant camps and nature trails through dense forests.',
    distanceToSafari: '1.8 km',
    coordinates: { lat: 11.5833, lng: 76.5333 },
    roomTypes: [
    {
      id: 201,
      type: 'Deluxe Room',
      capacity: 2,
      startingPrice: 3200,
      available: true,
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1af1ae10c-1768401463075.png",
      imageAlt: 'Modern deluxe room with contemporary design, queen bed, minimalist decor, ambient lighting, and garden view through large glass doors',
      description: 'Comfortable room with garden views and modern facilities',
      amenities: ['WiFi', 'AC', 'TV', 'Hot Water']
    },
    {
      id: 202,
      type: 'Dormitory',
      capacity: 6,
      startingPrice: 800,
      available: true,
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c855e09b-1766462867442.png",
      imageAlt: 'Clean dormitory room with multiple bunk beds, individual reading lights, lockers, and shared bathroom facilities in hostel-style accommodation',
      description: 'Budget-friendly shared accommodation for groups',
      amenities: ['WiFi', 'Hot Water', 'Parking'],
      discount: 20
    },
    {
      id: 203,
      type: 'Suite',
      capacity: 4,
      startingPrice: 5800,
      available: false,
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f30e6e8e-1767397380583.png",
      imageAlt: 'Executive suite with elegant interior, separate bedroom and living room, luxury bathroom, and private terrace overlooking wildlife sanctuary',
      description: 'Spacious suite with premium amenities and wildlife views',
      amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service']
    }]

  },
  {
    id: 3,
    name: 'Gudalur',
    description: 'Situated on elevated terrain, Gudalur offers breathtaking panoramic views of the Western Ghats and serves as a gateway to tea plantations.',
    distanceToSafari: '4.2 km',
    coordinates: { lat: 11.5000, lng: 76.5000 },
    roomTypes: [
    {
      id: 301,
      type: 'Cottage',
      capacity: 3,
      startingPrice: 4200,
      available: true,
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1ab70b0cd-1767793259021.png",
      imageAlt: 'Charming hillside cottage with stone walls, wooden beams, cozy fireplace, and wraparound porch with mountain valley views',
      description: 'Hillside cottage with stunning valley views',
      amenities: ['WiFi', 'AC', 'Hot Water', 'Parking', 'Balcony'],
      discount: 12
    },
    {
      id: 302,
      type: 'Deluxe Room',
      capacity: 2,
      startingPrice: 3800,
      available: true,
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_18f7da3af-1767661046592.png",
      imageAlt: 'Elegant deluxe room with plush bedding, wooden accents, modern amenities, and private balcony overlooking tea plantation landscape',
      description: 'Well-appointed room with tea plantation views',
      amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Balcony']
    },
    {
      id: 303,
      type: 'Suite',
      capacity: 4,
      startingPrice: 7200,
      available: true,
      image: "https://img.rocket.new/generatedImages/rocket_gen_img_1956f107d-1764649750876.png",
      imageAlt: 'Premium suite with spacious layout, luxury furnishings, marble bathroom, private dining area, and expansive windows with Western Ghats mountain views',
      description: 'Luxury suite with panoramic mountain views',
      amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Balcony', 'Room Service', 'Hot Water']
    }]

  }];


  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filters, setFilters] = useState({
    checkIn: new Date()?.toISOString()?.split('T')?.[0],
    checkOut: new Date(Date.now() + 86400000)?.toISOString()?.split('T')?.[0],
    guests: '2',
    roomType: 'all'
  });

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setSelectedRoom(null);
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const getFilteredRooms = () => {
    if (!selectedLocation) return [];

    let rooms = selectedLocation?.roomTypes;

    if (filters?.roomType !== 'all') {
      rooms = rooms?.filter((room) =>
      room?.type?.toLowerCase()?.includes(filters?.roomType?.toLowerCase())
      );
    }

    if (filters?.guests) {
      const guestCount = parseInt(filters?.guests);
      rooms = rooms?.filter((room) => room?.capacity >= guestCount);
    }

    return rooms;
  };

  const filteredRooms = getFilteredRooms();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <BookingProgress currentStep={1} onStepClick={() => {}} />
      </div>
      <main className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <div className="mb-6 md:mb-8">
          <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-3">
            Choose Your Perfect Stay
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-measure">
            Explore our three stunning locations across Mudumalai Tiger Reserve. Select your preferred accommodation on the interactive map and discover rooms that match your needs.
          </p>
        </div>

        <BookingFilters filters={filters} onFilterChange={handleFilterChange} />

        <div className="lg:hidden mt-6">
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 transition-organic ${
              activeTab === 'map' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-muted-foreground'}`
              }>

              <Icon name="Map" size={20} strokeWidth={2} />
              <span>Map View</span>
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 transition-organic ${
              activeTab === 'rooms' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-muted-foreground'}`
              }>

              <Icon name="Home" size={20} strokeWidth={2} />
              <span>Rooms</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-6 md:mt-8">
          <div className={`lg:col-span-2 ${activeTab === 'map' ? 'block' : 'hidden lg:block'}`}>
            <div className="h-[500px] md:h-[600px] lg:h-[700px] mb-6 md:mb-8">
              <MapPanel
                locations={mockLocations}
                selectedLocation={selectedLocation}
                onLocationSelect={handleLocationSelect}
                filters={filters} />

            </div>

            {selectedLocation &&
            <>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="Home" size={20} strokeWidth={2} color="var(--color-primary)" />
                    </div>
                    <h2 className="font-heading font-bold text-2xl md:text-3xl">
                      Available Rooms in {selectedLocation?.name}
                    </h2>
                  </div>
                  <p className="text-muted-foreground">{selectedLocation?.description}</p>
                </div>

                {filteredRooms?.length > 0 ?
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                    {filteredRooms?.map((room) =>
                <RoomTypeCard
                  key={room?.id}
                  room={room}
                  onSelect={handleRoomSelect}
                  isSelected={selectedRoom?.id === room?.id} />

                )}
                  </div> :

              <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <Icon name="Search" size={48} strokeWidth={2} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                    <h3 className="font-heading font-semibold text-xl mb-2">No Rooms Found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters to see more options</p>
                  </div>
              }

                {selectedRoom &&
              <AvailabilityCalendar
                selectedRoom={selectedRoom}
                checkIn={filters?.checkIn}
                checkOut={filters?.checkOut} />

              }
              </>
            }

            {!selectedLocation &&
            <div className="bg-card border border-border rounded-xl p-8 md:p-12 text-center">
                <Icon name="MapPin" size={64} strokeWidth={2} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-2xl mb-3">Select a Location</h3>
                <p className="text-muted-foreground max-measure mx-auto">
                  Click on any location marker on the map to view available accommodations and start your booking journey
                </p>
              </div>
            }
          </div>

          <div className={`lg:col-span-1 ${activeTab === 'rooms' ? 'block' : 'hidden lg:block'}`}>
            <BookingSummary
              selectedLocation={selectedLocation}
              selectedRoom={selectedRoom}
              filters={filters} />

          </div>
        </div>
      </main>
    </div>);

};

export default InteractiveMapBooking;