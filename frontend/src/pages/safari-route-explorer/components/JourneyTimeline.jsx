import React from 'react';
import Icon from '../../../components/AppIcon';

const JourneyTimeline = ({ waypoints }) => {
  const getElevationColor = (elevation) => {
    if (elevation > 1000) return 'var(--color-accent)';
    if (elevation > 950) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Route" size={20} strokeWidth={2} color="var(--color-primary)" />
        </div>
        <h3 className="font-heading font-semibold text-xl">Journey Timeline</h3>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-6">
          {waypoints?.map((waypoint, index) => (
            <div key={index} className="relative flex gap-4">
              <div className="relative z-10 flex-shrink-0">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-md">
                  <span className="text-primary-foreground font-bold">{index + 1}</span>
                </div>
              </div>
              
              <div className="flex-1 pb-2">
                <div className="bg-muted rounded-lg p-4 hover-lift transition-organic">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-heading font-semibold text-lg">{waypoint?.name}</h4>
                    <div className="flex items-center gap-2 bg-background px-3 py-1 rounded-full">
                      <Icon name="Clock" size={14} strokeWidth={2} color="var(--color-primary)" />
                      <span className="text-sm font-semibold">{waypoint?.time}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{waypoint?.description}</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Icon name="Mountain" size={16} strokeWidth={2} color={getElevationColor(waypoint?.elevation)} />
                      <span className="text-sm font-semibold">{waypoint?.elevation}m</span>
                    </div>
                    {index < waypoints?.length - 1 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="ArrowRight" size={16} strokeWidth={2} />
                        <span className="text-sm">Next stop</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Icon name="TrendingUp" size={16} strokeWidth={2} color="var(--color-success)" />
            <span className="text-muted-foreground">Elevation Range:</span>
            <span className="font-semibold">
              {Math.min(...waypoints?.map(w => w?.elevation))}m - {Math.max(...waypoints?.map(w => w?.elevation))}m
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="MapPin" size={16} strokeWidth={2} color="var(--color-primary)" />
            <span className="text-muted-foreground">Total Waypoints:</span>
            <span className="font-semibold">{waypoints?.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyTimeline;