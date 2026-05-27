import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useCheckIns, useRegistrarCheckIn } from "@/hooks/useTransportes"
import { useAlunos } from "@/hooks/useAlunos"
import type { CheckIn, TipoCheckIn } from "@/types/transporte"

const schema = z.object({
  alunoId: z.string().min(1, "Selecione um aluno"),
  tipo: z.enum(["Embarque", "Desembarque"]),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const CENTER: [number, number] = [-15.7801, -47.9292]

function MapFlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo(position, 15, { duration: 1.2 })
  }, [map, position])
  return null
}

export function TransportesPage() {
  const [sessionCheckIns, setSessionCheckIns] = useState<CheckIn[]>([])
  const [gpsPos, setGpsPos] = useState<[number, number] | null>(null)
  const [filtroAluno, setFiltroAluno] = useState("")
  const [filtroTurno, setFiltroTurno] = useState("")
  const [filtroDia, setFiltroDia] = useState("")

  const { mutateAsync, isPending } = useRegistrarCheckIn()
  const { data: alunos } = useAlunos()
  const { data: historico, isLoading: loadingHistorico } = useCheckIns()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { alunoId: "", tipo: "Embarque" as TipoCheckIn },
  })

  const tipo = watch("tipo")
  const alunoId = watch("alunoId")
  const alunoSelecionado = alunos?.find(a => a.id === alunoId)

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude", String(pos.coords.latitude))
        setValue("longitude", String(pos.coords.longitude))
        setGpsPos([pos.coords.latitude, pos.coords.longitude])
      },
      () => { /* silencioso — o usuário pode usar o botão manualmente */ }
    )
  }, [])

  const historicoFiltrado = useMemo(() => {
    return (historico ?? []).filter((c) => {
      if (filtroAluno && !c.alunoNome.toLowerCase().includes(filtroAluno.toLowerCase())) return false
      if (filtroTurno && c.alunoTurno !== filtroTurno) return false
      if (filtroDia) {
        const dia = new Date(c.horaRegistro).toISOString().slice(0, 10)
        if (dia !== filtroDia) return false
      }
      return true
    })
  }, [historico, filtroAluno, filtroTurno, filtroDia])

  function usarGPS() {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada neste navegador")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude", String(pos.coords.latitude))
        setValue("longitude", String(pos.coords.longitude))
        setGpsPos([pos.coords.latitude, pos.coords.longitude])
        toast.success("Localização capturada!")
      },
      () => toast.error("Não foi possível obter a localização")
    )
  }

  async function onSubmit(values: FormValues) {
    const lat = values.latitude ? parseFloat(values.latitude) : null
    const lng = values.longitude ? parseFloat(values.longitude) : null
    try {
      const result = await mutateAsync({
        alunoId: values.alunoId,
        tipo: values.tipo as TipoCheckIn,
        latitude: lat,
        longitude: lng,
      })
      setSessionCheckIns((prev) => [...prev, result])
      toast.success(`Check-in de ${values.tipo} registrado!`)
      reset({ alunoId: "", tipo: "Embarque" })
    } catch (err) {
      toast.error((err as Error).message ?? "Não foi possível registrar o check-in.")
    }
  }

  const markersWithCoords = sessionCheckIns.filter((c) => c.latitude != null && c.longitude != null)

  return (
    <div className="space-y-6">
      <PageHeader title="Transportes" description="Registrar embarques e desembarques" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Formulário */}
        <Card className="self-start">
          <CardHeader className="pb-3">
            <CardTitle>Registrar Check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1">
                <Label>Aluno</Label>
                <Select onValueChange={(v: string | null) => { if (v) setValue("alunoId", v) }}>
                  <SelectTrigger>
                    <span className="flex flex-1 text-left text-sm truncate">
                      {alunoSelecionado
                        ? alunoSelecionado.nome
                        : <span className="text-muted-foreground">Selecione o aluno...</span>}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {(alunos ?? []).map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.alunoId && <p className="text-destructive text-sm">{errors.alunoId.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={(v: string | null) => { if (v) setValue("tipo", v as TipoCheckIn) }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Embarque">Embarque</SelectItem>
                    <SelectItem value="Desembarque">Desembarque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Latitude</Label>
                  <Input type="number" step="any" {...register("latitude")} placeholder="-15.78" />
                </div>
                <div className="space-y-1">
                  <Label>Longitude</Label>
                  <Input type="number" step="any" {...register("longitude")} placeholder="-47.93" />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={usarGPS}>
                  📍 Usar GPS
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending ? "Registrando..." : "Registrar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Mapa */}
        <Card className="self-start">
          <CardHeader className="pb-3">
            <CardTitle>Mapa de Check-ins</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden rounded-b-lg">
            <MapContainer center={CENTER} zoom={5} style={{ height: 300, width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapFlyTo position={gpsPos} />
              {gpsPos && (
                <Marker position={gpsPos}>
                  <Popup>Sua localização atual</Popup>
                </Marker>
              )}
              {markersWithCoords.map((c) => (
                <Marker key={c.id} position={[c.latitude!, c.longitude!]}>
                  <Popup>
                    <strong>{c.tipo}</strong><br />
                    {c.alunoNome ?? c.alunoId}<br />
                    {new Date(c.dataHora).toLocaleString("pt-BR")}
                    {c.endereco && <><br /><span style={{ fontSize: "0.75rem", color: "#64748b" }}>{c.endereco}</span></>}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </CardContent>
        </Card>
      </div>

      {/* Histórico */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Histórico de Check-ins</CardTitle>
          <div className="flex flex-wrap gap-3 pt-2">
            <Input
              placeholder="Buscar aluno..."
              value={filtroAluno}
              onChange={(e) => setFiltroAluno(e.target.value)}
              className="max-w-48"
            />
            <Select value={filtroTurno} onValueChange={(v: string | null) => setFiltroTurno(v ?? "")}>
              <SelectTrigger className="max-w-40">
                <SelectValue placeholder="Turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os turnos</SelectItem>
                <SelectItem value="Manha">Manha</SelectItem>
                <SelectItem value="Tarde">Tarde</SelectItem>
                <SelectItem value="Noturno">Noturno</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filtroDia}
              onChange={(e) => setFiltroDia(e.target.value)}
              className="max-w-44"
            />
            {(filtroAluno || filtroTurno || filtroDia) && (
              <Button variant="ghost" size="sm" onClick={() => { setFiltroAluno(""); setFiltroTurno(""); setFiltroDia("") }}>
                Limpar filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Data / Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingHistorico ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  </TableRow>
                ))
              ) : historicoFiltrado.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    Nenhum check-in encontrado
                  </TableCell>
                </TableRow>
              ) : (
                historicoFiltrado.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.alunoNome}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{c.alunoTurno}</TableCell>
                    <TableCell>
                      <span className={c.tipo === "Embarque" ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                        {c.tipo}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-xs truncate" title={c.endereco ?? ""}>
                      {c.endereco ?? <span className="text-slate-300">—</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(c.horaRegistro).toLocaleString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
