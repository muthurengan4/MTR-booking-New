import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ActivityCard = ({ activity, onSelect, isSelected }) => {
  const getPriceDisplay = () => {
    if (activity?.priceRange) {
      return `₹${activity?.priceRange?.min?.toLocaleString('en-IN')} - ₹${activity?.priceRange?.max?.toLocaleString('en-IN')}`;
    }
    return `₹${activity?.price?.toLocaleString('en-IN')}`;
  };

  const getCapacityColor = () => {
    const percentage = (activity?.availableSlots / activity?.totalSlots) * 100;
    if (percentage > 50) return 'text-success';
    if (percentage > 20) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className={`bg-card rounded-xl overflow-hidden border-2 transition-organic hover-lift ${
      isSelected ? 'border-primary shadow-lg' : 'border-border'
    }`}>
      <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
        <Image
          src={activity?.image}
          alt={activity?.imageAlt}
          className="w-full h-full object-cover"
        />
        {activity?.isPopular && (
          <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Icon name="Star" size={16} strokeWidth={2} />
            <span>Popular</span>
          </div>
        )}
        {activity?.discount && (
          <div className="absolute top-4 left-4 bg-success text-success-foreground px-3 py-1 rounded-full text-sm font-semibold">
            {activity?.discount}% OFF
          </div>
        )}
      </div>
      <div className="p-4 md:p-5 lg:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h3 className="font-heading text-xl md:text-2xl font-semibold text-foreground mb-1">
              {activity?.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {activity?.description}
            </p>
          </div>
          <div className={`flex items-center gap-1 ${getCapacityColor()}`}>
            <Icon name="Users" size={18} strokeWidth={2} />
            <span className="text-sm font-medium">{activity?.availableSlots}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="Clock" size={18} strokeWidth={2} />
            <span className="text-sm">{activity?.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="Users" size={18} strokeWidth={2} />
            <span className="text-sm">Max {activity?.maxCapacity}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="Calendar" size={18} strokeWidth={2} />
            <span className="text-sm">{activity?.frequency}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="Baby" size={18} strokeWidth={2} />
            <span className="text-sm">{activity?.ageRestriction}</span>
          </div>
        </div>

        {activity?.highlights && activity?.highlights?.length > 0 && (
          <div className="mb-4 space-y-2">
            {activity?.highlights?.slice(0, 3)?.map((highlight, index) => (
              <div key={index} className="flex items-start gap-2">
                <Icon name="Check" size={16} strokeWidth={2} className="text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{highlight}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Starting from</p>
            <p className="text-xl md:text-2xl font-bold text-primary">
              {getPriceDisplay()}
            </p>
            <p className="text-xs text-muted-foreground">per person</p>
          </div>
          <Button
            variant={isSelected ? "default" : "outline"}
            onClick={() => onSelect(activity)}
            iconName={isSelected ? "Check" : "Plus"}
            iconPosition="left"
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;