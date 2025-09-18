import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

interface SafetyData {
  overall_safety_score: number;
  risk_zones: any[];
  recent_incidents: any[];
}

export const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [safetyData, setSafetyData] = useState<SafetyData | null>(null);

  const getCurrentLocation = useCallback(async (isEmergency = false) => {
    if (!navigator.geolocation) {
      const error = 'Geolocation is not supported by this browser';
      setLocationError(error);
      toast.error(error);
      return null;
    }

    setIsLoading(true);
    setLocationError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      // Save location to backend
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const response = await supabase.functions.invoke('location-services', {
            body: {
              ...locationData,
              is_emergency: isEmergency
            }
          });

          if (response.data && !response.error) {
            locationData.address = response.data.address;
            setSafetyData(response.data.safety);
            
            if (isEmergency && response.data.safety) {
              const safetyScore = response.data.safety.overall_safety_score;
              if (safetyScore <= 2) {
                toast.error('Warning: You are in a potentially unsafe area!');
              }
            }
          }
        } catch (error) {
          console.error('Error saving location:', error);
        }
      }

      setCurrentLocation(locationData);
      
      if (isEmergency) {
        toast.success('Emergency location saved and shared');
      } else {
        toast.success('Location detected successfully');
      }

      return locationData;
    } catch (error: any) {
      let errorMessage = 'Unable to get your location';
      
      if (error.code === 1) {
        errorMessage = 'Location access denied. Please enable location services.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please check your GPS.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      }

      setLocationError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setCurrentLocation(locationData);
      },
      (error) => {
        setLocationError('Unable to track your location');
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const getAddressFromCoords = useCallback(async (lat: number, lon: number): Promise<string> => {
    try {
      // In a real app, you'd use a geocoding service like Google Maps or Mapbox
      // For now, we'll return a formatted coordinate string
      return `Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } catch (error) {
      console.error('Error getting address:', error);
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  }, []);

  // Auto-detect location on mount
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    currentLocation,
    locationError,
    isLoading,
    safetyData,
    getCurrentLocation,
    watchLocation,
    getAddressFromCoords
  };
};