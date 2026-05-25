import { useState, useEffect, useRef } from "react"
import { useAlunos } from "@/hooks/useAlunos"
import { useRegistrarCheckIn, useCheckIns } from "@/hooks/useTransportes"
import { useViagemAtual, useIniciarViagem, useAtualizarPosicao, useEncerrarViagem } from "@/hooks/useViagens"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useAuth } from "@/contexts/AuthContext"
import {
  Bus, Loader2, Map as MapIcon, UserPlus, UserMinus, List,
  Search, X, Navigation, CheckCircle, LogOut
} from "lucide-react"
import { toast } from "sonner"
import { MapaViagem } from "./MapaViagem"
import type { TurnoAluno } from "@/types/viagem"

const GPS_INTERVAL_MS = 15_000

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function formatDateBR(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR")
}

function turnoLabel(t: string) {
  return t === "Manha" ? "Manhã" : t === "Tarde" ? "Tarde" : "Noturno"
}

export function TransportesPage() {
  const { user } = useAuth()
  const isMotorista = user?.perfil === "Admin" || user?.perfil === "Motorista"

  const [view, setView] = useState<"lista" | "mapa" | "historico">("lista")
  const [searchHistorico, setSearchHistorico] = useState("")
  const [turnoFiltro, setTurnoFiltro] = useState("")
  const [dataFiltro, setDataFiltro] = useState("")
  const [turnoSelecionado, setTurnoSelecionado] = useState<TurnoAluno>("Manha")
  const [showTurnoModal, setShowTurnoModal] = useState(false)

  const { data: alunos, isLoading: loadingAlunos } = useAlunos()
  const { data: checkins, isLoading: loadingCheckins } = useCheckIns()
  const { data: viagemAtual, isLoading: loadingViagem } = useViagemAtual()
  const { mutate: registrar, isPending: isRegistering } = useRegistrarCheckIn()
  const { mutate: iniciarViagem, isPending: isIniciando } = useIniciarViagem()
  const { mutate: atualizarPosicao } = useAtualizarPosicao()
  const { mutate: encerrarViagem, isPending: isEncerrando } = useEncerrarViagem()
  const { getCurrentPosition, loading: isGettingLocation } = useGeolocation()

  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // GPS loop quando viagem EmRota (apenas motoristas)
  useEffect(() => {
    if (!isMotorista || !viagemAtual || viagemAtual.status !== "EmRota") {
      if (gpsIntervalRef.current) {
        clearInterval(gpsIntervalRef.current)
        gpsIntervalRef.current = null
      }
      return
    }

    const sendPos = async () => {
      const pos = await getCurrentPosition()
      if (pos && viagemAtual?.id) {
        atualizarPosicao({
          viagemId: viagemAtual.id,
          latitude: pos.latitude,
          longitude: pos.longitude,
        })
      }
    }

    sendPos()
    gpsIntervalRef.current = setInterval(sendPos, GPS_INTERVAL_MS)

    return () => {
      if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current)
    }
  }, [viagemAtual?.id, viagemAtual?.status, isMotorista])

  const handleSairDeCasa = () => {
    setShowTurnoModal(true)
  }

  const confirmarSaida = () => {
    setShowTurnoModal(false)
    iniciarViagem(
      { turno: turnoSelecionado },
      {
        onSuccess: () => toast.success(`Viagem do turno ${turnoLabel(turnoSelecionado)} iniciada! Responsáveis notificados.`),
        onError: (err: unknown) => toast.error("Erro: " + (err as Error).message),
      }
    )
  }

  const handleEncerrar = () => {
    if (!viagemAtual) return
    encerrarViagem(viagemAtual.id, {
      onSuccess: () => toast.success("Trajeto encerrado! Responsáveis notificados."),
      onError: (err: unknown) => toast.error("Erro: " + (err as Error).message),
    })
  }

  const handleRegistro = async (alunoId: string, nome: string, tipo: "Embarque" | "Desembarque") => {
    if (isRegistering || isGettingLocation) return
    try {
      toast.loading(`Registrando ${tipo}...`, { id: "gps-status" })
      const location = await getCurrentPosition()
      registrar(
        { alunoId, tipo, latitude: location?.latitude, longitude: location?.longitude },
        {
          onSuccess: (result) => {
            const msg = result.endereco
              ? `${tipo} de ${nome}\n📍 ${result.endereco}`
              : `${tipo} de ${nome} registrado!`
            toast.success(msg, { id: "gps-status" })
          },
          onError: (err: unknown) => toast.error("Erro: " + (err as Error).message, { id: "gps-status" }),
        }
      )
    } catch {
      toast.error("Falha ao obter GPS.", { id: "gps-status" })
    }
  }

  const checkinsHoje = checkins ?? []

  const alunosDoTurno = viagemAtual
    ? alunos?.filter(a => a.turno === viagemAtual.turno) ?? []
    : alunos ?? []

  const checkinsHistorico = checkins?.filter(c => {
    const matchSearch = !searchHistorico || c.alunoNome.toLowerCase().includes(searchHistorico.toLowerCase())
    const matchTurno = !turnoFiltro || c.alunoTurno === turnoFiltro
    const matchData = !dataFiltro || formatDateBR(c.horaRegistro) === formatDateBR(dataFiltro + "T00:00:00")
    return matchSearch && matchTurno && matchData
  }) ?? []

  const posicaoMotorista =
    viagemAtual?.latitudeAtual && viagemAtual?.longitudeAtual
      ? { lat: viagemAtual.latitudeAtual, lng: viagemAtual.longitudeAtual }
      : null

  const todosDesembarcados =
    alunosDoTurno.length > 0 &&
    alunosDoTurno.every(a =>
      checkinsHoje.some(c => c.alunoId === a.id && c.tipo === "Desembarque")
    )

  if (loadingViagem) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Modal seleção de turno */}
      {showTurnoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 text-center">Qual turno vai sair agora?</h3>
            <div className="space-y-2">
              {(["Manha", "Tarde", "Noturno"] as TurnoAluno[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTurnoSelecionado(t)}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                    turnoSelecionado === t
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {turnoLabel(t)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTurnoModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarSaida}
                disabled={isIniciando}
                className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50"
              >
                {isIniciando ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : "Sair de Casa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Viagens</h2>
            {viagemAtual ? (
              <p className="text-xs font-medium text-amber-600">
                🚌 Em rota — Turno {turnoLabel(viagemAtual.turno)}
              </p>
            ) : (
              <p className="text-xs text-slate-500">Embarque, mapa e histórico</p>
            )}
          </div>

          {/* Botão Sair de Casa / Encerrar — só para motoristas */}
          {isMotorista && (
            <>
              {!viagemAtual && (
                <button
                  onClick={handleSairDeCasa}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  <Navigation className="h-4 w-4" />
                  Sair de Casa
                </button>
              )}
              {viagemAtual && (
                <button
                  onClick={handleEncerrar}
                  disabled={isEncerrando || !todosDesembarcados}
                  title={!todosDesembarcados ? "Todos os alunos precisam ser desembarcados primeiro" : ""}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-bold disabled:opacity-40 shadow-sm"
                >
                  {isEncerrando ? <Loader2 className="animate-spin h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                  Encerrar
                </button>
              )}
            </>
          )}
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
        {/* Vista lista — embarque */}
        {view === "lista" && (
          <div className="p-4 space-y-3">
            {/* Banner de viagem não iniciada (responsáveis) */}
            {!isMotorista && !viagemAtual && (
              <div className="bg-slate-100 rounded-2xl p-4 text-center text-slate-500 text-sm">
                O transporte ainda não saiu. Aguarde a notificação.
              </div>
            )}

            {/* Banner de viagem em andamento (responsáveis) */}
            {!isMotorista && viagemAtual && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl">🚌</span>
                <div>
                  <p className="font-bold text-amber-800 text-sm">Transporte a caminho!</p>
                  <p className="text-xs text-amber-600">Turno {turnoLabel(viagemAtual.turno)} — saiu às {viagemAtual.iniciadaEm ? formatTime(viagemAtual.iniciadaEm) : "--"}</p>
                </div>
              </div>
            )}

            {/* Banner viagem não iniciada (motorista) */}
            {isMotorista && !viagemAtual && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center space-y-2">
                <p className="text-blue-700 font-semibold text-sm">Pronto para iniciar?</p>
                <p className="text-xs text-blue-500">Toque em "Sair de Casa" para notificar os responsáveis e iniciar o rastreamento.</p>
              </div>
            )}

            {loadingAlunos ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
              </div>
            ) : (
              (viagemAtual ? alunosDoTurno : alunos ?? []).map(aluno => {
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
                        {status === "Desembarque" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          aluno.nome.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{aluno.nome}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-medium">
                          {aluno.escolaNome} • {aluno.turno}
                        </p>
                        {ultimoCheckin?.endereco && (
                          <p className="text-[9px] text-slate-400 truncate mt-0.5">{ultimoCheckin.endereco}</p>
                        )}
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

                    {isMotorista && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleRegistro(aluno.id, aluno.nome, "Embarque")}
                          disabled={!viagemAtual || status === "Embarque" || isRegistering || isGettingLocation}
                          className="flex items-center justify-center gap-2 h-10 rounded-xl border border-blue-200 text-blue-600 text-xs font-bold active:bg-blue-50 disabled:opacity-30"
                        >
                          <UserPlus className="h-4 w-4" />
                          Embarcar
                        </button>
                        <button
                          onClick={() => handleRegistro(aluno.id, aluno.nome, "Desembarque")}
                          disabled={!viagemAtual || status !== "Embarque" || isRegistering || isGettingLocation}
                          className="flex items-center justify-center gap-2 h-10 rounded-xl border border-green-200 text-green-600 text-xs font-bold active:bg-green-50 disabled:opacity-30"
                        >
                          <UserMinus className="h-4 w-4" />
                          Desembarcar
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Vista mapa */}
        {view === "mapa" && (
          <div className="h-full">
            <MapaViagem checkins={checkinsHoje} posicaoMotorista={posicaoMotorista} />
          </div>
        )}

        {/* Vista histórico */}
        {view === "historico" && (
          <div className="p-4 space-y-3">
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
                  onClick={() => { setSearchHistorico(""); setTurnoFiltro(""); setDataFiltro("") }}
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
                    className={`bg-white rounded-xl border p-3 flex items-start gap-3 ${
                      c.tipo === "Embarque" ? "border-blue-100" : "border-green-100"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                        c.tipo === "Embarque" ? "bg-blue-500" : "bg-green-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{c.alunoNome}</p>
                      <p className="text-xs text-slate-500">{c.alunoTurno}</p>
                      {c.endereco && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.endereco}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.tipo === "Embarque" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
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
