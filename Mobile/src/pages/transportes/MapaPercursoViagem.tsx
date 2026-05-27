import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { PercursoPontoDto } from '@/types/viagem'
import type { CheckInDto } from '@/types/transporte'

import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

interface MapaPercursoViagemProps {
  percurso: PercursoPontoDto[]
  checkins: CheckInDto[]
}

export function MapaPercursoViagem({ percurso, checkins }: MapaPercursoViagemProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([-23.5505, -46.6333], 13)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current)
    }

    const map = mapRef.current

    // Remove camadas anteriores exceto tiles
    map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer)
      }
    })

    const bounds: L.LatLng[] = []

    // Polyline do percurso GPS
    if (percurso.length > 1) {
      const latlngs = percurso.map(p => new L.LatLng(p.latitude, p.longitude))
      latlngs.forEach(p => bounds.push(p))

      L.polyline(latlngs, { color: '#3b82f6', weight: 4, opacity: 0.8 }).addTo(map)

      // Marcador de início
      const inicio = latlngs[0]
      L.marker(inicio, {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background:#22c55e;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(map).bindPopup('<b>Início da rota</b>')

      // Marcador de fim
      const fim = latlngs[latlngs.length - 1]
      L.marker(fim, {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(map).bindPopup('<b>Fim da rota</b>')
    }

    // Marcadores de check-ins
    checkins.forEach(c => {
      if (c.latitude && c.longitude) {
        const pos = new L.LatLng(c.latitude, c.longitude)
        bounds.push(pos)

        const color = c.tipo === 'Embarque' ? '#3b82f6' : '#22c55e'
        L.marker(pos, {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 5px rgba(0,0,0,0.3)"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
          })
        })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif">
              <strong style="color:${color}">${c.tipo}</strong><br/>
              <b>${c.alunoNome}</b><br/>
              <span style="font-size:10px;color:#666">${new Date(c.horaRegistro).toLocaleTimeString('pt-BR')}</span>
              ${c.endereco ? `<br/><span style="font-size:9px;color:#888">${c.endereco}</span>` : ''}
            </div>
          `)
      }
    })

    if (bounds.length > 0) {
      const group = new L.FeatureGroup(bounds.map(m => L.marker(m)))
      map.fitBounds(group.getBounds().pad(0.15))
    }

    return () => {}
  }, [percurso, checkins])

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-lg z-[1000] border border-white flex justify-around">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-[10px] font-bold text-slate-700 uppercase">Início</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-[10px] font-bold text-slate-700 uppercase">Fim</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-[10px] font-bold text-slate-700 uppercase">Embarque</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="text-[10px] font-bold text-slate-700 uppercase">Desembarque</span>
        </div>
      </div>
    </div>
  )
}
