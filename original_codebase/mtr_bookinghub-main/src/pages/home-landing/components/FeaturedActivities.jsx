import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FeaturedActivities = ({ onActivitySelect }) => {
  const activities = [
  {
    id: 'jeep-safari',
    name: 'Jeep Safari',
    description: 'Intimate wildlife encounters in open-top 4x4 vehicles with expert naturalists through dense forest trails and tiger corridors',
    image: "https://images.unsplash.com/photo-1663172876622-30fed267c69a",
    imageAlt: 'Green open-top safari jeep with tourists and guide navigating through muddy forest trail, surrounded by tall trees and dense vegetation in morning light',
    duration: '3 Hours',
    capacity: '6 Persons',
    price: 2500,
    availability: 'High',
    icon: 'Truck',
    features: ['Small Groups', 'Expert Guide', 'Tiger Territory']
  },
  {
    id: 'bus-safari',
    name: 'Bus Safari',
    description: 'Comfortable group wildlife viewing experience in specially designed safari buses covering extensive forest areas and water bodies',
    image: "https://images.unsplash.com/photo-1674556275189-e78fd6223e6d",
    imageAlt: 'Large green safari bus with open roof and side windows full of tourists, driving through wide forest road with elephants visible in background',
    duration: '2.5 Hours',
    capacity: '30 Persons',
    price: 800,
    availability: 'Medium',
    icon: 'Bus',
    features: ['Large Groups', 'Comfortable Seating', 'Wide Coverage']
  },
  {
    id: 'elephant-camp',
    name: 'Elephant Camp Visit',
    description: 'Educational experience at elephant rehabilitation center with feeding sessions, bathing activities, and mahout interactions',
    image: "https://images.unsplash.com/photo-1695280087835-b129a44d57f9",
    imageAlt: 'Majestic adult elephant with mahout standing in shallow river water, tourists watching from wooden platform, lush green forest backdrop',
    duration: '2 Hours',
    capacity: '20 Persons',
    price: 500,
    availability: 'High',
    icon: 'Palmtree',
    features: ['Family Friendly', 'Interactive', 'Educational']
  }];


  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => prev === 0 ? activities?.length - 1 : prev - 1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev === activities?.length - 1 ? 0 : prev + 1);
  };

  const handleActivityClick = (activity) => {
    if (onActivitySelect) {
      onActivitySelect(activity);
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'High':
        return 'bg-success text-success-foreground';
      case 'Medium':
        return 'bg-warning text-warning-foreground';
      case 'Low':
        return 'bg-error text-error-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3 md:mb-4">
            Featured Safari Activities
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose your adventure and witness the magnificent wildlife of Mudumalai Tiger Reserve
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:grid lg:grid-cols-3 gap-8">
            {activities?.map((activity) =>
            <div
              key={activity?.id}
              className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border transition-organic hover:shadow-xl hover-lift">

                <div className="relative h-64 overflow-hidden">
                  <Image
                  src={activity?.image}
                  alt={activity?.imageAlt}
                  className="w-full h-full object-cover transition-organic hover:scale-105" />

                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md">
                      <Icon name={activity?.icon} size={20} strokeWidth={2} />
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${getAvailabilityColor(activity?.availability)}`}>
                      {activity?.availability} Availability
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-heading font-bold text-white mb-1">
                      {activity?.name}
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {activity?.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="Clock" size={16} color="var(--color-primary)" strokeWidth={2} />
                      <span className="text-foreground">{activity?.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="Users" size={16} color="var(--color-primary)" strokeWidth={2} />
                      <span className="text-foreground">{activity?.capacity}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {activity?.features?.map((feature, idx) =>
                  <span
                    key={idx}
                    className="px-2 py-1 bg-muted rounded text-xs text-foreground">

                        {feature}
                      </span>
                  )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Starting from</p>
                      <p className="text-2xl font-bold text-primary">₹{activity?.price?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <Button
                  variant="default"
                  fullWidth
                  iconName="Calendar"
                  iconPosition="left"
                  onClick={() => handleActivityClick(activity)}>

                    Book Now
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:hidden">
            <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border">
              <div className="relative h-72 overflow-hidden">
                <Image
                  src={activities?.[currentIndex]?.image}
                  alt={activities?.[currentIndex]?.imageAlt}
                  className="w-full h-full object-cover" />

                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md">
                    <Icon name={activities?.[currentIndex]?.icon} size={24} strokeWidth={2} />
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-md ${getAvailabilityColor(activities?.[currentIndex]?.availability)}`}>
                    {activities?.[currentIndex]?.availability} Availability
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">
                    {activities?.[currentIndex]?.name}
                  </h3>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="Clock" size={16} strokeWidth={2} />
                      <span>{activities?.[currentIndex]?.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="Users" size={16} strokeWidth={2} />
                      <span>{activities?.[currentIndex]?.capacity}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-organic hover:bg-card active-press"
                  aria-label="Previous activity">

                  <Icon name="ChevronLeft" size={24} strokeWidth={2} />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-organic hover:bg-card active-press"
                  aria-label="Next activity">

                  <Icon name="ChevronRight" size={24} strokeWidth={2} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm md:text-base text-muted-foreground mb-4">
                  {activities?.[currentIndex]?.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {activities?.[currentIndex]?.features?.map((feature, idx) =>
                  <span
                    key={idx}
                    className="px-3 py-1 bg-muted rounded-lg text-xs md:text-sm text-foreground">

                      {feature}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground">Starting from</p>
                    <p className="text-3xl font-bold text-primary">₹{activities?.[currentIndex]?.price?.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <Button
                  variant="default"
                  fullWidth
                  iconName="Calendar"
                  iconPosition="left"
                  onClick={() => handleActivityClick(activities?.[currentIndex])}>

                  Book {activities?.[currentIndex]?.name}
                </Button>

                <div className="flex justify-center gap-2 mt-6">
                  {activities?.map((_, idx) =>
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-organic ${
                    idx === currentIndex ? 'bg-primary w-8' : 'bg-muted'}`
                    }
                    aria-label={`Go to activity ${idx + 1}`} />

                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            iconName="Compass"
            iconPosition="left"
            onClick={() => window.location.href = '/activity-booking'}>

            View All Activities
          </Button>
        </div>
      </div>
    </section>);

};

export default FeaturedActivities;