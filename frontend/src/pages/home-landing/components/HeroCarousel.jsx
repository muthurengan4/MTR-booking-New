import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=1920&q=80',
      title: 'Experience the Wild',
      subtitle: 'Journey through the untamed beauty of Mudumalai',
      overlay: 'from-[#2D5016]/70 via-transparent to-[#2D5016]/40'
    },
    {
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=80',
      title: 'Majestic Wildlife',
      subtitle: 'Home to Bengal Tigers, Asian Elephants & more',
      overlay: 'from-[#8B4513]/70 via-transparent to-[#8B4513]/40'
    },
    {
      image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1920&q=80',
      title: 'Elephant Sanctuary',
      subtitle: 'Witness the gentle giants in their natural habitat',
      overlay: 'from-[#2D5016]/70 via-transparent to-[#2D5016]/40'
    },
    {
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&q=80',
      title: 'Nature Trails',
      subtitle: 'Trek through ancient forests and scenic landscapes',
      overlay: 'from-[#8B4513]/70 via-transparent to-[#8B4513]/40'
    },
    {
      image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=1920&q=80',
      title: 'Birdwatcher\'s Paradise',
      subtitle: 'Over 250 species of exotic birds await you',
      overlay: 'from-[#FF6B35]/60 via-transparent to-[#FF6B35]/40'
    },
    {
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=80',
      title: 'Sunset Safari',
      subtitle: 'Magical golden hour experiences in the wilderness',
      overlay: 'from-[#FF6B35]/70 via-transparent to-[#8B4513]/50'
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
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative w-full h-[70vh] min-h-[500px] max-h-[700px] overflow-hidden" data-testid="hero-carousel">
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
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-start">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12 w-full">
              <div 
                className={`max-w-2xl transform transition-all duration-700 delay-200 ${
                  index === currentIndex 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-8 opacity-0'
                }`}
              >
                <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 drop-shadow-md max-w-xl">
                  {slide.subtitle}
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => window.location.href = '/interactive-map-booking'}
                    className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8C5A] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                  >
                    <Icon name="Calendar" size={20} />
                    Book Your Safari
                  </button>
                  <button 
                    onClick={() => window.location.href = '/safari-route-explorer'}
                    className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/40 hover:bg-white/30 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                  >
                    <Icon name="Map" size={20} />
                    Explore Routes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/30"
        aria-label="Previous slide"
      >
        <Icon name="ChevronLeft" size={28} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 border border-white/30"
        aria-label="Next slide"
      >
        <Icon name="ChevronRight" size={28} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex 
                ? 'w-10 h-3 bg-gradient-to-r from-[#FF6B35] to-[#FF8C5A]' 
                : 'w-3 h-3 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Bottom gradient fade for smooth transition to content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
      
      {/* Decorative bottom border matching header */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 z-20"
        style={{ background: 'linear-gradient(to right, #2D5016, #4A7C2E, #8B4513, #FF6B35)' }}
      />
    </section>
  );
};

export default HeroCarousel;
