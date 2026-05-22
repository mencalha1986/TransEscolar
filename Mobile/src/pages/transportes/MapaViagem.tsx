import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CheckInDto } from '@/types/transporte';

// Corrigir ícones do Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapaViagemProps {
  checkins: CheckInDto[];
}

export function MapaViagem({ checkins }: MapaViagemProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Inicializar mapa
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([-23.5505, -46.6333], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Limpar marcadores anteriores
    map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const markers: L.LatLng[] = [];

    // Adicionar marcadores dos checkins
    checkins.forEach(c => {
      if (c.latitude && c.longitude) {
        const pos = new L.LatLng(c.latitude, c.longitude);
        markers.push(pos);

        const color = c.tipo === 'Embarque' ? '#3b82f6' : '#22c55e';

        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        L.marker(pos, { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif;">
              <strong style="color: ${color}">${c.tipo}</strong><br/>
              <b>${c.alunoNome}</b><br/>
              <span style="font-size: 10px; color: #666;">${new Date(c.horaRegistro).toLocaleTimeString('pt-BR')}</span>
            </div>
          `);
      }
    });

    // Ajustar zoom para conter todos os marcadores
    if (markers.length > 0) {
      const group = new L.FeatureGroup(markers.map(m => L.marker(m)));
      map.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      // Cleanup se necessário
    };
  }, [checkins]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Legenda Suspensa */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-lg z-[1000] border border-white flex justify-around">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-[10px] font-bold text-slate-700 uppercase">Embarque</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-[10px] font-bold text-slate-700 uppercase">Desembarque</span>
        </div>
      </div>
    </div>
  );
}
