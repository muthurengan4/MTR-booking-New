import React, { useState } from 'react';

import Button from '../../../components/ui/Button';

const CalendarView = ({ selectedDate, onDateSelect, availabilityData }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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

  const getAvailabilityStatus = (day) => {
    const dateKey = `${currentMonth?.getFullYear()}-${String(currentMonth?.getMonth() + 1)?.padStart(2, '0')}-${String(day)?.padStart(2, '0')}`;
    const availability = availabilityData?.[dateKey];
    
    if (!availability) return 'unavailable';
    
    const percentage = (availability?.available / availability?.total) * 100;
    if (percentage === 0) return 'full';
    if (percentage <= 30) return 'limited';
    return 'available';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
      case 'limited':
        return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
      case 'full':
        return 'bg-error/10 text-error border-error/20 cursor-not-allowed';
      default:
        return 'bg-muted text-muted-foreground border-border cursor-not-allowed';
    }
  };

  const isDateSelected = (day) => {
    if (!selectedDate) return false;
    return (selectedDate?.getDate() === day &&
    selectedDate?.getMonth() === currentMonth?.getMonth() && selectedDate?.getFullYear() === currentMonth?.getFullYear());
  };

  const isPastDate = (day) => {
    const today = new Date();
    today?.setHours(0, 0, 0, 0);
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return checkDate < today;
  };

  const handleDateClick = (day) => {
    if (isPastDate(day)) return;
    const status = getAvailabilityStatus(day);
    if (status === 'full' || status === 'unavailable') return;
    
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateSelect(newDate);
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const day = i - startingDayOfWeek + 1;
      const isValidDay = day > 0 && day <= daysInMonth;
      const isPast = isValidDay && isPastDate(day);
      const status = isValidDay ? getAvailabilityStatus(day) : 'unavailable';
      const isSelected = isValidDay && isDateSelected(day);

      days?.push(
        <button
          key={i}
          onClick={() => isValidDay && !isPast && handleDateClick(day)}
          disabled={!isValidDay || isPast || status === 'full' || status === 'unavailable'}
          className={`aspect-square rounded-lg border-2 transition-organic flex items-center justify-center text-sm md:text-base font-medium ${
            !isValidDay
              ? 'invisible'
              : isPast
              ? 'bg-muted/50 text-muted-foreground/50 border-transparent cursor-not-allowed'
              : isSelected
              ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
              : getStatusColor(status)
          } ${!isPast && status !== 'full' && status !== 'unavailable' ? 'active-press' : ''}`}
        >
          {isValidDay && day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl md:text-2xl font-semibold text-foreground">
          Select Date
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            iconName="ChevronLeft"
          />
          <span className="text-sm md:text-base font-medium text-foreground min-w-[140px] text-center">
            {monthNames?.[currentMonth?.getMonth()]} {currentMonth?.getFullYear()}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            iconName="ChevronRight"
          />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']?.map((day) => (
          <div key={day} className="text-center text-xs md:text-sm font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {renderCalendarDays()}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success/20 border-2 border-success/40" />
          <span className="text-xs md:text-sm text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-warning/20 border-2 border-warning/40" />
          <span className="text-xs md:text-sm text-muted-foreground">Limited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-error/20 border-2 border-error/40" />
          <span className="text-xs md:text-sm text-muted-foreground">Full</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;