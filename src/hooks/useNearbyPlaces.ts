import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface Place {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  rating: number;
  is_open: boolean;
  distance_meters: number;
}

export interface SafetyInfo {
  overall_safety_score: number;
  risk_zones: Array<{
    name: string;
    type: string;
    risk_level: number;
    distance: number;
  }>;
  recent_incidents: Array<{
    type: string;
    severity: number;
    distance: number;
    reported_at: string;
  }>;
}

export const useNearbyPlaces = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [safetyInfo, setSafetyInfo] = useState<SafetyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNearbyPlaces = useCallback(async (
    latitude: number,
    longitude: number,
    options: {
      radius?: number;
      type?: string;
    } = {}
  ) => {
    const { radius = 5000, type } = options;
    
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radius.toString(),
      });

      if (type) {
        params.append('type', type);
      }

      const response = await supabase.functions.invoke('location-services', {
        method: 'GET'
      });

      // Since we can't pass query params through supabase.functions.invoke easily,
      // let's use a direct fetch to our edge function
      const { data: { session } } = await supabase.auth.getSession();
      
      const fetchResponse = await fetch(
        `https://obypgatzhmhpcwzvhlag.supabase.co/functions/v1/location-services?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token || ''}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!fetchResponse.ok) {
        throw new Error('Failed to fetch nearby places');
      }

      const data = await fetchResponse.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Format places data
      const formattedPlaces: Place[] = (data.places || []).map((place: any) => ({
        id: place.id,
        name: place.name,
        type: place.type,
        latitude: parseFloat(place.latitude),
        longitude: parseFloat(place.longitude),
        address: place.address || 'Address not available',
        phone: place.phone,
        rating: parseFloat(place.rating) || 0,
        is_open: place.is_open ?? true,
        distance_meters: parseFloat(place.distance_meters) || 0
      }));

      setPlaces(formattedPlaces);
      setSafetyInfo(data.safety);

      if (data.safety && data.safety.overall_safety_score <= 2) {
        toast.error('Warning: This area may have safety concerns');
      }

      return { places: formattedPlaces, safety: data.safety };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch nearby places';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching nearby places:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPlace = useCallback(async (placeData: {
    name: string;
    type: string;
    latitude: number;
    longitude: number;
    address?: string;
    phone?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('places')
        .insert({
          name: placeData.name,
          type: placeData.type,
          latitude: placeData.latitude,
          longitude: placeData.longitude,
          address: placeData.address,
          phone: placeData.phone,
          verified: false
        });

      if (error) {
        throw error;
      }

      toast.success('Place added successfully');
      
      // Refresh the places list
      if (places.length > 0) {
        const firstPlace = places[0];
        await fetchNearbyPlaces(firstPlace.latitude, firstPlace.longitude);
      }

      return true;
    } catch (error: any) {
      console.error('Error adding place:', error);
      toast.error(error.message || 'Failed to add place');
      return false;
    }
  }, [places, fetchNearbyPlaces]);

  const reportIncident = useCallback(async (incidentData: {
    latitude: number;
    longitude: number;
    incident_type: 'theft' | 'assault' | 'fraud' | 'harassment' | 'accident' | 'medical' | 'other';
    description?: string;
    severity: 1 | 2 | 3 | 4 | 5;
  }) => {
    try {
      const response = await supabase.functions.invoke('emergency-services/report-incident', {
        body: incidentData
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Incident reported successfully');
      
      // Refresh safety info
      await fetchNearbyPlaces(incidentData.latitude, incidentData.longitude);
      
      return response.data;
    } catch (error: any) {
      console.error('Error reporting incident:', error);
      toast.error(error.message || 'Failed to report incident');
      return null;
    }
  }, [fetchNearbyPlaces]);

  const getDirections = useCallback((place: Place) => {
    // Open Google Maps directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&destination_place_id=${place.name}`;
    window.open(url, '_blank');
    toast.success(`Opening directions to ${place.name}`);
  }, []);

  const formatDistance = useCallback((meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  }, []);

  return {
    places,
    safetyInfo,
    isLoading,
    error,
    fetchNearbyPlaces,
    addPlace,
    reportIncident,
    getDirections,
    formatDistance
  };
};