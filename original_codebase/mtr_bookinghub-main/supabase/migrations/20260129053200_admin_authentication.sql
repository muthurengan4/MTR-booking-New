-- Admin Authentication Migration
-- Creates admin_users table for separate admin login system

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    encrypted_password TEXT NOT NULL,
    full_name TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON public.admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only authenticated admins can read their own data
DROP POLICY IF EXISTS "admins_read_own_data" ON public.admin_users;
CREATE POLICY "admins_read_own_data"
ON public.admin_users
FOR SELECT
TO public
USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_admin_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_admin_updated_at();

-- Create mock admin user
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.admin_users (
        id,
        username,
        email,
        encrypted_password,
        full_name,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        admin_uuid,
        'admin',
        'admin@mudumalai.gov.in',
        crypt('admin123', gen_salt('bf', 10)),
        'System Administrator',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (username) DO NOTHING;
    
    RAISE NOTICE 'Admin user created: username=admin, password=admin123';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Admin user creation failed: %', SQLERRM;
END $$;