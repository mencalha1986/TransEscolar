import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { MessageSquare, Plus, Trash2, X, Send, ThumbsUp } from "lucide-react"
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

const TIPO_COLORS: Record<TipoRecado, string> = {
  Geral: "bg-blue-100 text-blue-700",
  ParaResponsavel: "bg-purple-100 text-purple-700",
  ParaTurno: "bg-amber-100 text-amber-700",
  ParaEscola: "bg-green-100 text-green-700",
  DoResponsavel: "bg-orange-100 text-orange-700",
}

const schema = z.object({
  tipo: z.enum(["Geral", "ParaResponsavel", "ParaTurno", "ParaEscola", "DoResponsavel"]),
  turnoFiltro: z.enum(["Manha", "Tarde", "Noturno"]).nullable().optional(),
  escolaFiltroId: z.string().nullable().optional(),
  conteudo: z.string().min(1, "Digite uma mensagem").max(500, "Máximo 500 caracteres"),
})

type FormValues = z.infer<typeof schema>

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const inputClass =
  "w-full h-11 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm"

export function MuralPage() {
  const { user } = useAuth()
  const { data: recados, isLoading } = useRecados()
  const { data: escolas } = useEscolas()
  const { mutateAsync: enviar, isPending: enviando } = useEnviarRecado()
  const { mutateAsync: deletar } = useDeletarRecado()
  const { mutateAsync: darCiencia, isPending: darCienciaPending } = useDarCienciaRecado()
  const [showForm, setShowForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [aba, setAba] = useState<"mural" | "historico">("mural")
  const [filtroData, setFiltroData] = useState("")

  const isResponsavel = user?.perfil === "Responsavel"
  const isAdmin = user?.perfil === "Admin" || user?.perfil === "SuperAdmin"

  const { register, handleSubmit, watch, control, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: isResponsavel ? "DoResponsavel" : "Geral",
      conteudo: "",
    },
  })

  const tipo = watch("tipo")
  const conteudo = watch("conteudo")

  const recadosAtivos = (recados ?? []).filter(
    r => !(r.tipo === "DoResponsavel" && r.cienciaAdmin)
  )
  const recadosHistorico = (recados ?? []).filter(
    r => r.tipo === "DoResponsavel" && r.cienciaAdmin
  )
  const recadosHistoricoFiltrados = filtroData
    ? recadosHistorico.filter(r => r.cienciaAdminDadaEm?.startsWith(filtroData))
    : recadosHistorico

  async function onSubmit(values: FormValues) {
    try {
      await enviar({
        conteudo: values.conteudo,
        tipo: values.tipo,
        turnoFiltro: values.tipo === "ParaTurno" ? (values.turnoFiltro as TurnoRecado) : null,
        escolaFiltroId: values.tipo === "ParaEscola" ? values.escolaFiltroId : null,
      })
      toast.success("Recado enviado!")
      reset({ tipo: isResponsavel ? "DoResponsavel" : "Geral", conteudo: "" })
      setShowForm(false)
    } catch (err) {
      toast.error((err as Error).message || "Erro ao enviar recado")
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletar(id)
      toast.success("Recado removido!")
      setConfirmDelete(null)
    } catch (err) {
      toast.error((err as Error).message || "Erro ao remover recado")
    }
  }

  async function handleDarCiencia(id: string) {
    try {
      await darCiencia(id)
      toast.success("Ciência registrada!")
    } catch (err) {
      toast.error((err as Error).message || "Erro ao dar ciência")
    }
  }

  return (
    <div className="p-4 space-y-4 pb-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Mural</h2>
          <p className="text-slate-500 text-sm">Recados e comunicados</p>
        </div>
        {!showForm && aba === "mural" && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl active:opacity-80"
          >
            <Plus className="h-4 w-4" />
            Recado
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
        <button
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
            aba === "mural" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
          onClick={() => { setAba("mural"); setShowForm(false) }}
        >
          Mural
        </button>
        <button
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            aba === "historico" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
          onClick={() => { setAba("historico"); setShowForm(false) }}
        >
          Histórico
          {recadosHistorico.length > 0 && (
            <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">
              {recadosHistorico.length}
            </span>
          )}
        </button>
      </div>

      {/* Formulário novo recado (só na aba mural) */}
      {aba === "mural" && showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Novo Recado</h3>
            <button onClick={() => { setShowForm(false); reset() }} className="text-slate-400 active:opacity-70">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {!isResponsavel && (
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Destinatário</p>
                <select className={inputClass} {...register("tipo")}>
                  <option value="Geral">Geral (todos)</option>
                  <option value="ParaTurno">Para um turno</option>
                  <option value="ParaEscola">Para uma escola</option>
                </select>
              </div>
            )}

            {tipo === "ParaTurno" && (
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Turno</p>
                <Controller
                  control={control}
                  name="turnoFiltro"
                  render={({ field }) => (
                    <select
                      className={inputClass}
                      value={field.value ?? ""}
                      onChange={e => field.onChange(e.target.value || null)}
                    >
                      <option value="">Selecione...</option>
                      <option value="Manha">Manhã</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noturno">Noturno</option>
                    </select>
                  )}
                />
              </div>
            )}

            {tipo === "ParaEscola" && (
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Escola</p>
                <Controller
                  control={control}
                  name="escolaFiltroId"
                  render={({ field }) => (
                    <select
                      className={inputClass}
                      value={field.value ?? ""}
                      onChange={e => field.onChange(e.target.value || null)}
                    >
                      <option value="">Selecione...</option>
                      {escolas?.map(e => (
                        <option key={e.id} value={e.id}>{e.nome}</option>
                      ))}
                    </select>
                  )}
                />
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Mensagem</p>
              <textarea
                rows={4}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm resize-none"
                placeholder="Escreva seu recado..."
                {...register("conteudo")}
              />
              <div className="flex justify-between items-start mt-0.5">
                {errors.conteudo ? (
                  <p className="text-red-600 text-xs">{errors.conteudo.message}</p>
                ) : <span />}
                <p className="text-xs text-slate-400">{conteudo?.length || 0}/500</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full h-11 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 active:opacity-80 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {enviando ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </div>
      )}

      {/* Filtro de data — só no histórico */}
      {aba === "historico" && (
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-500 whitespace-nowrap">Filtrar por data:</p>
          <input
            type="date"
            value={filtroData}
            onChange={e => setFiltroData(e.target.value)}
            className="flex-1 h-9 px-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900"
          />
          {filtroData && (
            <button
              onClick={() => setFiltroData("")}
              className="text-xs text-slate-500 active:opacity-70 whitespace-nowrap"
            >
              Limpar
            </button>
          )}
        </div>
      )}

      {/* Lista */}
      {isLoading ? (
        <div className="py-10 text-center text-slate-500">Carregando recados...</div>
      ) : aba === "mural" ? (
        recadosAtivos.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            <MessageSquare className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p>Nenhum recado ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recadosAtivos.map(recado => (
              <div key={recado.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-800">{recado.autorNome}</span>
                      {recado.euEnviei && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          Você
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TIPO_COLORS[recado.tipo]}`}>
                        {TIPO_LABELS[recado.tipo]}
                      </span>
                      {!isResponsavel && recado.tipo === "DoResponsavel" && recado.alunoNomes && (
                        <span className="text-[10px] text-slate-500">
                          Aluno(s): <span className="font-semibold text-slate-700">{recado.alunoNomes}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{recado.conteudo}</p>
                    <p className="text-xs text-slate-400 mt-2">{formatDateTime(recado.criadoEm)}</p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isAdmin && recado.tipo === "DoResponsavel" && !recado.euEnviei && (
                      <button
                        onClick={() => handleDarCiencia(recado.id)}
                        disabled={darCienciaPending}
                        className="text-slate-400 active:opacity-70 p-1 disabled:opacity-40"
                        aria-label="Dar ciência"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                    )}
                    {(recado.euEnviei || (isAdmin && recado.tipo !== "DoResponsavel")) && (
                      <div>
                        {confirmDelete === recado.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs text-slate-500 active:opacity-70"
                            >
                              Não
                            </button>
                            <button
                              onClick={() => handleDelete(recado.id)}
                              className="text-xs text-red-600 font-semibold active:opacity-70"
                            >
                              Sim
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(recado.id)}
                            className="text-slate-400 active:opacity-70 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // Aba histórico
        recadosHistoricoFiltrados.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            <ThumbsUp className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p>{filtroData ? "Nenhum recado nesta data." : "Nenhum recado no histórico."}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recadosHistoricoFiltrados.map(recado => (
              <div key={recado.id} className="bg-white rounded-2xl border border-slate-100 p-4 opacity-90">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-800">{recado.autorNome}</span>
                      {recado.euEnviei && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          Você
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TIPO_COLORS[recado.tipo]}`}>
                        {TIPO_LABELS[recado.tipo]}
                      </span>
                      {recado.alunoNomes && !isResponsavel && (
                        <span className="text-[10px] text-slate-500">
                          Aluno(s): <span className="font-semibold text-slate-700">{recado.alunoNomes}</span>
                        </span>
                      )}
                      <span className="text-[10px] bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <ThumbsUp className="h-2.5 w-2.5" />
                        Ciência: {formatDateTime(recado.cienciaAdminDadaEm!)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{recado.conteudo}</p>
                    <p className="text-xs text-slate-400 mt-2">{formatDateTime(recado.criadoEm)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
