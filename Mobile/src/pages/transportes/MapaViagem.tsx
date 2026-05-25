import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CheckInDto } from '@/types/transporte';

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
  posicaoMotorista?: { lat: number; lng: number } | null;
}

export function MapaViagem({ checkins, posicaoMotorista }: MapaViagemProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([-23.5505, -46.6333], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const markers: L.LatLng[] = [];

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

        const popupAddr = c.endereco ? `<br/><span style="font-size:9px;color:#888">${c.endereco}</span>` : '';
        L.marker(pos, { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif;">
              <strong style="color: ${color}">${c.tipo}</strong><br/>
              <b>${c.alunoNome}</b><br/>
              <span style="font-size: 10px; color: #666;">${new Date(c.horaRegistro).toLocaleTimeString('pt-BR')}</span>
              ${popupAddr}
            </div>
          `);
      }
    });

    if (posicaoMotorista) {
      const busPos = new L.LatLng(posicaoMotorista.lat, posicaoMotorista.lng);
      markers.push(busPos);

      const busIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:#f59e0b; width:18px; height:18px; border-radius:50%; border:3px solid white; box-shadow:0 0 8px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; font-size:10px;">🚌</div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      L.marker(busPos, { icon: busIcon })
        .addTo(map)
        .bindPopup('<b>Transporte</b><br/>Posição atual do motorista');
    }

    if (markers.length > 0) {
      const group = new L.FeatureGroup(markers.map(m => L.marker(m)));
      map.fitBounds(group.getBounds().pad(0.15));
    }

    return () => {};
  }, [checkins, posicaoMotorista]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-lg z-[1000] border border-white flex justify-around">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-[10px] font-bold text-slate-700 uppercase">Embarque</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-[10px] font-bold text-slate-700 uppercase">Desembarque</span>
        </div>
        {posicaoMotorista && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-[10px] font-bold text-slate-700 uppercase">Motorista</span>
          </div>
        )}
      </div>
    </div>
  );
}
