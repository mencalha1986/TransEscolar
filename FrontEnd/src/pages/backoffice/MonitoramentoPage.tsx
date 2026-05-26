import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import "@/lib/leaflet-config"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { backofficeService } from "@/services/backoffice.service"
import type { ViagemAtivaDto } from "@/types/monitoramento"
import { Bus, MapPin, Clock, Users, Radio, History } from "lucide-react"

const CENTER: [number, number] = [-15.7801, -47.9292]

const CORES = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16",
]

function makeIcon(cor: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${cor};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  map.flyTo([lat, lng], 14, { duration: 1 })
  return null
}

function formatHora(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function turnoLabel(t: string) {
  return t === "Manha" ? "Manhã" : t === "Tarde" ? "Tarde" : "Noturno"
}

// ── ABA TEMPO REAL ────────────────────────────────────────────────────────────

function AbaTempoReal() {
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null)

  const { data: viagens = [], isLoading } = useQuery({
    queryKey: ["monitoramento", "ativas"],
    queryFn: backofficeService.listarViagensAtivas,
    refetchInterval: 15_000,
  })

  const viagemSel = viagens.find(v => v.id === selecionado)

  const handleSelecionar = (v: ViagemAtivaDto) => {
    setSelecionado(v.id)
    if (v.latitude && v.longitude) setFlyTarget({ lat: v.latitude, lng: v.longitude })
  }

  return (
    <div className="flex gap-4 flex-1 min-h-0">
      {/* Lista lateral */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : viagens.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-2">
            <Radio className="h-8 w-8 opacity-30" />
            <p>Nenhuma viagem ativa agora</p>
          </div>
        ) : (
          viagens.map((v, i) => {
            const cor = CORES[i % CORES.length]
            const ativo = selecionado === v.id
            return (
              <button
                key={v.id}
                onClick={() => handleSelecionar(v)}
                className={`text-left rounded-xl border p-3 transition-colors ${ativo ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 bg-card"}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cor }} />
                  <span className="font-semibold text-sm truncate">{v.transportadorNome}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Bus className="h-3 w-3" />{turnoLabel(v.turno)}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatHora(v.iniciadaEm)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-xs">
                  <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                    {v.embarcados} emb.
                  </span>
                  <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                    {v.desembarcados} desemb.
                  </span>
                </div>
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
          {viagens.map((v, i) => {
            if (!v.latitude || !v.longitude) return null
            const cor = CORES[i % CORES.length]
            return (
              <Marker key={v.id} position={[v.latitude, v.longitude]} icon={makeIcon(cor)}>
                <Popup>
                  <div className="text-sm space-y-1 min-w-[180px]">
                    <p className="font-bold">{v.transportadorNome}</p>
                    <p className="text-muted-foreground">{turnoLabel(v.turno)} · iniciou {formatHora(v.iniciadaEm)}</p>
                    <div className="flex gap-2 pt-1">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{v.embarcados} embarcados</span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">{v.desembarcados} desembarcados</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Painel detalhe do selecionado */}
      {viagemSel && (
        <div className="w-56 flex-shrink-0 flex flex-col gap-2">
          <Card>
            <CardContent className="p-3 space-y-1 text-sm">
              <p className="font-semibold">{viagemSel.transportadorNome}</p>
              <p className="text-muted-foreground text-xs">{turnoLabel(viagemSel.turno)}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> Iniciou {formatHora(viagemSel.iniciadaEm)}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" /> {viagemSel.embarcados} emb. / {viagemSel.desembarcados} desemb.
              </div>
              {viagemSel.latitude && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {viagemSel.latitude.toFixed(4)}, {viagemSel.longitude?.toFixed(4)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// ── ABA HISTÓRICO ─────────────────────────────────────────────────────────────

function AbaHistorico() {
  const [transportadorId, setTransportadorId] = useState("")
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [buscar, setBuscar] = useState(false)

  const { data: transportadores = [] } = useQuery({
    queryKey: ["backoffice", "transportadores"],
    queryFn: backofficeService.listarTransportadores,
  })

  const { data: historico, isLoading, isFetching } = useQuery({
    queryKey: ["monitoramento", "historico", transportadorId, data],
    queryFn: () => backofficeService.obterHistoricoRota(transportadorId, data),
    enabled: buscar && !!transportadorId,
  })

  const handleBuscar = () => {
    if (!transportadorId) return
    setBuscar(true)
  }

  const todasViagens = historico?.viagens ?? []
  const todosCheckIns = todasViagens.flatMap(v => v.checkIns)
  const pontosComGps = todosCheckIns.filter(c => c.latitude && c.longitude)

  const mapCenter: [number, number] = pontosComGps.length > 0
    ? [pontosComGps[0].latitude!, pontosComGps[0].longitude!]
    : CENTER

  const polylinePoints: [number, number][] = pontosComGps.map(c => [c.latitude!, c.longitude!])

  return (
    <div className="flex gap-4 flex-1 min-h-0">
      {/* Filtros + tabela */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-3 overflow-y-auto pr-1">
        <div className="flex flex-col gap-2">
          <select
            className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={transportadorId}
            onChange={e => { setTransportadorId(e.target.value); setBuscar(false) }}
          >
            <option value="">Selecione um cliente</option>
            {transportadores.map(t => (
              <option key={t.id} value={t.id}>{t.nomeEmpresa}</option>
            ))}
          </select>
          <input
            type="date"
            className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={data}
            onChange={e => { setData(e.target.value); setBuscar(false) }}
          />
          <button
            onClick={handleBuscar}
            disabled={!transportadorId || isLoading || isFetching}
            className="h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
          >
            {(isLoading || isFetching) ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {/* Tabela de check-ins */}
        {buscar && historico && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {historico.transportadorNome} · {todosCheckIns.length} registros
            </p>
            {todasViagens.map(v => (
              <div key={v.id}>
                <p className="text-xs font-medium text-primary mb-1">
                  {turnoLabel(v.turno)} — {formatHora(v.iniciadaEm)} → {formatHora(v.concluidaEm)}
                </p>
                {v.checkIns.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Sem check-ins</p>
                ) : (
                  v.checkIns.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 py-1 border-b border-border last:border-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${c.tipo === "Embarque" ? "bg-blue-500" : "bg-green-500"}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{c.alunoNome}</p>
                        <p className="text-[10px] text-muted-foreground">{c.tipo} · {formatHora(c.horaRegistro)}</p>
                        {c.endereco && <p className="text-[10px] text-muted-foreground truncate">{c.endereco}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
            {todasViagens.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma viagem nesta data</p>
            )}
          </div>
        )}
      </div>

      {/* Mapa histórico */}
      <div className="flex-1 rounded-xl overflow-hidden border border-border">
        <MapContainer center={mapCenter} zoom={pontosComGps.length > 0 ? 13 : 5} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {polylinePoints.length > 1 && (
            <Polyline positions={polylinePoints} color="#3b82f6" weight={3} opacity={0.7} />
          )}
          {pontosComGps.map((c, i) => {
            const cor = c.tipo === "Embarque" ? "#3b82f6" : "#10b981"
            return (
              <Marker key={i} position={[c.latitude!, c.longitude!]} icon={makeIcon(cor)}>
                <Popup>
                  <div className="text-sm space-y-0.5">
                    <p className="font-bold">{c.alunoNome}</p>
                    <p className={c.tipo === "Embarque" ? "text-blue-600" : "text-green-600"}>{c.tipo}</p>
                    <p className="text-muted-foreground text-xs">{formatHora(c.horaRegistro)}</p>
                    {c.endereco && <p className="text-xs text-muted-foreground">{c.endereco}</p>}
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────────────────────────

export function MonitoramentoPage() {
  const [aba, setAba] = useState<"realtime" | "historico">("realtime")

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] gap-4">
      <div className="flex items-center justify-between">
        <PageHeader title="Monitoramento" description="Viagens em tempo real e histórico de rotas" />
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setAba("realtime")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${aba === "realtime" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Radio className="h-3.5 w-3.5" /> Tempo Real
          </button>
          <button
            onClick={() => setAba("historico")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${aba === "historico" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <History className="h-3.5 w-3.5" /> Histórico
          </button>
        </div>
      </div>

      {aba === "realtime" ? <AbaTempoReal /> : <AbaHistorico />}
    </div>
  )
}
