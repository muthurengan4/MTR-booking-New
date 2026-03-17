import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { safariRoutesAPI } from '../../../lib/api';

const SafariRouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const data = await safariRoutesAPI.getAll();
      setRoutes(data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
      // Use mock data as fallback
      setRoutes([
        { id: '1', name: 'Jeep Safari', route_type: 'jeep', icon: 'Truck', color: '#2D5016', duration: '3-4 hours', difficulty: 'Moderate', distance: '25 km', description: 'Thrilling off-road adventure', highlights: ['Tiger sightings', 'Elephant herds'], best_time: 'Early morning', max_capacity: 6, terrain: 'Mixed terrain', is_active: true, waypoints: [] },
        { id: '2', name: 'Bus Safari', route_type: 'bus', icon: 'Bus', color: '#8B4513', duration: '2-3 hours', difficulty: 'Easy', distance: '18 km', description: 'Comfortable group safari', highlights: ['Spotted deer', 'Peacock displays'], best_time: 'Morning', max_capacity: 45, terrain: 'Paved roads', is_active: true, waypoints: [] },
        { id: '3', name: 'Elephant Camp Visit', route_type: 'elephant', icon: 'Mountain', color: '#FF6B35', duration: '1.5-2 hours', difficulty: 'Easy', distance: '5 km', description: 'Educational walking tour', highlights: ['Elephant feeding', 'Bathing sessions'], best_time: 'Morning', max_capacity: 20, terrain: 'Flat walking paths', is_active: true, waypoints: [] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getRouteTypeIcon = (type) => {
    switch (type) {
      case 'jeep': return 'Truck';
      case 'bus': return 'Bus';
      case 'elephant': return 'Mountain';
      default: return 'Map';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="safari-route-management">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">Safari Route Management</h2>
          <p className="text-muted-foreground">Manage safari routes and waypoints</p>
        </div>
        <Button iconName="Plus" data-testid="add-route-btn">
          Add New Route
        </Button>
      </div>

      <div className="grid gap-4">
        {routes.map((route) => (
          <div
            key={route.id}
            className="bg-muted rounded-lg border border-border p-4 transition-organic hover:shadow-md"
            data-testid={`route-card-${route.id}`}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: route.color + '20' }}
              >
                <Icon name={getRouteTypeIcon(route.route_type)} size={24} style={{ color: route.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-foreground text-lg">{route.name}</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                    {route.route_type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    route.is_active ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {route.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{route.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Icon name="Clock" size={16} />
                    <span>{route.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Route" size={16} />
                    <span>{route.distance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Users" size={16} />
                    <span>Max {route.max_capacity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="AlertTriangle" size={16} />
                    <span>{route.difficulty}</span>
                  </div>
                </div>
                {route.highlights && route.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {route.highlights.map((highlight, idx) => (
                      <span key={idx} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex md:flex-col gap-2">
                <Button variant="outline" size="sm" iconName="Edit">Edit</Button>
                <Button variant="outline" size="sm" iconName="MapPin">Waypoints</Button>
                <Button variant="destructive" size="sm" iconName="Trash2">Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SafariRouteManagement;
