import React from 'react';
import Icon from '../../../components/AppIcon';

const ControlPanel = ({ 
  mapView, 
  onMapViewChange, 
  showWildlifeZones, 
  onToggleWildlifeZones,
  timeOfDay,
  onTimeOfDayChange
}) => {
  const timeOptions = [
    { value: 'morning', label: 'Morning', icon: 'Sunrise' },
    { value: 'afternoon', label: 'Afternoon', icon: 'Sun' },
    { value: 'evening', label: 'Evening', icon: 'Sunset' },
    { value: 'night', label: 'Night', icon: 'Moon' }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Settings" size={20} strokeWidth={2} color="var(--color-primary)" />
        </div>
        <h3 className="font-heading font-semibold text-xl">Map Controls</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-semibold mb-3 block">Map View</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onMapViewChange('terrain')}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-organic hover-lift active-press ${
                mapView === 'terrain' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              <Icon name="Map" size={18} strokeWidth={2} />
              <span className="text-sm font-medium">Terrain</span>
            </button>
            <button
              onClick={() => onMapViewChange('satellite')}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-organic hover-lift active-press ${
                mapView === 'satellite' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              <Icon name="Satellite" size={18} strokeWidth={2} />
              <span className="text-sm font-medium">Satellite</span>
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold mb-3 block">Time of Day</label>
          <div className="grid grid-cols-2 gap-2">
            {timeOptions?.map(option => (
              <button
                key={option?.value}
                onClick={() => onTimeOfDayChange(option?.value)}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-organic hover-lift active-press ${
                  timeOfDay === option?.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <Icon name={option?.icon} size={18} strokeWidth={2} />
                <span className="text-sm font-medium">{option?.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <button
            onClick={() => onToggleWildlifeZones(!showWildlifeZones)}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-muted transition-organic hover-lift active-press"
          >
            <div className="flex items-center gap-3">
              <Icon name="Binoculars" size={20} strokeWidth={2} color="var(--color-primary)" />
              <span className="font-medium">Wildlife Zones</span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-organic ${
              showWildlifeZones ? 'bg-primary' : 'bg-border'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-organic transform ${
                showWildlifeZones ? 'translate-x-6' : 'translate-x-0.5'
              } mt-0.5`} />
            </div>
          </button>
        </div>

        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-semibold mb-3">Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm text-muted-foreground">Very High Probability</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-sm text-muted-foreground">High Probability</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-sm text-muted-foreground">Medium Probability</span>
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} strokeWidth={2} color="var(--color-primary)" className="mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Wildlife sightings vary by season and time. Markers show probability zones based on ranger reports and historical data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;