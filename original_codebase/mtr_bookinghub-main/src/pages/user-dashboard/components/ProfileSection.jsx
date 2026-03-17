import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ProfileSection = ({ userData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: userData?.fullName,
    email: userData?.email,
    phone: userData?.phone,
    emergencyContact: userData?.emergencyContact || '',
    emergencyPhone: userData?.emergencyPhone || '',
    address: userData?.address || '',
    city: userData?.city || '',
    state: userData?.state || '',
    pincode: userData?.pincode || ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.fullName?.trim()) newErrors.fullName = 'Full name is required';
    if (!formData?.email?.trim()) newErrors.email = 'Email is required';
    if (!formData?.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (formData?.phone && !/^[6-9]\d{9}$/?.test(formData?.phone)) {
      newErrors.phone = 'Invalid Indian mobile number';
    }
    if (formData?.emergencyPhone && !/^[6-9]\d{9}$/?.test(formData?.emergencyPhone)) {
      newErrors.emergencyPhone = 'Invalid Indian mobile number';
    }
    if (formData?.pincode && !/^\d{6}$/?.test(formData?.pincode)) {
      newErrors.pincode = 'Invalid pincode';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fullName: userData?.fullName,
      email: userData?.email,
      phone: userData?.phone,
      emergencyContact: userData?.emergencyContact || '',
      emergencyPhone: userData?.emergencyPhone || '',
      address: userData?.address || '',
      city: userData?.city || '',
      state: userData?.state || '',
      pincode: userData?.pincode || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
          Profile Information
        </h2>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            iconName="Edit"
            iconPosition="left"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              value={formData?.fullName}
              onChange={handleChange}
              error={errors?.fullName}
              disabled={!isEditing}
              required
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData?.email}
              onChange={handleChange}
              error={errors?.email}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData?.phone}
              onChange={handleChange}
              error={errors?.phone}
              disabled={!isEditing}
              placeholder="10-digit mobile number"
              required
            />
            <Input
              label="User ID"
              type="text"
              value={userData?.userId}
              disabled
              description="Auto-generated user identifier"
            />
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="Phone" size={20} strokeWidth={2} color="var(--color-primary)" />
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Emergency Contact Name"
                type="text"
                name="emergencyContact"
                value={formData?.emergencyContact}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Contact person name"
              />
              <Input
                label="Emergency Phone Number"
                type="tel"
                name="emergencyPhone"
                value={formData?.emergencyPhone}
                onChange={handleChange}
                error={errors?.emergencyPhone}
                disabled={!isEditing}
                placeholder="10-digit mobile number"
              />
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="MapPin" size={20} strokeWidth={2} color="var(--color-primary)" />
              Address Details
            </h3>
            <div className="space-y-4">
              <Input
                label="Address"
                type="text"
                name="address"
                value={formData?.address}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Street address"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="City"
                  type="text"
                  name="city"
                  value={formData?.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <Input
                  label="State"
                  type="text"
                  name="state"
                  value={formData?.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <Input
                  label="Pincode"
                  type="text"
                  name="pincode"
                  value={formData?.pincode}
                  onChange={handleChange}
                  error={errors?.pincode}
                  disabled={!isEditing}
                  placeholder="6-digit pincode"
                />
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex flex-col md:flex-row gap-3 mt-6 pt-6 border-t border-border">
            <Button
              type="submit"
              variant="default"
              iconName="Save"
              iconPosition="left"
              className="md:flex-1"
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="md:flex-1"
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileSection;