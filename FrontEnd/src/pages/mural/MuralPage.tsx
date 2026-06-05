import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { Send, ThumbsUp, Trash2, Check, CheckCheck, ChevronDown, MessageSquare, History } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { useRecados, useEnviarRecado, useDeletarRecado, useDarCienciaRecado } from "@/hooks/useRecados"
import { useEscolas } from "@/hooks/useEscolas"
import { useAuth } from "@/contexts/AuthContext"
import type { TipoRecado, TurnoRecado } from "@/types/recado"

const TIPO_LABELS: Record<TipoRecado, string> = {
  Geral: "Geral",
  ParaResponsavel: "Para responsável",
  ParaTurno: "Por turno",
  ParaEscola: "Por escola",
  DoResponsavel: "Do responsável",
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
  const { user } = useAuth()
  const isAdmin = user?.perfil === "Admin" || user?.perfil === "SuperAdmin" || user?.perfil === "Motorista"
  const isResponsavel = user?.perfil === "Responsavel"

  const [conteudo, setConteudo] = useState("")
  const [tipo, setTipo] = useState<TipoRecado>("Geral")
  const [turnoFiltro, setTurnoFiltro] = useState<TurnoRecado | "">("")
  const [escolaFiltroId, setEscolaFiltroId] = useState("")
  const [aba, setAba] = useState<"mural" | "historico">("mural")
  const [filtroData, setFiltroData] = useState("")
  const [showTipoMenu, setShowTipoMenu] = useState(false)
  const [showTurnoMenu, setShowTurnoMenu] = useState(false)
  const [showEscolaMenu, setShowEscolaMenu] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: recados, isLoading } = useRecados()
  const { data: escolas } = useEscolas()
  const { mutateAsync: enviar, isPending } = useEnviarRecado()
  const { mutateAsync: deletar } = useDeletarRecado()
  const { mutateAsync: darCiencia, isPending: isDarCienciaPending } = useDarCienciaRecado()

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
    if (!texto) { toast.error("Digite o conteúdo do recado"); return }
    try {
      await enviar({
        conteudo: texto,
        tipo: isResponsavel ? "DoResponsavel" : tipo,
        turnoFiltro: tipo === "ParaTurno" && turnoFiltro ? turnoFiltro : null,
        escolaFiltroId: tipo === "ParaEscola" && escolaFiltroId ? escolaFiltroId : null,
      })
      setConteudo("")
      setTurnoFiltro("")
      setEscolaFiltroId("")
    } catch {
      toast.error("Não foi possível enviar o recado. Tente novamente.")
    }
  }

  async function onDeletar(id: string) {
    if (!window.confirm("Remover este recado?")) return
    try {
      await deletar(id)
      toast.success("Recado removido!")
    } catch {
      toast.error("Não foi possível remover o recado.")
    }
  }

  async function onDarCiencia(id: string) {
    try {
      await darCiencia(id)
      toast.success("Ciência registrada!")
    } catch {
      toast.error("Não foi possível registrar a ciência.")
    }
  }

  return (
    <div>
      <PageHeader
        title="Mural de Recados"
        description={isResponsavel ? "Deixe avisos para o transportador" : "Comunique-se com os responsáveis"}
      />

      {/* Chat container */}
      <div className="flex flex-col border rounded-xl bg-white overflow-hidden" style={{ height: "calc(100vh - 220px)", minHeight: "400px" }}>

        {/* Tabs bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-slate-50">
          <Button
            variant={aba === "mural" ? "default" : "outline"}
            size="sm"
            onClick={() => setAba("mural")}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Mural
          </Button>
          <Button
            variant={aba === "historico" ? "default" : "outline"}
            size="sm"
            onClick={() => setAba("historico")}
          >
            <History className="h-3.5 w-3.5 mr-1.5" />
            Histórico
            {recadosHistorico.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">
                {recadosHistorico.length}
              </span>
            )}
          </Button>

          {/* Date filter — historico tab */}
          {aba === "historico" && (
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Filtrar por data:</span>
              <input
                type="date"
                value={filtroData}
                onChange={e => setFiltroData(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              />
              {filtroData && (
                <Button variant="ghost" size="sm" onClick={() => setFiltroData("")}>Limpar</Button>
              )}
            </div>
          )}
        </div>

        {/* Messages scrollable area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-[#f0f2f5]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Carregando mensagens...
            </div>
          ) : mensagensExibidas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              {aba === "mural"
                ? <><MessageSquare className="h-10 w-10 mb-2 opacity-20" /><p className="text-sm">Nenhuma mensagem ainda.</p></>
                : <><History className="h-10 w-10 mb-2 opacity-20" /><p className="text-sm">{filtroData ? "Nenhum recado nesta data." : "Nenhum recado no histórico."}</p></>
              }
            </div>
          ) : (
            mensagensExibidas.map(r => (
              <div key={r.id} className={`flex flex-col ${r.euEnviei ? "items-end" : "items-start"}`}>
                {/* Sender name */}
                {!r.euEnviei && (
                  <p className="text-xs font-semibold text-slate-500 mb-0.5 ml-2">{r.autorNome}</p>
                )}

                {/* Bubble */}
                <div className={`group max-w-[60%] px-4 py-2.5 shadow-sm ${
                  r.euEnviei
                    ? "bg-primary text-white rounded-2xl rounded-br-sm"
                    : "bg-white text-slate-800 rounded-2xl rounded-bl-sm"
                }`}>
                  {/* Type badge for broadcasts */}
                  {r.tipo !== "DoResponsavel" && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold mb-2 inline-block ${TIPO_BADGE[r.tipo]}`}>
                      {TIPO_LABELS[r.tipo]}
                    </span>
                  )}

                  {/* Student names — admin view */}
                  {!isResponsavel && r.alunoNomes && r.tipo === "DoResponsavel" && (
                    <p className={`text-xs mb-1 ${r.euEnviei ? "text-white/70" : "text-slate-400"}`}>
                      Aluno(s): <span className="font-semibold">{r.alunoNomes}</span>
                    </p>
                  )}

                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{r.conteudo}</p>

                  {/* Time + status */}
                  <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${
                    r.euEnviei ? "text-white/60" : "text-slate-400"
                  }`}>
                    <span className="text-[11px]">{formatTime(r.criadoEm)}</span>
                    {r.euEnviei && r.tipo === "DoResponsavel" && (
                      r.cienciaAdmin
                        ? <CheckCheck className="h-3.5 w-3.5 text-white/80" />
                        : <Check className="h-3.5 w-3.5" />
                    )}
                    {aba === "historico" && r.cienciaAdminDadaEm && (
                      <CheckCheck className={`h-3.5 w-3.5 ${r.euEnviei ? "text-white/80" : "text-green-500"}`} />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className={`flex gap-2 mt-1 ${r.euEnviei ? "mr-1" : "ml-1"}`}>
                  {isAdmin && r.tipo === "DoResponsavel" && !r.euEnviei && !r.cienciaAdmin && aba === "mural" && (
                    <button
                      onClick={() => onDarCiencia(r.id)}
                      disabled={isDarCienciaPending}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-green-600 py-0.5 px-2 rounded-full border border-slate-200 bg-white disabled:opacity-40 transition-colors"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      Dar ciência
                    </button>
                  )}
                  {(r.euEnviei || (isAdmin && r.tipo !== "DoResponsavel")) && (
                    <button
                      onClick={() => onDeletar(r.id)}
                      className="p-1 text-slate-300 hover:text-destructive transition-colors"
                      aria-label="Remover recado"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar — only on mural tab */}
        {aba === "mural" && (
          <div
            className="border-t bg-white px-4 py-3"
            onClick={() => { setShowTipoMenu(false); setShowTurnoMenu(false); setShowEscolaMenu(false) }}
          >
            {/* Admin: tipo/turno/escola selectors */}
            {!isResponsavel && (
              <div className="flex flex-wrap gap-2 mb-2" onClick={e => e.stopPropagation()}>
                {/* Tipo */}
                <div className="relative">
                  <button
                    onClick={() => { setShowTipoMenu(v => !v); setShowTurnoMenu(false); setShowEscolaMenu(false) }}
                    className="flex items-center gap-1 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {TIPO_LABELS[tipo]}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  {showTipoMenu && (
                    <div className="absolute bottom-10 left-0 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20 min-w-[160px]">
                      {(["Geral", "ParaTurno", "ParaEscola"] as TipoRecado[]).map(t => (
                        <button
                          key={t}
                          onClick={() => { setTipo(t); setShowTipoMenu(false); setTurnoFiltro(""); setEscolaFiltroId("") }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${tipo === t ? "text-primary font-semibold" : "text-slate-700"}`}
                        >
                          {TIPO_LABELS[t]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {tipo === "ParaTurno" && (
                  <div className="relative">
                    <button
                      onClick={() => { setShowTurnoMenu(v => !v); setShowTipoMenu(false) }}
                      className="flex items-center gap-1 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {turnoFiltro ? (turnoFiltro === "Manha" ? "Manhã" : turnoFiltro) : "Selecione turno..."}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    {showTurnoMenu && (
                      <div className="absolute bottom-10 left-0 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20">
                        {(["Manha", "Tarde", "Noturno"] as TurnoRecado[]).map(t => (
                          <button
                            key={t}
                            onClick={() => { setTurnoFiltro(t); setShowTurnoMenu(false) }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            {t === "Manha" ? "Manhã" : t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tipo === "ParaEscola" && (
                  <div className="relative">
                    <button
                      onClick={() => { setShowEscolaMenu(v => !v); setShowTipoMenu(false) }}
                      className="flex items-center gap-1 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {escolas?.find(e => e.id === escolaFiltroId)?.nome ?? "Selecione escola..."}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    {showEscolaMenu && (
                      <div className="absolute bottom-10 left-0 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20 min-w-[200px] max-h-48 overflow-y-auto">
                        {(escolas ?? []).map(e => (
                          <button
                            key={e.id}
                            onClick={() => { setEscolaFiltroId(e.id); setShowEscolaMenu(false) }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
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
            <div className="flex items-end gap-3">
              <textarea
                value={conteudo}
                onChange={e => setConteudo(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onEnviar() } }}
                placeholder={isResponsavel ? "Ex: Meu filho não vai à escola hoje..." : "Digite o recado..."}
                rows={1}
                maxLength={500}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none overflow-y-auto"
                style={{ minHeight: "42px", maxHeight: "120px" }}
              />
              <Button
                onClick={onEnviar}
                disabled={isPending || !conteudo.trim()}
                size="icon"
                className="rounded-full h-10 w-10 flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-right mt-1">{conteudo.length}/500</p>
          </div>
        )}
      </div>
    </div>
  )
}
