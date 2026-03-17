import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const PreferencesSection = ({ preferences, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    favoriteLocations: preferences?.favoriteLocations || [],
    activityInterests: preferences?.activityInterests || [],
    dietaryRequirements: preferences?.dietaryRequirements || [],
    emailNotifications: preferences?.emailNotifications ?? true,
    smsNotifications: preferences?.smsNotifications ?? true,
    promotionalEmails: preferences?.promotionalEmails ?? false,
    bookingReminders: preferences?.bookingReminders ?? true,
    preferredLanguage: preferences?.preferredLanguage || 'english'
  });

  const locationOptions = [
    { value: 'masinagudi', label: 'Masinagudi' },
    { value: 'thepakadu', label: 'Thepakadu' },
    { value: 'gudalur', label: 'Gudalur' }
  ];

  const activityOptions = [
    { value: 'jeep-safari', label: 'Jeep Safari' },
    { value: 'bus-safari', label: 'Bus Safari' },
    { value: 'elephant-camp', label: 'Elephant Camp Visit' },
    { value: 'bird-watching', label: 'Bird Watching' },
    { value: 'nature-walks', label: 'Nature Walks' }
  ];

  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'non-vegetarian', label: 'Non-Vegetarian' },
    { value: 'jain', label: 'Jain' },
    { value: 'gluten-free', label: 'Gluten-Free' }
  ];

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'kannada', label: 'Kannada' }
  ];

  const handleCheckboxChange = (field, checked) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const handleMultiSelectChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      favoriteLocations: preferences?.favoriteLocations || [],
      activityInterests: preferences?.activityInterests || [],
      dietaryRequirements: preferences?.dietaryRequirements || [],
      emailNotifications: preferences?.emailNotifications ?? true,
      smsNotifications: preferences?.smsNotifications ?? true,
      promotionalEmails: preferences?.promotionalEmails ?? false,
      bookingReminders: preferences?.bookingReminders ?? true,
      preferredLanguage: preferences?.preferredLanguage || 'english'
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
          Preferences & Settings
        </h2>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            iconName="Settings"
            iconPosition="left"
            onClick={() => setIsEditing(true)}
          >
            Edit Preferences
          </Button>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="MapPin" size={20} strokeWidth={2} color="var(--color-primary)" />
              Favorite Locations
            </h3>
            <Select
              label="Select your preferred locations"
              description="Choose locations for faster booking"
              options={locationOptions}
              value={formData?.favoriteLocations}
              onChange={(value) => handleMultiSelectChange('favoriteLocations', value)}
              multiple
              searchable
              disabled={!isEditing}
            />
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="Compass" size={20} strokeWidth={2} color="var(--color-primary)" />
              Activity Interests
            </h3>
            <Select
              label="Select activities you're interested in"
              description="Get personalized recommendations"
              options={activityOptions}
              value={formData?.activityInterests}
              onChange={(value) => handleMultiSelectChange('activityInterests', value)}
              multiple
              searchable
              disabled={!isEditing}
            />
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="Utensils" size={20} strokeWidth={2} color="var(--color-primary)" />
              Dietary Requirements
            </h3>
            <Select
              label="Select your dietary preferences"
              description="Help us serve you better"
              options={dietaryOptions}
              value={formData?.dietaryRequirements}
              onChange={(value) => handleMultiSelectChange('dietaryRequirements', value)}
              multiple
              disabled={!isEditing}
            />
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="Bell" size={20} strokeWidth={2} color="var(--color-primary)" />
              Notification Preferences
            </h3>
            <div className="space-y-3">
              <Checkbox
                label="Email Notifications"
                description="Receive booking confirmations and updates via email"
                checked={formData?.emailNotifications}
                onChange={(e) => handleCheckboxChange('emailNotifications', e?.target?.checked)}
                disabled={!isEditing}
              />
              <Checkbox
                label="SMS Notifications"
                description="Get instant booking alerts and reminders via SMS"
                checked={formData?.smsNotifications}
                onChange={(e) => handleCheckboxChange('smsNotifications', e?.target?.checked)}
                disabled={!isEditing}
              />
              <Checkbox
                label="Promotional Emails"
                description="Receive special offers and seasonal discounts"
                checked={formData?.promotionalEmails}
                onChange={(e) => handleCheckboxChange('promotionalEmails', e?.target?.checked)}
                disabled={!isEditing}
              />
              <Checkbox
                label="Booking Reminders"
                description="Get reminders before your scheduled activities"
                checked={formData?.bookingReminders}
                onChange={(e) => handleCheckboxChange('bookingReminders', e?.target?.checked)}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="Languages" size={20} strokeWidth={2} color="var(--color-primary)" />
              Language Preference
            </h3>
            <Select
              label="Preferred Language"
              description="Choose your preferred language for communications"
              options={languageOptions}
              value={formData?.preferredLanguage}
              onChange={(value) => setFormData(prev => ({ ...prev, preferredLanguage: value }))}
              disabled={!isEditing}
            />
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
              Save Preferences
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

export default PreferencesSection;