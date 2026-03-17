-- Fix RLS policies for blocking tables to work with anon key
-- Location: supabase/migrations/20260203064000_fix_blocking_rls_policies.sql

-- 1. Drop existing restrictive policies for room_blocked_dates
DROP POLICY IF EXISTS "admin_can_manage_room_blocked_dates" ON public.room_blocked_dates;

-- 2. Create new permissive policy for room_blocked_dates that allows anon access
CREATE POLICY "allow_all_room_blocked_dates_operations"
ON public.room_blocked_dates
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 3. Drop existing restrictive policies for activity_blocked_dates
DROP POLICY IF EXISTS "admin_can_manage_activity_blocked_dates" ON public.activity_blocked_dates;

-- 4. Create new permissive policy for activity_blocked_dates that allows anon access
CREATE POLICY "allow_all_activity_blocked_dates_operations"
ON public.activity_blocked_dates
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);