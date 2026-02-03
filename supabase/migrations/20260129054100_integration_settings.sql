-- Integration Settings Table for Email and SMS API Configuration
-- Allows admin to configure API keys later without immediate integration

-- Create integration settings table
CREATE TABLE IF NOT EXISTS public.integration_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT,
    is_enabled BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_integration_settings_key ON public.integration_settings(setting_key);

-- Enable RLS
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only authenticated users can read settings
DROP POLICY IF EXISTS "authenticated_read_integration_settings" ON public.integration_settings;
CREATE POLICY "authenticated_read_integration_settings"
ON public.integration_settings
FOR SELECT
TO authenticated
USING (true);

-- RLS Policy: Only authenticated users can manage settings
DROP POLICY IF EXISTS "authenticated_manage_integration_settings" ON public.integration_settings;
CREATE POLICY "authenticated_manage_integration_settings"
ON public.integration_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert default integration settings
DO $$
BEGIN
    INSERT INTO public.integration_settings (setting_key, setting_value, is_enabled, description)
    VALUES 
        ('email_api_provider', 'resend', false, 'Email service provider (resend, sendgrid, etc.)'),
        ('email_api_key', NULL, false, 'API key for email service'),
        ('email_from_address', NULL, false, 'Default sender email address'),
        ('sms_api_provider', 'twilio', false, 'SMS service provider (twilio, etc.)'),
        ('sms_api_key', NULL, false, 'API key for SMS service (Account SID for Twilio)'),
        ('sms_api_secret', NULL, false, 'API secret for SMS service (Auth Token for Twilio)'),
        ('sms_from_number', NULL, false, 'Default sender phone number')
    ON CONFLICT (setting_key) DO NOTHING;
END $$;