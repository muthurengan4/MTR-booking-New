-- Analytics Schema Migration
-- Creates tables and views for business insights tracking

-- Bookings table for tracking all reservations
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('accommodation', 'activity', 'product')),
  item_id UUID,
  item_name TEXT NOT NULL,
  booking_date DATE NOT NULL,
  check_in_date DATE,
  check_out_date DATE,
  guests_count INTEGER DEFAULT 1,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'pending')),
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'refunded', 'partial_refund')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table for revenue tracking
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund')),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON public.bookings(booking_type);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON public.bookings(check_in_date);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_booking ON public.transactions(booking_id);

-- RLS Policies
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Admin full access to bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Admin full access to bookings'
  ) THEN
    CREATE POLICY "Admin full access to bookings"
      ON public.bookings
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Admin full access to transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Admin full access to transactions'
  ) THEN
    CREATE POLICY "Admin full access to transactions"
      ON public.transactions
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for bookings updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookings_updated_at'
  ) THEN
    CREATE TRIGGER update_bookings_updated_at
      BEFORE UPDATE ON public.bookings
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Insert mock booking data for analytics demonstration
INSERT INTO public.bookings (booking_reference, customer_name, customer_email, customer_phone, booking_type, item_name, booking_date, check_in_date, check_out_date, guests_count, amount, status, payment_status)
VALUES
  ('BK-2026-001', 'Rajesh Kumar', 'rajesh.kumar@email.com', '9876543210', 'accommodation', 'Deluxe Room - Masinagudi', '2026-01-15', '2026-02-15', '2026-02-17', 2, 7000, 'completed', 'paid'),
  ('BK-2026-002', 'Priya Sharma', 'priya.sharma@email.com', '9123456789', 'activity', 'Jeep Safari', '2026-01-18', '2026-02-20', '2026-02-20', 4, 3600, 'completed', 'paid'),
  ('BK-2026-003', 'Amit Patel', 'amit.patel@email.com', '9988776655', 'accommodation', 'Suite - Gudalur', '2026-01-20', '2026-03-01', '2026-03-04', 3, 14400, 'cancelled', 'refunded'),
  ('BK-2026-004', 'Sneha Reddy', 'sneha.reddy@email.com', '9876501234', 'activity', 'Elephant Camp Visit', '2026-01-22', '2026-02-18', '2026-02-18', 2, 1200, 'completed', 'paid'),
  ('BK-2026-005', 'Vikram Singh', 'vikram.singh@email.com', '9123450987', 'accommodation', 'Standard Room - Ooty', '2026-01-25', '2026-02-25', '2026-02-27', 2, 5000, 'confirmed', 'paid'),
  ('BK-2026-006', 'Ananya Iyer', 'ananya.iyer@email.com', '9988771234', 'activity', 'Nature Walk', '2026-01-26', '2026-02-28', '2026-02-28', 3, 900, 'confirmed', 'paid'),
  ('BK-2026-007', 'Karthik Menon', 'karthik.menon@email.com', '9876509876', 'accommodation', 'Deluxe Room - Masinagudi', '2026-01-28', '2026-03-10', '2026-03-12', 2, 7000, 'confirmed', 'paid'),
  ('BK-2026-008', 'Divya Nair', 'divya.nair@email.com', '9123456543', 'activity', 'Bird Watching', '2026-01-29', '2026-03-05', '2026-03-05', 2, 800, 'confirmed', 'paid')
ON CONFLICT (booking_reference) DO NOTHING;

-- Insert corresponding transactions
INSERT INTO public.transactions (booking_id, transaction_type, amount, payment_method, transaction_date, status)
SELECT 
  id,
  'payment',
  amount,
  'online',
  created_at,
  'completed'
FROM public.bookings
WHERE payment_status IN ('paid', 'refunded')
ON CONFLICT DO NOTHING;

-- Insert refund transaction for cancelled booking
INSERT INTO public.transactions (booking_id, transaction_type, amount, payment_method, transaction_date, status)
SELECT 
  id,
  'refund',
  -amount * 0.9,
  'online',
  created_at + INTERVAL '2 days',
  'completed'
FROM public.bookings
WHERE booking_reference = 'BK-2026-003'
ON CONFLICT DO NOTHING;