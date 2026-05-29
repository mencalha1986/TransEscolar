import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useResponsavelPerfil } from "@/hooks/useResponsavel"
import { listarCheckIns } from "@/services/transportes.service"
import { obterPercurso } from "@/services/viagens.service"
import { MapaPercursoViagem } from "@/components/MapaPercursoViagem"
import { MapPin, X, Loader2 } from "lucide-react"
import type { CheckInDto } from "@/types/transporte"

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function turnoLabel(t: string) {
  return t === "Manha" ? "Manhã" : t === "Tarde" ? "Tarde" : "Noturno"
}

function grupoHorario(checkins: CheckInDto[]) {
  const horas = checkins.map(c => new Date(c.horaRegistro).getTime())
  const min = new Date(Math.min(...horas)).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  const max = new Date(Math.max(...horas)).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  return min === max ? min : `${min} → ${max}`
}

export function HistoricoPage() {
  const hoje = new Date().toISOString().slice(0, 10)
  const [data, setData] = useState(hoje)
  const [alunoId, setAlunoId] = useState("")
  const [viagemAbertaId, setViagemAbertaId] = useState<string | null>(null)

  const { data: perfil } = useResponsavelPerfil()
  const alunoIds = new Set(perfil?.alunos.map(a => a.id) ?? [])

  const { data: checkIns = [], isLoading } = useQuery({
    queryKey: ["checkins", data],
    queryFn: () => listarCheckIns(data),
    enabled: !!data,
  })

  const { data: percurso = [], isLoading: loadingPercurso } = useQuery({
    queryKey: ["viagem-percurso-historico", viagemAbertaId],
    queryFn: () => obterPercurso(viagemAbertaId!),
    enabled: !!viagemAbertaId,
    staleTime: Infinity,
  })

  const filtrados = checkIns.filter(c => {
    const doFilho = alunoIds.has(c.alunoId)
    const doSelecionado = !alunoId || c.alunoId === alunoId
    return doFilho && doSelecionado
  })

  const grupos = filtrados.reduce((acc, c) => {
    const key = c.viagemId ?? "__sem_viagem__"
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {} as Record<string, CheckInDto[]>)

  const checkinsViagemAberta = viagemAbertaId ? (grupos[viagemAbertaId] ?? []) : []

  return (
    <div>
      <PageHeader title="Histórico" description="Registro de embarques e desembarques dos seus filhos" />

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="date"
          value={data}
          onChange={e => setData(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={alunoId}
          onChange={e => setAlunoId(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Todos os filhos</option>
          {perfil?.alunos.map(a => (
            <option key={a.id} value={a.id}>{a.nome}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : filtrados.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Nenhum registro encontrado para esta data.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {Object.entries(grupos).map(([key, items]) => {
            const temViagem = key !== "__sem_viagem__"
            const turno = turnoLabel(items[0].alunoTurno)
            return (
              <Card key={key}>
                <CardContent className="p-0">
                  {temViagem && (
                    <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30 rounded-t-lg">
                      <div>
                        <span className="text-sm font-semibold">{turno}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{grupoHorario(items)}</span>
                      </div>
                      <button
                        onClick={() => setViagemAbertaId(key)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:bg-primary/10 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Ver Rota
                      </button>
                    </div>
                  )}
                  <div className="divide-y">
                    {items.map(c => (
                      <div key={c.id} className="flex items-start gap-3 px-4 py-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${c.tipo === "Embarque" ? "bg-blue-500" : "bg-green-500"}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm">{c.alunoNome}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${c.tipo === "Embarque" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                              {c.tipo}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{formatHora(c.horaRegistro)}</p>
                          {c.endereco && (
                            <p className="text-xs text-muted-foreground truncate">{c.endereco}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal de rota */}
      {viagemAbertaId && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center gap-3 px-4 py-3 border-b bg-white shadow-sm">
            <button
              onClick={() => setViagemAbertaId(null)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">
                {turnoLabel(checkinsViagemAberta[0]?.alunoTurno ?? "")}
              </p>
              <p className="text-xs text-muted-foreground">{grupoHorario(checkinsViagemAberta)}</p>
            </div>
          </div>
          <div className="flex-1 relative">
            {loadingPercurso ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
              </div>
            ) : percurso.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground/30" />
                <p className="font-semibold text-muted-foreground">Rota sem dados GPS</p>
                <p className="text-xs text-muted-foreground">Esta viagem não possui rastreamento de rota disponível.</p>
              </div>
            ) : (
              <MapaPercursoViagem percurso={percurso} checkins={checkinsViagemAberta} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
