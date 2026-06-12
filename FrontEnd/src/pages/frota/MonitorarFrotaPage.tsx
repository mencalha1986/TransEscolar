import { useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "@/lib/leaflet-config"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useFrotaAtiva } from "@/hooks/useViagens"
import type { VeiculoAtivoDto } from "@/services/viagens.service"
import { Bus, MapPin, Clock, Users, Radio } from "lucide-react"

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
    i < CORES_BASE.length
      ? CORES_BASE[i]
      : `hsl(${Math.round((i * 360) / n)},70%,50%)`
  )
}

const BUS_SVG = (cor: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
    <filter id="s"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-opacity=".4"/></filter>
    <g filter="url(#s)">
      <rect x="2" y="5" width="20" height="14" rx="2" fill="${cor}"/>
      <rect x="4" y="8" width="5" height="4" rx="0.5" fill="rgba(255,255,255,0.6)"/>
      <rect x="10" y="8" width="5" height="4" rx="0.5" fill="rgba(255,255,255,0.6)"/>
      <rect x="3" y="17" width="4" height="3" rx="1.5" fill="#1a1a1a"/>
      <rect x="17" y="17" width="4" height="3" rx="1.5" fill="#1a1a1a"/>
      <rect x="2" y="13" width="20" height="1.5" fill="rgba(0,0,0,0.15)"/>
    </g>
  </svg>`

function makeBusIcon(cor: string) {
  return L.divIcon({
    className: "",
    html: BUS_SVG(cor),
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  map.flyTo([lat, lng], 15, { duration: 1 })
  return null
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
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null)

  const { data: veiculos = [], isLoading } = useFrotaAtiva()

  const veiculoSel = veiculos.find(v => v.viagemId === selecionado)

  const handleSelecionar = (v: VeiculoAtivoDto) => {
    setSelecionado(v.viagemId)
    if (v.latitude && v.longitude) setFlyTarget({ lat: v.latitude, lng: v.longitude })
  }

  const cores = getCores(veiculos.length)

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-3">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Minha Frota"
          description={veiculos.length > 0 ? `${veiculos.length} veículo(s) em rota agora` : "Monitoramento em tempo real"}
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
          Atualiza a cada 15s
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Lista lateral */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
          ) : veiculos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm gap-2">
              <Radio className="h-8 w-8 opacity-30" />
              <p>Nenhum veículo em rota agora</p>
              <p className="text-xs opacity-60">Os motoristas aparecerão aqui ao iniciar uma viagem</p>
            </div>
          ) : (
            cores.map((cor, i) => {
              const v = veiculos[i]
              const ativo = selecionado === v.viagemId
              const semGps = !v.latitude || !v.longitude
              return (
                <button
                  key={v.viagemId}
                  onClick={() => handleSelecionar(v)}
                  className={`text-left rounded-xl border p-3 transition-colors ${ativo ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 bg-card"}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cor }} />
                    <span className="font-semibold text-sm truncate">{v.motoristaNome}</span>
                    {semGps && (
                      <span className="ml-auto text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        Aguardando GPS
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mb-1.5">
                    <MapPin className="h-3 w-3 inline mr-1 opacity-60" />
                    {v.rotaNome}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Bus className="h-3 w-3" />{turnoLabel(v.turno)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />{v.totalAlunos} aluno(s)
                    </span>
                  </div>
                  {v.ultimaAtualizacao && (
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      {tempoRelativo(v.ultimaAtualizacao)}
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Mapa */}
        <div className="flex-1 rounded-xl overflow-hidden border border-border">
          <MapContainer center={CENTER} zoom={5} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {flyTarget && <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} />}
            {cores.map((cor, i) => {
              const v = veiculos[i]
              if (!v.latitude || !v.longitude) return null
              return (
                <Marker key={v.viagemId} position={[v.latitude, v.longitude]} icon={makeBusIcon(cor)}>
                  <Popup>
                    <div className="text-sm space-y-1 min-w-[180px]">
                      <p className="font-bold">{v.motoristaNome}</p>
                      <p className="text-muted-foreground text-xs">{v.rotaNome}</p>
                      <p className="text-muted-foreground text-xs">{turnoLabel(v.turno)}</p>
                      <div className="flex gap-2 pt-1">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                          {v.totalAlunos} aluno(s)
                        </span>
                      </div>
                      {v.ultimaAtualizacao && (
                        <p className="text-[10px] text-muted-foreground pt-0.5">
                          GPS: {tempoRelativo(v.ultimaAtualizacao)}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>

        {/* Painel detalhe do selecionado */}
        {veiculoSel && (
          <div className="w-52 flex-shrink-0 flex flex-col gap-2">
            <Card>
              <CardContent className="p-3 space-y-2 text-sm">
                <p className="font-semibold truncate">{veiculoSel.motoristaNome}</p>
                <p className="text-muted-foreground text-xs truncate">{veiculoSel.rotaNome}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Bus className="h-3 w-3" /> {turnoLabel(veiculoSel.turno)}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" /> {veiculoSel.totalAlunos} aluno(s)
                </div>
                {veiculoSel.latitude && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {veiculoSel.latitude.toFixed(4)}, {veiculoSel.longitude?.toFixed(4)}
                  </div>
                )}
                {veiculoSel.ultimaAtualizacao && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {tempoRelativo(veiculoSel.ultimaAtualizacao)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
