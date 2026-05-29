import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "@/lib/leaflet-config"
import type { PercursoPontoDto } from "@/services/viagens.service"
import type { CheckInDto } from "@/types/transporte"

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points as L.LatLngBoundsExpression, { padding: [30, 30] })
    }
  }, [map, points])
  return null
}

function dotIcon(color: string, size = 12) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:2px solid white;box-shadow:0 0 5px rgba(0,0,0,0.3)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

interface MapaPercursoViagemProps {
  percurso: PercursoPontoDto[]
  checkins: CheckInDto[]
}

export function MapaPercursoViagem({ percurso, checkins }: MapaPercursoViagemProps) {
  const polyline: [number, number][] = percurso.map(p => [p.latitude, p.longitude])
  const checkinsComPos = checkins.filter(c => c.latitude && c.longitude)
  const allPoints: [number, number][] = [
    ...polyline,
    ...checkinsComPos.map(c => [c.latitude!, c.longitude!] as [number, number]),
  ]

  return (
    <div className="relative h-full w-full">
      <MapContainer center={[-15.78, -47.93]} zoom={12} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {allPoints.length > 0 && <FitBounds points={allPoints} />}
        {polyline.length > 1 && (
          <Polyline positions={polyline} color="#3b82f6" weight={4} opacity={0.8} />
        )}
        {polyline.length > 0 && (
          <Marker position={polyline[0]} icon={dotIcon("#22c55e", 14)}>
            <Popup><b>Início da rota</b></Popup>
          </Marker>
        )}
        {polyline.length > 1 && (
          <Marker position={polyline[polyline.length - 1]} icon={dotIcon("#ef4444", 14)}>
            <Popup><b>Fim da rota</b></Popup>
          </Marker>
        )}
        {checkinsComPos.map(c => (
          <Marker key={c.id} position={[c.latitude!, c.longitude!]} icon={dotIcon(c.tipo === "Embarque" ? "#3b82f6" : "#22c55e")}>
            <Popup>
              <div style={{ fontFamily: "sans-serif", fontSize: 13 }}>
                <strong style={{ color: c.tipo === "Embarque" ? "#3b82f6" : "#22c55e" }}>{c.tipo}</strong><br />
                <b>{c.alunoNome}</b><br />
                <span style={{ fontSize: 11, color: "#666" }}>
                  {new Date(c.horaRegistro).toLocaleTimeString("pt-BR")}
                </span>
                {c.endereco && (
                  <><br /><span style={{ fontSize: 10, color: "#888" }}>{c.endereco}</span></>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-2 rounded-xl shadow-lg z-[1000] border border-white flex justify-around text-xs font-semibold text-slate-700">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block flex-shrink-0" />Início
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block flex-shrink-0" />Fim
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block flex-shrink-0" />Embarque
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-400 inline-block flex-shrink-0" />Desembarque
        </span>
      </div>
    </div>
  )
}
