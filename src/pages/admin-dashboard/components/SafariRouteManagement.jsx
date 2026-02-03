import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const SafariRouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRoute, setEditingRoute] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [waypoints, setWaypoints] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    route_type: 'jeep',
    icon: 'Truck',
    color: '#2D5016',
    duration: '',
    difficulty: 'Easy',
    distance: '',
    description: '',
    highlights: '',
    best_time: '',
    max_capacity: 6,
    terrain: '',
    is_active: true
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase?.from('safari_routes')?.select('*')?.order('created_at', { ascending: false });

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWaypoints = async (routeId) => {
    try {
      const { data, error } = await supabase?.from('safari_waypoints')?.select('*')?.eq('route_id', routeId)?.order('sequence_order', { ascending: true });

      if (error) throw error;
      setWaypoints(data || []);
    } catch (error) {
      console.error('Error fetching waypoints:', error);
    }
  };

  const handleEdit = async (route) => {
    setEditingRoute(route);
    setFormData({
      name: route?.name || '',
      route_type: route?.route_type || 'jeep',
      icon: route?.icon || 'Truck',
      color: route?.color || '#2D5016',
      duration: route?.duration || '',
      difficulty: route?.difficulty || 'Easy',
      distance: route?.distance || '',
      description: route?.description || '',
      highlights: route?.highlights?.join(', ') || '',
      best_time: route?.best_time || '',
      max_capacity: route?.max_capacity || 6,
      terrain: route?.terrain || '',
      is_active: route?.is_active ?? true
    });
    await fetchWaypoints(route?.id);
    setShowForm(true);
  };

  const handleDelete = async (routeId) => {
    if (!confirm('Are you sure you want to delete this route?')) return;

    try {
      const { error } = await supabase?.from('safari_routes')?.delete()?.eq('id', routeId);

      if (error) throw error;
      await fetchRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
      alert('Failed to delete route');
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    try {
      const routeData = {
        name: formData?.name,
        route_type: formData?.route_type,
        icon: formData?.icon,
        color: formData?.color,
        duration: formData?.duration,
        difficulty: formData?.difficulty,
        distance: formData?.distance,
        description: formData?.description,
        highlights: formData?.highlights?.split(',')?.map(h => h?.trim())?.filter(Boolean),
        best_time: formData?.best_time,
        max_capacity: parseInt(formData?.max_capacity),
        terrain: formData?.terrain,
        is_active: formData?.is_active
      };

      if (editingRoute) {
        const { error } = await supabase?.from('safari_routes')?.update(routeData)?.eq('id', editingRoute?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase?.from('safari_routes')?.insert([routeData]);

        if (error) throw error;
      }

      await fetchRoutes();
      handleCancel();
    } catch (error) {
      console.error('Error saving route:', error);
      alert('Failed to save route');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRoute(null);
    setWaypoints([]);
    setFormData({
      name: '',
      route_type: 'jeep',
      icon: 'Truck',
      color: '#2D5016',
      duration: '',
      difficulty: 'Easy',
      distance: '',
      description: '',
      highlights: '',
      best_time: '',
      max_capacity: 6,
      terrain: '',
      is_active: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={32} className="animate-spin" color="var(--color-primary)" />
      </div>
    );
  }

  if (showForm) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl font-bold">
            {editingRoute ? 'Edit Safari Route' : 'Add New Safari Route'}
          </h2>
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Icon name="X" size={20} />
            <span>Cancel</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Route Name</label>
              <input
                type="text"
                value={formData?.name}
                onChange={(e) => setFormData({ ...formData, name: e?.target?.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Route Type</label>
              <select
                value={formData?.route_type}
                onChange={(e) => setFormData({ ...formData, route_type: e?.target?.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="jeep">Jeep Safari</option>
                <option value="bus">Bus Safari</option>
                <option value="elephant">Elephant Camp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Icon Name</label>
              <input
                type="text"
                value={formData?.icon}
                onChange={(e) => setFormData({ ...formData, icon: e?.target?.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Truck, Bus, Mountain"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <input
                type="color"
                value={formData?.color}
                onChange={(e) => setFormData({ ...formData, color: e?.target?.value })}
                className="w-full h-10 border border-border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <input
                type="text"
                value={formData?.duration}
                onChange={(e) => setFormData({ ...formData, duration: e?.target?.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., 3-4 hours"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={formData?.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e?.target?.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Difficult">Difficult</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Distance</label>
              <input
                type="text"
                value={formData?.distance}
                onChange={(e) => setFormData({ ...formData, distance: e?.target?.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., 25 km"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Capacity</label>
              <input
                type="number"
                value={formData?.max_capacity}
                onChange={(e) => setFormData({ ...formData, max_capacity: e?.target?.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData?.description}
              onChange={(e) => setFormData({ ...formData, description: e?.target?.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Highlights (comma-separated)</label>
            <input
              type="text"
              value={formData?.highlights}
              onChange={(e) => setFormData({ ...formData, highlights: e?.target?.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Tiger sightings, Elephant herds, Bird watching"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Best Time</label>
            <input
              type="text"
              value={formData?.best_time}
              onChange={(e) => setFormData({ ...formData, best_time: e?.target?.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Early morning (6:00 AM)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Terrain</label>
            <input
              type="text"
              value={formData?.terrain}
              onChange={(e) => setFormData({ ...formData, terrain: e?.target?.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Mixed terrain with forest trails"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData?.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e?.target?.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_active" className="text-sm font-medium">Active</label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Icon name="Save" size={20} />
              <span>Save Route</span>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
        {editingRoute && waypoints?.length > 0 && (
          <div className="mt-8">
            <h3 className="font-heading text-xl font-bold mb-4">Waypoints</h3>
            <div className="space-y-2">
              {waypoints?.map((waypoint) => (
                <div key={waypoint?.id} className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{waypoint?.name}</p>
                      <p className="text-sm text-muted-foreground">{waypoint?.time} • Elevation: {waypoint?.elevation}m</p>
                      <p className="text-sm mt-1">{waypoint?.description}</p>
                    </div>
                    <span className="text-sm font-semibold bg-background px-3 py-1 rounded-full">#{waypoint?.sequence_order}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold">Safari Route Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Icon name="Plus" size={20} />
          <span>Add Route</span>
        </button>
      </div>

      <div className="space-y-4">
        {routes?.map((route) => (
          <div key={route?.id} className="bg-muted p-6 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${route?.color}20` }}>
                  <Icon name={route?.icon} size={24} color={route?.color} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading text-xl font-bold">{route?.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      route?.is_active ? 'bg-success/20 text-success' : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}>
                      {route?.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-3">{route?.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-semibold">{route?.duration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Distance</p>
                      <p className="font-semibold">{route?.distance}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Difficulty</p>
                      <p className="font-semibold">{route?.difficulty}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Capacity</p>
                      <p className="font-semibold">{route?.max_capacity} people</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(route)}
                  className="p-2 bg-background rounded-lg hover:bg-background/80 transition-colors"
                  aria-label="Edit route"
                >
                  <Icon name="Edit" size={20} />
                </button>
                <button
                  onClick={() => handleDelete(route?.id)}
                  className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                  aria-label="Delete route"
                >
                  <Icon name="Trash2" size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {routes?.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Map" size={48} className="mx-auto mb-4" color="var(--color-muted-foreground)" />
            <p className="text-muted-foreground">No safari routes found. Add your first route to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafariRouteManagement;