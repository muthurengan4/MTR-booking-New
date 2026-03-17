-- Add location field to room_types and create blocking system
-- Location: supabase/migrations/20260203031600_add_location_and_blocking.sql

-- 1. Add location field to room_types table
ALTER TABLE public.room_types 
ADD COLUMN IF NOT EXISTS location TEXT;

-- 2. Create index for location
CREATE INDEX IF NOT EXISTS idx_room_types_location ON public.room_types(location);

-- 3. Create room_blocked_dates table for manual blocking
CREATE TABLE IF NOT EXISTS public.room_blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    blocked_date DATE NOT NULL,
    reason TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_type_id, location, blocked_date)
);

-- 4. Create activity_blocked_dates table for manual blocking
CREATE TABLE IF NOT EXISTS public.activity_blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type_id UUID NOT NULL REFERENCES public.activity_types(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    blocked_date DATE NOT NULL,
    reason TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(activity_type_id, location, blocked_date)
);

-- 5. Create indexes for blocking tables
CREATE INDEX IF NOT EXISTS idx_room_blocked_dates_room_type ON public.room_blocked_dates(room_type_id);
CREATE INDEX IF NOT EXISTS idx_room_blocked_dates_date ON public.room_blocked_dates(blocked_date);
CREATE INDEX IF NOT EXISTS idx_room_blocked_dates_location ON public.room_blocked_dates(location);
CREATE INDEX IF NOT EXISTS idx_activity_blocked_dates_activity_type ON public.activity_blocked_dates(activity_type_id);
CREATE INDEX IF NOT EXISTS idx_activity_blocked_dates_date ON public.activity_blocked_dates(blocked_date);
CREATE INDEX IF NOT EXISTS idx_activity_blocked_dates_location ON public.activity_blocked_dates(location);

-- 6. Enable RLS on blocking tables
ALTER TABLE public.room_blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_blocked_dates ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for room_blocked_dates
DROP POLICY IF EXISTS "public_can_read_room_blocked_dates" ON public.room_blocked_dates;
CREATE POLICY "public_can_read_room_blocked_dates"
ON public.room_blocked_dates
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "admin_can_manage_room_blocked_dates" ON public.room_blocked_dates;
CREATE POLICY "admin_can_manage_room_blocked_dates"
ON public.room_blocked_dates
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 8. Create RLS policies for activity_blocked_dates
DROP POLICY IF EXISTS "public_can_read_activity_blocked_dates" ON public.activity_blocked_dates;
CREATE POLICY "public_can_read_activity_blocked_dates"
ON public.activity_blocked_dates
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "admin_can_manage_activity_blocked_dates" ON public.activity_blocked_dates;
CREATE POLICY "admin_can_manage_activity_blocked_dates"
ON public.activity_blocked_dates
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 9. Create function to check room availability
CREATE OR REPLACE FUNCTION public.is_room_available(
    p_room_type_id UUID,
    p_location TEXT,
    p_check_in_date DATE,
    p_check_out_date DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    blocked_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO blocked_count
    FROM public.room_blocked_dates
    WHERE room_type_id = p_room_type_id
    AND location = p_location
    AND blocked_date >= p_check_in_date
    AND blocked_date < p_check_out_date;
    
    RETURN blocked_count = 0;
END;
$$;

-- 10. Create function to check activity availability
CREATE OR REPLACE FUNCTION public.is_activity_available(
    p_activity_type_id UUID,
    p_location TEXT,
    p_activity_date DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    is_blocked BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1
        FROM public.activity_blocked_dates
        WHERE activity_type_id = p_activity_type_id
        AND location = p_location
        AND blocked_date = p_activity_date
    ) INTO is_blocked;
    
    RETURN NOT is_blocked;
END;
$$;

-- 11. Update existing room_types with location data
DO $$
BEGIN
    UPDATE public.room_types
    SET location = CASE 
        WHEN name = 'Deluxe Room' THEN 'Masinagudi'
        WHEN name = 'Suite' THEN 'Thepakadu'
        WHEN name = 'Cottage' THEN 'Gudalur'
        WHEN name = 'Dormitory' THEN 'Thepakadu'
        WHEN name = 'Family Room' THEN 'Masinagudi'
        ELSE 'Masinagudi'
    END
    WHERE location IS NULL;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Location update failed: %', SQLERRM;
END $$;