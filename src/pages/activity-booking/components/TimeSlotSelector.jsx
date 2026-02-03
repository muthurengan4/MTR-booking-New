import React from 'react';
import Icon from '../../../components/AppIcon';

const TimeSlotSelector = ({ selectedActivity, selectedDate, selectedSlot, onSlotSelect, availableSlots }) => {
  if (!selectedActivity || !selectedDate) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 md:p-8 text-center">
        <Icon name="Calendar" size={48} className="mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
        <p className="text-muted-foreground">Please select an activity and date to view available time slots</p>
      </div>
    );
  }

  const getCapacityStatus = (slot) => {
    const percentage = (slot?.available / slot?.capacity) * 100;
    if (percentage > 50) return { label: 'Available', color: 'text-success', bgColor: 'bg-success/10' };
    if (percentage > 0) return { label: 'Limited', color: 'text-warning', bgColor: 'bg-warning/10' };
    return { label: 'Full', color: 'text-error', bgColor: 'bg-error/10' };
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 md:p-6">
      <div className="mb-6">
        <h3 className="font-heading text-xl md:text-2xl font-semibold text-foreground mb-2">
          Available Time Slots
        </h3>
        <p className="text-sm text-muted-foreground">
          {selectedDate?.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {availableSlots?.map((slot) => {
          const status = getCapacityStatus(slot);
          const isSelected = selectedSlot?.id === slot?.id;
          const isDisabled = slot?.available === 0;

          return (
            <button
              key={slot?.id}
              onClick={() => !isDisabled && onSlotSelect(slot)}
              disabled={isDisabled}
              className={`p-4 md:p-5 rounded-xl border-2 transition-organic text-left ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : isDisabled
                  ? 'border-border bg-muted/50 cursor-not-allowed opacity-60' :'border-border hover:border-primary/50 hover-lift active-press'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${isSelected ? 'bg-primary' : 'bg-primary/10'} flex items-center justify-center`}>
                    <Icon 
                      name="Clock" 
                      size={24} 
                      strokeWidth={2}
                      color={isSelected ? 'var(--color-primary-foreground)' : 'var(--color-primary)'}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-base md:text-lg text-foreground">{slot?.time}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{slot?.duration}</p>
                  </div>
                </div>
                {isSelected && (
                  <Icon name="CheckCircle2" size={24} strokeWidth={2} className="text-primary" />
                )}
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="MapPin" size={16} strokeWidth={2} />
                  <span>{slot?.meetingPoint}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Users" size={16} strokeWidth={2} />
                  <span>{slot?.available} of {slot?.capacity} spots available</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${status?.bgColor} ${status?.color}`}>
                  {status?.label}
                </div>
                <p className="text-base md:text-lg font-bold text-primary">
                  ₹{slot?.price?.toLocaleString('en-IN')}
                </p>
              </div>
              {slot?.includes && slot?.includes?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Includes:</p>
                  <div className="flex flex-wrap gap-2">
                    {slot?.includes?.map((item, index) => (
                      <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {availableSlots?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="CalendarX" size={48} className="mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-muted-foreground">No time slots available for this date</p>
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;