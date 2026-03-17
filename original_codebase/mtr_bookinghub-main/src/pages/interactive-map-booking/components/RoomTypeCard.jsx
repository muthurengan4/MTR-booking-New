import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const RoomTypeCard = ({ room, onSelect, isSelected }) => {
  const amenityIcons = {
    'WiFi': 'Wifi',
    'AC': 'Wind',
    'TV': 'Tv',
    'Mini Bar': 'Coffee',
    'Balcony': 'Home',
    'Room Service': 'Bell',
    'Hot Water': 'Droplet',
    'Parking': 'Car'
  };

  return (
    <div className={`bg-card border rounded-xl overflow-hidden transition-organic hover-lift ${
      isSelected ? 'border-primary shadow-lg' : 'border-border'
    }`}>
      <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
        <Image
          src={room?.image}
          alt={room?.imageAlt}
          className="w-full h-full object-cover transition-organic hover:scale-105"
        />
        {room?.available ? (
          <div className="absolute top-4 right-4 bg-success text-success-foreground px-3 py-1 rounded-full text-sm font-semibold">
            Available
          </div>
        ) : (
          <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
            <div className="text-center">
              <Icon name="XCircle" size={48} strokeWidth={2} color="var(--color-destructive)" />
              <p className="text-destructive font-semibold mt-2">Not Available</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-heading font-bold text-lg md:text-xl mb-1">{room?.type}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Users" size={16} strokeWidth={2} />
              <span>Up to {room?.capacity} guests</span>
            </div>
          </div>
          {isSelected && (
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              <Icon name="Check" size={20} strokeWidth={2.5} />
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{room?.description}</p>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Amenities:</p>
          <div className="flex flex-wrap gap-2">
            {room?.amenities?.map((amenity, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm"
              >
                <Icon name={amenityIcons?.[amenity] || 'Check'} size={14} strokeWidth={2} />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="font-heading font-bold text-2xl text-primary">
              ₹{room?.startingPrice?.toLocaleString('en-IN')}
            </p>
            <p className="text-sm text-muted-foreground">per night</p>
          </div>
          {room?.discount && (
            <div className="bg-accent text-accent-foreground px-3 py-1 rounded-lg text-sm font-semibold">
              {room?.discount}% OFF
            </div>
          )}
        </div>

        <Button
          variant={isSelected ? 'default' : 'outline'}
          fullWidth
          onClick={() => onSelect(room)}
          disabled={!room?.available}
          iconName={isSelected ? 'Check' : 'Plus'}
          iconPosition="left"
        >
          {isSelected ? 'Selected' : 'Select Room'}
        </Button>
      </div>
    </div>
  );
};

export default RoomTypeCard;