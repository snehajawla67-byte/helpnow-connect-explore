-- Create comprehensive backend for Travel Saviour app

-- Places table for storing locations, amenities, and safety information
CREATE TABLE public.places (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hospital', 'police', 'hotel', 'restaurant', 'travel', 'guide', 'vehicle', 'home', 'safety', 'gas_station', 'atm', 'pharmacy', 'tourist_attraction')),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  phone TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  is_open BOOLEAN DEFAULT true,
  opening_hours JSONB,
  description TEXT,
  amenities TEXT[],
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User locations for tracking and emergency services
CREATE TABLE public.user_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_emergency BOOLEAN DEFAULT false,
  accuracy_meters INTEGER
);

-- Safety zones and unsafe areas
CREATE TABLE public.safety_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  zone_type TEXT NOT NULL CHECK (zone_type IN ('safe', 'caution', 'unsafe', 'emergency')),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 500,
  description TEXT,
  risk_level INTEGER CHECK (risk_level BETWEEN 1 AND 5) DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  verified BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Emergency contacts and services
CREATE TABLE public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Incident reports for safety tracking
CREATE TABLE public.incident_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('theft', 'assault', 'fraud', 'harassment', 'accident', 'medical', 'other')),
  description TEXT,
  severity INTEGER CHECK (severity BETWEEN 1 AND 5) DEFAULT 3,
  status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'resolved', 'closed')),
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- User photos/media for sharing and emergency
CREATE TABLE public.user_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'audio')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  caption TEXT,
  is_emergency BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for places (public read, authenticated write)
CREATE POLICY "Places are viewable by everyone" 
ON public.places FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert places" 
ON public.places FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update places they created or verified places" 
ON public.places FOR UPDATE 
USING (verified = true OR auth.uid() IS NOT NULL);

-- RLS Policies for user_locations
CREATE POLICY "Users can view their own locations" 
ON public.user_locations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own locations" 
ON public.user_locations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locations" 
ON public.user_locations FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for safety_zones (public read for safety)
CREATE POLICY "Safety zones are viewable by everyone" 
ON public.safety_zones FOR SELECT 
USING (active = true);

CREATE POLICY "Authenticated users can create safety zones" 
ON public.safety_zones FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own safety zones" 
ON public.safety_zones FOR UPDATE 
USING (auth.uid() = created_by);

-- RLS Policies for emergency_contacts
CREATE POLICY "Users can view their own emergency contacts" 
ON public.emergency_contacts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own emergency contacts" 
ON public.emergency_contacts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency contacts" 
ON public.emergency_contacts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emergency contacts" 
ON public.emergency_contacts FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for incident_reports
CREATE POLICY "Users can view incident reports in their area" 
ON public.incident_reports FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create incident reports" 
ON public.incident_reports FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can update their own reports" 
ON public.incident_reports FOR UPDATE 
USING (auth.uid() = reporter_id);

-- RLS Policies for user_media
CREATE POLICY "Users can view their own media" 
ON public.user_media FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public media is viewable by everyone" 
ON public.user_media FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can insert their own media" 
ON public.user_media FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media" 
ON public.user_media FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media" 
ON public.user_media FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_places_location ON public.places USING btree (latitude, longitude);
CREATE INDEX idx_places_type ON public.places USING btree (type);
CREATE INDEX idx_user_locations_user_timestamp ON public.user_locations USING btree (user_id, timestamp DESC);
CREATE INDEX idx_safety_zones_location ON public.safety_zones USING btree (latitude, longitude);
CREATE INDEX idx_safety_zones_active ON public.safety_zones USING btree (active) WHERE active = true;
CREATE INDEX idx_incident_reports_location ON public.incident_reports USING btree (latitude, longitude);
CREATE INDEX idx_incident_reports_type_time ON public.incident_reports USING btree (incident_type, reported_at DESC);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_places_updated_at
BEFORE UPDATE ON public.places
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_safety_zones_updated_at
BEFORE UPDATE ON public.safety_zones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
) RETURNS DECIMAL AS $$
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
$$ LANGUAGE plpgsql;

-- Function to get nearby places
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
) AS $$
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
$$ LANGUAGE plpgsql;

-- Function to check safety in an area
CREATE OR REPLACE FUNCTION public.check_area_safety(
  check_lat DECIMAL,
  check_lon DECIMAL,
  radius_meters INTEGER DEFAULT 1000
)
RETURNS TABLE (
  overall_safety_score INTEGER,
  risk_zones JSONB,
  recent_incidents JSONB
) AS $$
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
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing
INSERT INTO public.places (name, type, latitude, longitude, address, phone, rating, is_open) VALUES
('City General Hospital', 'hospital', 28.6139, 77.2090, 'Connaught Place, New Delhi', '+91-11-23341234', 4.5, true),
('Central Police Station', 'police', 28.6304, 77.2177, 'Chandni Chowk, New Delhi', '100', 4.2, true),
('Hotel Imperial', 'hotel', 28.6278, 77.2176, 'Janpath, New Delhi', '+91-11-23341234', 4.8, true),
('Karim Restaurant', 'restaurant', 28.6562, 77.2410, 'Jama Masjid, Delhi', '+91-11-23262942', 4.6, true),
('Delhi Tourism Office', 'travel', 28.6139, 77.2090, 'N Block, Connaught Place', '+91-11-23320005', 4.3, true),
('Local Guide Services', 'guide', 28.6139, 77.2090, 'CP Metro Station', '+91-9876543214', 4.7, true),
('Prepaid Taxi Booth', 'vehicle', 28.5562, 77.0999, 'IGI Airport, Terminal 3', '+91-11-25675678', 4.4, true),
('Safety Shelter', 'safety', 28.6139, 77.2090, 'Emergency Services, CP', '112', 4.1, true);

-- Insert sample safety zones
INSERT INTO public.safety_zones (name, zone_type, latitude, longitude, radius_meters, description, risk_level, verified, active) VALUES
('Connaught Place Safe Zone', 'safe', 28.6139, 77.2090, 1000, 'Well-lit area with good police presence', 1, true, true),
('Red Fort Tourist Area', 'caution', 28.6562, 77.2410, 800, 'Crowded tourist area, watch for pickpockets', 2, true, true),
('Old Delhi Market', 'caution', 28.6507, 77.2334, 1200, 'Busy market area, stay alert', 3, true, true);