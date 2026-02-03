-- Room Types and Activity Types Management Migration
-- Location: supabase/migrations/20260128071730_room_activity_types.sql

-- 1. Create room_types table
CREATE TABLE IF NOT EXISTS public.room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 2,
    amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create activity_types table
CREATE TABLE IF NOT EXISTS public.activity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    duration TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 10,
    location TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_room_types_is_active ON public.room_types(is_active);
CREATE INDEX IF NOT EXISTS idx_room_types_name ON public.room_types(name);
CREATE INDEX IF NOT EXISTS idx_activity_types_is_active ON public.activity_types(is_active);
CREATE INDEX IF NOT EXISTS idx_activity_types_name ON public.activity_types(name);

-- 4. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 5. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_room_types_updated_at ON public.room_types;
CREATE TRIGGER update_room_types_updated_at
    BEFORE UPDATE ON public.room_types
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_activity_types_updated_at ON public.activity_types;
CREATE TRIGGER update_activity_types_updated_at
    BEFORE UPDATE ON public.activity_types
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Enable RLS
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for room_types (public read, admin write)
DROP POLICY IF EXISTS "public_can_read_room_types" ON public.room_types;
CREATE POLICY "public_can_read_room_types"
ON public.room_types
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "admin_can_manage_room_types" ON public.room_types;
CREATE POLICY "admin_can_manage_room_types"
ON public.room_types
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 8. Create RLS policies for activity_types (public read, admin write)
DROP POLICY IF EXISTS "public_can_read_activity_types" ON public.activity_types;
CREATE POLICY "public_can_read_activity_types"
ON public.activity_types
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "admin_can_manage_activity_types" ON public.activity_types;
CREATE POLICY "admin_can_manage_activity_types"
ON public.activity_types
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 9. Insert mock data for room types
DO $$
BEGIN
    INSERT INTO public.room_types (id, name, description, base_price, max_capacity, amenities, image_url, is_active)
    VALUES
        (gen_random_uuid(), 'Deluxe Room', 'Spacious room with modern amenities and forest view', 3500.00, 2, ARRAY['WiFi', 'AC', 'TV', 'Mini Bar', 'Balcony']::TEXT[], 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', true),
        (gen_random_uuid(), 'Suite', 'Luxurious suite with separate living area and premium facilities', 6500.00, 4, ARRAY['WiFi', 'AC', 'TV', 'Mini Bar', 'Jacuzzi', 'Living Room', 'Balcony']::TEXT[], 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', true),
        (gen_random_uuid(), 'Cottage', 'Private cottage surrounded by nature with rustic charm', 4800.00, 3, ARRAY['WiFi', 'AC', 'Fireplace', 'Kitchen', 'Garden']::TEXT[], 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800', true),
        (gen_random_uuid(), 'Dormitory', 'Budget-friendly shared accommodation for groups', 800.00, 6, ARRAY['WiFi', 'Shared Bathroom', 'Lockers']::TEXT[], 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', true),
        (gen_random_uuid(), 'Family Room', 'Spacious room perfect for families with children', 5200.00, 5, ARRAY['WiFi', 'AC', 'TV', 'Mini Bar', 'Extra Beds', 'Play Area']::TEXT[], 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', true)
    ON CONFLICT (name) DO NOTHING;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Room types mock data insertion failed: %', SQLERRM;
END $$;

-- 10. Insert mock data for activity types
DO $$
BEGIN
    INSERT INTO public.activity_types (id, name, description, duration, base_price, max_capacity, location, image_url, is_active)
    VALUES
        (gen_random_uuid(), 'Jeep Safari', 'Thrilling wildlife safari in open jeep through dense forest', '3 hours', 1800.00, 6, 'Mudumalai Core Zone', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800', true),
        (gen_random_uuid(), 'Bus Safari', 'Comfortable group safari with expert naturalist guide', '2.5 hours', 800.00, 30, 'Mudumalai Buffer Zone', 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800', true),
        (gen_random_uuid(), 'Elephant Camp Visit', 'Interactive experience with rescued elephants and mahouts', '2 hours', 600.00, 20, 'Thepakadu Elephant Camp', 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800', true),
        (gen_random_uuid(), 'Guided Nature Walk', 'Educational trek through forest trails with wildlife expert', '2 hours', 500.00, 12, 'Masinagudi Forest Trail', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', true),
        (gen_random_uuid(), 'Bird Watching Tour', 'Early morning birding expedition for enthusiasts', '3 hours', 1200.00, 8, 'Gudalur Wetlands', 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800', true),
        (gen_random_uuid(), 'Night Safari', 'Exclusive nocturnal wildlife spotting adventure', '2 hours', 2200.00, 6, 'Mudumalai Night Zone', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800', true)
    ON CONFLICT (name) DO NOTHING;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Activity types mock data insertion failed: %', SQLERRM;
END $$;