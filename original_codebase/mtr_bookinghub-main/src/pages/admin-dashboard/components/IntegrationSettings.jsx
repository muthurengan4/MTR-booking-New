import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';

const IntegrationSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase?.from('integration_settings')?.select('*')?.order('setting_key', { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: error?.message || 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (id, field, value) => {
    setSettings(prev =>
      prev?.map(setting =>
        setting?.id === id ? { ...setting, [field]: value } : setting
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      for (const setting of settings) {
        const { error } = await supabase?.from('integration_settings')?.update({
            setting_value: setting?.setting_value,
            is_enabled: setting?.is_enabled,
            updated_at: new Date()?.toISOString()
          })?.eq('id', setting?.id);

        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Integration settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: error?.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const groupedSettings = {
    email: settings?.filter(s => s?.setting_key?.startsWith('email_')),
    sms: settings?.filter(s => s?.setting_key?.startsWith('sms_'))
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message?.text && (
        <div
          className={`p-4 rounded-lg border ${
            message?.type === 'success' ?'bg-green-50 border-green-200 text-green-800' :'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon
              name={message?.type === 'success' ? 'CheckCircle' : 'AlertCircle'}
              size={20}
              strokeWidth={2}
            />
            <span className="font-medium">{message?.text}</span>
          </div>
        </div>
      )}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} color="#3b82f6" strokeWidth={2} />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">Integration Settings</h3>
            <p className="text-sm text-blue-800">
              Configure your email and SMS API keys here. Enable integrations when ready to send notifications to users.
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Mail" size={20} color="var(--color-primary)" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Email Integration</h3>
              <p className="text-sm text-muted-foreground">Configure email service for booking notifications</p>
            </div>
          </div>

          <div className="space-y-4">
            {groupedSettings?.email?.map((setting) => (
              <div key={setting?.id} className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  {setting?.description}
                </label>
                <div className="flex gap-3">
                  <Input
                    type={setting?.setting_key?.includes('key') ? 'password' : 'text'}
                    value={setting?.setting_value || ''}
                    onChange={(e) => handleSettingChange(setting?.id, 'setting_value', e?.target?.value)}
                    placeholder={`Enter ${setting?.description?.toLowerCase()}`}
                    className="flex-1"
                  />
                  <label className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
                    <input
                      type="checkbox"
                      checked={setting?.is_enabled || false}
                      onChange={(e) => handleSettingChange(setting?.id, 'is_enabled', e?.target?.checked)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-foreground">Enabled</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="MessageSquare" size={20} color="var(--color-primary)" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">SMS Integration</h3>
              <p className="text-sm text-muted-foreground">Configure SMS service for booking notifications</p>
            </div>
          </div>

          <div className="space-y-4">
            {groupedSettings?.sms?.map((setting) => (
              <div key={setting?.id} className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  {setting?.description}
                </label>
                <div className="flex gap-3">
                  <Input
                    type={setting?.setting_key?.includes('key') || setting?.setting_key?.includes('secret') ? 'password' : 'text'}
                    value={setting?.setting_value || ''}
                    onChange={(e) => handleSettingChange(setting?.id, 'setting_value', e?.target?.value)}
                    placeholder={`Enter ${setting?.description?.toLowerCase()}`}
                    className="flex-1"
                  />
                  <label className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
                    <input
                      type="checkbox"
                      checked={setting?.is_enabled || false}
                      onChange={(e) => handleSettingChange(setting?.id, 'is_enabled', e?.target?.checked)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-foreground">Enabled</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Icon name="Save" size={20} strokeWidth={2} />
              <span>Save Settings</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default IntegrationSettings;