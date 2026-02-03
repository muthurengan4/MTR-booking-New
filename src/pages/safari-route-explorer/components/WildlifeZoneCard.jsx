import React from 'react';
import Icon from '../../../components/AppIcon';

const WildlifeZoneCard = ({ zone }) => {
  const getProbabilityColor = (probability) => {
    switch(probability?.toLowerCase()) {
      case 'very high': return 'bg-success text-success-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 transition-organic hover-lift">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-heading font-semibold text-base">{zone?.name}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getProbabilityColor(zone?.probability)}`}>
          {zone?.probability}
        </span>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{zone?.description}</p>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon name="Footprints" size={14} strokeWidth={2} color="var(--color-primary)" />
          <span className="text-xs text-muted-foreground">
            {zone?.species?.slice(0, 2)?.join(', ')}
            {zone?.species?.length > 2 && ` +${zone?.species?.length - 2} more`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Sun" size={14} strokeWidth={2} color="var(--color-accent)" />
          <span className="text-xs text-muted-foreground">{zone?.bestTime}</span>
        </div>
      </div>
    </div>
  );
};

export default WildlifeZoneCard;