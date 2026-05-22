import { useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';

export function useGeolocation() {
  const [loading, setLoading] = useState(false);

  async function getCurrentPosition() {
    setLoading(true);
    try {
      // Solicita permissão se necessário e obtém a posição
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
