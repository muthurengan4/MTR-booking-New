import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/navigation/Header';
import HeroSection from './components/HeroSection';
import ServicesOverview from './components/ServicesOverview';
import FeaturedActivities from './components/FeaturedActivities';
import ConservationSpotlight from './components/ConservationSpotlight';
import Footer from './components/Footer';

const HomeLanding = () => {
  const navigate = useNavigate();

  const handleLocationClick = (location) => {
    console.log('Location selected:', location);
  };

  const handleBookNowClick = (location) => {
    navigate('/interactive-map-booking', { state: { selectedLocation: location } });
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
      
      <main className="pt-20">
        <HeroSection 
          onLocationClick={handleLocationClick}
          onBookNowClick={handleBookNowClick}
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