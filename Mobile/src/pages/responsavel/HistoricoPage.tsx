import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, MapPin, X, Loader2 } from "lucide-react"
import { usePerfilResponsavel } from "@/hooks/useResponsaveis"
import { useCheckIns } from "@/hooks/useTransportes"
import { usePercursoViagem } from "@/hooks/useViagens"
import { MapaPercursoViagem } from "@/pages/transportes/MapaPercursoViagem"
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
  const navigate = useNavigate()
  const hoje = new Date().toISOString().slice(0, 10)
  const [data, setData] = useState(hoje)
  const [alunoId, setAlunoId] = useState("")
  const [viagemAbertaId, setViagemAbertaId] = useState<string | null>(null)

  const { data: perfil } = usePerfilResponsavel()
  const alunoIds = new Set(perfil?.alunos.map(a => a.id) ?? [])

  const { data: checkIns = [], isLoading } = useCheckIns(data)
  const { data: percurso, isLoading: loadingPercurso } = usePercursoViagem(viagemAbertaId)

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
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg active:bg-slate-100">
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Histórico</h2>
          <p className="text-xs text-slate-500">Embarques e desembarques dos seus filhos</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="date"
          value={data}
          onChange={e => setData(e.target.value)}
          className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={alunoId}
          onChange={e => setAlunoId(e.target.value)}
          className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Todos</option>
          {perfil?.alunos.map(a => (
            <option key={a.id} value={a.id}>{a.nome}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-100 h-16 animate-pulse" />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
          <p className="text-sm">Nenhum registro encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(grupos).map(([key, items]) => {
            const temViagem = key !== "__sem_viagem__"
            return (
              <div key={key} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                {temViagem && (
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-50 bg-slate-50/60">
                    <div>
                      <span className="text-sm font-bold text-slate-800">{turnoLabel(items[0].alunoTurno)}</span>
                      <span className="ml-2 text-xs text-slate-400">{grupoHorario(items)}</span>
                    </div>
                    <button
                      onClick={() => setViagemAbertaId(key)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-bold active:bg-primary/20"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      Ver Rota
                    </button>
                  </div>
                )}
                <div className="divide-y divide-slate-50">
                  {items.map(c => (
                    <div key={c.id} className="flex items-start gap-3 px-4 py-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${c.tipo === "Embarque" ? "bg-blue-500" : "bg-green-500"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-800 truncate">{c.alunoNome}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${c.tipo === "Embarque" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                            {c.tipo}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{formatHora(c.horaRegistro)}</p>
                        {c.endereco && (
                          <p className="text-xs text-slate-400 truncate">{c.endereco}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de rota fullscreen */}
      {viagemAbertaId && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
            <button
              onClick={() => setViagemAbertaId(null)}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 active:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm">
                {turnoLabel(checkinsViagemAberta[0]?.alunoTurno ?? "")}
              </p>
              <p className="text-xs text-slate-500">{grupoHorario(checkinsViagemAberta)}</p>
            </div>
          </div>
          <div className="flex-1 relative">
            {loadingPercurso ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
              </div>
            ) : !percurso || percurso.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
                <MapPin className="h-12 w-12 text-slate-300" />
                <p className="font-semibold text-slate-600">Rota sem dados GPS</p>
                <p className="text-xs text-slate-400">Esta viagem não possui rastreamento de rota disponível.</p>
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
