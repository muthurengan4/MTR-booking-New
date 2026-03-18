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
    <section id="map-section" className="relative bg-[#0D1A0D] py-12 md:py-16 lg:py-20" data-testid="map-section">
      {/* Subtle forest pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%234A7C2E" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
      
      {/* Section Header */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10 md:mb-14">
          {/* Decorative element */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#4A7C2E]" />
            <div className="w-3 h-3 rounded-full bg-[#FF8C5A] shadow-lg shadow-[#FF8C5A]/30" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#4A7C2E]" />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            <span className="text-[#4A7C2E]">Discover</span>{' '}
            <span className="bg-gradient-to-r from-[#A0522D] to-[#FF8C5A] bg-clip-text text-transparent">Wildlife Paradise</span>
          </h2>
          
          <p className="text-base md:text-lg text-[#9CA38B] max-w-2xl mx-auto mb-6">
            Explore the real Mudumalai Tiger Reserve map to find authentic forest rest houses and accommodations
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-3 bg-[#152415]/80 rounded-xl px-4 py-3 border border-[#4A7C2E]/20">
              <div className="w-10 h-10 rounded-full bg-[#4A7C2E]/20 flex items-center justify-center">
                <Icon name="MapPin" size={20} className="text-[#4A7C2E]" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-[#4A7C2E]">5</p>
                <p className="text-xs text-[#9CA38B]">Regions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#152415]/80 rounded-xl px-4 py-3 border border-[#A0522D]/20">
              <div className="w-10 h-10 rounded-full bg-[#A0522D]/20 flex items-center justify-center">
                <Icon name="Home" size={20} className="text-[#A0522D]" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-[#A0522D]">25+</p>
                <p className="text-xs text-[#9CA38B]">Rest Houses</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#152415]/80 rounded-xl px-4 py-3 border border-[#FF8C5A]/20">
              <div className="w-10 h-10 rounded-full bg-[#FF8C5A]/20 flex items-center justify-center">
                <Icon name="Navigation" size={20} className="text-[#FF8C5A]" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold text-[#FF8C5A]">Real</p>
                <p className="text-xs text-[#9CA38B]">GPS Locations</p>
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
          <p className="text-sm text-[#9CA38B] mb-4">
            Need help planning your stay?
          </p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4A7C2E] to-[#2D5016] text-white rounded-xl hover:from-[#5A8C3E] hover:to-[#3D6026] transition-all duration-300 shadow-lg shadow-[#4A7C2E]/30"
            data-testid="back-to-booking-btn"
          >
            <Icon name="ArrowUp" size={18} />
            Back to Booking
          </button>
        </div>
      </div>

      {/* Bottom decorative stripe */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: 'linear-gradient(to right, #2D5016, #4A7C2E, #8B4513, #FF8C5A)' }}
      />
    </section>
  );
};

export default HeroSection;
