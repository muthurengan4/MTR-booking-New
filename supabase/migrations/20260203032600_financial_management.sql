-- Financial Management Migration
-- Adds GST tracking, cancellation details, and financial reporting capabilities
-- Location: supabase/migrations/20260203032600_financial_management.sql

-- 1. Add GST and financial tracking fields to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS gst_rate DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancellation_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_status TEXT CHECK (refund_status IN ('none', 'pending', 'processed', 'failed'));

-- 2. Add GST fields to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS gst_rate DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10, 2) DEFAULT 0;

-- 3. Create indexes for financial queries
CREATE INDEX IF NOT EXISTS idx_bookings_cancellation_date ON public.bookings(cancellation_date);
CREATE INDEX IF NOT EXISTS idx_bookings_refund_status ON public.bookings(refund_status);
CREATE INDEX IF NOT EXISTS idx_bookings_gst_rate ON public.bookings(gst_rate);

-- 4. Function to calculate GST breakdown
CREATE OR REPLACE FUNCTION public.calculate_gst_breakdown(
  start_date DATE,
  end_date DATE,
  filter_location TEXT DEFAULT NULL
)
RETURNS TABLE(
  location TEXT,
  total_revenue DECIMAL,
  total_gst DECIMAL,
  net_revenue DECIMAL,
  booking_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(
      CASE
        WHEN b.item_name ILIKE '%masinagudi%' THEN 'Masinagudi'
        WHEN b.item_name ILIKE '%gudalur%' THEN 'Gudalur'
        WHEN b.item_name ILIKE '%ooty%' THEN 'Ooty'
        ELSE 'Other'
      END,
      'Unknown'
    ) AS location,
    SUM(b.amount)::DECIMAL AS total_revenue,
    SUM(b.gst_amount)::DECIMAL AS total_gst,
    SUM(b.net_amount)::DECIMAL AS net_revenue,
    COUNT(*)::BIGINT AS booking_count
  FROM public.bookings b
  WHERE b.booking_date >= start_date
    AND b.booking_date <= end_date
    AND b.status IN ('confirmed', 'completed')
    AND (filter_location IS NULL OR b.item_name ILIKE '%' || filter_location || '%')
  GROUP BY location
  ORDER BY total_revenue DESC;
END;
$$;

-- 5. Function to calculate cancellation impact
CREATE OR REPLACE FUNCTION public.calculate_cancellation_impact(
  start_date DATE,
  end_date DATE,
  filter_location TEXT DEFAULT NULL
)
RETURNS TABLE(
  location TEXT,
  total_cancellations BIGINT,
  total_cancelled_revenue DECIMAL,
  total_refunded DECIMAL,
  refund_percentage DECIMAL,
  impact_on_revenue DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(
      CASE
        WHEN b.item_name ILIKE '%masinagudi%' THEN 'Masinagudi'
        WHEN b.item_name ILIKE '%gudalur%' THEN 'Gudalur'
        WHEN b.item_name ILIKE '%ooty%' THEN 'Ooty'
        ELSE 'Other'
      END,
      'Unknown'
    ) AS location,
    COUNT(*)::BIGINT AS total_cancellations,
    SUM(b.amount)::DECIMAL AS total_cancelled_revenue,
    SUM(b.refund_amount)::DECIMAL AS total_refunded,
    CASE
      WHEN SUM(b.amount) > 0 THEN (SUM(b.refund_amount) / SUM(b.amount) * 100)::DECIMAL
      ELSE 0::DECIMAL
    END AS refund_percentage,
    (SUM(b.amount) - SUM(b.refund_amount))::DECIMAL AS impact_on_revenue
  FROM public.bookings b
  WHERE b.status = 'cancelled'
    AND b.booking_date >= start_date
    AND b.booking_date <= end_date
    AND (filter_location IS NULL OR b.item_name ILIKE '%' || filter_location || '%')
  GROUP BY location
  ORDER BY total_cancelled_revenue DESC;
END;
$$;

-- 6. Function to get revenue by booking type
CREATE OR REPLACE FUNCTION public.get_revenue_by_type(
  start_date DATE,
  end_date DATE,
  filter_location TEXT DEFAULT NULL
)
RETURNS TABLE(
  booking_type TEXT,
  total_revenue DECIMAL,
  total_gst DECIMAL,
  net_revenue DECIMAL,
  booking_count BIGINT,
  average_booking_value DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.booking_type,
    SUM(b.amount)::DECIMAL AS total_revenue,
    SUM(b.gst_amount)::DECIMAL AS total_gst,
    SUM(b.net_amount)::DECIMAL AS net_revenue,
    COUNT(*)::BIGINT AS booking_count,
    AVG(b.amount)::DECIMAL AS average_booking_value
  FROM public.bookings b
  WHERE b.booking_date >= start_date
    AND b.booking_date <= end_date
    AND b.status IN ('confirmed', 'completed')
    AND (filter_location IS NULL OR b.item_name ILIKE '%' || filter_location || '%')
  GROUP BY b.booking_type
  ORDER BY total_revenue DESC;
END;
$$;

-- 7. Update existing bookings with GST calculations (assuming 12% GST rate)
DO $$
BEGIN
  UPDATE public.bookings
  SET
    gst_rate = 12.00,
    gst_amount = ROUND((amount * 12.00 / 112.00)::NUMERIC, 2),
    net_amount = ROUND((amount * 100.00 / 112.00)::NUMERIC, 2),
    refund_status = CASE
      WHEN status = 'cancelled' AND payment_status = 'refunded' THEN 'processed'
      WHEN status = 'cancelled' AND payment_status = 'partial_refund' THEN 'processed'
      ELSE 'none'
    END
  WHERE gst_rate = 0 OR gst_rate IS NULL;

  -- Update refund amounts for cancelled bookings
  UPDATE public.bookings
  SET
    refund_amount = ROUND((amount * 0.9)::NUMERIC, 2),
    cancellation_date = updated_at
  WHERE status = 'cancelled' AND refund_amount = 0;
END $$;

-- 8. Update existing transactions with GST calculations
DO $$
BEGIN
  UPDATE public.transactions
  SET
    gst_rate = 12.00,
    gst_amount = ROUND((amount * 12.00 / 112.00)::NUMERIC, 2),
    net_amount = ROUND((amount * 100.00 / 112.00)::NUMERIC, 2)
  WHERE (gst_rate = 0 OR gst_rate IS NULL) AND transaction_type = 'payment';
END $$;