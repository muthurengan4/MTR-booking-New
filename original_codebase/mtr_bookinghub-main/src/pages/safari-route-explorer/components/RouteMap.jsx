import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const RouteMap = ({ route, wildlifeZones, mapView, showWildlifeZones, timeOfDay }) => {
  const [zoomLevel, setZoomLevel] = useState(12);
  const [selectedZone, setSelectedZone] = useState(null);

  const handleZoomIn = () => {
    if (zoomLevel < 18) setZoomLevel(prev => prev + 1);
  };

  const handleZoomOut = () => {
    if (zoomLevel > 8) setZoomLevel(prev => prev - 1);
  };

  const getRouteColor = () => {
    return route?.color || '#2D5016';
  };

  const getProbabilityColor = (probability) => {
    switch(probability?.toLowerCase()) {
      case 'very high': return 'var(--color-success)';
      case 'high': return 'var(--color-warning)';
      case 'medium': return 'var(--color-accent)';
      default: return 'var(--color-muted-foreground)';
    }
  };

  const getTimeOfDayOverlay = () => {
    switch(timeOfDay) {
      case 'morning': return 'bg-amber-500/10';
      case 'afternoon': return 'bg-orange-500/10';
      case 'evening': return 'bg-purple-500/10';
      case 'night': return 'bg-blue-900/30';
      default: return '';
    }
  };

  return (
    <div className="relative h-[500px] md:h-[600px] bg-muted rounded-xl overflow-hidden border border-border">
      <div className="absolute inset-0">
        <Image
          src={mapView === 'satellite' 
            ? "https://img.rocket.new/generatedImages/rocket_gen_img_1a8f3e2b1-1768809815591.png"
            : "https://img.rocket.new/generatedImages/rocket_gen_img_1b7aa2fb3-1768809815591.png"
          }
          alt="Detailed topographic map of Mudumalai Tiger Reserve showing safari routes, wildlife zones, and terrain features with forest boundaries marked"
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 transition-organic ${getTimeOfDayOverlay()}`} />
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill={getRouteColor()} />
          </marker>
        </defs>
        
        {route?.id === 'jeep' && (
          <path
            d="M 15% 30%, Q 25% 45%, 35% 40%, T 55% 30%, Q 65% 35%, 70% 55%, T 80% 65%"
            stroke={getRouteColor()}
            strokeWidth="4"
            fill="none"
            strokeDasharray="10,5"
            markerEnd="url(#arrowhead)"
            className="animate-pulse"
          />
        )}
        
        {route?.id === 'bus' && (
          <path
            d="M 20% 25%, L 40% 35%, L 55% 30%, L 70% 40%, L 85% 50%"
            stroke={getRouteColor()}
            strokeWidth="5"
            fill="none"
            strokeDasharray="15,8"
            markerEnd="url(#arrowhead)"
            className="animate-pulse"
          />
        )}
        
        {route?.id === 'elephant' && (
          <path
            d="M 30% 50%, Q 40% 48%, 50% 50%, T 70% 52%"
            stroke={getRouteColor()}
            strokeWidth="4"
            fill="none"
            strokeDasharray="8,4"
            markerEnd="url(#arrowhead)"
            className="animate-pulse"
          />
        )}
      </svg>

      {showWildlifeZones && wildlifeZones?.map(zone => (
        <button
          key={zone?.id}
          onClick={() => setSelectedZone(zone)}
          className="absolute w-10 h-10 rounded-full bg-card border-2 shadow-lg transition-organic hover-lift active-press pointer-events-auto"
          style={{
            left: `${zone?.coordinates?.x}%`,
            top: `${zone?.coordinates?.y}%`,
            borderColor: getProbabilityColor(zone?.probability),
            zIndex: 20
          }}
          aria-label={`Wildlife zone: ${zone?.name}`}
        >
          <Icon name="Binoculars" size={20} strokeWidth={2} color={getProbabilityColor(zone?.probability)} />
        </button>
      ))}

      <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
        <button
          onClick={handleZoomIn}
          className="bg-card p-3 rounded-lg shadow-lg transition-organic hover-lift active-press"
          aria-label="Zoom in"
        >
          <Icon name="Plus" size={20} strokeWidth={2} />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-card p-3 rounded-lg shadow-lg transition-organic hover-lift active-press"
          aria-label="Zoom out"
        >
          <Icon name="Minus" size={20} strokeWidth={2} />
        </button>
        <button
          className="bg-card p-3 rounded-lg shadow-lg transition-organic hover-lift active-press"
          aria-label="Recenter map"
        >
          <Icon name="Maximize2" size={20} strokeWidth={2} />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm p-4 rounded-xl shadow-lg max-w-xs z-30">
        <div className="flex items-center gap-3 mb-3">
          <Icon name={route?.icon} size={24} strokeWidth={2} color={route?.color} />
          <h3 className="font-heading font-semibold text-lg">{route?.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{route?.description}</p>
        <div className="flex items-center gap-2 text-sm">
          <Icon name="MapPin" size={16} strokeWidth={2} color="var(--color-primary)" />
          <span className="text-muted-foreground">{route?.waypoints?.length} waypoints</span>
        </div>
      </div>

      {selectedZone && (
        <>
          <div 
            className="absolute inset-0 bg-background/60 backdrop-blur-sm z-40"
            onClick={() => setSelectedZone(null)}
          />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 z-50 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold text-xl mb-1">{selectedZone?.name}</h3>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getProbabilityColor(selectedZone?.probability) }}
                  />
                  <span className="text-sm font-semibold">{selectedZone?.probability} Probability</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                className="p-2 rounded-lg hover:bg-muted transition-organic"
                aria-label="Close"
              >
                <Icon name="X" size={20} strokeWidth={2} />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{selectedZone?.description}</p>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Icon name="Footprints" size={16} strokeWidth={2} color="var(--color-primary)" />
                  Species Found
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedZone?.species?.map((species, index) => (
                    <span key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                      {species}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Best Season</p>
                  <p className="text-sm font-semibold">{selectedZone?.season}</p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Best Time</p>
                  <p className="text-sm font-semibold">{selectedZone?.bestTime}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Icon name="Shield" size={16} strokeWidth={2} color="var(--color-warning)" />
                  Safety Tips
                </h4>
                <ul className="space-y-1">
                  {selectedZone?.safetyTips?.map((tip, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <Icon name="AlertCircle" size={14} strokeWidth={2} className="mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Icon name="Camera" size={16} strokeWidth={2} color="var(--color-accent)" />
                  Photography Tips
                </h4>
                <ul className="space-y-1">
                  {selectedZone?.photoTips?.map((tip, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <Icon name="Aperture" size={14} strokeWidth={2} className="mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RouteMap;