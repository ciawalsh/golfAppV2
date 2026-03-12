import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

interface LocationResult {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setIsLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch {
      setError('Failed to get location');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Request on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    location,
    isLoading,
    error,
    requestPermission,
  };
}
