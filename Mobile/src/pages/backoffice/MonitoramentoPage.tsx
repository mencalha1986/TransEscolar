import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Bus, MapPin, Users, RefreshCw } from "lucide-react"
import { useViagensAtivas, useTransportadores, useHistoricoRota } from "@/hooks/useBackoffice"

function formatTime(dateStr?: string) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

const TURNO_COLORS: Record<string, string> = {
  Manha: "bg-yellow-100 text-yellow-700",
  Tarde: "bg-orange-100 text-orange-700",
  Noturno: "bg-indigo-100 text-indigo-700",
}

const TURNO_LABELS: Record<string, string> = {
  Manha: "Manhã",
  Tarde: "Tarde",
  Noturno: "Noturno",
}

function HistoricoSection() {
  const { data: transportadores } = useTransportadores()
  const [transportadorId, setTransportadorId] = useState("")
  const [data, setData] = useState(() => new Date().toISOString().split("T")[0])

  const { data: historico, isLoading } = useHistoricoRota(transportadorId, data)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Histórico de Rotas</h3>
      <div className="space-y-2">
        <select
          value={transportadorId}
          onChange={e => setTransportadorId(e.target.value)}
          className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm bg-white"
        >
          <option value="">Selecione um transportador</option>
          {transportadores?.map(t => (
            <option key={t.id} value={t.id}>{t.nomeEmpresa}</option>
          ))}
        </select>
        <input
          type="date"
          value={data}
          onChange={e => setData(e.target.value)}
          className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm"
        />
      </div>

      {!transportadorId ? (
        <p className="text-sm text-slate-400 text-center py-4">Selecione um transportador para ver o histórico.</p>
      ) : isLoading ? (
        <p className="text-sm text-slate-400 text-center py-4">Carregando...</p>
      ) : historico?.viagens.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">Nenhuma viagem encontrada para esta data.</p>
      ) : (
        <div className="space-y-3">
          {historico?.viagens.map(viagem => (
            <div key={viagem.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TURNO_COLORS[viagem.turno] ?? "bg-slate-100 text-slate-600"}`}>
                    {TURNO_LABELS[viagem.turno] ?? viagem.turno}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${viagem.status === "Concluida" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {viagem.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {formatTime(viagem.iniciadaEm)} – {formatTime(viagem.concluidaEm)}
                </p>
              </div>
              {viagem.checkIns.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500">{viagem.checkIns.length} check-in{viagem.checkIns.length !== 1 ? "s" : ""}</p>
                  {viagem.checkIns.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${c.tipo === "Embarque" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                        {c.tipo}
                      </span>
                      <span className="font-medium text-slate-800 truncate">{c.alunoNome}</span>
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-auto">{formatDate(c.horaRegistro)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function MonitoramentoPage() {
  const navigate = useNavigate()
  const { data: viagens, isLoading, refetch, isFetching } = useViagensAtivas()

  return (
    <div className="pb-8">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b sticky top-0 z-10">
        <button
          onClick={() => navigate("/backoffice")}
          className="text-slate-600 active:opacity-70"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 flex-1">Monitoramento</h1>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-slate-500 active:opacity-70 disabled:opacity-40"
        >
          <RefreshCw className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Viagens ativas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Viagens em Andamento</h3>
            {viagens && (
              <span className="text-xs text-slate-400">{viagens.length} ativa{viagens.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : viagens?.length === 0 ? (
            <div className="py-8 text-center">
              <Bus className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Nenhuma viagem em andamento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {viagens?.map(v => (
                <div key={v.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-blue-50 rounded-xl">
                        <Bus className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{v.transportadorNome}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TURNO_COLORS[v.turno] ?? "bg-slate-100 text-slate-600"}`}>
                          {TURNO_LABELS[v.turno] ?? v.turno}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 flex-shrink-0">{formatTime(v.iniciadaEm)}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span>{v.embarcados} a bordo</span>
                    </div>
                    {v.latitude && v.longitude && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="font-mono text-xs">{v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-2">
          <HistoricoSection />
        </div>
      </div>
    </div>
  )
}
