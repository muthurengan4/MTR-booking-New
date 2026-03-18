import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/navigation/Header';
import HeroCarousel from './components/HeroCarousel';
import HeroSection from './components/HeroSection';
import ServicesOverview from './components/ServicesOverview';
import FeaturedActivities from './components/FeaturedActivities';
import ConservationSpotlight from './components/ConservationSpotlight';
import Footer from './components/Footer';

const HomeLanding = () => {
  const navigate = useNavigate();
  const [bookingParams, setBookingParams] = useState(null);

  const handleLocationClick = (location) => {
    console.log('Location selected:', location);
  };

  const handleBookNowClick = (location) => {
    // Scroll to the top where booking widget is located
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log('Book now for location:', location);
  };

  const handleSearch = (params) => {
    setBookingParams(params);
    console.log('Booking search params:', params);
    // Scroll to map section to explore accommodations
    const mapSection = document.getElementById('map-section');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleServiceClick = (service) => {
    navigate(service?.route);
  };

  const handleActivitySelect = (activity) => {
    navigate('/activity-booking', { state: { selectedActivity: activity } });
  };

  const handleAdoptClick = (program) => {
    navigate('/e-shop', { state: { adoptionProgram: program } });
  };

  const handleNewsClick = (news) => {
    console.log('News clicked:', news);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-[88px]">
        {/* Hero Carousel Section with Booking Widget */}
        <HeroCarousel onSearch={handleSearch} />
        
        {/* Map Section with smooth blend */}
        <HeroSection 
          onLocationClick={handleLocationClick}
          onBookNowClick={handleBookNowClick}
          bookingParams={bookingParams}
        />
        
        <ServicesOverview 
          onServiceClick={handleServiceClick}
        />
        
        <FeaturedActivities 
          onActivitySelect={handleActivitySelect}
        />
        
        <ConservationSpotlight 
          onAdoptClick={handleAdoptClick}
          onNewsClick={handleNewsClick}
        />
      </main>

      <Footer />
    </div>
  );
};

export default HomeLanding;