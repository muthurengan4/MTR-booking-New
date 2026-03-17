import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { wildlifeZonesAPI } from '../../../lib/api';

const WildlifeZoneManagement = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const data = await wildlifeZonesAPI.getAll();
      setZones(data || []);
    } catch (error) {
      console.error('Error fetching zones:', error);
      // Use mock data as fallback
      setZones([
        { id: '1', name: 'Tiger Territory Alpha', coordinate_x: 35, coordinate_y: 40, species: ['Bengal Tiger', 'Wild Boar', 'Sambar Deer'], probability: 'High', season: 'Year-round', best_time: 'Early morning', description: 'Core tiger habitat with frequent sightings', safety_tips: ['Maintain silence', 'Stay in vehicle'], photo_tips: ['Use telephoto lens'], is_active: true },
        { id: '2', name: 'Elephant Corridor', coordinate_x: 55, coordinate_y: 30, species: ['Asian Elephant', 'Gaur', 'Spotted Deer'], probability: 'Very High', season: 'Peak in dry season', best_time: 'Morning and evening', description: 'Traditional elephant migration path', safety_tips: ['Keep safe distance', 'Avoid loud noises'], photo_tips: ['Wide-angle for herds'], is_active: true },
        { id: '3', name: 'Grassland Meadow', coordinate_x: 70, coordinate_y: 55, species: ['Gaur', 'Wild Dog', 'Peacock', 'Spotted Deer'], probability: 'High', season: 'Best in monsoon', best_time: 'Late afternoon', description: 'Open grassland with diverse herbivores', safety_tips: ['Sun protection required'], photo_tips: ['Landscape shots'], is_active: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getProbabilityColor = (probability) => {
    switch (probability) {
      case 'Very High': return 'bg-success/10 text-success';
      case 'High': return 'bg-primary/10 text-primary';
      case 'Medium': return 'bg-warning/10 text-warning';
      case 'Low': return 'bg-muted-foreground/10 text-muted-foreground';
      default: return 'bg-muted-foreground/10 text-muted-foreground';
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
    <div className="space-y-6" data-testid="wildlife-zone-management">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">Wildlife Zone Management</h2>
          <p className="text-muted-foreground">Manage wildlife zones and sighting information</p>
        </div>
        <Button iconName="Plus" data-testid="add-zone-btn">
          Add Wildlife Zone
        </Button>
      </div>

      <div className="grid gap-4">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="bg-muted rounded-lg border border-border p-4 transition-organic hover:shadow-md"
            data-testid={`zone-card-${zone.id}`}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Binoculars" size={24} className="text-accent" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-foreground text-lg">{zone.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProbabilityColor(zone.probability)}`}>
                    {zone.probability} Probability
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    zone.is_active ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {zone.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{zone.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Icon name="MapPin" size={16} />
                    <span>({zone.coordinate_x}, {zone.coordinate_y})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Calendar" size={16} />
                    <span>{zone.season}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Clock" size={16} />
                    <span>{zone.best_time}</span>
                  </div>
                </div>
                {zone.species && zone.species.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Species:</p>
                    <div className="flex flex-wrap gap-2">
                      {zone.species.map((species, idx) => (
                        <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {species}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex md:flex-col gap-2">
                <Button variant="outline" size="sm" iconName="Edit">Edit</Button>
                <Button variant={zone.is_active ? 'destructive' : 'success'} size="sm" iconName={zone.is_active ? 'EyeOff' : 'Eye'}>
                  {zone.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button variant="destructive" size="sm" iconName="Trash2">Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WildlifeZoneManagement;
