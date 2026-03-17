import React, { useState, useEffect } from 'react';
import Header from '../../components/navigation/Header';
import Icon from '../../components/AppIcon';
import RouteMap from './components/RouteMap';
import RouteSelector from './components/RouteSelector';
import JourneyTimeline from './components/JourneyTimeline';
import ControlPanel from './components/ControlPanel';
import { safariRoutesAPI, wildlifeZonesAPI } from '../../lib/api';

const SafariRouteExplorer = () => {
  const [selectedRoute, setSelectedRoute] = useState('jeep');
  const [mapView, setMapView] = useState('terrain');
  const [showWildlifeZones, setShowWildlifeZones] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [safariRoutes, setSafariRoutes] = useState([]);
  const [wildlifeZones, setWildlifeZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [routesData, zonesData] = await Promise.all([
        safariRoutesAPI.getAll(true),
        wildlifeZonesAPI.getAll(true)
      ]);

      const formattedRoutes = routesData?.map(route => ({
        id: route?.route_type,
        route_id: route?.id,
        name: route?.name,
        icon: route?.icon,
        color: route?.color,
        duration: route?.duration,
        difficulty: route?.difficulty,
        distance: route?.distance,
        description: route?.description,
        highlights: route?.highlights || [],
        bestTime: route?.best_time,
        maxCapacity: route?.max_capacity,
        terrain: route?.terrain,
        waypoints: route?.waypoints?.map(wp => ({
          name: wp?.name,
          time: wp?.time,
          elevation: wp?.elevation,
          description: wp?.description
        })) || []
      })) || [];

      const formattedZones = zonesData?.map(zone => ({
        id: zone?.id,
        name: zone?.name,
        coordinates: { x: zone?.coordinate_x, y: zone?.coordinate_y },
        species: zone?.species || [],
        probability: zone?.probability,
        season: zone?.season,
        bestTime: zone?.best_time,
        description: zone?.description,
        safetyTips: zone?.safety_tips || [],
        photoTips: zone?.photo_tips || []
      })) || [];

      setSafariRoutes(formattedRoutes);
      setWildlifeZones(formattedZones);

      if (formattedRoutes?.length > 0) {
        setSelectedRoute(formattedRoutes?.[0]?.id);
      }
    } catch (error) {
      console.error('Error fetching safari data:', error);
      // Use mock data as fallback
      setSafariRoutes([
        { id: 'jeep', route_id: '1', name: 'Jeep Safari', icon: 'Truck', color: '#2D5016', duration: '3-4 hours', difficulty: 'Moderate', distance: '25 km', description: 'Thrilling off-road adventure', highlights: ['Tiger sightings', 'Elephant herds'], bestTime: 'Early morning', maxCapacity: 6, terrain: 'Mixed terrain', waypoints: [] },
        { id: 'bus', route_id: '2', name: 'Bus Safari', icon: 'Bus', color: '#8B4513', duration: '2-3 hours', difficulty: 'Easy', distance: '18 km', description: 'Comfortable group safari', highlights: ['Spotted deer', 'Peacock displays'], bestTime: 'Morning', maxCapacity: 45, terrain: 'Paved roads', waypoints: [] },
        { id: 'elephant', route_id: '3', name: 'Elephant Camp Visit', icon: 'Mountain', color: '#FF6B35', duration: '1.5-2 hours', difficulty: 'Easy', distance: '5 km', description: 'Educational walking tour', highlights: ['Elephant feeding', 'Bathing sessions'], bestTime: 'Morning', maxCapacity: 20, terrain: 'Flat walking paths', waypoints: [] }
      ]);
      setWildlifeZones([
        { id: '1', name: 'Tiger Territory Alpha', coordinates: { x: 35, y: 40 }, species: ['Bengal Tiger', 'Wild Boar'], probability: 'High', season: 'Year-round', bestTime: 'Early morning', description: 'Core tiger habitat', safetyTips: ['Stay in vehicle'], photoTips: ['Use telephoto lens'] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const currentRoute = safariRoutes?.find(route => route?.id === selectedRoute);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 flex items-center justify-center py-12">
          <Icon name="Loader2" size={48} className="animate-spin" color="var(--color-primary)" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="safari-route-explorer">
      <Header />
      
      <main className="pt-20">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Icon name="Map" size={24} strokeWidth={2} color="var(--color-primary)" />
              </div>
              <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl">
                Safari Route Explorer
              </h1>
            </div>
            <p className="text-muted-foreground text-base md:text-lg max-w-3xl">
              Explore interactive maps of our safari routes, discover wildlife zones, and plan your perfect Mudumalai adventure with detailed journey insights.
            </p>
          </div>

          {safariRoutes?.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Map" size={48} className="mx-auto mb-4" color="var(--color-muted-foreground)" />
              <p className="text-muted-foreground">No safari routes available at the moment.</p>
            </div>
          ) : (
            <>
              <RouteSelector 
                routes={safariRoutes}
                selectedRoute={selectedRoute}
                onRouteSelect={setSelectedRoute}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2">
                  <RouteMap 
                    route={currentRoute}
                    wildlifeZones={wildlifeZones}
                    mapView={mapView}
                    showWildlifeZones={showWildlifeZones}
                    timeOfDay={timeOfDay}
                  />

                  <div className="mt-6">
                    <JourneyTimeline waypoints={currentRoute?.waypoints} />
                  </div>
                </div>

                <div className="space-y-6">
                  <ControlPanel 
                    mapView={mapView}
                    onMapViewChange={setMapView}
                    showWildlifeZones={showWildlifeZones}
                    onToggleWildlifeZones={setShowWildlifeZones}
                    timeOfDay={timeOfDay}
                    onTimeOfDayChange={setTimeOfDay}
                  />

                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-heading font-semibold text-xl mb-4">Route Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Icon name="Clock" size={20} strokeWidth={2} color="var(--color-primary)" />
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-semibold">{currentRoute?.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon name="Route" size={20} strokeWidth={2} color="var(--color-primary)" />
                        <div>
                          <p className="text-sm text-muted-foreground">Distance</p>
                          <p className="font-semibold">{currentRoute?.distance}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon name="TrendingUp" size={20} strokeWidth={2} color="var(--color-primary)" />
                        <div>
                          <p className="text-sm text-muted-foreground">Difficulty</p>
                          <p className="font-semibold">{currentRoute?.difficulty}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon name="Users" size={20} strokeWidth={2} color="var(--color-primary)" />
                        <div>
                          <p className="text-sm text-muted-foreground">Max Capacity</p>
                          <p className="font-semibold">{currentRoute?.maxCapacity} people</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Icon name="Sun" size={20} strokeWidth={2} color="var(--color-primary)" />
                        <div>
                          <p className="text-sm text-muted-foreground">Best Time</p>
                          <p className="font-semibold">{currentRoute?.bestTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-heading font-semibold text-xl mb-4">Highlights</h3>
                    <div className="space-y-2">
                      {currentRoute?.highlights?.map((highlight, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Icon name="CheckCircle" size={16} strokeWidth={2} color="var(--color-success)" />
                          <span className="text-sm">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SafariRouteExplorer;
