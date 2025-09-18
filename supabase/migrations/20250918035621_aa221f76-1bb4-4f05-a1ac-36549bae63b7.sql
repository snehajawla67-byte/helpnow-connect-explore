-- Fix security issues identified by linter

-- Fix function search_path issues for security
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
) RETURNS DECIMAL 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r DECIMAL := 6371000; -- Earth's radius in meters
  d_lat DECIMAL;
  d_lon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  d_lat := radians(lat2 - lat1);
  d_lon := radians(lon2 - lon1);
  a := sin(d_lat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon/2)^2;
  c := 2 * asin(sqrt(a));
  RETURN r * c;
END;
$$;

-- Fix get_nearby_places function
CREATE OR REPLACE FUNCTION public.get_nearby_places(
  user_lat DECIMAL,
  user_lon DECIMAL,
  radius_meters INTEGER DEFAULT 5000,
  place_type TEXT DEFAULT NULL
) 
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  address TEXT,
  phone TEXT,
  rating DECIMAL,
  is_open BOOLEAN,
  distance_meters DECIMAL
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.type,
    p.latitude,
    p.longitude,
    p.address,
    p.phone,
    p.rating,
    p.is_open,
    calculate_distance(user_lat, user_lon, p.latitude, p.longitude) as distance_meters
  FROM public.places p
  WHERE 
    (place_type IS NULL OR p.type = place_type)
    AND calculate_distance(user_lat, user_lon, p.latitude, p.longitude) <= radius_meters
  ORDER BY distance_meters ASC;
END;
$$;

-- Fix check_area_safety function
CREATE OR REPLACE FUNCTION public.check_area_safety(
  check_lat DECIMAL,
  check_lon DECIMAL,
  radius_meters INTEGER DEFAULT 1000
)
RETURNS TABLE (
  overall_safety_score INTEGER,
  risk_zones JSONB,
  recent_incidents JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  safety_score INTEGER := 5; -- Start with max safety
  zones_data JSONB := '[]'::jsonb;
  incidents_data JSONB := '[]'::jsonb;
BEGIN
  -- Check safety zones
  SELECT 
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'name', sz.name,
        'type', sz.zone_type,
        'risk_level', sz.risk_level,
        'distance', calculate_distance(check_lat, check_lon, sz.latitude, sz.longitude)
      )
    ), '[]'::jsonb)
  INTO zones_data
  FROM public.safety_zones sz
  WHERE 
    sz.active = true 
    AND calculate_distance(check_lat, check_lon, sz.latitude, sz.longitude) <= radius_meters;

  -- Check recent incidents (last 30 days)
  SELECT 
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'type', ir.incident_type,
        'severity', ir.severity,
        'distance', calculate_distance(check_lat, check_lon, ir.latitude, ir.longitude),
        'reported_at', ir.reported_at
      )
    ), '[]'::jsonb)
  INTO incidents_data
  FROM public.incident_reports ir
  WHERE 
    calculate_distance(check_lat, check_lon, ir.latitude, ir.longitude) <= radius_meters
    AND ir.reported_at >= now() - INTERVAL '30 days';

  -- Calculate safety score based on incidents and zones
  SELECT 
    GREATEST(1, 5 - 
      COALESCE((SELECT COUNT(*) FROM public.safety_zones sz 
               WHERE sz.zone_type = 'unsafe' 
               AND calculate_distance(check_lat, check_lon, sz.latitude, sz.longitude) <= radius_meters), 0) -
      COALESCE((SELECT COUNT(*) FROM public.incident_reports ir 
               WHERE ir.severity >= 4 
               AND calculate_distance(check_lat, check_lon, ir.latitude, ir.longitude) <= radius_meters
               AND ir.reported_at >= now() - INTERVAL '7 days'), 0)
    )
  INTO safety_score;

  RETURN QUERY SELECT safety_score, zones_data, incidents_data;
END;
$$;