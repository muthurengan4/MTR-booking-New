import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const AccommodationItem = ({ item, onModify, onRemove }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights(item?.checkIn, item?.checkOut);

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 transition-organic hover:shadow-md">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <div className="w-full md:w-48 h-48 md:h-32 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={item?.image}
            alt={item?.imageAlt}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="MapPin" size={16} color="var(--color-primary)" strokeWidth={2} />
                <span className="text-caption text-muted-foreground">{item?.location}</span>
              </div>
              <h3 className="font-heading text-lg md:text-xl font-semibold text-foreground mb-1 line-clamp-1">
                {item?.roomType}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{item?.description}</p>
            </div>

            <div className="flex md:flex-col items-center md:items-end gap-2">
              <span className="text-2xl md:text-3xl font-bold text-primary whitespace-nowrap">
                ₹{item?.totalPrice?.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-muted-foreground">for {nights} {nights === 1 ? 'night' : 'nights'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Icon name="Calendar" size={18} color="var(--color-primary)" strokeWidth={2} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Check-in</p>
                <p className="text-sm font-medium text-foreground">{formatDate(item?.checkIn)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Icon name="Calendar" size={18} color="var(--color-primary)" strokeWidth={2} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Check-out</p>
                <p className="text-sm font-medium text-foreground">{formatDate(item?.checkOut)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Icon name="Users" size={18} color="var(--color-primary)" strokeWidth={2} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Guests</p>
                <p className="text-sm font-medium text-foreground">{item?.guests} {item?.guests === 1 ? 'Guest' : 'Guests'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Edit"
              iconPosition="left"
              onClick={() => onModify(item?.id)}
            >
              Modify Dates
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
      </div>
    </div>
  );
};

export default AccommodationItem;