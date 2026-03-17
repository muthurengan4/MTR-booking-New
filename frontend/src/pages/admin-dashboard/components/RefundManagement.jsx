import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const RefundManagement = () => {
  const [bookings, setBookings] = useState([
    {
      id: 'BK-2026-001',
      customerName: 'Rajesh Kumar',
      email: 'rajesh.kumar@email.com',
      phone: '9876543210',
      bookingType: 'Accommodation',
      itemName: 'Deluxe Room - Masinagudi',
      bookingDate: '2026-02-15',
      amount: 7000,
      status: 'confirmed',
      refundStatus: null,
      refundAmount: 0
    },
    {
      id: 'BK-2026-002',
      customerName: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '9123456789',
      bookingType: 'Activity',
      itemName: 'Jeep Safari',
      bookingDate: '2026-02-20',
      amount: 3600,
      status: 'confirmed',
      refundStatus: null,
      refundAmount: 0
    },
    {
      id: 'BK-2026-003',
      customerName: 'Amit Patel',
      email: 'amit.patel@email.com',
      phone: '9988776655',
      bookingType: 'Accommodation',
      itemName: 'Suite - Gudalur',
      bookingDate: '2026-03-01',
      amount: 14400,
      status: 'cancelled',
      refundStatus: 'pending',
      refundAmount: 12960
    },
    {
      id: 'BK-2026-004',
      customerName: 'Sneha Reddy',
      email: 'sneha.reddy@email.com',
      phone: '9876501234',
      bookingType: 'Activity',
      itemName: 'Elephant Camp Visit',
      bookingDate: '2026-02-18',
      amount: 1200,
      status: 'cancelled',
      refundStatus: 'processed',
      refundAmount: 1200
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [refundPercentage, setRefundPercentage] = useState(100);

  const statusOptions = [
    { value: 'all', label: 'All Bookings' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'pending', label: 'Refund Pending' },
    { value: 'processed', label: 'Refund Processed' }
  ];

  const filteredBookings = bookings?.filter(booking => {
    const matchesSearch = searchQuery === '' ||
      booking?.id?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      booking?.customerName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      booking?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      booking?.phone?.includes(searchQuery);

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'pending' && booking?.refundStatus === 'pending') ||
      (filterStatus === 'processed' && booking?.refundStatus === 'processed') ||
      booking?.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleInitiateRefund = (booking) => {
    setSelectedBooking(booking);
    setRefundPercentage(100);
  };

  const handleProcessRefund = () => {
    if (!selectedBooking) return;

    const refundAmount = (selectedBooking?.amount * refundPercentage) / 100;

    setBookings(bookings?.map(booking =>
      booking?.id === selectedBooking?.id
        ? {
            ...booking,
            status: 'cancelled',
            refundStatus: 'processed',
            refundAmount: refundAmount
          }
        : booking
    ));

    setSelectedBooking(null);
    setRefundPercentage(100);
  };

  const handleCancelRefund = () => {
    setSelectedBooking(null);
    setRefundPercentage(100);
  };

  const getStatusBadge = (booking) => {
    if (booking?.refundStatus === 'processed') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">Refunded</span>;
    }
    if (booking?.refundStatus === 'pending') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">Refund Pending</span>;
    }
    if (booking?.status === 'confirmed') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">Confirmed</span>;
    }
    if (booking?.status === 'cancelled') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">Cancelled</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">Refund Processing</h2>
          <p className="text-muted-foreground">Search bookings and process refunds</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Search by ID, name, email, or phone"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="w-full md:w-64"
          />
          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            className="w-48"
          />
        </div>
      </div>

      {selectedBooking && (
        <div className="bg-accent/10 border border-accent rounded-lg p-6">
          <h3 className="font-heading text-xl font-semibold text-foreground mb-4">Process Refund</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Booking ID</p>
                <p className="font-medium text-foreground">{selectedBooking?.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium text-foreground">{selectedBooking?.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Original Amount</p>
                <p className="font-medium text-foreground">₹{selectedBooking?.amount?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Refund Amount</p>
                <p className="font-medium text-accent text-lg">
                  ₹{((selectedBooking?.amount * refundPercentage) / 100)?.toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Refund Percentage: {refundPercentage}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={refundPercentage}
                onChange={(e) => setRefundPercentage(parseInt(e?.target?.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleProcessRefund} iconName="Check" variant="success">
                Process Refund
              </Button>
              <Button variant="outline" onClick={handleCancelRefund} iconName="X">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {filteredBookings?.map((booking) => (
          <div
            key={booking?.id}
            className="bg-muted rounded-lg border border-border p-4 transition-organic hover:shadow-md"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-foreground text-lg">{booking?.id}</span>
                  {getStatusBadge(booking)}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="User" size={16} className="text-muted-foreground" />
                    <span className="text-foreground font-medium">{booking?.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Mail" size={16} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{booking?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Phone" size={16} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{booking?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Icon name="Package" size={16} className="text-muted-foreground" />
                    <span className="text-foreground">
                      {booking?.bookingType}: {booking?.itemName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Calendar" size={16} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{booking?.bookingDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-xl font-semibold text-foreground">₹{booking?.amount?.toLocaleString()}</p>
                  {booking?.refundAmount > 0 && (
                    <p className="text-sm text-success">Refunded: ₹{booking?.refundAmount?.toLocaleString()}</p>
                  )}
                </div>
                {booking?.status === 'confirmed' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    iconName="RefreshCw"
                    onClick={() => handleInitiateRefund(booking)}
                  >
                    Initiate Refund
                  </Button>
                )}
                {booking?.refundStatus === 'pending' && (
                  <Button
                    variant="warning"
                    size="sm"
                    iconName="AlertCircle"
                    onClick={() => handleInitiateRefund(booking)}
                  >
                    Process Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Search" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No bookings found matching your search</p>
        </div>
      )}
    </div>
  );
};

export default RefundManagement;