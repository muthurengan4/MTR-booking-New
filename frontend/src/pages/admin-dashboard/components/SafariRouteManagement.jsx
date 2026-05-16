import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import ImageUpload from '../../../components/ImageUpload';
import { safariRoutesAPI, safariSlotsAPI } from '../../../lib/api';

const SafariRouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('routes');
  const [editingRoute, setEditingRoute] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [isCreatingSlot, setIsCreatingSlot] = useState(false);
  
  const [routeFormData, setRouteFormData] = useState({
    name: '',
    short_name: '',
    description: '',
    distance_km: '',
    duration_hours: 1,
    safari_type: '1hr',
    route_color: '#00FFFF',
    price_per_person: '',
    max_capacity: 6,
    coordinates: '',
    highlights: '',
    image_url: '',
    images: [],
    is_active: true,
    display_order: 0
  });

  const [slotFormData, setSlotFormData] = useState({
    slot_time: '',
    slot_period: 'Morning',
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [routesData, slotsData] = await Promise.all([
        safariRoutesAPI.getAll(),
        safariSlotsAPI.getAll()
      ]);
      setRoutes(routesData || []);
      setSlots(slotsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Route handlers
  const handleCreateRoute = () => {
    setIsCreatingRoute(true);
    setRouteFormData({
      name: '',
      short_name: '',
      description: '',
      distance_km: '',
      duration_hours: 1,
      safari_type: '1hr',
      route_color: '#00FFFF',
      price_per_person: '',
      max_capacity: 6,
      coordinates: '',
      highlights: '',
      image_url: '',
      images: [],
      is_active: true,
      display_order: routes.length + 1
    });
  };

  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setRouteFormData({
      name: route.name || '',
      short_name: route.short_name || '',
      description: route.description || '',
      distance_km: route.distance_km || '',
      duration_hours: route.duration_hours || 1,
      safari_type: route.safari_type || '1hr',
      route_color: route.route_color || '#00FFFF',
      price_per_person: route.price_per_person || '',
      max_capacity: route.max_capacity || 6,
      coordinates: JSON.stringify(route.coordinates || []),
      highlights: (route.highlights || []).join(', '),
      image_url: route.image_url || '',
      images: route.images || [],
      is_active: route.is_active ?? true,
      display_order: route.display_order || 0
    });
  };

  const handleCancelRoute = () => {
    setIsCreatingRoute(false);
    setEditingRoute(null);
  };

  const handleSaveRoute = async () => {
    try {
      const highlightsArray = routeFormData.highlights
        .split(',')
        .map(h => h.trim())
        .filter(h => h.length > 0);

      let coordinatesArray = [];
      try {
        coordinatesArray = JSON.parse(routeFormData.coordinates || '[]');
      } catch (e) {
        console.warn('Invalid coordinates JSON');
      }

      const payload = {
        name: routeFormData.name,
        short_name: routeFormData.short_name,
        description: routeFormData.description,
        distance_km: parseFloat(routeFormData.distance_km) || 0,
        duration_hours: parseInt(routeFormData.duration_hours) || 1,
        safari_type: routeFormData.safari_type,
        route_color: routeFormData.route_color,
        price_per_person: parseFloat(routeFormData.price_per_person) || 0,
        max_capacity: parseInt(routeFormData.max_capacity) || 6,
        coordinates: coordinatesArray,
        highlights: highlightsArray,
        image_url: routeFormData.images?.length > 0 ? routeFormData.images[0] : routeFormData.image_url,
        images: routeFormData.images || [],
        is_active: routeFormData.is_active,
        display_order: parseInt(routeFormData.display_order) || 0
      };

      if (isCreatingRoute) {
        await safariRoutesAPI.create(payload);
      } else if (editingRoute) {
        await safariRoutesAPI.update(editingRoute.id, payload);
      }

      await fetchData();
      handleCancelRoute();
    } catch (error) {
      console.error('Error saving route:', error);
      alert('Failed to save route: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteRoute = async (id) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    try {
      await safariRoutesAPI.delete(id);
      await fetchData();
    } catch (error) {
      console.error('Error deleting route:', error);
      alert('Failed to delete route');
    }
  };

  // Slot handlers
  const handleCreateSlot = () => {
    setIsCreatingSlot(true);
    setSlotFormData({
      slot_time: '',
      slot_period: 'Morning',
      is_active: true,
      display_order: slots.length + 1
    });
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setSlotFormData({
      slot_time: slot.slot_time || '',
      slot_period: slot.slot_period || 'Morning',
      is_active: slot.is_active ?? true,
      display_order: slot.display_order || 0
    });
  };

  const handleCancelSlot = () => {
    setIsCreatingSlot(false);
    setEditingSlot(null);
  };

  const handleSaveSlot = async () => {
    try {
      const payload = {
        slot_time: slotFormData.slot_time,
        slot_period: slotFormData.slot_period,
        is_active: slotFormData.is_active,
        display_order: parseInt(slotFormData.display_order) || 0
      };

      if (isCreatingSlot) {
        await safariSlotsAPI.create(payload);
      } else if (editingSlot) {
        await safariSlotsAPI.update(editingSlot.id, payload);
      }

      await fetchData();
      handleCancelSlot();
    } catch (error) {
      console.error('Error saving slot:', error);
      alert('Failed to save slot: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;
    try {
      await safariSlotsAPI.delete(id);
      await fetchData();
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Failed to delete slot');
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">Safari Route Management</h2>
          <p className="text-muted-foreground">Manage safari routes and time slots from KML data</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'routes'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon name="Route" size={18} className="inline mr-2" />
          Safari Routes ({routes.length})
        </button>
        <button
          onClick={() => setActiveTab('slots')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'slots'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon name="Clock" size={18} className="inline mr-2" />
          Time Slots ({slots.length})
        </button>
      </div>

      {/* Routes Tab */}
      {activeTab === 'routes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleCreateRoute} iconName="Plus">
              Add Safari Route
            </Button>
          </div>

          {/* Route Form */}
          {(isCreatingRoute || editingRoute) && (
            <div className="bg-muted rounded-lg border border-border p-6">
              <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                {isCreatingRoute ? 'Create New Safari Route' : 'Edit Safari Route'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Route Name"
                  value={routeFormData.name}
                  onChange={(e) => setRouteFormData({ ...routeFormData, name: e.target.value })}
                  placeholder="Reception-Mandradiyar Road-Reception"
                />
                <Input
                  label="Short Name"
                  value={routeFormData.short_name}
                  onChange={(e) => setRouteFormData({ ...routeFormData, short_name: e.target.value })}
                  placeholder="Route 1 - Mandradiyar"
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Safari Type</label>
                  <select
                    value={routeFormData.safari_type}
                    onChange={(e) => setRouteFormData({ ...routeFormData, safari_type: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="1hr">1 Hour Safari</option>
                    <option value="2hr">2 Hour Safari (20km)</option>
                  </select>
                </div>
                <Input
                  label="Distance (km)"
                  type="number"
                  step="0.1"
                  value={routeFormData.distance_km}
                  onChange={(e) => setRouteFormData({ ...routeFormData, distance_km: e.target.value })}
                  placeholder="20.5"
                />
                <Input
                  label="Duration (hours)"
                  type="number"
                  value={routeFormData.duration_hours}
                  onChange={(e) => setRouteFormData({ ...routeFormData, duration_hours: e.target.value })}
                  placeholder="2"
                />
                <Input
                  label="Price per Person (₹)"
                  type="number"
                  value={routeFormData.price_per_person}
                  onChange={(e) => setRouteFormData({ ...routeFormData, price_per_person: e.target.value })}
                  placeholder="800"
                />
                <Input
                  label="Max Capacity"
                  type="number"
                  value={routeFormData.max_capacity}
                  onChange={(e) => setRouteFormData({ ...routeFormData, max_capacity: e.target.value })}
                  placeholder="6"
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Route Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={routeFormData.route_color}
                      onChange={(e) => setRouteFormData({ ...routeFormData, route_color: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={routeFormData.route_color}
                      onChange={(e) => setRouteFormData({ ...routeFormData, route_color: e.target.value })}
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                      placeholder="#FFFF00"
                    />
                  </div>
                </div>
                <Input
                  label="Display Order"
                  type="number"
                  value={routeFormData.display_order}
                  onChange={(e) => setRouteFormData({ ...routeFormData, display_order: e.target.value })}
                  placeholder="1"
                />
                <div className="md:col-span-3">
                  <Input
                    label="Description"
                    value={routeFormData.description}
                    onChange={(e) => setRouteFormData({ ...routeFormData, description: e.target.value })}
                    placeholder="Route description..."
                  />
                </div>
                <div className="md:col-span-3">
                  <Input
                    label="Highlights (comma-separated)"
                    value={routeFormData.highlights}
                    onChange={(e) => setRouteFormData({ ...routeFormData, highlights: e.target.value })}
                    placeholder="Dense forest cover, Wildlife corridors, Bird watching spots"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Coordinates (JSON array from KML)
                  </label>
                  <textarea
                    value={routeFormData.coordinates}
                    onChange={(e) => setRouteFormData({ ...routeFormData, coordinates: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm font-mono h-24"
                    placeholder='[[76.6228,11.5627],[76.6222,11.5633],...]'
                  />
                </div>
                <div className="md:col-span-3">
                  <ImageUpload
                    images={routeFormData.images || []}
                    onImagesChange={(images) => setRouteFormData({ ...routeFormData, images })}
                    folder="safaris"
                    maxImages={10}
                    label="Route Images"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="route_is_active"
                    checked={routeFormData.is_active}
                    onChange={(e) => setRouteFormData({ ...routeFormData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="route_is_active" className="text-sm text-foreground">Active</label>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={handleSaveRoute} iconName="Check">
                  {isCreatingRoute ? 'Create Route' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={handleCancelRoute} iconName="X">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Routes List */}
          <div className="grid gap-4">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-muted rounded-lg border border-border p-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-4 h-full min-h-[80px] rounded"
                    style={{ backgroundColor: route.route_color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-foreground">{route.short_name || route.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        route.safari_type === '2hr' 
                          ? 'bg-warning/20 text-warning' 
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {route.safari_type === '2hr' ? '2 Hour Safari' : '1 Hour Safari'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        route.is_active ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                      }`}>
                        {route.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{route.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span><Icon name="Route" size={14} className="inline mr-1" />{route.distance_km} km</span>
                      <span><Icon name="Clock" size={14} className="inline mr-1" />{route.duration_hours} hour(s)</span>
                      <span><Icon name="IndianRupee" size={14} className="inline mr-1" />₹{route.price_per_person}/person</span>
                      <span><Icon name="Users" size={14} className="inline mr-1" />Max {route.max_capacity}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" iconName="Edit" onClick={() => handleEditRoute(route)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" iconName="Trash2" onClick={() => handleDeleteRoute(route.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slots Tab */}
      {activeTab === 'slots' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={handleCreateSlot} iconName="Plus">
              Add Time Slot
            </Button>
          </div>

          {/* Slot Form */}
          {(isCreatingSlot || editingSlot) && (
            <div className="bg-muted rounded-lg border border-border p-6">
              <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                {isCreatingSlot ? 'Create New Time Slot' : 'Edit Time Slot'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Slot Time"
                  value={slotFormData.slot_time}
                  onChange={(e) => setSlotFormData({ ...slotFormData, slot_time: e.target.value })}
                  placeholder="06:30 AM"
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Period</label>
                  <select
                    value={slotFormData.slot_period}
                    onChange={(e) => setSlotFormData({ ...slotFormData, slot_period: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                  </select>
                </div>
                <Input
                  label="Display Order"
                  type="number"
                  value={slotFormData.display_order}
                  onChange={(e) => setSlotFormData({ ...slotFormData, display_order: e.target.value })}
                  placeholder="1"
                />
                <div className="flex items-end gap-2">
                  <input
                    type="checkbox"
                    id="slot_is_active"
                    checked={slotFormData.is_active}
                    onChange={(e) => setSlotFormData({ ...slotFormData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="slot_is_active" className="text-sm text-foreground">Active</label>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={handleSaveSlot} iconName="Check">
                  {isCreatingSlot ? 'Create Slot' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={handleCancelSlot} iconName="X">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Slots by Period */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Morning Slots */}
            <div className="bg-muted rounded-lg border border-border p-4">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Sun" size={20} className="text-warning" />
                Morning Slots
              </h4>
              <div className="space-y-2">
                {slots.filter(s => s.slot_period === 'Morning').map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon name="Clock" size={16} className="text-primary" />
                      <span className="font-medium text-foreground">{slot.slot_time}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        slot.is_active ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                      }`}>
                        {slot.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSlot(slot)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Icon name="Edit" size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Afternoon Slots */}
            <div className="bg-muted rounded-lg border border-border p-4">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon name="Sunset" size={20} className="text-accent" />
                Afternoon Slots
              </h4>
              <div className="space-y-2">
                {slots.filter(s => s.slot_period === 'Afternoon').map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon name="Clock" size={16} className="text-primary" />
                      <span className="font-medium text-foreground">{slot.slot_time}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        slot.is_active ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                      }`}>
                        {slot.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSlot(slot)}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Icon name="Edit" size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafariRouteManagement;
