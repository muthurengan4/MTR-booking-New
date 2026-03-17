import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const BookingCard = ({ booking, onCancel, onModify, onDownload }) => {
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationDetails, setCancellationDetails] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return 'CheckCircle';
      case 'pending':
        return 'Clock';
      case 'cancelled':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  const calculateRefund = () => {
    const bookingDate = new Date(booking.checkIn || booking.activityDate);
    const today = new Date();
    const daysUntilBooking = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;
    if (daysUntilBooking > 7) {
      refundPercentage = 90;
    } else if (daysUntilBooking > 3) {
      refundPercentage = 50;
    } else if (daysUntilBooking > 1) {
      refundPercentage = 25;
    }

    const refundAmount = (booking?.totalAmount * refundPercentage) / 100;
    return { refundPercentage, refundAmount };
  };

  const handleCancelClick = () => {
    const refundInfo = calculateRefund();
    setCancellationDetails(refundInfo);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    onCancel(booking?.id, cancellationDetails);
    setShowCancelModal(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    })?.format(amount);
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden transition-organic hover:shadow-lg">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-48 h-48 lg:h-auto overflow-hidden flex-shrink-0">
            <Image
              src={booking?.image}
              alt={booking?.imageAlt}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-2">
                  <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
                    {booking?.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(booking?.status)}`}>
                    <Icon name={getStatusIcon(booking?.status)} size={14} strokeWidth={2} />
                    {booking?.status?.charAt(0)?.toUpperCase() + booking?.status?.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{booking?.location}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {booking?.type === 'accommodation' ? (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Calendar" size={16} strokeWidth={2} color="var(--color-primary)" />
                        <span className="text-foreground">
                          {formatDate(booking?.checkIn)} - {formatDate(booking?.checkOut)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Users" size={16} strokeWidth={2} color="var(--color-primary)" />
                        <span className="text-foreground">{booking?.guests} Guests</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Home" size={16} strokeWidth={2} color="var(--color-primary)" />
                        <span className="text-foreground">{booking?.roomType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Moon" size={16} strokeWidth={2} color="var(--color-primary)" />
                        <span className="text-foreground">{booking?.nights} Nights</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Calendar" size={16} strokeWidth={2} color="var(--color-primary)" />
                        <span className="text-foreground">{formatDate(booking?.activityDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Clock" size={16} strokeWidth={2} color="var(--color-primary)" />
                        <span className="text-foreground">{booking?.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Users" size={16} strokeWidth={2} color="var(--color-primary)" />
                        <span className="text-foreground">{booking?.participants} Participants</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Compass" size={16} strokeWidth={2} color="var(--color-primary)" />
                        <span className="text-foreground">{booking?.activityType}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="text-2xl font-heading font-bold text-primary">
                  {formatCurrency(booking?.totalAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Booking ID: {booking?.bookingId}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                iconPosition="left"
                onClick={() => onDownload(booking?.id)}
              >
                Download PDF
              </Button>

              {booking?.status === 'confirmed' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Edit"
                    iconPosition="left"
                    onClick={() => onModify(booking?.id)}
                  >
                    Modify
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    iconName="XCircle"
                    iconPosition="left"
                    onClick={handleCancelClick}
                  >
                    Cancel
                  </Button>
                </>
              )}

              {booking?.type === 'accommodation' && (
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="MapPin"
                  iconPosition="left"
                  onClick={() => navigate('/interactive-map-booking')}
                >
                  View Location
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {showCancelModal && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-modal" onClick={() => setShowCancelModal(false)} />
          <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="AlertTriangle" size={24} strokeWidth={2} color="var(--color-warning)" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                    Cancel Booking?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to cancel this booking? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Original Amount:</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(booking?.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Refund Percentage:</span>
                  <span className="text-sm font-medium text-success">
                    {cancellationDetails?.refundPercentage}%
                  </span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Refund Amount:</span>
                  <span className="text-lg font-heading font-bold text-success">
                    {formatCurrency(cancellationDetails?.refundAmount || 0)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Booking
                </Button>
                <Button
                  variant="destructive"
                  fullWidth
                  onClick={handleConfirmCancel}
                >
                  Confirm Cancellation
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BookingCard;