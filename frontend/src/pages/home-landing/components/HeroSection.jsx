import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const HeroSection = ({ onLocationClick, onBookNowClick }) => {
  const locations = [
  {
    id: 'masinagudi',
    name: 'Masinagudi',
    position: { top: '45%', left: '30%' },
    highlight: 'Gateway to wilderness with luxury cottages',
    rooms: 12,
    image: "https://images.unsplash.com/photo-1688761587870-a74f8f5c5a47",
    imageAlt: 'Luxury wooden cottage nestled in dense green forest with mountain backdrop at Masinagudi wildlife resort'
  },
  {
    id: 'thepakadu',
    name: 'Thepakadu',
    position: { top: '35%', left: '55%' },
    highlight: 'Heart of tiger territory with safari access',
    rooms: 8,
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e98cccdb-1766856337806.png",
    imageAlt: 'Traditional safari lodge with thatched roof surrounded by tall trees and wildlife viewing deck at Thepakadu'
  },
  {
    id: 'gudalur',
    name: 'Gudalur',
    position: { top: '60%', left: '70%' },
    highlight: 'Serene valley retreat with nature trails',
    rooms: 10,
    image: "https://images.unsplash.com/photo-1683899306814-cb0c0942441a",
    imageAlt: 'Peaceful valley resort with white buildings set against lush green hills and misty mountains at Gudalur'
  }];


  const [selectedLocation, setSelectedLocation] = React.useState(null);
  const [hoveredLocation, setHoveredLocation] = React.useState(null);

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    if (onLocationClick) {
      onLocationClick(location);
    }
  };

  return (
    <section className="relative bg-background py-8 md:py-12 lg:py-16 -mt-16">
      {/* Top gradient blend with carousel */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background via-background/80 to-transparent" />
      
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-6 md:mb-8 lg:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-[#2D5016] mb-3 md:mb-4">
            Discover Wildlife Paradise
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the untamed beauty of Mudumalai Tiger Reserve across three stunning locations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
          <div className="relative bg-card rounded-2xl shadow-lg overflow-hidden border border-border">
            <div className="relative aspect-[4/3] bg-muted">
              <Image
                src="https://img.rocket.new/generatedImages/rocket_gen_img_1b7aa2fb3-1768809815591.png"
                alt="Detailed topographic map of Mudumalai Tiger Reserve showing three resort locations Masinagudi, Thepakadu and Gudalur with forest boundaries and wildlife zones marked in green"
                className="w-full h-full object-cover" />

              
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

              {locations?.map((location) =>
              <button
                key={location?.id}
                onClick={() => handleLocationClick(location)}
                onMouseEnter={() => setHoveredLocation(location?.id)}
                onMouseLeave={() => setHoveredLocation(null)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-organic hover-lift active-press group"
                style={{ top: location?.position?.top, left: location?.position?.left }}
                aria-label={`View ${location?.name} location details`}>

                  <div className={`relative transition-organic ${
                hoveredLocation === location?.id || selectedLocation?.id === location?.id ?
                'scale-125' : 'scale-100'}`
                }>
                    <div className={`w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center transition-organic ${
                  selectedLocation?.id === location?.id ?
                  'bg-accent text-accent-foreground shadow-lg' :
                  'bg-primary text-primary-foreground shadow-md'}`
                  }>
                      <Icon name="MapPin" size={20} strokeWidth={2.5} />
                    </div>
                    
                    {(hoveredLocation === location?.id || selectedLocation?.id === location?.id) &&
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-card border border-border rounded-lg shadow-xl p-3 md:p-4 whitespace-nowrap z-10 min-w-[200px] md:min-w-[240px]">
                        <p className="font-semibold text-sm md:text-base text-foreground mb-1">{location?.name}</p>
                        <p className="text-xs md:text-sm text-muted-foreground mb-2">{location?.rooms} rooms available</p>
                        <div className="w-full h-px bg-border my-2" />
                        <p className="text-xs text-muted-foreground">{location?.highlight}</p>
                      </div>
                  }
                  </div>
                </button>
              )}
            </div>

            <div className="p-4 md:p-6 bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                <Icon name="Info" size={18} strokeWidth={2} />
                <span>Click on location pins to explore accommodation options</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            {selectedLocation ?
            <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border transition-organic">
                <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
                  <Image
                  src={selectedLocation?.image}
                  alt={selectedLocation?.imageAlt}
                  className="w-full h-full object-cover transition-organic hover:scale-105" />

                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-sm font-semibold shadow-md">
                    {selectedLocation?.rooms} Rooms
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
                    {selectedLocation?.name}
                  </h3>
                  <p className="text-base md:text-lg text-muted-foreground mb-6">
                    {selectedLocation?.highlight}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Icon name="Home" size={24} color="var(--color-primary)" strokeWidth={2} />
                      <div>
                        <p className="text-xs text-muted-foreground">Accommodation</p>
                        <p className="font-semibold text-foreground">Multiple Types</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Icon name="MapPin" size={24} color="var(--color-accent)" strokeWidth={2} />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="font-semibold text-foreground">Prime Area</p>
                      </div>
                    </div>
                  </div>

                  <Button
                  variant="default"
                  fullWidth
                  iconName="ArrowRight"
                  iconPosition="right"
                  onClick={() => onBookNowClick(selectedLocation)}
                  className="shadow-md">

                    Book {selectedLocation?.name}
                  </Button>
                </div>
              </div> :

            <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12 text-center border border-border">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <Icon name="MousePointerClick" size={32} color="var(--color-primary)" strokeWidth={2} />
                </div>
                <h3 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-3">
                  Select Your Destination
                </h3>
                <p className="text-base md:text-lg text-muted-foreground mb-6">
                  Click on any location pin on the map to view detailed information and available accommodations
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {locations?.map((location) =>
                <button
                  key={location?.id}
                  onClick={() => handleLocationClick(location)}
                  className="px-4 py-2 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-organic text-sm font-medium active-press">

                      {location?.name}
                    </button>
                )}
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>);

};

export default HeroSection;