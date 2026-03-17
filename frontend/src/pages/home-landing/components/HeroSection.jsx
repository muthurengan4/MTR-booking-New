import React from 'react';
import Icon from '../../../components/AppIcon';
import RealMudumalaiMap from './RealMudumalaiMap';

const HeroSection = ({ onLocationClick, onBookNowClick }) => {
  const handleLocationSelect = (location) => {
    if (onLocationClick) {
      onLocationClick(location);
    }
  };

  const handleBookNow = (location) => {
    if (onBookNowClick) {
      onBookNowClick(location);
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-background via-[#2D5016]/5 to-background py-12 md:py-16 lg:py-20">
      {/* Section Header */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          {/* Decorative element */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#2D5016]" />
            <div className="w-3 h-3 rounded-full bg-[#FF6B35]" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#2D5016]" />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            <span className="text-[#2D5016]">Discover</span>{' '}
            <span className="bg-gradient-to-r from-[#8B4513] to-[#FF6B35] bg-clip-text text-transparent">Wildlife Paradise</span>
          </h2>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Explore the real Mudumalai Tiger Reserve map to find authentic forest rest houses and accommodations
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#2D5016]/10 flex items-center justify-center">
                <Icon name="MapPin" size={20} className="text-[#2D5016]" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-[#2D5016]">5</p>
                <p className="text-xs text-muted-foreground">Regions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#8B4513]/10 flex items-center justify-center">
                <Icon name="Home" size={20} className="text-[#8B4513]" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-[#8B4513]">25+</p>
                <p className="text-xs text-muted-foreground">Rest Houses</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                <Icon name="Navigation" size={20} className="text-[#FF6B35]" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-[#FF6B35]">Real</p>
                <p className="text-xs text-muted-foreground">GPS Locations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Real Interactive Map Section */}
        <RealMudumalaiMap 
          onLocationSelect={handleLocationSelect}
          onBookNow={handleBookNow}
        />

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Can't find what you're looking for?
          </p>
          <button 
            onClick={() => window.location.href = '/interactive-map-booking'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D5016] text-white rounded-xl hover:bg-[#4A7C2E] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Icon name="Search" size={18} />
            Browse All Accommodations
          </button>
        </div>
      </div>

      {/* Bottom decorative stripe */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: 'linear-gradient(to right, #2D5016, #4A7C2E, #8B4513, #FF6B35)' }}
      />
    </section>
  );
};

export default HeroSection;
