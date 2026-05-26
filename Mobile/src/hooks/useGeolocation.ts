import { useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';

export function useGeolocation() {
  const [loading, setLoading] = useState(false);

  async function getCurrentPosition() {
    setLoading(true);
    try {
      const permission = await Geolocation.requestPermissions();
      if (permission.location !== 'granted') {
        throw new Error('Permissão de localização negada pelo usuário');
      }
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      return {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude
      };
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { getCurrentPosition, loading };
}
