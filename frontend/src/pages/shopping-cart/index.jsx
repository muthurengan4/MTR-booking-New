import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/navigation/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import AccommodationItem from './components/AccommodationItem';
import ActivityItem from './components/ActivityItem';
import ProductItem from './components/ProductItem';
import OrderSummary from './components/OrderSummary';
import GuestInfoForm from './components/GuestInfoForm';
import EmptyCart from './components/EmptyCart';

const ShoppingCart = () => {
  const navigate = useNavigate();

  const [accommodations, setAccommodations] = useState([
  {
    id: 'acc-1',
    location: 'Masinagudi',
    roomType: 'Deluxe Forest View Room',
    description: 'Spacious room with panoramic forest views, king-size bed, and modern amenities',
    image: "https://images.unsplash.com/photo-1582743560990-400cadc4a544",
    imageAlt: 'Luxurious hotel room with large windows overlooking dense green forest, featuring king-size bed with white linens and wooden furniture',
    checkIn: '2026-02-15',
    checkOut: '2026-02-17',
    guests: 2,
    totalPrice: 8500
  },
  {
    id: 'acc-2',
    location: 'Thepakadu',
    roomType: 'Family Suite',
    description: 'Two-bedroom suite perfect for families, with separate living area and wildlife viewing deck',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_170c40371-1768984977325.png",
    imageAlt: 'Spacious family suite with two separate bedrooms, comfortable seating area, and large balcony with forest views',
    checkIn: '2026-02-15',
    checkOut: '2026-02-18',
    guests: 4,
    totalPrice: 15600
  }]
  );

  const [activities, setActivities] = useState([
  {
    id: 'act-1',
    activityName: 'Jeep Safari',
    location: 'Masinagudi Zone',
    icon: 'Truck',
    date: '2026-02-16',
    timeSlot: '06:00',
    participants: 4,
    specialRequirements: 'Child seat required for 5-year-old',
    totalPrice: 2400
  },
  {
    id: 'act-2',
    activityName: 'Elephant Camp Visit',
    location: 'Thepakadu Camp',
    icon: 'Trees',
    date: '2026-02-17',
    timeSlot: '10:00',
    participants: 4,
    specialRequirements: null,
    totalPrice: 800
  }]
  );

  const [products, setProducts] = useState([
  {
    id: 'prod-1',
    productName: 'MTR Wildlife T-Shirt',
    description: 'Premium cotton t-shirt with tiger print design',
    image: "https://images.unsplash.com/photo-1605760641624-e03a56160108",
    imageAlt: 'White cotton t-shirt with artistic tiger face print design displayed on wooden hanger',
    variant: 'Size: L, Color: Forest Green',
    price: 599,
    quantity: 2,
    maxQuantity: 15
  },
  {
    id: 'prod-2',
    productName: 'Handcrafted Wooden Elephant',
    description: 'Traditional wooden elephant sculpture, hand-carved by local artisans',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_13e21a9ce-1765439097702.png",
    imageAlt: 'Intricately carved wooden elephant sculpture with detailed trunk and tusks on display stand',
    variant: 'Size: Medium (8 inches)',
    price: 1299,
    quantity: 1,
    maxQuantity: 5
  }]
  );

  const [showGuestForm, setShowGuestForm] = useState(false);

  const calculateSummary = () => {
    const accommodationTotal = accommodations?.reduce((sum, item) => sum + item?.totalPrice, 0);
    const activityTotal = activities?.reduce((sum, item) => sum + item?.totalPrice, 0);
    const productTotal = products?.reduce((sum, item) => sum + item?.price * item?.quantity, 0);
    const subtotal = accommodationTotal + activityTotal + productTotal;

    const packageSavings = accommodations?.length > 0 && activities?.length > 0 ? 500 : 0;
    const discount = packageSavings;
    const tax = Math.round((subtotal - discount) * 0.18);
    const total = subtotal - discount + tax;

    return {
      accommodationCount: accommodations?.length,
      activityCount: activities?.length,
      productCount: products?.reduce((sum, item) => sum + item?.quantity, 0),
      accommodationTotal,
      activityTotal,
      productTotal,
      subtotal,
      discount,
      tax,
      total,
      packageSavings
    };
  };

  const handleModifyAccommodation = (id) => {
    navigate('/interactive-map-booking', { state: { modifyBooking: id } });
  };

  const handleRemoveAccommodation = (id) => {
    setAccommodations((prev) => prev?.filter((item) => item?.id !== id));
  };

  const handleRescheduleActivity = (id) => {
    navigate('/activity-booking', { state: { rescheduleBooking: id } });
  };

  const handleRemoveActivity = (id) => {
    setActivities((prev) => prev?.filter((item) => item?.id !== id));
  };

  const handleProductQuantityChange = (id, newQuantity) => {
    setProducts((prev) => prev?.map((item) =>
    item?.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveProduct = (id) => {
    setProducts((prev) => prev?.filter((item) => item?.id !== id));
  };

  const handleApplyPromo = (code) => {
    console.log('Promo code applied:', code);
  };

  const handleProceedCheckout = () => {
    setShowGuestForm(true);
    setTimeout(() => {
      document.getElementById('guest-info-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleGuestInfoSubmit = (formData) => {
    console.log('Guest information submitted:', formData);
    alert('Redirecting to secure payment gateway...');
  };

  const summary = calculateSummary();
  const hasItems = accommodations?.length > 0 || activities?.length > 0 || products?.length > 0;

  if (!hasItems) {
    return (
      <>
        <Header />
        <div className="pt-[88px]">
          <EmptyCart />
        </div>
      </>);

  }

  return (
    <>
      <Header />
      <div className="pt-[88px] bg-background min-h-screen">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="ShoppingCart" size={32} color="var(--color-primary)" strokeWidth={2} />
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Shopping Cart
              </h1>
            </div>
            <p className="text-base md:text-lg text-muted-foreground">
              Review your bookings and items before proceeding to checkout
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {accommodations?.length > 0 &&
              <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="Home" size={20} color="var(--color-primary)" strokeWidth={2} />
                    </div>
                    <h2 className="font-heading text-xl md:text-2xl font-semibold text-foreground">
                      Accommodation Bookings ({accommodations?.length})
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {accommodations?.map((item) =>
                  <AccommodationItem
                    key={item?.id}
                    item={item}
                    onModify={handleModifyAccommodation}
                    onRemove={handleRemoveAccommodation} />

                  )}
                  </div>
                </section>
              }

              {activities?.length > 0 &&
              <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Icon name="Compass" size={20} color="var(--color-accent)" strokeWidth={2} />
                    </div>
                    <h2 className="font-heading text-xl md:text-2xl font-semibold text-foreground">
                      Activity Bookings ({activities?.length})
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {activities?.map((item) =>
                  <ActivityItem
                    key={item?.id}
                    item={item}
                    onReschedule={handleRescheduleActivity}
                    onRemove={handleRemoveActivity} />

                  )}
                  </div>
                </section>
              }

              {products?.length > 0 &&
              <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Icon name="ShoppingBag" size={20} color="var(--color-secondary)" strokeWidth={2} />
                    </div>
                    <h2 className="font-heading text-xl md:text-2xl font-semibold text-foreground">
                      E-Shop Items ({products?.reduce((sum, item) => sum + item?.quantity, 0)})
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {products?.map((item) =>
                  <ProductItem
                    key={item?.id}
                    item={item}
                    onQuantityChange={handleProductQuantityChange}
                    onRemove={handleRemoveProduct} />

                  )}
                  </div>
                </section>
              }

              {showGuestForm &&
              <section id="guest-info-section">
                  <GuestInfoForm onSubmit={handleGuestInfoSubmit} />
                  <div className="mt-6 flex flex-col md:flex-row gap-4">
                    <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    iconName="ArrowLeft"
                    iconPosition="left"
                    onClick={() => setShowGuestForm(false)}>

                      Back to Cart
                    </Button>
                    <Button
                    variant="default"
                    size="lg"
                    fullWidth
                    iconName="CreditCard"
                    iconPosition="right"
                    onClick={handleGuestInfoSubmit}>

                      Proceed to Payment
                    </Button>
                  </div>
                </section>
              }
            </div>

            <div className="lg:col-span-1">
              <OrderSummary
                summary={summary}
                onApplyPromo={handleApplyPromo}
                onProceedCheckout={handleProceedCheckout} />

            </div>
          </div>

          <div className="mt-8 md:mt-12 p-4 md:p-6 bg-muted/50 border border-border rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Icon name="Info" size={20} color="var(--color-primary)" strokeWidth={2} className="flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-heading text-base md:text-lg font-semibold text-foreground mb-1">
                    What happens after checkout?
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Instant booking confirmation via email and SMS</li>
                    <li>• Auto-generated login credentials (if account creation selected)</li>
                    <li>• Downloadable PDF with visit guidelines and directions</li>
                    <li>• Payment receipt and booking reference number</li>
                  </ul>
                </div>
              </div>
              <Button
                variant="outline"
                size="default"
                iconName="HelpCircle"
                iconPosition="left">

                Need Help?
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>);

};

export default ShoppingCart;