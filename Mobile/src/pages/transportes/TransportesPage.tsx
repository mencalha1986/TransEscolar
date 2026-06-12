import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { rotaService } from "@/services/rota.service"
import type { Rota } from "@/types/rota"
import { useAlunos } from "@/hooks/useAlunos"
import { useRegistrarCheckIn, useCheckIns } from "@/hooks/useTransportes"
import { useViagemAtual, useIniciarViagem, useAtualizarPosicao, useEncerrarViagem, useViagensHistorico, usePercursoViagem } from "@/hooks/useViagens"
import { usePerfilResponsavel } from "@/hooks/useResponsaveis"
import { useFaltas, useDarCienciaFalta } from "@/hooks/useFaltas"
import { useGeolocation } from "@/hooks/useGeolocation"
import { useAuth } from "@/contexts/AuthContext"
import {
  Bus, Loader2, Map as MapIcon, UserPlus, UserMinus, List,
  Navigation, CheckCircle, LogOut, MapPin, ChevronRight, X, AlertTriangle
} from "lucide-react"
import { toast } from "sonner"
import { MapaViagem } from "./MapaViagem"
import { MapaPercursoViagem } from "./MapaPercursoViagem"
import type { TurnoAluno, ViagemDto } from "@/types/viagem"
import type { CheckInDto } from "@/types/transporte"

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

function statusAluno(alunoId: string, checkinsHoje: CheckInDto[]) {
  const deste = checkinsHoje
    .filter(c => c.alunoId === alunoId)
    .sort((a, b) => new Date(b.horaRegistro).getTime() - new Date(a.horaRegistro).getTime())
  const ultimo = deste[0]
  if (!ultimo) return "aguardando"
  if (ultimo.tipo === "Embarque") return "embarcado"
  return "desembarcado"
}

// ── VIEW RESPONSÁVEL ────────────────────────────────────────────────────────

function ViewResponsavel({ checkinsHoje, viagemAtual }: {
  checkinsHoje: CheckInDto[]
  viagemAtual: ReturnType<typeof useViagemAtual>["data"]
}) {
  const { data: perfil, isLoading } = usePerfilResponsavel()

  if (isLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
  }

  if (!perfil || perfil.alunos.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        Nenhum aluno associado ao seu perfil.
      </div>
    )
  }

  // Para cada filho: calcular estado
  const filhos = perfil.alunos.map(aluno => {
    const status = statusAluno(aluno.id, checkinsHoje)
    const checkinsFilho = checkinsHoje
      .filter(c => c.alunoId === aluno.id)
      .sort((a, b) => new Date(a.horaRegistro).getTime() - new Date(b.horaRegistro).getTime())
    return { aluno, status, checkinsFilho }
  })

  // Algum filho está embarcado (tracking ativo para este responsável)
  const algumEmbarcado = filhos.some(f => f.status === "embarcado")
  const posicaoMotorista =
    algumEmbarcado && viagemAtual?.latitudeAtual && viagemAtual?.longitudeAtual
      ? { lat: viagemAtual.latitudeAtual, lng: viagemAtual.longitudeAtual }
      : null

  // Check-ins dos filhos para exibir no mapa
  const checkinsFilhos = checkinsHoje.filter(c =>
    perfil.alunos.some(a => a.id === c.alunoId)
  )

  return (
    <div className="flex flex-col h-full">
      {/* Cards dos filhos */}
      <div className="p-4 space-y-3">
        {filhos.map(({ aluno, status, checkinsFilho }) => (
          <div key={aluno.id} className={`bg-white rounded-2xl border p-4 shadow-sm space-y-3 ${
            status === "embarcado" ? "border-amber-200" :
            status === "desembarcado" ? "border-green-200" : "border-slate-100"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-lg ${
                status === "embarcado" ? "bg-amber-100 text-amber-700" :
                status === "desembarcado" ? "bg-green-100 text-green-700" :
                "bg-slate-100 text-slate-500"
              }`}>
                {status === "desembarcado"
                  ? <CheckCircle className="h-6 w-6 text-green-600" />
                  : aluno.nome.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{aluno.nome}</p>
                <p className="text-xs text-slate-500">{turnoLabel(aluno.turno)}</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                status === "embarcado" ? "bg-amber-50 text-amber-700" :
                status === "desembarcado" ? "bg-green-50 text-green-700" :
                "bg-slate-50 text-slate-400"
              }`}>
                {status === "embarcado" ? "NO ÔNIBUS" :
                 status === "desembarcado" ? "ENTREGUE" : "AGUARDANDO"}
              </span>
            </div>

            {/* Linha do tempo dos eventos do filho */}
            {checkinsFilho.length > 0 && (
              <div className="space-y-1.5 border-t border-slate-50 pt-2">
                {checkinsFilho.map(c => (
                  <div key={c.id} className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${
                      c.tipo === "Embarque" ? "bg-amber-400" : "bg-green-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700">
                        {c.tipo === "Embarque" ? "Embarcou" : "Desembarcou"} às {formatTime(c.horaRegistro)}
                      </p>
                      {c.endereco && (
                        <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                          {c.endereco}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mapa ao vivo — só aparece quando há filho embarcado */}
      {algumEmbarcado && (
        <div className="mx-4 mb-4 rounded-2xl overflow-hidden border border-amber-200 shadow-sm" style={{ height: 280 }}>
          <div className="bg-amber-50 px-3 py-2 flex items-center gap-2 border-b border-amber-200">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold text-amber-800">Rastreamento ao vivo</span>
          </div>
          <div style={{ height: 240 }}>
            <MapaViagem checkins={checkinsFilhos} posicaoMotorista={posicaoMotorista} />
          </div>
        </div>
      )}

      {/* Mensagem quando todos desembarcados */}
      {filhos.length > 0 && filhos.every(f => f.status === "desembarcado") && (
        <div className="mx-4 mb-4 bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="font-bold text-green-800">Todos entregues!</p>
          <p className="text-xs text-green-600 mt-1">Trajeto concluído para seus filhos.</p>
        </div>
      )}

      {/* Mensagem quando viagem não iniciada */}
      {!viagemAtual && filhos.every(f => f.status === "aguardando") && (
        <div className="mx-4 mb-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
          <Bus className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600 text-sm font-medium">Aguardando o transporte...</p>
          <p className="text-xs text-slate-400 mt-1">Você será notificado quando o ônibus sair.</p>
        </div>
      )}
    </div>
  )
}

// ── VIEW MOTORISTA ──────────────────────────────────────────────────────────

export function TransportesPage() {
  const { user } = useAuth()
  const isMotorista = user?.perfil === "Admin" || user?.perfil === "Motorista" || user?.perfil === "SuperAdmin"
  const isMotoristaFrota = !!user?.motoristaId

  const [view, setView] = useState<"lista" | "mapa" | "historico">("lista")
  const [dataFiltro, setDataFiltro] = useState("")
  const [turnoSelecionado, setTurnoSelecionado] = useState<TurnoAluno>("Manha")
  const [rotaSelecionada, setRotaSelecionada] = useState<Rota | null>(null)
  const [showTurnoModal, setShowTurnoModal] = useState(false)
  const [viagemSelecionada, setViagemSelecionada] = useState<ViagemDto | null>(null)

  const { data: minhasRotas = [] } = useQuery({
    queryKey: ["rotas"],
    queryFn: rotaService.listar,
    enabled: isMotoristaFrota,
  })

  const { data: alunos, isLoading: loadingAlunos } = useAlunos()
  const { data: checkins, isLoading: loadingCheckins } = useCheckIns()
  const { data: checkinsDataFiltro } = useCheckIns(dataFiltro || undefined)
  const { data: checkinsViagem } = useCheckIns(viagemSelecionada?.data ?? undefined)
  const { data: viagemAtual, isPending: loadingViagem } = useViagemAtual()
  const { mutate: registrar, isPending: isRegistering } = useRegistrarCheckIn()
  const { mutate: iniciarViagem, isPending: isIniciando } = useIniciarViagem()
  const { mutate: atualizarPosicao } = useAtualizarPosicao()
  const { mutate: encerrarViagem, isPending: isEncerrando } = useEncerrarViagem()
  const { getCurrentPosition, getPositionSilent, loading: isGettingLocation } = useGeolocation()
  const { data: viagensHistorico, isLoading: loadingHistorico } = useViagensHistorico(dataFiltro || undefined)
  const { data: percursoSelecionado, isLoading: loadingPercurso } = usePercursoViagem(viagemSelecionada?.id ?? null)
  const today = new Date().toISOString().split("T")[0]
  const { data: faltasHoje } = useFaltas(today)
  const { mutate: darCiencia, isPending: isDandoCiencia } = useDarCienciaFalta()
  const ausentesHoje = new Set(faltasHoje?.map(f => f.alunoId) ?? [])

  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isMotorista || !viagemAtual || viagemAtual.status !== "EmRota") {
      if (gpsIntervalRef.current) { clearInterval(gpsIntervalRef.current); gpsIntervalRef.current = null }
      return
    }
    const sendPos = async () => {
      const pos = await getPositionSilent()
      if (pos && viagemAtual?.id) {
        atualizarPosicao({ viagemId: viagemAtual.id, latitude: pos.latitude, longitude: pos.longitude })
      }
    }
    sendPos()
    gpsIntervalRef.current = setInterval(sendPos, GPS_INTERVAL_MS)
    return () => { if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current) }
  }, [viagemAtual?.id, viagemAtual?.status, isMotorista])

  const handleSairDeCasa = () => setShowTurnoModal(true)

  const confirmarSaida = () => {
    setShowTurnoModal(false)
    if (isMotoristaFrota) {
      if (!rotaSelecionada) return
      iniciarViagem({ turno: rotaSelecionada.turno, rotaId: rotaSelecionada.id }, {
        onSuccess: () => toast.success(`Rota ${rotaSelecionada.nome} iniciada! Responsáveis notificados.`),
        onError: (err: unknown) => toast.error("Erro: " + (err as Error).message),
      })
    } else {
      iniciarViagem({ turno: turnoSelecionado }, {
        onSuccess: () => toast.success(`Viagem do turno ${turnoLabel(turnoSelecionado)} iniciada! Responsáveis notificados.`),
        onError: (err: unknown) => toast.error("Erro: " + (err as Error).message),
      })
    }
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
  const rotaAtiva = isMotoristaFrota && viagemAtual?.rotaId
    ? minhasRotas.find(r => r.id === viagemAtual.rotaId) ?? null
    : null
  const alunosDoTurno = (() => {
    if (isMotoristaFrota && rotaAtiva) {
      const idsRota = new Set(rotaAtiva.alunos.map(a => a.id))
      return (alunos ?? []).filter(a => idsRota.has(a.id) && !ausentesHoje.has(a.id))
    }
    return (viagemAtual ? alunos?.filter(a => a.turno === viagemAtual.turno) ?? [] : alunos ?? [])
      .filter(a => !ausentesHoje.has(a.id))
  })()
  const todosDesembarcados = alunosDoTurno.length === 0 ||
    alunosDoTurno.every(a => checkinsHoje.some(c => c.alunoId === a.id && c.tipo === "Desembarque"))
  const posicaoMotorista = viagemAtual?.latitudeAtual && viagemAtual?.longitudeAtual
    ? { lat: viagemAtual.latitudeAtual, lng: viagemAtual.longitudeAtual } : null

  const checkinsDeViagem = (viagem: ViagemDto, pool?: CheckInDto[]) =>
    (pool ?? checkins ?? []).filter(c => c.viagemId === viagem.id)

  // ── VIEW RESPONSÁVEL ──
  if (!isMotorista) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="p-4 bg-white border-b sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-900">Meus Alunos</h2>
          {viagemAtual ? (
            <p className="text-xs font-medium text-amber-600">🚌 Transporte em rota — Turno {turnoLabel(viagemAtual.turno)}</p>
          ) : (
            <p className="text-xs text-slate-500">Acompanhe seus filhos em tempo real</p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <ViewResponsavel checkinsHoje={checkinsHoje} viagemAtual={viagemAtual} />
        </div>
      </div>
    )
  }

  // ── VIEW MOTORISTA ──
  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Modal rota da viagem */}
      {viagemSelecionada && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
            <button onClick={() => setViagemSelecionada(null)}
              className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <X className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm">{turnoLabel(viagemSelecionada.turno)}</p>
              <p className="text-xs text-slate-500">
                {viagemSelecionada.iniciadaEm && formatTime(viagemSelecionada.iniciadaEm)}
                {viagemSelecionada.concluidaEm && ` → ${formatTime(viagemSelecionada.concluidaEm)}`}
                {" • "}{viagemSelecionada.data && new Date(viagemSelecionada.data).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <div className="flex-1 relative">
            {loadingPercurso ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
              </div>
            ) : percursoSelecionado && percursoSelecionado.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
                <MapPin className="h-12 w-12 text-slate-300" />
                <p className="font-semibold text-slate-600">Rota sem dados GPS</p>
                <p className="text-xs text-slate-400">Esta viagem foi registrada antes do rastreamento de rota ser ativado.</p>
              </div>
            ) : (
              <MapaPercursoViagem
                percurso={percursoSelecionado ?? []}
                checkins={checkinsDeViagem(viagemSelecionada, checkinsViagem)}
              />
            )}
          </div>
        </div>
      )}

      {/* Modal turno / rota */}
      {showTurnoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4">
            {isMotoristaFrota ? (
              <>
                <h3 className="text-lg font-bold text-slate-900 text-center">Qual rota vai sair agora?</h3>
                {minhasRotas.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">Nenhuma rota atribuída a você.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {minhasRotas.map(r => (
                      <button key={r.id} onClick={() => setRotaSelecionada(r)}
                        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-colors text-left ${
                          rotaSelecionada?.id === r.id ? "bg-primary text-white" : "bg-slate-100 text-slate-700"
                        }`}>
                        <p className="font-bold">{r.nome}</p>
                        <p className={`text-xs mt-0.5 ${rotaSelecionada?.id === r.id ? "text-white/70" : "text-slate-500"}`}>
                          {turnoLabel(r.turno)} • {r.alunos.length} aluno(s)
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-slate-900 text-center">Qual turno vai sair agora?</h3>
                <div className="space-y-2">
                  {(["Manha", "Tarde", "Noturno"] as TurnoAluno[]).map(t => (
                    <button key={t} onClick={() => setTurnoSelecionado(t)}
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                        turnoSelecionado === t ? "bg-primary text-white" : "bg-slate-100 text-slate-700"
                      }`}>
                      {turnoLabel(t)}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="flex gap-2">
              <button onClick={() => setShowTurnoModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold">
                Cancelar
              </button>
              <button onClick={confirmarSaida} disabled={isIniciando || (isMotoristaFrota && !rotaSelecionada)}
                className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50">
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
                🚌 Em rota{rotaAtiva ? ` — ${rotaAtiva.nome}` : ` — Turno ${turnoLabel(viagemAtual.turno)}`}
              </p>
            ) : (
              <p className="text-xs text-slate-500">Embarque, mapa e histórico</p>
            )}
          </div>

          {loadingViagem ? (
            <Loader2 className="animate-spin text-primary h-5 w-5" />
          ) : (
            <>
              {!viagemAtual && (
                <button onClick={handleSairDeCasa}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-sm">
                  <Navigation className="h-4 w-4" />
                  Sair de Casa
                </button>
              )}
              {viagemAtual && (
                <button onClick={handleEncerrar}
                  disabled={isEncerrando || !todosDesembarcados}
                  title={!todosDesembarcados ? "Todos os alunos precisam ser desembarcados primeiro" : ""}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-bold disabled:opacity-40 shadow-sm">
                  {isEncerrando ? <Loader2 className="animate-spin h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                  Encerrar
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2">
          {(["lista", "mapa", "historico"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                view === v ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
              }`}>
              {v === "lista" && <><Bus className="h-4 w-4" />Embarque</>}
              {v === "mapa" && <><MapIcon className="h-4 w-4" />Mapa</>}
              {v === "historico" && <><List className="h-4 w-4" />Histórico</>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Lista embarque */}
        {view === "lista" && (
          <div className="p-4 space-y-3">
            {!viagemAtual && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center space-y-3">
                <p className="text-blue-700 font-semibold text-sm">Pronto para iniciar?</p>
                <p className="text-xs text-blue-500">Selecione o turno e notifique os responsáveis.</p>
                <button
                  onClick={handleSairDeCasa}
                  disabled={isIniciando}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-sm disabled:opacity-50">
                  {isIniciando ? <Loader2 className="animate-spin h-4 w-4" /> : <Navigation className="h-4 w-4" />}
                  Iniciar Rota
                </button>
              </div>
            )}
            {faltasHoje && faltasHoje.some(f => !f.cienciaTransportador) && (
              <div className="space-y-2">
                {faltasHoje.filter(f => !f.cienciaTransportador).map(f => (
                  <div key={f.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-amber-900">{f.alunoNome} — Ausente hoje</p>
                      {f.motivo && <p className="text-xs text-amber-700 truncate">{f.motivo}</p>}
                    </div>
                    <button
                      onClick={() => darCiencia(f.id)}
                      disabled={isDandoCiencia}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-amber-500 text-white flex-shrink-0 disabled:opacity-50">
                      Ciente
                    </button>
                  </div>
                ))}
              </div>
            )}
            {loadingAlunos ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
            ) : (
              alunosDoTurno.map(aluno => {
                const status = statusAluno(aluno.id, checkinsHoje)
                const ultimoCheckin = checkinsHoje
                  .filter(c => c.alunoId === aluno.id)
                  .sort((a, b) => new Date(b.horaRegistro).getTime() - new Date(a.horaRegistro).getTime())[0]

                return (
                  <div key={aluno.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                        status === "embarcado" ? "bg-blue-100 text-blue-600" :
                        status === "desembarcado" ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500"
                      }`}>
                        {status === "desembarcado" ? <CheckCircle className="h-5 w-5 text-green-600" /> : aluno.nome.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{aluno.nome}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-medium">{aluno.escolaNome} • {aluno.turno}</p>
                        {ultimoCheckin?.endereco && (
                          <p className="text-[9px] text-slate-400 truncate mt-0.5">{ultimoCheckin.endereco}</p>
                        )}
                      </div>
                      <div className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                        status === "embarcado" ? "bg-blue-50 text-blue-600" :
                        status === "desembarcado" ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-400"
                      }`}>
                        {status === "embarcado" ? "EMBARCADO" : status === "desembarcado" ? "ENTREGUE" : "PENDENTE"}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleRegistro(aluno.id, aluno.nome, "Embarque")}
                        disabled={!viagemAtual || status === "embarcado" || isRegistering || isGettingLocation}
                        className="flex items-center justify-center gap-2 h-10 rounded-xl border border-blue-200 text-blue-600 text-xs font-bold active:bg-blue-50 disabled:opacity-30">
                        <UserPlus className="h-4 w-4" />Embarcar
                      </button>
                      <button
                        onClick={() => handleRegistro(aluno.id, aluno.nome, "Desembarque")}
                        disabled={!viagemAtual || status !== "embarcado" || isRegistering || isGettingLocation}
                        className="flex items-center justify-center gap-2 h-10 rounded-xl border border-green-200 text-green-600 text-xs font-bold active:bg-green-50 disabled:opacity-30">
                        <UserMinus className="h-4 w-4" />Desembarcar
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Mapa */}
        {view === "mapa" && (
          <div className="h-full">
            <MapaViagem checkins={checkinsHoje} posicaoMotorista={posicaoMotorista} />
          </div>
        )}

        {/* Histórico */}
        {view === "historico" && (
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <input type="date"
                className="flex-1 h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none"
                value={dataFiltro} onChange={e => setDataFiltro(e.target.value)} />
              {dataFiltro && (
                <button onClick={() => setDataFiltro("")}
                  className="flex items-center gap-1 px-3 h-11 rounded-xl border border-slate-200 bg-white text-xs text-slate-500">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {loadingHistorico ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
            ) : !viagensHistorico || viagensHistorico.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-sm">Nenhuma viagem encontrada.</div>
            ) : (
              viagensHistorico
                .filter(v => v.status === "Concluida")
                .sort((a, b) => new Date(b.iniciadaEm ?? 0).getTime() - new Date(a.iniciadaEm ?? 0).getTime())
                .map(v => {
                  const cins = checkinsDeViagem(v, dataFiltro ? checkinsDataFiltro : undefined)
                  const alunosCount = new Set(cins.map(c => c.alunoId)).size
                  return (
                    <div key={v.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm">{turnoLabel(v.turno)}</p>
                        <p className="text-xs text-slate-500">
                          {v.iniciadaEm && formatTime(v.iniciadaEm)}
                          {v.concluidaEm && ` → ${formatTime(v.concluidaEm)}`}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {v.data && new Date(v.data).toLocaleDateString("pt-BR")}
                          {alunosCount > 0 && ` • ${alunosCount} aluno${alunosCount > 1 ? "s" : ""}`}
                        </p>
                      </div>
                      <button
                        onClick={() => setViagemSelecionada(v)}
                        className="flex items-center gap-1 px-3 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold flex-shrink-0">
                        <MapPin className="h-3.5 w-3.5" />
                        Ver Rota
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
