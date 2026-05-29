import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet"
import { useRef, useEffect } from "react"
import L from "leaflet"
import "@/lib/leaflet-config"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useViagemAtual, usePercurso, useResponsavelPerfil } from "@/hooks/useResponsavel"
import { listarCheckIns } from "@/services/transportes.service"
import { Bus, MapPin, Radio } from "lucide-react"

const CAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
  <filter id="s"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-opacity=".4"/></filter>
  <g filter="url(#s)">
    <rect x="2" y="9" width="20" height="9" rx="2" fill="#3b82f6"/>
    <path d="M5 9 L7 4 H17 L19 9Z" fill="#3b82f6"/>
    <rect x="3" y="16" width="4" height="3" rx="1.5" fill="#1a1a1a"/>
    <rect x="17" y="16" width="4" height="3" rx="1.5" fill="#1a1a1a"/>
    <rect x="7.5" y="5.5" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.55)"/>
    <rect x="12.5" y="5.5" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.55)"/>
  </g>
</svg>`

const carIcon = L.divIcon({ className: "", html: CAR_SVG, iconSize: [28, 28], iconAnchor: [14, 14] })

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  const prevRef = useRef<[number, number] | null>(null)

  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = [lat, lng]
    if (!prev) {
      map.flyTo([lat, lng], 14, { duration: 1 })
    } else if (prev[0] !== lat || prev[1] !== lng) {
      map.panTo([lat, lng], { animate: true, duration: 1 })
    }
  }, [lat, lng, map])

  return null
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

const CENTER: [number, number] = [-15.7801, -47.9292]

export function AcompanharPage() {
  const { data: viagem, isLoading: loadingViagem } = useViagemAtual()
  const { data: percurso = [] } = usePercurso(viagem?.status === "EmRota" ? viagem.id : undefined)
  const { data: perfil } = useResponsavelPerfil()

  const hoje = new Date().toISOString().slice(0, 10)
  const alunoIds = new Set(perfil?.alunos.map(a => a.id) ?? [])

  const { data: checkIns = [] } = useQuery({
    queryKey: ["checkins", hoje],
    queryFn: () => listarCheckIns(hoje),
    refetchInterval: 15_000,
    enabled: viagem?.status === "EmRota",
    placeholderData: keepPreviousData,
  })

  const checkInsFilhos = checkIns.filter(c => alunoIds.has(c.alunoId))
  const viagemAtiva = viagem?.status === "EmRota"
  const posAtual: [number, number] | null =
    viagemAtiva && viagem.latitudeAtual && viagem.longitudeAtual
      ? [viagem.latitudeAtual, viagem.longitudeAtual]
      : null

  const polylinePoints: [number, number][] = percurso.map(p => [p.latitude, p.longitude])

  if (loadingViagem) {
    return (
      <div>
        <PageHeader title="Acompanhar" description="Localização em tempo real do transporte" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Acompanhar" description="Localização em tempo real do transporte" />

      {!viagemAtiva ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-muted-foreground">
            <Radio className="h-10 w-10 opacity-30" />
            <p className="text-sm">Nenhuma viagem em andamento no momento.</p>
            <p className="text-xs opacity-70">A página atualiza automaticamente a cada 15 segundos.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Status badge */}
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Viagem em andamento — {viagem.turno === "Manha" ? "Manhã" : viagem.turno === "Tarde" ? "Tarde" : "Noturno"}
            </span>
          </div>

          {/* Mapa */}
          <div className="h-[400px] rounded-xl overflow-hidden border border-border">
            <MapContainer
              center={posAtual ?? CENTER}
              zoom={posAtual ? 14 : 5}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {posAtual && <FlyTo lat={posAtual[0]} lng={posAtual[1]} />}
              {polylinePoints.length > 1 && (
                <Polyline positions={polylinePoints} color="#3b82f6" weight={3} opacity={0.6} />
              )}
              {posAtual && (
                <Marker position={posAtual} icon={carIcon}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold flex items-center gap-1"><Bus className="h-3.5 w-3.5" /> Transporte escolar</p>
                      <p className="text-muted-foreground text-xs">Atualizado às {formatHora(new Date().toISOString())}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          {/* Check-ins dos filhos hoje */}
          {checkInsFilhos.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Registros de hoje
                </p>
                <div className="divide-y">
                  {checkInsFilhos.map(c => (
                    <div key={c.id} className="flex items-start gap-3 py-2 first:pt-0 last:pb-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${c.tipo === "Embarque" ? "bg-blue-500" : "bg-green-500"}`} />
                      <div>
                        <span className="text-sm font-medium">{c.alunoNome}</span>
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${c.tipo === "Embarque" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                          {c.tipo}
                        </span>
                        <p className="text-xs text-muted-foreground">{formatHora(c.horaRegistro)}{c.endereco ? ` — ${c.endereco}` : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
