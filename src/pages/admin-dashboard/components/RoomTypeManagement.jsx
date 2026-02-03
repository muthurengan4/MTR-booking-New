import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';

const RoomTypeManagement = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    max_capacity: '',
    amenities: '',
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase?.from('room_types')?.select('*')?.order('created_at', { ascending: false });

      if (error) throw error;
      setRoomTypes(data || []);
    } catch (error) {
      console.error('Error fetching room types:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      name: '',
      description: '',
      base_price: '',
      max_capacity: '',
      amenities: '',
      image_url: '',
      is_active: true
    });
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type?.name || '',
      description: type?.description || '',
      base_price: type?.base_price || '',
      max_capacity: type?.max_capacity || '',
      amenities: type?.amenities?.join(', ') || '',
      image_url: type?.image_url || '',
      is_active: type?.is_active ?? true
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingType(null);
    setFormData({
      name: '',
      description: '',
      base_price: '',
      max_capacity: '',
      amenities: '',
      image_url: '',
      is_active: true
    });
  };

  const handleSave = async () => {
    try {
      const amenitiesArray = formData?.amenities
        ?.split(',')
        ?.map(a => a?.trim())
        ?.filter(a => a?.length > 0) || [];

      const payload = {
        name: formData?.name,
        description: formData?.description,
        base_price: parseFloat(formData?.base_price),
        max_capacity: parseInt(formData?.max_capacity),
        amenities: amenitiesArray,
        image_url: formData?.image_url,
        is_active: formData?.is_active
      };

      if (isCreating) {
        const { error } = await supabase?.from('room_types')?.insert([payload]);

        if (error) throw error;
      } else if (editingType) {
        const { error } = await supabase?.from('room_types')?.update(payload)?.eq('id', editingType?.id);

        if (error) throw error;
      }

      await fetchRoomTypes();
      handleCancel();
    } catch (error) {
      console.error('Error saving room type:', error?.message);
      alert('Failed to save room type: ' + error?.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this room type?')) return;

    try {
      const { error } = await supabase?.from('room_types')?.delete()?.eq('id', id);

      if (error) throw error;
      await fetchRoomTypes();
    } catch (error) {
      console.error('Error deleting room type:', error?.message);
      alert('Failed to delete room type: ' + error?.message);
    }
  };

  const handleToggleActive = async (type) => {
    try {
      const { error } = await supabase?.from('room_types')?.update({ is_active: !type?.is_active })?.eq('id', type?.id);

      if (error) throw error;
      await fetchRoomTypes();
    } catch (error) {
      console.error('Error toggling room type status:', error?.message);
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
          <h2 className="font-heading text-2xl font-semibold text-foreground">Room Type Management</h2>
          <p className="text-muted-foreground">Add, edit, and manage room types</p>
        </div>
        <Button onClick={handleCreate} iconName="Plus">
          Add Room Type
        </Button>
      </div>

      {(isCreating || editingType) && (
        <div className="bg-muted rounded-lg border border-border p-6">
          <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
            {isCreating ? 'Create New Room Type' : 'Edit Room Type'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Room Type Name"
              value={formData?.name}
              onChange={(e) => setFormData({ ...formData, name: e?.target?.value })}
              placeholder="e.g., Deluxe Room"
            />
            <Input
              label="Base Price (₹)"
              type="number"
              value={formData?.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: e?.target?.value })}
              placeholder="3500"
            />
            <Input
              label="Max Capacity"
              type="number"
              value={formData?.max_capacity}
              onChange={(e) => setFormData({ ...formData, max_capacity: e?.target?.value })}
              placeholder="2"
            />
            <Input
              label="Image URL"
              value={formData?.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e?.target?.value })}
              placeholder="https://example.com/image.jpg"
            />
            <div className="md:col-span-2">
              <Input
                label="Description"
                value={formData?.description}
                onChange={(e) => setFormData({ ...formData, description: e?.target?.value })}
                placeholder="Spacious room with modern amenities"
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Amenities (comma-separated)"
                value={formData?.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e?.target?.value })}
                placeholder="WiFi, AC, TV, Mini Bar"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData?.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e?.target?.checked })}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
              />
              <label htmlFor="is_active" className="text-sm text-foreground">
                Active
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button onClick={handleSave} iconName="Check">
              {isCreating ? 'Create' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={handleCancel} iconName="X">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {roomTypes?.map((type) => (
          <div
            key={type?.id}
            className="bg-muted rounded-lg border border-border p-4 transition-organic hover:shadow-md"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {type?.image_url && (
                <img
                  src={type?.image_url}
                  alt={type?.name}
                  className="w-full md:w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-foreground text-lg">{type?.name}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      type?.is_active
                        ? 'bg-success/10 text-success' :'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {type?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{type?.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Icon name="IndianRupee" size={16} />
                    <span>₹{type?.base_price?.toLocaleString()}/night</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Users" size={16} />
                    <span>Max {type?.max_capacity} guests</span>
                  </div>
                </div>
                {type?.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {type?.amenities?.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex md:flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Edit"
                  onClick={() => handleEdit(type)}
                >
                  Edit
                </Button>
                <Button
                  variant={type?.is_active ? 'destructive' : 'success'}
                  size="sm"
                  iconName={type?.is_active ? 'EyeOff' : 'Eye'}
                  onClick={() => handleToggleActive(type)}
                >
                  {type?.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  iconName="Trash2"
                  onClick={() => handleDelete(type?.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {roomTypes?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Home" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No room types found</p>
          <Button onClick={handleCreate} iconName="Plus">
            Add Your First Room Type
          </Button>
        </div>
      )}
    </div>
  );
};

export default RoomTypeManagement;