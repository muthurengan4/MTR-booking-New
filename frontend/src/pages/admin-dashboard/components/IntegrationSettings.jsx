import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const IntegrationSettings = () => {
  const [settings, setSettings] = useState([
    { id: '1', setting_key: 'email_api_provider', setting_value: 'resend', is_enabled: false, description: 'Email service provider' },
    { id: '2', setting_key: 'email_api_key', setting_value: '', is_enabled: false, description: 'API key for email service' },
    { id: '3', setting_key: 'email_from_address', setting_value: '', is_enabled: false, description: 'Default sender email address' },
    { id: '4', setting_key: 'sms_api_provider', setting_value: 'twilio', is_enabled: false, description: 'SMS service provider' },
    { id: '5', setting_key: 'sms_api_key', setting_value: '', is_enabled: false, description: 'API key for SMS service' },
    { id: '6', setting_key: 'sms_from_number', setting_value: '', is_enabled: false, description: 'Default sender phone number' },
  ]);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEdit = (setting) => {
    setEditingKey(setting.setting_key);
    setEditValue(setting.setting_value || '');
  };

  const handleSave = async (settingKey) => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSettings(settings.map(s => 
        s.setting_key === settingKey 
          ? { ...s, setting_value: editValue }
          : s
      ));
      setEditingKey(null);
      setSaving(false);
    }, 500);
  };

  const handleToggle = async (settingKey) => {
    setSettings(settings.map(s => 
      s.setting_key === settingKey 
        ? { ...s, is_enabled: !s.is_enabled }
        : s
    ));
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const getSettingLabel = (key) => {
    const labels = {
      'email_api_provider': 'Email Provider',
      'email_api_key': 'Email API Key',
      'email_from_address': 'Email From Address',
      'sms_api_provider': 'SMS Provider',
      'sms_api_key': 'SMS API Key',
      'sms_from_number': 'SMS From Number'
    };
    return labels[key] || key;
  };

  const getSettingIcon = (key) => {
    if (key.includes('email')) return 'Mail';
    if (key.includes('sms')) return 'MessageSquare';
    return 'Settings';
  };

  return (
    <div className="space-y-6" data-testid="integration-settings">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">Integration Settings</h2>
          <p className="text-muted-foreground">Configure email and SMS API settings</p>
        </div>
      </div>

      <div className="grid gap-4">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className="bg-muted rounded-lg border border-border p-4 transition-organic hover:shadow-md"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={getSettingIcon(setting.setting_key)} size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-foreground">{getSettingLabel(setting.setting_key)}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        setting.is_enabled
                          ? 'bg-success/10 text-success'
                          : 'bg-muted-foreground/10 text-muted-foreground'
                      }`}
                    >
                      {setting.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                  
                  {editingKey === setting.setting_key ? (
                    <div className="mt-3 flex items-center gap-2">
                      <Input
                        type={setting.setting_key.includes('key') ? 'password' : 'text'}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder={`Enter ${getSettingLabel(setting.setting_key)}`}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSave(setting.setting_key)}
                        disabled={saving}
                        iconName={saving ? 'Loader' : 'Check'}
                      >
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel} iconName="X">
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground mt-1">
                      {setting.setting_key.includes('key') && setting.setting_value
                        ? '••••••••'
                        : setting.setting_value || <span className="text-muted-foreground italic">Not configured</span>}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Edit"
                  onClick={() => handleEdit(setting)}
                >
                  Edit
                </Button>
                <Button
                  variant={setting.is_enabled ? 'destructive' : 'success'}
                  size="sm"
                  iconName={setting.is_enabled ? 'ToggleRight' : 'ToggleLeft'}
                  onClick={() => handleToggle(setting.setting_key)}
                >
                  {setting.is_enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Integration Guide</p>
            <p>To enable email/SMS notifications, configure the API keys from your provider:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>For email: Get API key from Resend, SendGrid, or your email provider</li>
              <li>For SMS: Get Account SID and Auth Token from Twilio or your SMS provider</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettings;
