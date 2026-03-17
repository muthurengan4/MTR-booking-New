import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const MapPanel = ({ locations, selectedLocation, onLocationSelect, filters }) => {
  const [mapView, setMapView] = useState('terrain');
  const [zoomLevel, setZoomLevel] = useState(12);
  const [showLocationOverlay, setShowLocationOverlay] = useState(null);

  const handleZoomIn = () => {
    if (zoomLevel < 18) setZoomLevel((prev) => prev + 1);
  };

  const handleZoomOut = () => {
    if (zoomLevel > 8) setZoomLevel((prev) => prev - 1);
  };

  const handleLocationClick = (location) => {
    setShowLocationOverlay(location);
  };

  const handleSelectLocation = (location) => {
    onLocationSelect(location);
    setShowLocationOverlay(null);
  };

  const getAvailabilityStatus = (location) => {
    const availableRooms = location?.roomTypes?.filter((room) => room?.available)?.length;
    if (availableRooms === 0) return 'unavailable';
    if (availableRooms <= 2) return 'limited';
    return 'available';
  };

  return (
    <div className="relative h-full bg-muted rounded-xl overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://img.rocket.new/generatedImages/rocket_gen_img_1b7aa2fb3-1768809815591.png"
          alt="Detailed topographic map of Mudumalai Tiger Reserve showing three resort locations Masinagudi, Thepakadu and Gudalur with forest boundaries and wildlife zones marked in green"
          className="w-full h-full object-cover" />

      </div>
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => setMapView(mapView === 'terrain' ? 'satellite' : 'terrain')}
          className="bg-card p-3 rounded-lg shadow-lg transition-organic hover-lift active-press"
          aria-label="Toggle map view">

          <Icon name={mapView === 'terrain' ? 'Satellite' : 'Map'} size={20} strokeWidth={2} />
        </button>
        <button
          onClick={handleZoomIn}
          className="bg-card p-3 rounded-lg shadow-lg transition-organic hover-lift active-press"
          aria-label="Zoom in">

          <Icon name="Plus" size={20} strokeWidth={2} />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-card p-3 rounded-lg shadow-lg transition-organic hover-lift active-press"
          aria-label="Zoom out">

          <Icon name="Minus" size={20} strokeWidth={2} />
        </button>
      </div>
      <div className="absolute top-4 left-4 bg-card p-4 rounded-xl shadow-lg max-w-xs z-10">
        <h3 className="font-heading font-semibold text-lg mb-3">MTR Locations</h3>
        <div className="space-y-2">
          {locations?.map((location) => {
            const status = getAvailabilityStatus(location);
            return (
              <button
                key={location?.id}
                onClick={() => handleLocationClick(location)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-organic hover-lift active-press ${
                selectedLocation?.id === location?.id ?
                'bg-primary text-primary-foreground' :
                'bg-muted hover:bg-muted/80'}`
                }>

                <div className="flex items-center gap-3">
                  <Icon name="MapPin" size={20} strokeWidth={2} />
                  <span className="font-medium text-sm">{location?.name}</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                status === 'available' ? 'bg-success' :
                status === 'limited' ? 'bg-warning' : 'bg-destructive'}`
                } />
              </button>);

          })}
        </div>
      </div>
      {showLocationOverlay &&
      <>
          <div
          className="absolute inset-0 bg-background/80 z-20"
          onClick={() => setShowLocationOverlay(null)} />

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4 z-30 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold text-2xl mb-2">{showLocationOverlay?.name}</h3>
                <p className="text-muted-foreground">{showLocationOverlay?.description}</p>
              </div>
              <button
              onClick={() => setShowLocationOverlay(null)}
              className="p-2 rounded-lg hover:bg-muted transition-organic"
              aria-label="Close overlay">

                <Icon name="X" size={24} strokeWidth={2} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Icon name="Navigation" size={20} strokeWidth={2} color="var(--color-primary)" />
                <div>
                  <p className="text-sm text-muted-foreground">Distance to Safari Zone</p>
                  <p className="font-semibold">{showLocationOverlay?.distanceToSafari}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Icon name="Home" size={20} strokeWidth={2} color="var(--color-primary)" />
                <div>
                  <p className="text-sm text-muted-foreground">Available Rooms</p>
                  <p className="font-semibold">{showLocationOverlay?.roomTypes?.filter((r) => r?.available)?.length} types</p>
                </div>
              </div>
            </div>

            <h4 className="font-heading font-semibold text-lg mb-3">Available Room Types</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {showLocationOverlay?.roomTypes?.map((room) =>
            <div key={room?.id} className="border border-border rounded-lg overflow-hidden">
                  <div className="relative h-40">
                    <Image
                  src={room?.image}
                  alt={room?.imageAlt}
                  className="w-full h-full object-cover" />

                    {!room?.available &&
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <span className="text-destructive font-semibold">Not Available</span>
                      </div>
                }
                  </div>
                  <div className="p-4">
                    <h5 className="font-semibold mb-2">{room?.type}</h5>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Icon name="Users" size={16} strokeWidth={2} />
                      <span>Up to {room?.capacity} guests</span>
                    </div>
                    <p className="font-bold text-primary">₹{room?.startingPrice?.toLocaleString('en-IN')}/night</p>
                  </div>
                </div>
            )}
            </div>

            <button
            onClick={() => handleSelectLocation(showLocationOverlay)}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold transition-organic hover-lift active-press">

              Select This Location
            </button>
          </div>
        </>
      }
    </div>);

};

export default MapPanel;