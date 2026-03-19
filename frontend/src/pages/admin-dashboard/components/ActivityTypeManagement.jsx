import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import ImageUpload from '../../../components/ImageUpload';
import { activityTypesAPI } from '../../../lib/api';

const ActivityTypeManagement = () => {
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    base_price: '',
    max_capacity: '',
    location: '',
    image_url: '',
    images: [],
    is_active: true
  });

  useEffect(() => {
    fetchActivityTypes();
  }, []);

  const fetchActivityTypes = async () => {
    try {
      setLoading(true);
      const data = await activityTypesAPI.getAll();
      setActivityTypes(data || []);
    } catch (error) {
      console.error('Error fetching activity types:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      name: '',
      description: '',
      duration: '',
      base_price: '',
      max_capacity: '',
      location: '',
      image_url: '',
      images: [],
      is_active: true
    });
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type?.name || '',
      description: type?.description || '',
      duration: type?.duration || '',
      base_price: type?.base_price || '',
      max_capacity: type?.max_capacity || '',
      location: type?.location || '',
      image_url: type?.image_url || '',
      images: type?.images || [],
      is_active: type?.is_active ?? true
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingType(null);
    setFormData({
      name: '',
      description: '',
      duration: '',
      base_price: '',
      max_capacity: '',
      location: '',
      image_url: '',
      images: [],
      is_active: true
    });
  };

  const handleSave = async () => {
    try {
      // Use first uploaded image as main image_url if available
      const mainImageUrl = formData?.images?.length > 0 
        ? formData.images[0] 
        : formData?.image_url;

      const payload = {
        name: formData?.name,
        description: formData?.description,
        duration: formData?.duration,
        base_price: parseFloat(formData?.base_price),
        max_capacity: parseInt(formData?.max_capacity),
        location: formData?.location,
        image_url: mainImageUrl,
        images: formData?.images || [],
        is_active: formData?.is_active
      };

      if (isCreating) {
        await activityTypesAPI.create(payload);
      } else if (editingType) {
        await activityTypesAPI.update(editingType?.id, payload);
      }

      await fetchActivityTypes();
      handleCancel();
    } catch (error) {
      console.error('Error saving activity type:', error?.message);
      alert('Failed to save activity type: ' + (error?.response?.data?.detail || error?.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this activity type?')) return;

    try {
      await activityTypesAPI.delete(id);
      await fetchActivityTypes();
    } catch (error) {
      console.error('Error deleting activity type:', error?.message);
      alert('Failed to delete activity type: ' + (error?.response?.data?.detail || error?.message));
    }
  };

  const handleToggleActive = async (type) => {
    try {
      await activityTypesAPI.update(type?.id, {
        ...type,
        is_active: !type?.is_active
      });
      await fetchActivityTypes();
    } catch (error) {
      console.error('Error toggling activity type status:', error?.message);
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
          <h2 className="font-heading text-2xl font-semibold text-foreground">Safari & Activity Management</h2>
          <p className="text-muted-foreground">Add, edit, and manage safari and activity types</p>
        </div>
        <Button onClick={handleCreate} iconName="Plus" data-testid="add-activity-type-btn">
          Add Safari/Activity
        </Button>
      </div>

      {(isCreating || editingType) && (
        <div className="bg-muted rounded-lg border border-border p-6">
          <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
            {isCreating ? 'Create New Safari/Activity' : 'Edit Safari/Activity'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Activity Name"
              value={formData?.name}
              onChange={(e) => setFormData({ ...formData, name: e?.target?.value })}
              placeholder="e.g., Jeep Safari"
            />
            <Input
              label="Duration"
              value={formData?.duration}
              onChange={(e) => setFormData({ ...formData, duration: e?.target?.value })}
              placeholder="e.g., 3 hours"
            />
            <Input
              label="Base Price (₹)"
              type="number"
              value={formData?.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: e?.target?.value })}
              placeholder="1800"
            />
            <Input
              label="Max Capacity"
              type="number"
              value={formData?.max_capacity}
              onChange={(e) => setFormData({ ...formData, max_capacity: e?.target?.value })}
              placeholder="6"
            />
            <Input
              label="Location"
              value={formData?.location}
              onChange={(e) => setFormData({ ...formData, location: e?.target?.value })}
              placeholder="e.g., Mudumalai Core Zone"
            />
            <div className="md:col-span-2">
              <Input
                label="Description"
                value={formData?.description}
                onChange={(e) => setFormData({ ...formData, description: e?.target?.value })}
                placeholder="Thrilling wildlife safari experience"
              />
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                images={formData?.images || []}
                onImagesChange={(images) => setFormData({ ...formData, images })}
                folder="safaris"
                maxImages={10}
                label="Safari/Activity Images (Gallery)"
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Or enter Image URL manually"
                value={formData?.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e?.target?.value })}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Note: Uploaded images above will override this URL
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_activity"
                checked={formData?.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e?.target?.checked })}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
              />
              <label htmlFor="is_active_activity" className="text-sm text-foreground">
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
        {activityTypes?.map((type) => (
          <div
            key={type?.id}
            className="bg-muted rounded-lg border border-border p-4 transition-organic hover:shadow-md"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Image Gallery Preview */}
              <div className="flex gap-2 w-full md:w-auto">
                {type?.image_url && (
                  <img
                    src={type?.image_url}
                    alt={type?.name}
                    className="w-full md:w-32 h-32 object-cover rounded-lg"
                  />
                )}
                {type?.images?.length > 1 && (
                  <div className="hidden md:flex flex-col gap-1">
                    {type.images.slice(1, 4).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${type?.name} ${idx + 2}`}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ))}
                    {type.images.length > 4 && (
                      <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center text-xs text-primary">
                        +{type.images.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                    <Icon name="Clock" size={16} />
                    <span>{type?.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="IndianRupee" size={16} />
                    <span>₹{type?.base_price?.toLocaleString()}/person</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Users" size={16} />
                    <span>Max {type?.max_capacity} people</span>
                  </div>
                  {type?.location && (
                    <div className="flex items-center gap-1">
                      <Icon name="MapPin" size={16} />
                      <span>{type?.location}</span>
                    </div>
                  )}
                  {type?.images?.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Icon name="Image" size={16} />
                      <span>{type.images.length} photos</span>
                    </div>
                  )}
                </div>
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

      {activityTypes?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Compass" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No safaris or activities found</p>
          <Button onClick={handleCreate} iconName="Plus">
            Add Your First Safari/Activity
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActivityTypeManagement;
