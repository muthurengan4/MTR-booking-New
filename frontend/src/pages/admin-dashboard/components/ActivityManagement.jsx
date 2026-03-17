import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { activityTypesAPI } from '../../../lib/api';

const ActivityManagement = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await activityTypesAPI.getAll();
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (activity) => {
    try {
      await activityTypesAPI.update(activity.id, {
        ...activity,
        is_active: !activity.is_active
      });
      await fetchActivities();
    } catch (error) {
      console.error('Error toggling activity status:', error);
    }
  };

  const locations = ['all', ...new Set(activities.map(a => a.location).filter(Boolean))];
  const filteredActivities = selectedLocation === 'all' 
    ? activities 
    : activities.filter(a => a.location === selectedLocation);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="activity-management">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">Activity Slot Management</h2>
          <p className="text-muted-foreground">Manage activity availability and scheduling</p>
        </div>
        <Select
          options={locations.map(loc => ({ value: loc, label: loc === 'all' ? 'All Locations' : loc }))}
          value={selectedLocation}
          onChange={setSelectedLocation}
          className="w-48"
        />
      </div>

      <div className="grid gap-4">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className="bg-muted rounded-lg border border-border p-4 transition-organic hover:shadow-md"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {activity.image_url && (
                <img
                  src={activity.image_url}
                  alt={activity.name}
                  className="w-full md:w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-foreground text-lg">{activity.name}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.is_active ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {activity.is_active ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Icon name="MapPin" size={16} />
                    <span>{activity.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Clock" size={16} />
                    <span>{activity.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="IndianRupee" size={16} />
                    <span>₹{activity.base_price?.toLocaleString()}/person</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Users" size={16} />
                    <span>Max {activity.max_capacity} people</span>
                  </div>
                </div>
              </div>
              <div className="flex md:flex-col gap-2">
                <Button
                  variant={activity.is_active ? 'destructive' : 'success'}
                  size="sm"
                  iconName={activity.is_active ? 'Lock' : 'Unlock'}
                  onClick={() => handleToggleStatus(activity)}
                >
                  {activity.is_active ? 'Disable' : 'Enable'}
                </Button>
                <Button variant="outline" size="sm" iconName="Calendar">
                  Block Dates
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Compass" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No activities found for the selected location</p>
        </div>
      )}
    </div>
  );
};

export default ActivityManagement;
