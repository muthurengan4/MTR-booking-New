import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { getRoomBlockedDates } from '../../../utils/availabilityChecker';

const AvailabilityCalendar = ({ selectedRoom, checkIn, checkOut }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState([]);

  useEffect(() => {
    if (selectedRoom?.id && selectedRoom?.location) {
      fetchBlockedDates();
    }
  }, [selectedRoom, currentMonth]);

  const fetchBlockedDates = async () => {
    const year = currentMonth?.getFullYear();
    const month = currentMonth?.getMonth();
    const startDate = new Date(year, month, 1)?.toISOString()?.split('T')?.[0];
    const endDate = new Date(year, month + 1, 0)?.toISOString()?.split('T')?.[0];

    const blocked = await getRoomBlockedDates(
      selectedRoom?.id,
      selectedRoom?.location,
      startDate,
      endDate
    );
    setBlockedDates(blocked);
  };

  const getDaysInMonth = (date) => {
    const year = date?.getFullYear();
    const month = date?.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay?.getDate();
    const startingDayOfWeek = firstDay?.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDateInRange = (day) => {
    if (!checkIn || !checkOut) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    return date >= checkInDate && date <= checkOutDate;
  };

  const isDateBlocked = (day) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)?.toISOString()?.split('T')?.[0];
    return blockedDates?.includes(dateStr);
  };

  const getDayPrice = (day) => {
    if (!selectedRoom) return null;
    const isWeekend = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)?.getDay() % 6 === 0;
    return isWeekend ? selectedRoom?.startingPrice * 1.2 : selectedRoom?.startingPrice;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-semibold text-xl">
          {monthNames?.[currentMonth?.getMonth()]} {currentMonth?.getFullYear()}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-muted transition-organic active-press"
            aria-label="Previous month"
          >
            <Icon name="ChevronLeft" size={20} strokeWidth={2} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-muted transition-organic active-press"
            aria-label="Next month"
          >
            <Icon name="ChevronRight" size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames?.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: startingDayOfWeek })?.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth })?.map((_, index) => {
          const day = index + 1;
          const inRange = isDateInRange(day);
          const blocked = isDateBlocked(day);
          const price = getDayPrice(day);

          return (
            <div
              key={day}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-organic ${
                blocked
                  ? 'bg-destructive/20 text-destructive line-through'
                  : inRange
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
              title={blocked ? 'Not available' : ''}
            >
              <span className="text-sm font-semibold">{day}</span>
              {selectedRoom && price && !blocked && (
                <span className="text-xs opacity-80">₹{Math.round(price / 100)}k</span>
              )}
              {blocked && (
                <Icon name="Lock" size={12} className="mt-1" />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-center gap-4 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary rounded" />
          <span className="text-muted-foreground">Selected Dates</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-muted rounded" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-destructive/20 rounded" />
          <span className="text-muted-foreground">Blocked</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;