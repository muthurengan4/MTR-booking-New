import React from 'react';
import Icon from '../../../components/AppIcon';

const RouteSelector = ({ routes, selectedRoute, onRouteSelect }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {routes?.map(route => (
          <button
            key={route?.id}
            onClick={() => onRouteSelect(route?.id)}
            className={`flex items-center gap-3 p-4 rounded-lg transition-organic hover-lift active-press ${
              selectedRoute === route?.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              selectedRoute === route?.id ? 'bg-primary-foreground/20' : 'bg-background'
            }`}>
              <Icon 
                name={route?.icon} 
                size={24} 
                strokeWidth={2} 
                color={selectedRoute === route?.id ? 'currentColor' : route?.color}
              />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-heading font-semibold text-lg">{route?.name}</h3>
              <p className={`text-sm ${
                selectedRoute === route?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}>
                {route?.duration} • {route?.difficulty}
              </p>
            </div>
            {selectedRoute === route?.id && (
              <Icon name="Check" size={20} strokeWidth={2.5} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RouteSelector;