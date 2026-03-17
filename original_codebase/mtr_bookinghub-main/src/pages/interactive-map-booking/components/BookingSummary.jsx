import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const BookingSummary = ({ selectedLocation, selectedRoom, filters }) => {
  const navigate = useNavigate();

  const calculateNights = () => {
    if (!filters?.checkIn || !filters?.checkOut) return 0;
    const checkIn = new Date(filters.checkIn);
    const checkOut = new Date(filters.checkOut);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights();
  const basePrice = selectedRoom ? selectedRoom?.startingPrice * nights : 0;
  const taxAmount = basePrice * 0.12;
  const totalPrice = basePrice + taxAmount;

  const handleProceedToActivities = () => {
    navigate('/activity-booking');
  };

  const handleProceedToCheckout = () => {
    navigate('/shopping-cart');
  };

  if (!selectedLocation || !selectedRoom) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <Icon name="MapPin" size={48} strokeWidth={2} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
        <h3 className="font-heading font-semibold text-lg mb-2">No Selection Yet</h3>
        <p className="text-muted-foreground">Select a location and room type to see booking summary</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 sticky top-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="FileText" size={20} strokeWidth={2} color="var(--color-primary)" />
        </div>
        <h3 className="font-heading font-semibold text-xl">Booking Summary</h3>
      </div>
      <div className="space-y-4 mb-6">
        <div className="pb-4 border-b border-border">
          <div className="flex items-start gap-3 mb-3">
            <Icon name="MapPin" size={20} strokeWidth={2} color="var(--color-primary)" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-semibold">{selectedLocation?.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Icon name="Home" size={20} strokeWidth={2} color="var(--color-primary)" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Room Type</p>
              <p className="font-semibold">{selectedRoom?.type}</p>
            </div>
          </div>
        </div>

        <div className="pb-4 border-b border-border">
          <div className="flex items-start gap-3 mb-3">
            <Icon name="Calendar" size={20} strokeWidth={2} color="var(--color-primary)" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Check-in</p>
              <p className="font-semibold">{new Date(filters.checkIn)?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Icon name="Calendar" size={20} strokeWidth={2} color="var(--color-primary)" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Check-out</p>
              <p className="font-semibold">{new Date(filters.checkOut)?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        <div className="pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Room × {nights} nights</span>
            <span className="font-semibold">₹{basePrice?.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Taxes & Fees (12%)</span>
            <span className="font-semibold">₹{taxAmount?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-lg">Total Amount</span>
          <span className="font-heading font-bold text-2xl text-primary">₹{totalPrice?.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div className="space-y-3">
        <Button
          variant="default"
          fullWidth
          onClick={handleProceedToActivities}
          iconName="Compass"
          iconPosition="right"
        >
          Add Activities
        </Button>
        <Button
          variant="outline"
          fullWidth
          onClick={handleProceedToCheckout}
          iconName="ShoppingCart"
          iconPosition="right"
        >
          Proceed to Checkout
        </Button>
      </div>
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} strokeWidth={2} color="var(--color-primary)" />
          <div className="flex-1">
            <p className="text-sm font-semibold mb-1">Free Cancellation</p>
            <p className="text-sm text-muted-foreground">Cancel up to 48 hours before check-in for a full refund</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;