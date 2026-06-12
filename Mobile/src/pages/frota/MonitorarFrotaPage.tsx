import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Radio, Bus, MapPin, Clock, Users, Loader2 } from 'lucide-react'
import { useFrotaAtiva } from '@/hooks/useViagens'
import type { VeiculoAtivoDto } from '@/services/viagens.service'

const CENTER: [number, number] = [-15.7801, -47.9292]

const CORES_BASE = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16",
  "#f97316", "#14b8a6", "#6366f1", "#a855f7",
  "#0ea5e9", "#d946ef", "#22c55e", "#eab308",
]

function getCores(n: number): string[] {
  if (n <= CORES_BASE.length) return CORES_BASE.slice(0, n)
  return Array.from({ length: n }, (_, i) =>
    i < CORES_BASE.length ? CORES_BASE[i] : `hsl(${Math.round((i * 360) / n)},70%,50%)`)
}

function makeBusSvg(cor: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
    <filter id="s"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-opacity=".4"/></filter>
    <g filter="url(#s)">
      <rect x="2" y="5" width="20" height="14" rx="2" fill="${cor}"/>
      <rect x="4" y="8" width="5" height="4" rx="0.5" fill="rgba(255,255,255,0.6)"/>
      <rect x="10" y="8" width="5" height="4" rx="0.5" fill="rgba(255,255,255,0.6)"/>
      <rect x="3" y="17" width="4" height="3" rx="1.5" fill="#1a1a1a"/>
      <rect x="17" y="17" width="4" height="3" rx="1.5" fill="#1a1a1a"/>
    </g>
  </svg>`
}

function tempoRelativo(iso: string | null | undefined) {
  if (!iso) return "—"
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `há ${diff}s`
  if (diff < 3600) return `há ${Math.floor(diff / 60)}min`
  return `há ${Math.floor(diff / 3600)}h`
}

function turnoLabel(t: string) {
  return t === "Manha" ? "Manhã" : t === "Tarde" ? "Tarde" : "Noturno"
}

export function MonitorarFrotaPage() {
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  const { data: veiculos = [], isLoading } = useFrotaAtiva()
  const cores = getCores(veiculos.length)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return
    mapRef.current = L.map(mapContainerRef.current).setView(CENTER, 5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current)
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const idsAtivos = new Set(veiculos.map(v => v.viagemId))
    markersRef.current.forEach((marker, id) => {
      if (!idsAtivos.has(id)) {
        map.removeLayer(marker)
        markersRef.current.delete(id)
      }
    })

    veiculos.forEach((v, i) => {
      if (!v.latitude || !v.longitude) return
      const cor = cores[i]
      const icon = L.divIcon({
        className: '',
        html: makeBusSvg(cor),
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })

      const existing = markersRef.current.get(v.viagemId)
      if (existing) {
        existing.setLatLng([v.latitude, v.longitude])
        existing.setIcon(icon)
      } else {
        const marker = L.marker([v.latitude, v.longitude], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:160px">
              <b>${v.motoristaNome}</b><br/>
              <span style="color:#666;font-size:11px">${v.rotaNome}</span><br/>
              <span style="color:#666;font-size:11px">${turnoLabel(v.turno)} • ${v.totalAlunos} aluno(s)</span>
            </div>
          `)
        marker.on('click', () => setSelecionado(v.viagemId))
        markersRef.current.set(v.viagemId, marker)
      }
    })
  }, [veiculos, cores])

  const handleSelecionar = (v: VeiculoAtivoDto) => {
    setSelecionado(v.viagemId)
    if (v.latitude && v.longitude && mapRef.current) {
      mapRef.current.flyTo([v.latitude, v.longitude], 15, { duration: 1 })
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="px-4 py-3 bg-white border-b flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Minha Frota</h2>
          <p className="text-xs text-slate-500">
            {veiculos.length > 0 ? `${veiculos.length} veículo(s) em rota agora` : "Monitoramento em tempo real"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
          15s
        </div>
      </div>

      <div className="relative" style={{ flex: "0 0 55%" }}>
        <div ref={mapContainerRef} className="h-full w-full" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-[1000]">
            <Loader2 className="animate-spin text-primary h-8 w-8" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {!isLoading && veiculos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400 gap-2">
            <Radio className="h-8 w-8 opacity-30" />
            <p className="text-sm">Nenhum veículo em rota agora</p>
            <p className="text-xs opacity-60">Os motoristas aparecerão ao iniciar uma viagem</p>
          </div>
        ) : (
          cores.map((cor, i) => {
            const v = veiculos[i]
            if (!v) return null
            const ativo = selecionado === v.viagemId
            const semGps = !v.latitude || !v.longitude
            return (
              <button
                key={v.viagemId}
                onClick={() => handleSelecionar(v)}
                className={`w-full text-left rounded-2xl border p-3 transition-colors ${
                  ativo ? "border-primary bg-primary/5" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cor }} />
                  <span className="font-bold text-sm text-slate-900 truncate flex-1">{v.motoristaNome}</span>
                  {semGps && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      Aguardando GPS
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1 truncate max-w-[120px]">
                    <MapPin className="h-3 w-3 flex-shrink-0" />{v.rotaNome}
                  </span>
                  <span className="flex items-center gap-1 flex-shrink-0">
                    <Bus className="h-3 w-3" />{turnoLabel(v.turno)}
                  </span>
                  <span className="flex items-center gap-1 flex-shrink-0">
                    <Users className="h-3 w-3" />{v.totalAlunos}
                  </span>
                  {v.ultimaAtualizacao && (
                    <span className="flex items-center gap-1 flex-shrink-0">
                      <Clock className="h-3 w-3" />{tempoRelativo(v.ultimaAtualizacao)}
                    </span>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
