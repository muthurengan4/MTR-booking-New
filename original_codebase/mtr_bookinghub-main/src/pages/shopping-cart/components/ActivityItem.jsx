import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActivityItem = ({ item, onReschedule, onRemove }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString?.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 transition-organic hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name={item?.icon} size={20} color="var(--color-accent)" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-lg md:text-xl font-semibold text-foreground line-clamp-1">
                {item?.activityName}
              </h3>
              <p className="text-sm text-muted-foreground">{item?.location}</p>
            </div>
          </div>
        </div>

        <div className="flex md:flex-col items-center md:items-end gap-2">
          <span className="text-2xl md:text-3xl font-bold text-accent whitespace-nowrap">
            ₹{item?.totalPrice?.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-muted-foreground">per person</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Icon name="Calendar" size={18} color="var(--color-accent)" strokeWidth={2} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="text-sm font-medium text-foreground">{formatDate(item?.date)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Icon name="Clock" size={18} color="var(--color-accent)" strokeWidth={2} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Time Slot</p>
            <p className="text-sm font-medium text-foreground">{formatTime(item?.timeSlot)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Icon name="Users" size={18} color="var(--color-accent)" strokeWidth={2} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Participants</p>
            <p className="text-sm font-medium text-foreground">{item?.participants} {item?.participants === 1 ? 'Person' : 'People'}</p>
          </div>
        </div>
      </div>
      {item?.specialRequirements && (
        <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Icon name="AlertCircle" size={16} color="var(--color-warning)" strokeWidth={2} className="mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-warning mb-1">Special Requirements</p>
              <p className="text-sm text-foreground">{item?.specialRequirements}</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          iconName="Calendar"
          iconPosition="left"
          onClick={() => onReschedule(item?.id)}
        >
          Reschedule
        </Button>
        <Button
          variant="ghost"
          size="sm"
          iconName="Trash2"
          iconPosition="left"
          onClick={() => onRemove(item?.id)}
          className="text-destructive hover:text-destructive"
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

export default ActivityItem;