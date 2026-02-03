import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const WildlifeZoneManagement = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingZone, setEditingZone] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    coordinate_x: 50,
    coordinate_y: 50,
    species: '',
    probability: 'Medium',
    season: '',
    best_time: '',
    description: '',
    safety_tips: '',
    photo_tips: '',
    is_active: true
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase?.from('wildlife_zones')?.select('*')?.order('created_at', { ascending: false });

      if (error) throw error;
      setZones(data || []);
    } catch (error) {
      console.error('Error fetching zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone?.name || '',
      coordinate_x: zone?.coordinate_x || 50,
      coordinate_y: zone?.coordinate_y || 50,
      species: zone?.species?.join(', ') || '',
      probability: zone?.probability || 'Medium',
      season: zone?.season || '',
      best_time: zone?.best_time || '',
      description: zone?.description || '',
      safety_tips: zone?.safety_tips?.join(', ') || '',
      photo_tips: zone?.photo_tips?.join(', ') || '',
      is_active: zone?.is_active ?? true
    });
    setShowForm(true);
  };

  const handleDelete = async (zoneId) => {
    if (!confirm('Are you sure you want to delete this wildlife zone?')) return;

    try {
      const { error } = await supabase?.from('wildlife_zones')?.delete()?.eq('id', zoneId);

      if (error) throw error;
      await fetchZones();
    } catch (error) {
      console.error('Error deleting zone:', error);
      alert('Failed to delete zone');
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    try {
      const zoneData = {
        name: formData?.name,
        coordinate_x: parseFloat(formData?.coordinate_x),
        coordinate_y: parseFloat(formData?.coordinate_y),
        species: formData?.species?.split(',')?.map(s => s?.trim())?.filter(Boolean),
        probability: formData?.probability,
        season: formData?.season,
        best_time: formData?.best_time,
        description: formData?.description,
        safety_tips: formData?.safety_tips?.split(',')?.map(t => t?.trim())?.filter(Boolean),
        photo_tips: formData?.photo_tips?.split(',')?.map(t => t?.trim())?.filter(Boolean),
        is_active: formData?.is_active
      };

      if (editingZone) {
        const { error } = await supabase?.from('wildlife_zones')?.update(zoneData)?.eq('id', editingZone?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase?.from('wildlife_zones')?.insert([zoneData]);

        if (error) throw error;
      }

      await fetchZones();
      handleCancel();
    } catch (error) {
      console.error('Error saving zone:', error);
      alert('Failed to save zone');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingZone(null);
    setFormData({
      name: '',
      coordinate_x: 50,
      coordinate_y: 50,
      species: '',
      probability: 'Medium',
      season: '',
      best_time: '',
      description: '',
      safety_tips: '',
      photo_tips: '',
      is_active: true
    });
  };

  const getProbabilityColor = (probability) => {
    switch(probability) {
      case 'Very High': return 'bg-success/20 text-success';
      case 'High': return 'bg-warning/20 text-warning';
      case 'Medium': return 'bg-accent/20 text-accent';
      default: return 'bg-muted-foreground/20 text-muted-foreground';
    }
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
            {editingZone ? 'Edit Wildlife Zone' : 'Add New Wildlife Zone'}
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
              <label className="block text-sm font-medium mb-2">Zone Name</label>
              <input
                type="text"
                value={formData?.name}
                onChange={(e) => setFormData({ ...formData, name: e?.target?.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Probability</label>
              <select
                value={formData?.probability}
                onChange={(e) => setFormData({ ...formData, probability: e?.target?.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="Very High">Very High</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Map X Coordinate (%)</label>
              <input
                type="number"
                value={formData?.coordinate_x}
                onChange={(e) => setFormData({ ...formData, coordinate_x: e?.target?.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
                max="100"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Map Y Coordinate (%)</label>
              <input
                type="number"
                value={formData?.coordinate_y}
                onChange={(e) => setFormData({ ...formData, coordinate_y: e?.target?.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
                max="100"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Season</label>
              <input
                type="text"
                value={formData?.season}
                onChange={(e) => setFormData({ ...formData, season: e?.target?.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Year-round, Peak in dry season"
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
                placeholder="e.g., Early morning"
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
            <label className="block text-sm font-medium mb-2">Species (comma-separated)</label>
            <input
              type="text"
              value={formData?.species}
              onChange={(e) => setFormData({ ...formData, species: e?.target?.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Bengal Tiger, Wild Boar, Sambar Deer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Safety Tips (comma-separated)</label>
            <input
              type="text"
              value={formData?.safety_tips}
              onChange={(e) => setFormData({ ...formData, safety_tips: e?.target?.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Maintain silence, Stay in vehicle, No sudden movements"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Photography Tips (comma-separated)</label>
            <input
              type="text"
              value={formData?.photo_tips}
              onChange={(e) => setFormData({ ...formData, photo_tips: e?.target?.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Use telephoto lens, Fast shutter speed, Natural light preferred"
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
              <span>Save Zone</span>
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
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold">Wildlife Zone Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Icon name="Plus" size={20} />
          <span>Add Zone</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones?.map((zone) => (
          <div key={zone?.id} className="bg-muted p-6 rounded-xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading text-lg font-bold">{zone?.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getProbabilityColor(zone?.probability)}`}>
                    {zone?.probability}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{zone?.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(zone)}
                  className="p-2 bg-background rounded-lg hover:bg-background/80 transition-colors"
                  aria-label="Edit zone"
                >
                  <Icon name="Edit" size={18} />
                </button>
                <button
                  onClick={() => handleDelete(zone?.id)}
                  className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                  aria-label="Delete zone"
                >
                  <Icon name="Trash2" size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Icon name="MapPin" size={14} color="var(--color-primary)" />
                <span className="text-muted-foreground">Position: {zone?.coordinate_x}%, {zone?.coordinate_y}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={14} color="var(--color-primary)" />
                <span className="text-muted-foreground">{zone?.season}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={14} color="var(--color-primary)" />
                <span className="text-muted-foreground">{zone?.best_time}</span>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="Footprints" size={14} color="var(--color-primary)" className="mt-0.5" />
                <span className="text-muted-foreground">{zone?.species?.slice(0, 3)?.join(', ')}{zone?.species?.length > 3 && ` +${zone?.species?.length - 3} more`}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                zone?.is_active ? 'bg-success/20 text-success' : 'bg-muted-foreground/20 text-muted-foreground'
              }`}>
                {zone?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}

        {zones?.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <Icon name="Binoculars" size={48} className="mx-auto mb-4" color="var(--color-muted-foreground)" />
            <p className="text-muted-foreground">No wildlife zones found. Add your first zone to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WildlifeZoneManagement;