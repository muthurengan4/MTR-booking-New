import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { roomTypesAPI } from '../../../lib/api';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('all');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await roomTypesAPI.getAll();
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (room) => {
    try {
      await roomTypesAPI.update(room.id, {
        ...room,
        is_active: !room.is_active
      });
      await fetchRooms();
    } catch (error) {
      console.error('Error toggling room status:', error);
    }
  };

  const locations = ['all', ...new Set(rooms.map(r => r.location).filter(Boolean))];
  const filteredRooms = selectedLocation === 'all' 
    ? rooms 
    : rooms.filter(r => r.location === selectedLocation);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="room-management">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">Room Inventory Management</h2>
          <p className="text-muted-foreground">Manage room availability and blocking</p>
        </div>
        <Select
          options={locations.map(loc => ({ value: loc, label: loc === 'all' ? 'All Locations' : loc }))}
          value={selectedLocation}
          onChange={setSelectedLocation}
          className="w-48"
        />
      </div>

      <div className="grid gap-4">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            className="bg-muted rounded-lg border border-border p-4 transition-organic hover:shadow-md"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {room.image_url && (
                <img
                  src={room.image_url}
                  alt={room.name}
                  className="w-full md:w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-foreground text-lg">{room.name}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      room.is_active ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {room.is_active ? 'Available' : 'Blocked'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{room.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Icon name="MapPin" size={16} />
                    <span>{room.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="IndianRupee" size={16} />
                    <span>₹{room.base_price?.toLocaleString()}/night</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Users" size={16} />
                    <span>Max {room.max_capacity} guests</span>
                  </div>
                </div>
              </div>
              <div className="flex md:flex-col gap-2">
                <Button
                  variant={room.is_active ? 'destructive' : 'success'}
                  size="sm"
                  iconName={room.is_active ? 'Lock' : 'Unlock'}
                  onClick={() => handleToggleStatus(room)}
                >
                  {room.is_active ? 'Block' : 'Unblock'}
                </Button>
                <Button variant="outline" size="sm" iconName="Calendar">
                  Block Dates
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Home" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No rooms found for the selected location</p>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
