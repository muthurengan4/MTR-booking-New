import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/navigation/Header';
import BookingProgress from '../../components/navigation/BookingProgress';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ActivityCard from './components/ActivityCard';
import CalendarView from './components/CalendarView';
import TimeSlotSelector from './components/TimeSlotSelector';
import BookingForm from './components/BookingForm';
import PackageSuggestions from './components/PackageSuggestions';
import ActivityFilters from './components/ActivityFilters';

const ActivityBooking = () => {
  const navigate = useNavigate();
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: 'popular',
    priceRange: 'all',
    duration: 'all',
    onlyAvailable: false,
    includeLimited: true,
    showSafari: true,
    showEncounters: true
  });

  const activities = [
  {
    id: 'jeep-safari',
    name: 'Jeep Safari',
    description: 'Explore the dense forests and grasslands of Mudumalai in a 4x4 jeep with experienced naturalist guides. Perfect for wildlife photography and close encounters with animals.',
    image: "https://images.unsplash.com/photo-1630482414704-2e55a5470e9d",
    imageAlt: 'Open-top safari jeep with tourists driving through dense forest trail with sunlight filtering through trees',
    duration: '3 hours',
    maxCapacity: 6,
    availableSlots: 12,
    totalSlots: 20,
    frequency: 'Daily',
    ageRestriction: '5+ years',
    price: 1800,
    priceRange: { min: 1800, max: 2200 },
    isPopular: true,
    discount: 15,
    highlights: [
    'Small group experience (max 6 people)',
    'Expert naturalist guide included',
    'Access to restricted forest zones',
    'Wildlife photography opportunities',
    'Binoculars provided']

  },
  {
    id: 'bus-safari',
    name: 'Bus Safari',
    description: 'Comfortable group safari experience through the main wildlife corridors of Mudumalai. Ideal for families and larger groups wanting to explore the reserve together.',
    image: "https://images.unsplash.com/photo-1662554875631-7b73fcff7807",
    imageAlt: 'Large safari bus with open roof filled with tourists observing wildlife in grassland area with mountains in background',
    duration: '2.5 hours',
    maxCapacity: 30,
    availableSlots: 45,
    totalSlots: 60,
    frequency: 'Daily',
    ageRestriction: 'All ages',
    price: 800,
    highlights: [
    'Comfortable seating for all ages',
    'Covered vehicle with open viewing areas',
    'Guided commentary throughout',
    'Multiple wildlife zones covered',
    'Family-friendly experience']

  },
  {
    id: 'elephant-camp',
    name: 'Elephant Camp Visit',
    description: 'Interactive experience at the elephant rehabilitation camp. Learn about elephant conservation, watch bathing sessions, and understand their daily care routines.',
    image: "https://images.unsplash.com/photo-1533631278779-d722ded4c7df",
    imageAlt: 'Mahout bathing large elephant in river with tourists watching from safe distance, surrounded by tropical vegetation',
    duration: '2 hours',
    maxCapacity: 20,
    availableSlots: 8,
    totalSlots: 40,
    frequency: 'Daily',
    ageRestriction: 'All ages',
    price: 600,
    isPopular: true,
    highlights: [
    'Watch elephant bathing sessions',
    'Learn about elephant conservation',
    'Interact with mahouts',
    'Educational presentation included',
    'Photography allowed']

  }];


  const availabilityData = {
    '2026-01-20': { available: 15, total: 20 },
    '2026-01-21': { available: 8, total: 20 },
    '2026-01-22': { available: 18, total: 20 },
    '2026-01-23': { available: 12, total: 20 },
    '2026-01-24': { available: 5, total: 20 },
    '2026-01-25': { available: 0, total: 20 },
    '2026-01-26': { available: 20, total: 20 },
    '2026-01-27': { available: 14, total: 20 },
    '2026-01-28': { available: 9, total: 20 },
    '2026-01-29': { available: 16, total: 20 },
    '2026-01-30': { available: 3, total: 20 }
  };

  const timeSlots = [
  {
    id: 'slot-1',
    time: '06:00 AM',
    duration: '3 hours',
    meetingPoint: 'Main Gate Reception',
    capacity: 20,
    available: 12,
    price: 1800,
    includes: ['Guide', 'Binoculars', 'Water']
  },
  {
    id: 'slot-2',
    time: '09:30 AM',
    duration: '3 hours',
    meetingPoint: 'Main Gate Reception',
    capacity: 20,
    available: 8,
    price: 2000,
    includes: ['Guide', 'Binoculars', 'Water', 'Snacks']
  },
  {
    id: 'slot-3',
    time: '02:00 PM',
    duration: '3 hours',
    meetingPoint: 'Main Gate Reception',
    capacity: 20,
    available: 15,
    price: 1800,
    includes: ['Guide', 'Binoculars', 'Water']
  },
  {
    id: 'slot-4',
    time: '04:30 PM',
    duration: '3 hours',
    meetingPoint: 'Main Gate Reception',
    capacity: 20,
    available: 5,
    price: 2200,
    includes: ['Guide', 'Binoculars', 'Water', 'Sunset viewing']
  }];


  const handleActivitySelect = (activity) => {
    const isSelected = selectedActivities?.some((a) => a?.id === activity?.id);
    if (isSelected) {
      setSelectedActivities(selectedActivities?.filter((a) => a?.id !== activity?.id));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBookingSubmit = (formData) => {
    console.log('Booking submitted:', {
      activities: selectedActivities,
      date: selectedDate,
      slot: selectedSlot,
      ...formData
    });
    navigate('/shopping-cart');
  };

  const handlePackageSelect = (pkg) => {
    console.log('Package selected:', pkg);
    navigate('/shopping-cart');
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const bookingSteps = [
  { id: 1, label: 'Location', icon: 'MapPin', completed: true },
  { id: 2, label: 'Accommodation', icon: 'Home', completed: true },
  { id: 3, label: 'Activities', icon: 'Compass', completed: false },
  { id: 4, label: 'Review', icon: 'ShoppingCart', completed: false }];


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BookingProgress currentStep={3} steps={bookingSteps} onStepClick={(stepId) => console.log('Step clicked:', stepId)} />
      <main className="pt-[88px]">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
          <div className="mb-8 md:mb-10 lg:mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon name="Compass" size={32} strokeWidth={2} color="var(--color-primary)" />
              </div>
              <div>
                <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                  Book Activities
                </h1>
                <p className="text-base md:text-lg text-muted-foreground mt-1">
                  Choose from exciting wildlife experiences and safari adventures
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Calendar" size={18} strokeWidth={2} />
                <span>Flexible booking dates</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Users" size={18} strokeWidth={2} />
                <span>Group discounts available</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Shield" size={18} strokeWidth={2} />
                <span>Free cancellation up to 24 hours</span>
              </div>
            </div>
          </div>

          <div className="lg:hidden mb-6">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowFilters(!showFilters)}
              iconName="SlidersHorizontal"
              iconPosition="left">

              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-24">
                <ActivityFilters filters={filters} onFilterChange={handleFilterChange} />
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6 md:space-y-8">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-semibold text-foreground mb-6">
                  Available Activities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {activities?.map((activity) =>
                  <ActivityCard
                    key={activity?.id}
                    activity={activity}
                    onSelect={handleActivitySelect}
                    isSelected={selectedActivities?.some((a) => a?.id === activity?.id)} />

                  )}
                </div>
              </div>

              {selectedActivities?.length > 0 &&
              <>
                  <PackageSuggestions
                  selectedActivities={selectedActivities}
                  onPackageSelect={handlePackageSelect} />


                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    <CalendarView
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    availabilityData={availabilityData} />


                    <TimeSlotSelector
                    selectedActivity={selectedActivities?.[0]}
                    selectedDate={selectedDate}
                    selectedSlot={selectedSlot}
                    onSlotSelect={handleSlotSelect}
                    availableSlots={timeSlots} />

                  </div>

                  {selectedDate && selectedSlot &&
                <BookingForm
                  selectedActivity={selectedActivities?.[0]}
                  selectedSlot={selectedSlot}
                  onSubmit={handleBookingSubmit}
                  maxParticipants={selectedActivities?.[0]?.maxCapacity || 10} />

                }
                </>
              }

              {selectedActivities?.length === 0 &&
              <div className="bg-card rounded-xl border border-border p-8 md:p-12 text-center">
                  <Icon name="Compass" size={64} className="mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                  <h3 className="font-heading text-xl md:text-2xl font-semibold text-foreground mb-2">
                    Select an Activity to Continue
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Choose one or more activities above to view available dates, time slots, and complete your booking
                  </p>
                </div>
              }
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-card border-t border-border mt-12 md:mt-16 lg:mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date()?.getFullYear()} Mudumalai Tiger Reserve. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-organic">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-organic">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-organic">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>);

};

export default ActivityBooking;