import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import 'leaflet/dist/leaflet.css';

const HeroCarousel = ({ onSearch }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Booking form state
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [bookingType, setBookingType] = useState('both');
  const [guests, setGuests] = useState(2);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=1920&q=80',
      title: 'Experience the Wild',
      subtitle: 'Journey through the untamed beauty of Mudumalai',
      overlay: 'from-[#0D1A0D]/80 via-[#0D1A0D]/40 to-transparent'
    },
    {
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=80',
      title: 'Majestic Wildlife',
      subtitle: 'Home to Bengal Tigers, Asian Elephants & more',
      overlay: 'from-[#0D1A0D]/80 via-[#0D1A0D]/40 to-transparent'
    },
    {
      image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1920&q=80',
      title: 'Elephant Sanctuary',
      subtitle: 'Witness the gentle giants in their natural habitat',
      overlay: 'from-[#0D1A0D]/80 via-[#0D1A0D]/40 to-transparent'
    },
    {
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&q=80',
      title: 'Nature Trails',
      subtitle: 'Trek through ancient forests and scenic landscapes',
      overlay: 'from-[#0D1A0D]/80 via-[#0D1A0D]/40 to-transparent'
    },
    {
      image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=1920&q=80',
      title: 'Birdwatcher\'s Paradise',
      subtitle: 'Over 250 species of exotic birds await you',
      overlay: 'from-[#0D1A0D]/80 via-[#0D1A0D]/40 to-transparent'
    },
    {
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=80',
      title: 'Sunset Safari',
      subtitle: 'Magical golden hour experiences in the wilderness',
      overlay: 'from-[#0D1A0D]/80 via-[#0D1A0D]/40 to-transparent'
    }
  ];

  const goToSlide = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % slides.length);
  }, [currentIndex, slides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + slides.length) % slides.length);
  }, [currentIndex, slides.length, goToSlide]);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    setCheckInDate(tomorrow.toISOString().split('T')[0]);
    setCheckOutDate(dayAfter.toISOString().split('T')[0]);
  }, []);

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        checkInDate,
        checkOutDate,
        bookingType,
        guests
      });
    }
    // Scroll to the map section which shows accommodations
    const mapSection = document.getElementById('map-section');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const bookingTypes = [
    { id: 'rooms', label: 'Rooms Only', icon: 'Bed', description: 'Forest rest houses & cottages' },
    { id: 'safari', label: 'Safari Only', icon: 'Binoculars', description: 'Jeep & bus safari tours' },
    { id: 'both', label: 'Rooms + Safari', icon: 'Sparkles', description: 'Complete wildlife package' }
  ];

  return (
    <section className="relative w-full h-[85vh] min-h-[650px] max-h-[900px] overflow-hidden" data-testid="hero-carousel">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === currentIndex 
              ? 'opacity-100 scale-100 z-10' 
              : 'opacity-0 scale-105 z-0'
          }`}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />
          
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ))}

      {/* Content Container */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 w-full">
          {/* Title Section */}
          <div 
            className={`max-w-2xl mb-8 transform transition-all duration-700 ${
              true ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {slides[currentIndex].title}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 drop-shadow-md max-w-xl">
              {slides[currentIndex].subtitle}
            </p>
          </div>

          {/* Booking Widget */}
          <div className="max-w-5xl">
            <div className="bg-[#0D1A0D]/80 backdrop-blur-xl rounded-2xl border border-[#4A7C2E]/30 shadow-2xl shadow-black/40 overflow-hidden">
              {/* Booking Type Selector */}
              <div className="flex border-b border-[#4A7C2E]/20">
                {bookingTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setBookingType(type.id)}
                    className={`flex-1 px-4 py-4 flex items-center justify-center gap-3 transition-all duration-300 ${
                      bookingType === type.id
                        ? 'bg-gradient-to-b from-[#4A7C2E]/30 to-transparent text-[#4A7C2E] border-b-2 border-[#4A7C2E]'
                        : 'text-[#9CA38B] hover:text-white hover:bg-[#4A7C2E]/10'
                    }`}
                    data-testid={`booking-type-${type.id}`}
                  >
                    <Icon name={type.icon} size={20} />
                    <div className="text-left hidden sm:block">
                      <p className={`font-semibold text-sm ${bookingType === type.id ? 'text-white' : ''}`}>{type.label}</p>
                      <p className="text-xs opacity-70">{type.description}</p>
                    </div>
                    <span className="sm:hidden font-medium text-sm">{type.label}</span>
                  </button>
                ))}
              </div>

              {/* Date & Guest Selection */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Check-in Date */}
                  <div className="relative">
                    <label className="block text-xs font-medium text-[#4A7C2E] mb-2 uppercase tracking-wider">
                      Check-in Date
                    </label>
                    <div className="relative">
                      <Icon name="Calendar" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A7C2E]" />
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-3 bg-[#152415] border border-[#4A7C2E]/30 rounded-xl text-white focus:outline-none focus:border-[#4A7C2E] focus:ring-2 focus:ring-[#4A7C2E]/20 transition-all"
                        data-testid="check-in-date"
                      />
                    </div>
                  </div>

                  {/* Check-out Date */}
                  <div className="relative">
                    <label className="block text-xs font-medium text-[#4A7C2E] mb-2 uppercase tracking-wider">
                      Check-out Date
                    </label>
                    <div className="relative">
                      <Icon name="Calendar" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A7C2E]" />
                      <input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        min={checkInDate || new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-3 bg-[#152415] border border-[#4A7C2E]/30 rounded-xl text-white focus:outline-none focus:border-[#4A7C2E] focus:ring-2 focus:ring-[#4A7C2E]/20 transition-all"
                        data-testid="check-out-date"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="relative">
                    <label className="block text-xs font-medium text-[#4A7C2E] mb-2 uppercase tracking-wider">
                      Guests
                    </label>
                    <div className="relative">
                      <Icon name="Users" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A7C2E]" />
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 bg-[#152415] border border-[#4A7C2E]/30 rounded-xl text-white focus:outline-none focus:border-[#4A7C2E] focus:ring-2 focus:ring-[#4A7C2E]/20 transition-all appearance-none cursor-pointer"
                        data-testid="guests-select"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num} className="bg-[#152415]">
                            {num} {num === 1 ? 'Guest' : 'Guests'}
                          </option>
                        ))}
                      </select>
                      <Icon name="ChevronDown" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A7C2E] pointer-events-none" />
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="flex items-end">
                    <button
                      onClick={handleSearch}
                      className="w-full py-3 px-6 bg-gradient-to-r from-[#FF8C5A] to-[#FF6B35] hover:from-[#FFA07A] hover:to-[#FF8C5A] text-white font-semibold rounded-xl shadow-lg shadow-[#FF8C5A]/30 hover:shadow-xl hover:shadow-[#FF8C5A]/40 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                      data-testid="search-availability-btn"
                    >
                      <Icon name="Search" size={20} />
                      <span>Check Availability</span>
                    </button>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#9CA38B]">
                  <div className="flex items-center gap-1">
                    <Icon name="Shield" size={14} className="text-[#4A7C2E]" />
                    <span>Free Cancellation</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="CreditCard" size={14} className="text-[#4A7C2E]" />
                    <span>Pay at Property</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Clock" size={14} className="text-[#4A7C2E]" />
                    <span>Instant Confirmation</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Leaf" size={14} className="text-[#4A7C2E]" />
                    <span>Eco-Friendly Stay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/3 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 bg-[#0D1A0D]/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-[#4A7C2E]/50 transition-all duration-300 border border-white/20"
        aria-label="Previous slide"
      >
        <Icon name="ChevronLeft" size={28} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/3 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 bg-[#0D1A0D]/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-[#4A7C2E]/50 transition-all duration-300 border border-white/20"
        aria-label="Next slide"
      >
        <Icon name="ChevronRight" size={28} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex 
                ? 'w-10 h-3 bg-gradient-to-r from-[#FF8C5A] to-[#FF6B35]' 
                : 'w-3 h-3 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0D1A0D] to-transparent z-20 pointer-events-none" />
      
      {/* Decorative bottom border */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 z-30"
        style={{ background: 'linear-gradient(to right, #2D5016, #4A7C2E, #8B4513, #FF8C5A)' }}
      />
    </section>
  );
};

export default HeroCarousel;
