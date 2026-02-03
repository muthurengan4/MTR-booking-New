-- Safari Routes Management Schema
-- Location: supabase/migrations/20260203033000_safari_routes_management.sql

-- 1. Create safari_routes table
CREATE TABLE IF NOT EXISTS public.safari_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    route_type TEXT NOT NULL CHECK (route_type IN ('jeep', 'bus', 'elephant')),
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    duration TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    distance TEXT NOT NULL,
    description TEXT NOT NULL,
    highlights TEXT[] DEFAULT ARRAY[]::TEXT[],
    best_time TEXT NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 6,
    terrain TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create waypoints table
CREATE TABLE IF NOT EXISTS public.safari_waypoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES public.safari_routes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    time TEXT NOT NULL,
    elevation INTEGER NOT NULL,
    description TEXT NOT NULL,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create wildlife_zones table
CREATE TABLE IF NOT EXISTS public.wildlife_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    coordinate_x NUMERIC NOT NULL,
    coordinate_y NUMERIC NOT NULL,
    species TEXT[] DEFAULT ARRAY[]::TEXT[],
    probability TEXT NOT NULL CHECK (probability IN ('Very High', 'High', 'Medium', 'Low')),
    season TEXT NOT NULL,
    best_time TEXT NOT NULL,
    description TEXT NOT NULL,
    safety_tips TEXT[] DEFAULT ARRAY[]::TEXT[],
    photo_tips TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_safari_routes_route_type ON public.safari_routes(route_type);
CREATE INDEX IF NOT EXISTS idx_safari_routes_is_active ON public.safari_routes(is_active);
CREATE INDEX IF NOT EXISTS idx_safari_waypoints_route_id ON public.safari_waypoints(route_id);
CREATE INDEX IF NOT EXISTS idx_safari_waypoints_sequence ON public.safari_waypoints(route_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_wildlife_zones_is_active ON public.wildlife_zones(is_active);

-- 5. Enable RLS
ALTER TABLE public.safari_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safari_waypoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wildlife_zones ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies - Public read access, admin write access
DROP POLICY IF EXISTS "public_read_safari_routes" ON public.safari_routes;
CREATE POLICY "public_read_safari_routes"
ON public.safari_routes
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_safari_routes" ON public.safari_routes;
CREATE POLICY "admin_manage_safari_routes"
ON public.safari_routes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_safari_waypoints" ON public.safari_waypoints;
CREATE POLICY "public_read_safari_waypoints"
ON public.safari_waypoints
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "admin_manage_safari_waypoints" ON public.safari_waypoints;
CREATE POLICY "admin_manage_safari_waypoints"
ON public.safari_waypoints
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_wildlife_zones" ON public.wildlife_zones;
CREATE POLICY "public_read_wildlife_zones"
ON public.wildlife_zones
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_wildlife_zones" ON public.wildlife_zones;
CREATE POLICY "admin_manage_wildlife_zones"
ON public.wildlife_zones
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Mock Data
DO $$
DECLARE
    jeep_route_id UUID := gen_random_uuid();
    bus_route_id UUID := gen_random_uuid();
    elephant_route_id UUID := gen_random_uuid();
BEGIN
    -- Insert safari routes
    INSERT INTO public.safari_routes (id, name, route_type, icon, color, duration, difficulty, distance, description, highlights, best_time, max_capacity, terrain)
    VALUES
        (jeep_route_id, 'Jeep Safari', 'jeep', 'Truck', '#2D5016', '3-4 hours', 'Moderate', '25 km', 'Thrilling off-road adventure through dense forests and grasslands with high wildlife sighting probability', 
         ARRAY['Tiger sightings', 'Elephant herds', 'Gaur populations', 'Bird watching'], 'Early morning (6:00 AM) or late afternoon (3:30 PM)', 6, 'Mixed terrain with forest trails and open grasslands'),
        (bus_route_id, 'Bus Safari', 'bus', 'Bus', '#8B4513', '2-3 hours', 'Easy', '18 km', 'Comfortable group safari experience on paved roads with guided wildlife commentary',
         ARRAY['Spotted deer herds', 'Peacock displays', 'Langur colonies', 'Scenic landscapes'], 'Morning (7:00 AM) or afternoon (4:00 PM)', 45, 'Paved roads through forest corridors'),
        (elephant_route_id, 'Elephant Camp Visit', 'elephant', 'Mountain', '#FF6B35', '1.5-2 hours', 'Easy', '5 km', 'Educational walking tour of elephant rehabilitation camp with close encounters',
         ARRAY['Elephant feeding', 'Bathing sessions', 'Conservation education', 'Mahout interactions'], 'Morning (8:00 AM) for bathing session', 20, 'Flat walking paths around camp facilities')
    ON CONFLICT (id) DO NOTHING;

    -- Insert waypoints for Jeep Safari
    INSERT INTO public.safari_waypoints (route_id, name, time, elevation, description, sequence_order)
    VALUES
        (jeep_route_id, 'Thepakadu Entry Gate', '06:00 AM', 950, 'Safari starting point with briefing', 1),
        (jeep_route_id, 'Moyar River Crossing', '06:45 AM', 920, 'Prime elephant and deer spotting zone', 2),
        (jeep_route_id, 'Tiger Zone Alpha', '07:30 AM', 1050, 'High probability tiger territory', 3),
        (jeep_route_id, 'Grassland Viewpoint', '08:15 AM', 980, 'Panoramic views of wildlife grazing', 4),
        (jeep_route_id, 'Return to Base', '09:30 AM', 950, 'Safari conclusion with refreshments', 5)
    ON CONFLICT (id) DO NOTHING;

    -- Insert waypoints for Bus Safari
    INSERT INTO public.safari_waypoints (route_id, name, time, elevation, description, sequence_order)
    VALUES
        (bus_route_id, 'Masinagudi Depot', '07:00 AM', 960, 'Boarding point with safety instructions', 1),
        (bus_route_id, 'Bamboo Forest Section', '07:30 AM', 940, 'Dense bamboo groves with bird activity', 2),
        (bus_route_id, 'Deer Meadow', '08:00 AM', 930, 'Large spotted deer congregation area', 3),
        (bus_route_id, 'Scenic Overlook', '08:30 AM', 1020, 'Photo stop with valley views', 4),
        (bus_route_id, 'Return Journey', '09:30 AM', 960, 'End of safari experience', 5)
    ON CONFLICT (id) DO NOTHING;

    -- Insert waypoints for Elephant Camp
    INSERT INTO public.safari_waypoints (route_id, name, time, elevation, description, sequence_order)
    VALUES
        (elephant_route_id, 'Camp Reception', '08:00 AM', 945, 'Introduction to camp activities', 1),
        (elephant_route_id, 'Feeding Area', '08:20 AM', 945, 'Participate in elephant feeding', 2),
        (elephant_route_id, 'Bathing Zone', '08:45 AM', 940, 'Watch elephants bathing in river', 3),
        (elephant_route_id, 'Conservation Center', '09:15 AM', 945, 'Learn about elephant rescue efforts', 4),
        (elephant_route_id, 'Photo Opportunity', '09:40 AM', 945, 'Close-up photos with elephants', 5)
    ON CONFLICT (id) DO NOTHING;

    -- Insert wildlife zones
    INSERT INTO public.wildlife_zones (name, coordinate_x, coordinate_y, species, probability, season, best_time, description, safety_tips, photo_tips)
    VALUES
        ('Tiger Territory Alpha', 35, 40, ARRAY['Bengal Tiger', 'Wild Boar', 'Sambar Deer'], 'High', 'Year-round', 'Early morning', 'Core tiger habitat with frequent sightings near water sources',
         ARRAY['Maintain silence', 'Stay in vehicle', 'No sudden movements'], ARRAY['Use telephoto lens', 'Fast shutter speed', 'Natural light preferred']),
        ('Elephant Corridor', 55, 30, ARRAY['Asian Elephant', 'Gaur', 'Spotted Deer'], 'Very High', 'Peak in dry season', 'Morning and evening', 'Traditional elephant migration path with large herds',
         ARRAY['Keep safe distance', 'Avoid loud noises', 'Follow guide instructions'], ARRAY['Wide-angle for herds', 'Capture interactions', 'Golden hour lighting']),
        ('Grassland Meadow', 70, 55, ARRAY['Gaur', 'Wild Dog', 'Peacock', 'Spotted Deer'], 'High', 'Best in monsoon', 'Late afternoon', 'Open grassland with diverse herbivore populations',
         ARRAY['Sun protection required', 'Binoculars recommended', 'Stay hydrated'], ARRAY['Landscape shots', 'Silhouettes at sunset', 'Action photography']),
        ('Moyar River Zone', 45, 65, ARRAY['Crocodile', 'Otter', 'Water Birds', 'Elephant'], 'Medium', 'Year-round', 'Morning', 'Riverine habitat with aquatic and semi-aquatic wildlife',
         ARRAY['Stay on designated paths', 'Watch for slippery rocks', 'No swimming'], ARRAY['Reflections in water', 'Bird flight shots', 'Macro for insects']),
        ('Dense Forest Section', 25, 70, ARRAY['Leopard', 'Langur', 'Giant Squirrel', 'Hornbill'], 'Medium', 'Year-round', 'Early morning', 'Dense canopy forest with elusive species and rich birdlife',
         ARRAY['Watch for leeches', 'Wear appropriate clothing', 'Stay on trail'], ARRAY['Low light settings', 'Canopy shots', 'Patience required'])
    ON CONFLICT (id) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;