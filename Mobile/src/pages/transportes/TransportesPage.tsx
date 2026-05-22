import { useState } from "react"
import { useAlunos } from "@/hooks/useAlunos"
import { useRegistrarCheckIn, useCheckIns } from "@/hooks/useTransportes"
import { useGeolocation } from "@/hooks/useGeolocation"
import { Bus, Loader2, Map as MapIcon, UserPlus, UserMinus, List, Search, X } from "lucide-react"
import { toast } from "sonner"
import { MapaViagem } from "./MapaViagem"

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function formatDateBR(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR")
}

export function TransportesPage() {
  const [view, setView] = useState<"lista" | "mapa" | "historico">("lista")
  const [searchHistorico, setSearchHistorico] = useState("")
  const [turnoFiltro, setTurnoFiltro] = useState("")
  const [dataFiltro, setDataFiltro] = useState("")

  const { data: alunos, isLoading: loadingAlunos } = useAlunos()
  const { data: checkins, isLoading: loadingCheckins } = useCheckIns()
  const { mutate: registrar, isPending: isRegistering } = useRegistrarCheckIn()
  const { getCurrentPosition, loading: isGettingLocation } = useGeolocation()

  const handleRegistro = async (alunoId: string, nome: string, tipo: "Embarque" | "Desembarque") => {
    if (isRegistering || isGettingLocation) return
    try {
      toast.loading(`Registrando ${tipo}...`, { id: "gps-status" })
      const location = await getCurrentPosition()
      registrar(
        { alunoId, tipo, latitude: location?.latitude, longitude: location?.longitude },
        {
          onSuccess: () => toast.success(`${tipo} de ${nome} registrado!`, { id: "gps-status" }),
          onError: (err: unknown) => toast.error("Erro: " + (err as Error).message, { id: "gps-status" }),
        }
      )
    } catch {
      toast.error("Falha ao obter GPS.", { id: "gps-status" })
    }
  }

  const checkinsHoje =
    checkins?.filter(c => new Date(c.horaRegistro).toDateString() === new Date().toDateString()) ?? []

  const checkinsHistorico = checkins?.filter(c => {
    const matchSearch =
      !searchHistorico ||
      c.alunoNome.toLowerCase().includes(searchHistorico.toLowerCase())
    const matchTurno = !turnoFiltro || c.alunoTurno === turnoFiltro
    const matchData = !dataFiltro || formatDateBR(c.horaRegistro) === formatDateBR(dataFiltro + "T00:00:00")
    return matchSearch && matchTurno && matchData
  }) ?? []

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header com tabs */}
      <div className="p-4 bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Viagens</h2>
            <p className="text-xs text-slate-500">Embarque, mapa e histórico</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("lista")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              view === "lista" ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Bus className="h-4 w-4" />
            Embarque
          </button>
          <button
            onClick={() => setView("mapa")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              view === "mapa" ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <MapIcon className="h-4 w-4" />
            Mapa
          </button>
          <button
            onClick={() => setView("historico")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              view === "historico" ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <List className="h-4 w-4" />
            Histórico
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Vista lista - embarque */}
        {view === "lista" && (
          <div className="p-4 space-y-3">
            {loadingAlunos ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
              </div>
            ) : (
              alunos?.map(aluno => {
                const ultimoCheckin = checkinsHoje
                  .filter(c => c.alunoId === aluno.id)
                  .sort((a, b) => new Date(b.horaRegistro).getTime() - new Date(a.horaRegistro).getTime())[0]

                const status = ultimoCheckin?.tipo || "Pendente"

                return (
                  <div
                    key={aluno.id}
                    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                          status === "Embarque"
                            ? "bg-blue-100 text-blue-600"
                            : status === "Desembarque"
                            ? "bg-green-100 text-green-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {aluno.nome.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{aluno.nome}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-medium">
                          {aluno.escolaNome} • {aluno.turno}
                        </p>
                      </div>
                      <div
                        className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                          status === "Embarque"
                            ? "bg-blue-50 text-blue-600"
                            : status === "Desembarque"
                            ? "bg-green-50 text-green-600"
                            : "bg-slate-50 text-slate-400"
                        }`}
                      >
                        {status.toUpperCase()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleRegistro(aluno.id, aluno.nome, "Embarque")}
                        disabled={status === "Embarque" || isRegistering || isGettingLocation}
                        className="flex items-center justify-center gap-2 h-10 rounded-xl border border-blue-200 text-blue-600 text-xs font-bold active:bg-blue-50 disabled:opacity-30"
                      >
                        <UserPlus className="h-4 w-4" />
                        Embarcar
                      </button>
                      <button
                        onClick={() => handleRegistro(aluno.id, aluno.nome, "Desembarque")}
                        disabled={status !== "Embarque" || isRegistering || isGettingLocation}
                        className="flex items-center justify-center gap-2 h-10 rounded-xl border border-green-200 text-green-600 text-xs font-bold active:bg-green-50 disabled:opacity-30"
                      >
                        <UserMinus className="h-4 w-4" />
                        Desembarcar
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Vista mapa */}
        {view === "mapa" && (
          <div className="h-full">
            <MapaViagem checkins={checkinsHoje} />
          </div>
        )}

        {/* Vista histórico */}
        {view === "historico" && (
          <div className="p-4 space-y-3">
            {/* Filtros */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar aluno..."
                  className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  value={searchHistorico}
                  onChange={e => setSearchHistorico(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none"
                  value={turnoFiltro}
                  onChange={e => setTurnoFiltro(e.target.value)}
                >
                  <option value="">Todos os turnos</option>
                  <option value="Manha">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noturno">Noturno</option>
                </select>
                <input
                  type="date"
                  className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none"
                  value={dataFiltro}
                  onChange={e => setDataFiltro(e.target.value)}
                />
              </div>
              {(searchHistorico || turnoFiltro || dataFiltro) && (
                <button
                  onClick={() => {
                    setSearchHistorico("")
                    setTurnoFiltro("")
                    setDataFiltro("")
                  }}
                  className="flex items-center gap-1 text-xs text-slate-500 active:opacity-70"
                >
                  <X className="h-3.5 w-3.5" />
                  Limpar filtros
                </button>
              )}
            </div>

            {loadingCheckins ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
              </div>
            ) : checkinsHistorico.length === 0 ? (
              <div className="py-10 text-center text-slate-500">Nenhum registro encontrado.</div>
            ) : (
              checkinsHistorico
                .slice()
                .sort((a, b) => new Date(b.horaRegistro).getTime() - new Date(a.horaRegistro).getTime())
                .map(c => (
                  <div
                    key={c.id}
                    className={`bg-white rounded-xl border p-3 flex items-center gap-3 ${
                      c.tipo === "Embarque" ? "border-blue-100" : "border-green-100"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        c.tipo === "Embarque" ? "bg-blue-500" : "bg-green-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{c.alunoNome}</p>
                      <p className="text-xs text-slate-500">{c.alunoTurno}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.tipo === "Embarque"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {c.tipo.toUpperCase()}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDateBR(c.horaRegistro)} {formatTime(c.horaRegistro)}
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
