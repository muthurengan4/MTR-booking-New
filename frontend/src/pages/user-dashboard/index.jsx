import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '../../components/navigation/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import BookingCard from './components/BookingCard';
import QuickActionCard from './components/QuickActionCard';
import ProfileSection from './components/ProfileSection';
import PreferencesSection from './components/PreferencesSection';
import AdoptionHistoryCard from './components/AdoptionHistoryCard';
import StatsCard from './components/StatsCard';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookingFilter, setBookingFilter] = useState('upcoming');

  const [userData] = useState({
    userId: 'MTR2026001234',
    fullName: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '9876543210',
    emergencyContact: 'Priya Kumar',
    emergencyPhone: '9876543211',
    address: '123 MG Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    memberSince: '2025-06-15',
    totalBookings: 12,
    upcomingBookings: 2,
    completedBookings: 10
  });

  const [preferences, setPreferences] = useState({
    favoriteLocations: ['masinagudi', 'thepakadu'],
    activityInterests: ['jeep-safari', 'elephant-camp'],
    dietaryRequirements: ['vegetarian'],
    emailNotifications: true,
    smsNotifications: true,
    promotionalEmails: false,
    bookingReminders: true,
    preferredLanguage: 'english'
  });

  const [bookings] = useState([
  {
    id: 1,
    bookingId: 'MTR-ACC-2026-001',
    type: 'accommodation',
    title: 'Deluxe Cottage',
    location: 'Masinagudi, Mudumalai Tiger Reserve',
    image: "https://images.unsplash.com/photo-1645636587227-6bef9903da62",
    imageAlt: 'Luxurious wooden cottage with large windows surrounded by dense forest greenery and mountain views in background',
    checkIn: '2026-02-15',
    checkOut: '2026-02-18',
    guests: 4,
    roomType: 'Deluxe Cottage',
    nights: 3,
    totalAmount: 18000,
    status: 'confirmed'
  },
  {
    id: 2,
    bookingId: 'MTR-ACT-2026-002',
    type: 'activity',
    title: 'Jeep Safari',
    location: 'Thepakadu, Mudumalai Tiger Reserve',
    image: "https://images.unsplash.com/photo-1629822700341-87e5dcd2fa9a",
    imageAlt: 'Open-top safari jeep with tourists driving through dense jungle trail with tall trees and wildlife viewing opportunities',
    activityDate: '2026-02-16',
    timeSlot: '06:00 AM - 09:00 AM',
    participants: 4,
    activityType: 'Jeep Safari',
    totalAmount: 4000,
    status: 'confirmed'
  },
  {
    id: 3,
    bookingId: 'MTR-ACC-2026-003',
    type: 'accommodation',
    title: 'Standard Room',
    location: 'Gudalur, Mudumalai Tiger Reserve',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_10a0f4ace-1767530147750.png",
    imageAlt: 'Comfortable hotel room with twin beds, wooden furniture, large window with forest view and modern amenities',
    checkIn: '2026-03-10',
    checkOut: '2026-03-12',
    guests: 2,
    roomType: 'Standard Room',
    nights: 2,
    totalAmount: 8000,
    status: 'pending'
  },
  {
    id: 4,
    bookingId: 'MTR-ACT-2025-004',
    type: 'activity',
    title: 'Elephant Camp Visit',
    location: 'Masinagudi, Mudumalai Tiger Reserve',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_1a651086d-1768148645003.png",
    imageAlt: 'Group of elephants bathing in river with mahouts and tourists watching from safe distance in natural habitat',
    activityDate: '2025-12-20',
    timeSlot: '10:00 AM - 12:00 PM',
    participants: 3,
    activityType: 'Elephant Camp Visit',
    totalAmount: 1500,
    status: 'confirmed'
  }]
  );

  const [adoptionHistory] = useState([
  {
    id: 1,
    animalName: 'Raja',
    species: 'Bengal Tiger',
    animalImage: "https://images.unsplash.com/photo-1687260275534-2d6f7016f89c",
    animalImageAlt: 'Majestic Bengal tiger with orange and black stripes walking through tall grass in natural forest habitat',
    adoptionDate: '2025-08-15',
    duration: '1 Year',
    amount: 25000,
    status: 'active',
    certificateUrl: '/certificates/adoption-raja.pdf'
  },
  {
    id: 2,
    animalName: 'Lakshmi',
    species: 'Asian Elephant',
    animalImage: "https://images.unsplash.com/photo-1695280087835-b129a44d57f9",
    animalImageAlt: 'Large Asian elephant with tusks standing in shallow water surrounded by lush green vegetation',
    adoptionDate: '2025-01-10',
    duration: '6 Months',
    amount: 15000,
    status: 'completed',
    certificateUrl: '/certificates/adoption-lakshmi.pdf'
  }]
  );

  const upcomingBookings = bookings?.filter((b) =>
  b?.status === 'confirmed' &&
  new Date(b.checkIn || b.activityDate) > new Date()
  );

  const pastBookings = bookings?.filter((b) =>
  new Date(b.checkIn || b.activityDate) < new Date()
  );

  const pendingBookings = bookings?.filter((b) => b?.status === 'pending');

  const handleCancelBooking = (bookingId, refundDetails) => {
    console.log('Cancelling booking:', bookingId, refundDetails);
  };

  const handleModifyBooking = (bookingId) => {
    console.log('Modifying booking:', bookingId);
  };

  const handleDownloadPDF = (bookingId) => {
    console.log('Downloading PDF for booking:', bookingId);
  };

  const handleUpdateProfile = (updatedData) => {
    console.log('Updating profile:', updatedData);
  };

  const handleUpdatePreferences = (updatedPreferences) => {
    setPreferences(updatedPreferences);
    console.log('Preferences updated:', updatedPreferences);
  };

  const tabs = [
  { id: 'bookings', label: 'My Bookings', icon: 'Calendar' },
  { id: 'profile', label: 'Profile', icon: 'User' },
  { id: 'preferences', label: 'Preferences', icon: 'Settings' },
  { id: 'adoptions', label: 'Adoptions', icon: 'Heart' }];


  const renderBookings = () => {
    let displayBookings = [];
    if (bookingFilter === 'upcoming') displayBookings = upcomingBookings;else
    if (bookingFilter === 'past') displayBookings = pastBookings;else
    if (bookingFilter === 'pending') displayBookings = pendingBookings;

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            My Bookings
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={bookingFilter === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBookingFilter('upcoming')}>

              Upcoming ({upcomingBookings?.length})
            </Button>
            <Button
              variant={bookingFilter === 'past' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBookingFilter('past')}>

              Past ({pastBookings?.length})
            </Button>
            <Button
              variant={bookingFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBookingFilter('pending')}>

              Pending ({pendingBookings?.length})
            </Button>
          </div>
        </div>
        {displayBookings?.length > 0 ?
        <div className="space-y-4">
            {displayBookings?.map((booking) =>
          <BookingCard
            key={booking?.id}
            booking={booking}
            onCancel={handleCancelBooking}
            onModify={handleModifyBooking}
            onDownload={handleDownloadPDF} />

          )}
          </div> :

        <div className="bg-card border border-border rounded-xl p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Calendar" size={32} strokeWidth={2} color="var(--color-muted-foreground)" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
              No {bookingFilter} bookings
            </h3>
            <p className="text-muted-foreground mb-6">
              You don't have any {bookingFilter} bookings at the moment.
            </p>
            <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={() => navigate('/interactive-map-booking')}>

              Book Now
            </Button>
          </div>
        }
      </div>);

  };

  const renderAdoptions = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            Adoption & Donations
          </h2>
          <Button
            variant="default"
            iconName="Heart"
            iconPosition="left"
            onClick={() => navigate('/e-shop')}>

            Adopt an Animal
          </Button>
        </div>
        {adoptionHistory?.length > 0 ?
        <div className="space-y-4">
            {adoptionHistory?.map((adoption) =>
          <AdoptionHistoryCard key={adoption?.id} adoption={adoption} />
          )}
          </div> :

        <div className="bg-card border border-border rounded-xl p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Heart" size={32} strokeWidth={2} color="var(--color-accent)" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
              Support Wildlife Conservation
            </h3>
            <p className="text-muted-foreground mb-6">
              Adopt an animal and contribute to wildlife conservation efforts at Mudumalai Tiger Reserve.
            </p>
            <Button
            variant="default"
            iconName="Heart"
            iconPosition="left"
            onClick={() => navigate('/e-shop')}>

              Explore Adoption Programs
            </Button>
          </div>
        }
      </div>);

  };

  return (
    <>
      <Helmet>
        <title>User Dashboard - MTR BookingHub</title>
        <meta name="description" content="Manage your bookings, profile, and preferences for Mudumalai Tiger Reserve accommodations and activities" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-success/5 border-b border-border py-8 md:py-12">
            <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-2">
                    Welcome back, {userData?.fullName?.split(' ')?.[0]}!
                  </h1>
                  <p className="text-base md:text-lg text-muted-foreground">
                    Manage your bookings and account settings
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="text-base font-medium text-foreground">
                      {new Date(userData.memberSince)?.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="User" size={32} strokeWidth={2} color="var(--color-primary)" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <StatsCard
                  icon="Calendar"
                  label="Total Bookings"
                  value={userData?.totalBookings}
                  variant="primary"
                  trend={null}
                  trendValue={null} />

                <StatsCard
                  icon="Clock"
                  label="Upcoming Bookings"
                  value={userData?.upcomingBookings}
                  variant="accent"
                  trend="up"
                  trendValue="+2" />

                <StatsCard
                  icon="CheckCircle"
                  label="Completed Bookings"
                  value={userData?.completedBookings}
                  variant="success"
                  trend={null}
                  trendValue={null} />

              </div>
            </div>
          </div>

          <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <QuickActionCard
                icon="Plus"
                title="New Booking"
                description="Book accommodation or activities"
                actionLabel="Book Now"
                onClick={() => navigate('/interactive-map-booking')}
                variant="primary" />

              <QuickActionCard
                icon="ShoppingBag"
                title="E-Shop"
                description="Browse souvenirs and gifts"
                actionLabel="Shop Now"
                onClick={() => navigate('/e-shop')}
                variant="accent" />

              <QuickActionCard
                icon="Download"
                title="Download PDFs"
                description="Access booking confirmations"
                actionLabel="View All"
                onClick={() => console.log('Download PDFs')} />

              <QuickActionCard
                icon="Award"
                title="Certificates"
                description="View educational certificates"
                actionLabel="View All"
                onClick={() => console.log('View certificates')}
                variant="success" />

            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden mb-8">
              <div className="border-b border-border overflow-x-auto">
                <div className="flex">
                  {tabs?.map((tab) =>
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-organic whitespace-nowrap ${
                    activeTab === tab?.id ?
                    'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`
                    }>

                      <Icon name={tab?.icon} size={20} strokeWidth={2} />
                      <span>{tab?.label}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 md:p-6 lg:p-8">
                {activeTab === 'bookings' && renderBookings()}
                {activeTab === 'profile' &&
                <ProfileSection userData={userData} onUpdate={handleUpdateProfile} />
                }
                {activeTab === 'preferences' &&
                <PreferencesSection preferences={preferences} onUpdate={handleUpdatePreferences} />
                }
                {activeTab === 'adoptions' && renderAdoptions()}
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-card border-t border-border py-8">
          <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                &copy; {new Date()?.getFullYear()} MTR BookingHub. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-organic">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-organic">
                  Terms of Service
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-organic">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>);

};

export default UserDashboard;