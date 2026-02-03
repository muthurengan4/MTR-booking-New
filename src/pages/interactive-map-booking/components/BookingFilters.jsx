import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const BookingFilters = ({ filters, onFilterChange }) => {
  const guestOptions = [
    { value: '1', label: '1 Guest' },
    { value: '2', label: '2 Guests' },
    { value: '3', label: '3 Guests' },
    { value: '4', label: '4 Guests' },
    { value: '5', label: '5+ Guests' }
  ];

  const roomTypeOptions = [
    { value: 'all', label: 'All Room Types' },
    { value: 'deluxe', label: 'Deluxe Room' },
    { value: 'suite', label: 'Suite' },
    { value: 'cottage', label: 'Cottage' },
    { value: 'dormitory', label: 'Dormitory' }
  ];

  const handleCheckInChange = (e) => {
    onFilterChange({ ...filters, checkIn: e?.target?.value });
  };

  const handleCheckOutChange = (e) => {
    onFilterChange({ ...filters, checkOut: e?.target?.value });
  };

  const handleGuestsChange = (value) => {
    onFilterChange({ ...filters, guests: value });
  };

  const handleRoomTypeChange = (value) => {
    onFilterChange({ ...filters, roomType: value });
  };

  const getTodayDate = () => {
    const today = new Date();
    return today?.toISOString()?.split('T')?.[0];
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow?.setDate(tomorrow?.getDate() + 1);
    return tomorrow?.toISOString()?.split('T')?.[0];
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Filter" size={20} strokeWidth={2} color="var(--color-primary)" />
        </div>
        <h3 className="font-heading font-semibold text-xl">Filter Accommodations</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          type="date"
          label="Check-in Date"
          value={filters?.checkIn}
          onChange={handleCheckInChange}
          min={getTodayDate()}
          required
        />

        <Input
          type="date"
          label="Check-out Date"
          value={filters?.checkOut}
          onChange={handleCheckOutChange}
          min={filters?.checkIn || getTomorrowDate()}
          required
        />

        <Select
          label="Number of Guests"
          options={guestOptions}
          value={filters?.guests}
          onChange={handleGuestsChange}
          placeholder="Select guests"
        />

        <Select
          label="Room Type"
          options={roomTypeOptions}
          value={filters?.roomType}
          onChange={handleRoomTypeChange}
          placeholder="Select room type"
        />
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Icon name="Info" size={16} strokeWidth={2} />
        <span>Prices and availability update based on your selected dates</span>
      </div>
    </div>
  );
};

export default BookingFilters;