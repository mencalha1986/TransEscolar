import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Send, ThumbsUp, Trash2, Check, CheckCheck, ChevronDown } from "lucide-react"
import { useRecados, useEnviarRecado, useDeletarRecado, useDarCienciaRecado } from "@/hooks/useRecados"
import { useEscolas } from "@/hooks/useEscolas"
import { useAuth } from "@/contexts/AuthContext"
import type { TipoRecado, TurnoRecado } from "@/types/recado"

const TIPO_LABELS: Record<TipoRecado, string> = {
  Geral: "Geral",
  ParaResponsavel: "Para Responsável",
  ParaTurno: "Para Turno",
  ParaEscola: "Para Escola",
  DoResponsavel: "Do Responsável",
}

const TIPO_BADGE: Record<string, string> = {
  Geral: "bg-blue-100 text-blue-700",
  ParaResponsavel: "bg-purple-100 text-purple-700",
  ParaTurno: "bg-amber-100 text-amber-700",
  ParaEscola: "bg-green-100 text-green-700",
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

export function MuralPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: recados, isLoading } = useRecados()
  const { data: escolas } = useEscolas()
  const { mutateAsync: enviar, isPending: enviando } = useEnviarRecado()
  const { mutateAsync: deletar } = useDeletarRecado()
  const { mutateAsync: darCiencia, isPending: darCienciaPending } = useDarCienciaRecado()

  const [conteudo, setConteudo] = useState("")
  const [tipo, setTipo] = useState<TipoRecado>("Geral")
  const [turnoFiltro, setTurnoFiltro] = useState<TurnoRecado | "">("")
  const [escolaFiltroId, setEscolaFiltroId] = useState("")
  const [aba, setAba] = useState<"mural" | "historico">("mural")
  const [filtroData, setFiltroData] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [showTipoMenu, setShowTipoMenu] = useState(false)
  const [showTurnoMenu, setShowTurnoMenu] = useState(false)
  const [showEscolaMenu, setShowEscolaMenu] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isResponsavel = user?.perfil === "Responsavel"
  const isAdmin = user?.perfil === "Admin" || user?.perfil === "SuperAdmin"

  const recadosAtivos = (recados ?? []).filter(
    r => !(r.tipo === "DoResponsavel" && r.cienciaAdmin)
  )
  const recadosHistorico = (recados ?? []).filter(
    r => r.tipo === "DoResponsavel" && r.cienciaAdmin
  )
  const recadosHistoricoFiltrados = filtroData
    ? recadosHistorico.filter(r => r.cienciaAdminDadaEm?.startsWith(filtroData))
    : recadosHistorico

  const mensagensExibidas = aba === "mural" ? recadosAtivos : recadosHistoricoFiltrados

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensagensExibidas])

  async function onEnviar() {
    const texto = conteudo.trim()
    if (!texto) return
    const tipoFinal: TipoRecado = isResponsavel ? "DoResponsavel" : tipo
    try {
      await enviar({
        conteudo: texto,
        tipo: tipoFinal,
        turnoFiltro: tipoFinal === "ParaTurno" && turnoFiltro ? (turnoFiltro as TurnoRecado) : null,
        escolaFiltroId: tipoFinal === "ParaEscola" && escolaFiltroId ? escolaFiltroId : null,
      })
      setConteudo("")
    } catch (err) {
      toast.error((err as Error).message || "Erro ao enviar")
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletar(id)
      toast.success("Recado removido!")
      setConfirmDelete(null)
    } catch {
      toast.error("Erro ao remover")
    }
  }

  async function handleDarCiencia(id: string) {
    try {
      await darCiencia(id)
    } catch {
      toast.error("Erro ao dar ciência")
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-slate-600 active:opacity-70">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-900">Mural</h2>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 mx-4 mt-3 rounded-xl p-1 gap-1 sticky top-[53px] z-10">
        <button
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
            aba === "mural" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
          onClick={() => setAba("mural")}
        >
          Mural
        </button>
        <button
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            aba === "historico" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
          onClick={() => setAba("historico")}
        >
          Histórico
          {recadosHistorico.length > 0 && (
            <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">
              {recadosHistorico.length}
            </span>
          )}
        </button>
      </div>

      {/* Date filter — historico only */}
      {aba === "historico" && (
        <div className="flex items-center gap-2 px-4 mt-3">
          <p className="text-xs text-slate-500 whitespace-nowrap">Filtrar por data:</p>
          <input
            type="date"
            value={filtroData}
            onChange={e => setFiltroData(e.target.value)}
            className="flex-1 h-9 px-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900"
          />
          {filtroData && (
            <button onClick={() => setFiltroData("")} className="text-xs text-slate-500 active:opacity-70">
              Limpar
            </button>
          )}
        </div>
      )}

      {/* Messages area — pb-36 clears fixed input (≈68px) + bottom nav (64px) */}
      <div className="px-4 py-4 pb-36 space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Carregando...</div>
        ) : mensagensExibidas.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            {aba === "historico" && filtroData ? "Nenhum recado nesta data." : "Nenhuma mensagem ainda."}
          </div>
        ) : (
          mensagensExibidas.map(recado => (
            <div
              key={recado.id}
              className={`flex flex-col ${recado.euEnviei ? "items-end" : "items-start"}`}
            >
              {/* Sender name — only for messages from others */}
              {!recado.euEnviei && (
                <p className="text-xs font-semibold text-slate-500 mb-0.5 ml-2">{recado.autorNome}</p>
              )}

              {/* Bubble */}
              <div className={`max-w-[80%] px-4 py-2.5 shadow-sm ${
                recado.euEnviei
                  ? "bg-primary text-white rounded-2xl rounded-br-sm"
                  : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm"
              }`}>
                {/* Type badge for broadcast messages */}
                {recado.tipo !== "DoResponsavel" && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold mb-2 inline-block ${TIPO_BADGE[recado.tipo]}`}>
                    {TIPO_LABELS[recado.tipo]}
                  </span>
                )}

                {/* Student names — shown to admin on DoResponsavel messages */}
                {!isResponsavel && recado.alunoNomes && recado.tipo === "DoResponsavel" && (
                  <p className={`text-[10px] mb-1 ${recado.euEnviei ? "text-white/70" : "text-slate-400"}`}>
                    Aluno(s): <span className="font-semibold">{recado.alunoNomes}</span>
                  </p>
                )}

                <p className="text-sm leading-relaxed whitespace-pre-wrap">{recado.conteudo}</p>

                {/* Timestamp + read indicator */}
                <div className={`flex items-center justify-end gap-1 mt-1.5 ${
                  recado.euEnviei ? "text-white/60" : "text-slate-400"
                }`}>
                  <span className="text-[10px]">{formatTime(recado.criadoEm)}</span>
                  {recado.euEnviei && recado.tipo === "DoResponsavel" && (
                    recado.cienciaAdmin
                      ? <CheckCheck className="h-3.5 w-3.5 text-white/80" />
                      : <Check className="h-3.5 w-3.5" />
                  )}
                  {aba === "historico" && recado.cienciaAdminDadaEm && (
                    <CheckCheck className={`h-3.5 w-3.5 ${recado.euEnviei ? "text-white/80" : "text-green-500"}`} />
                  )}
                </div>
              </div>

              {/* Actions below bubble */}
              <div className={`flex gap-2 mt-1 ${recado.euEnviei ? "mr-1" : "ml-1"}`}>
                {/* Dar ciência — admin, DoResponsavel from others, active tab only */}
                {isAdmin && recado.tipo === "DoResponsavel" && !recado.euEnviei && !recado.cienciaAdmin && aba === "mural" && (
                  <button
                    onClick={() => handleDarCiencia(recado.id)}
                    disabled={darCienciaPending}
                    className="flex items-center gap-1 text-[10px] text-slate-400 active:text-green-600 py-0.5 px-2 rounded-full border border-slate-200 bg-white disabled:opacity-40"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    Ciência
                  </button>
                )}

                {/* Delete */}
                {(recado.euEnviei || (isAdmin && recado.tipo !== "DoResponsavel")) && (
                  confirmDelete === recado.id ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => setConfirmDelete(null)} className="text-[10px] text-slate-400 active:opacity-70">
                        Cancelar
                      </button>
                      <button onClick={() => handleDelete(recado.id)} className="text-[10px] text-red-500 font-semibold active:opacity-70">
                        Remover
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(recado.id)} className="p-1 text-slate-300 active:text-red-400">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed input bar — sits above bottom nav (h-16 = 64px) */}
      {aba === "mural" && (
        <div
          className="fixed left-0 right-0 bg-white border-t border-slate-200 px-3 py-2 z-10"
          style={{ bottom: "64px" }}
          onClick={() => { setShowTipoMenu(false); setShowTurnoMenu(false); setShowEscolaMenu(false) }}
        >
          {/* Admin: tipo/turno/escola selectors */}
          {!isResponsavel && (
            <div className="flex flex-wrap gap-2 mb-2" onClick={e => e.stopPropagation()}>
              {/* Tipo selector */}
              <div className="relative">
                <button
                  onClick={() => { setShowTipoMenu(v => !v); setShowTurnoMenu(false); setShowEscolaMenu(false) }}
                  className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full active:bg-slate-200"
                >
                  {TIPO_LABELS[tipo]}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {showTipoMenu && (
                  <div className="absolute bottom-9 left-0 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20 min-w-[160px]">
                    {(["Geral", "ParaTurno", "ParaEscola"] as TipoRecado[]).map(t => (
                      <button
                        key={t}
                        onClick={() => { setTipo(t); setShowTipoMenu(false); setTurnoFiltro(""); setEscolaFiltroId("") }}
                        className={`w-full text-left px-4 py-2 text-sm ${tipo === t ? "text-primary font-semibold" : "text-slate-700"}`}
                      >
                        {TIPO_LABELS[t]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Turno selector */}
              {tipo === "ParaTurno" && (
                <div className="relative">
                  <button
                    onClick={() => { setShowTurnoMenu(v => !v); setShowTipoMenu(false) }}
                    className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full active:bg-slate-200"
                  >
                    {turnoFiltro ? (turnoFiltro === "Manha" ? "Manhã" : turnoFiltro) : "Selecione turno..."}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {showTurnoMenu && (
                    <div className="absolute bottom-9 left-0 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20">
                      {(["Manha", "Tarde", "Noturno"] as TurnoRecado[]).map(t => (
                        <button
                          key={t}
                          onClick={() => { setTurnoFiltro(t); setShowTurnoMenu(false) }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700"
                        >
                          {t === "Manha" ? "Manhã" : t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Escola selector */}
              {tipo === "ParaEscola" && (
                <div className="relative">
                  <button
                    onClick={() => { setShowEscolaMenu(v => !v); setShowTipoMenu(false) }}
                    className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full active:bg-slate-200"
                  >
                    {escolas?.find(e => e.id === escolaFiltroId)?.nome ?? "Selecione escola..."}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {showEscolaMenu && (
                    <div className="absolute bottom-9 left-0 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20 min-w-[200px] max-h-48 overflow-y-auto">
                      {escolas?.map(e => (
                        <button
                          key={e.id}
                          onClick={() => { setEscolaFiltroId(e.id); setShowEscolaMenu(false) }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700"
                        >
                          {e.nome}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Text input + send */}
          <div className="flex items-end gap-2">
            <textarea
              value={conteudo}
              onChange={e => setConteudo(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onEnviar() } }}
              placeholder="Digite uma mensagem..."
              rows={1}
              maxLength={500}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none overflow-y-auto"
              style={{ minHeight: "42px", maxHeight: "112px" }}
            />
            <button
              onClick={onEnviar}
              disabled={enviando || !conteudo.trim()}
              className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 active:opacity-80 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
