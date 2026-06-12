import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  ChevronDown, ChevronUp, Plus, Route, Users, X, UserPlus,
  Pencil, Trash2, Loader2, Check,
} from "lucide-react"
import { rotaService } from "@/services/rota.service"
import { listarAlunos } from "@/services/alunos.service"
import type { Rota, Turno } from "@/types/rota"

const turnoLabel: Record<Turno, string> = { Manha: "Manhã", Tarde: "Tarde", Noturno: "Noturno" }
const turnoColor: Record<Turno, string> = {
  Manha: "bg-amber-100 text-amber-700",
  Tarde: "bg-blue-100 text-blue-700",
  Noturno: "bg-purple-100 text-purple-700",
}

type FormState = { nome: string; turno: Turno; motoristaId: string }
const empty: FormState = { nome: "", turno: "Manha", motoristaId: "" }

// ── Modal de criação/edição ────────────────────────────────────────────────

function RotaModal({
  open,
  editing,
  onClose,
}: {
  open: boolean
  editing: Rota | null
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [form, setForm] = useState<FormState>(
    editing
      ? { nome: editing.nome, turno: editing.turno, motoristaId: editing.motoristaId ?? "" }
      : empty
  )

  const criar = useMutation({
    mutationFn: () => rotaService.criar({ nome: form.nome, turno: form.turno }),
    onSuccess: () => { toast.success("Rota criada!"); qc.invalidateQueries({ queryKey: ["rotas"] }); onClose() },
    onError: (e: Error) => toast.error(e.message),
  })

  const editar = useMutation({
    mutationFn: () => rotaService.editar(editing!.id, { nome: form.nome, turno: form.turno }),
    onSuccess: () => { toast.success("Rota atualizada!"); qc.invalidateQueries({ queryKey: ["rotas"] }); onClose() },
    onError: (e: Error) => toast.error(e.message),
  })

  const isPending = criar.isPending || editar.isPending

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-2xl p-5 space-y-4 pb-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto -mt-1 mb-2" />
        <h3 className="text-lg font-bold text-slate-900">{editing ? "Editar Rota" : "Nova Rota"}</h3>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Nome da rota *</label>
          <input
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Ex: Rota Centro"
            value={form.nome}
            onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Turno *</label>
          <div className="grid grid-cols-3 gap-2">
            {(["Manha", "Tarde", "Noturno"] as Turno[]).map(t => (
              <button
                key={t}
                onClick={() => setForm(f => ({ ...f, turno: t }))}
                className={`py-3 rounded-xl text-sm font-semibold transition-colors ${
                  form.turno === t
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {turnoLabel[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm"
          >
            Cancelar
          </button>
          <button
            disabled={isPending || !form.nome}
            onClick={() => editing ? editar.mutate() : criar.mutate()}
            className="flex-1 h-12 rounded-xl bg-primary text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Check className="h-4 w-4" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────

export function RotasPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Rota | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [alunoSelecionado, setAlunoSelecionado] = useState("")

  const { data: rotas, isLoading } = useQuery({ queryKey: ["rotas"], queryFn: rotaService.listar })
  const { data: todosAlunos } = useQuery({ queryKey: ["alunos"], queryFn: () => listarAlunos() })

  const removerAluno = useMutation({
    mutationFn: ({ rotaId, alunoId }: { rotaId: string; alunoId: string }) =>
      rotaService.removerAluno(rotaId, alunoId),
    onSuccess: () => { toast.success("Aluno removido"); qc.invalidateQueries({ queryKey: ["rotas"] }) },
    onError: (e: Error) => toast.error(e.message),
  })

  const adicionarAluno = useMutation({
    mutationFn: ({ rotaId, alunoId }: { rotaId: string; alunoId: string }) =>
      rotaService.adicionarAluno(rotaId, alunoId),
    onSuccess: () => {
      toast.success("Aluno adicionado!")
      qc.invalidateQueries({ queryKey: ["rotas"] })
      setAddingTo(null)
      setAlunoSelecionado("")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deletarRota = useMutation({
    mutationFn: (id: string) => rotaService.deletar(id),
    onSuccess: () => { toast.success("Rota removida"); qc.invalidateQueries({ queryKey: ["rotas"] }) },
    onError: (e: Error) => toast.error(e.message),
  })

  function abrirNovo() { setEditing(null); setModalOpen(true) }
  function abrirEditar(r: Rota) { setEditing(r); setModalOpen(true) }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="px-4 py-4 bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Rotas</h2>
            <p className="text-xs text-slate-500 mt-0.5">Gerencie rotas e alunos de cada rota</p>
          </div>
          <button
            onClick={abrirNovo}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-sm active:opacity-80"
          >
            <Plus className="h-4 w-4" />
            Nova Rota
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-primary h-8 w-8" />
          </div>
        ) : (rotas ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8">
            <Route className="h-12 w-12 text-slate-300 mb-3" />
            <p className="font-semibold text-slate-600">Nenhuma rota cadastrada</p>
            <p className="text-xs text-slate-400 mt-1">Crie a primeira rota para organizar o transporte</p>
            <button
              onClick={abrirNovo}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold"
            >
              <Plus className="h-4 w-4" /> Nova Rota
            </button>
          </div>
        ) : (
          (rotas ?? []).map(r => {
            const expanded = expandedId === r.id
            const alunosNaRota = new Set(r.alunos.map(a => a.id))
            const disponiveis = (todosAlunos ?? []).filter(a => !alunosNaRota.has(a.id))
            const showAddSelect = addingTo === r.id

            return (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Card header */}
                <button
                  className="w-full p-4 text-left active:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : r.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5 ${turnoColor[r.turno]}`}>
                      {turnoLabel[r.turno]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{r.nome}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Motorista: <span className="font-medium text-slate-700">{r.nomeMotorista ?? "—"}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                        <Users className="h-3.5 w-3.5" />
                        {r.alunos.length}
                      </span>
                      {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </div>
                </button>

                {/* Expanded content */}
                {expanded && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirEditar(r)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold active:opacity-70"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar rota
                      </button>
                      <button
                        onClick={() => deletarRota.mutate(r.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold active:opacity-70"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Excluir
                      </button>
                    </div>

                    {/* Student list */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Alunos nesta rota
                      </p>
                      {r.alunos.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">Nenhum aluno vinculado ainda.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {r.alunos.map(a => (
                            <div
                              key={a.id}
                              className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5"
                            >
                              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                                {a.nome.charAt(0).toUpperCase()}
                              </div>
                              <span className="flex-1 text-sm font-medium text-slate-800 truncate">{a.nome}</span>
                              <button
                                onClick={() => removerAluno.mutate({ rotaId: r.id, alunoId: a.id })}
                                className="p-1.5 rounded-lg text-slate-400 active:text-red-500 active:bg-red-50 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add student */}
                    {disponiveis.length > 0 && (
                      <div>
                        {!showAddSelect ? (
                          <button
                            onClick={() => { setAddingTo(r.id); setAlunoSelecionado("") }}
                            className="w-full flex items-center justify-center gap-2 h-10 border-2 border-dashed border-primary/30 rounded-xl text-primary text-sm font-semibold active:opacity-70"
                          >
                            <UserPlus className="h-4 w-4" />
                            Adicionar aluno
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <select
                              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                              value={alunoSelecionado}
                              onChange={e => setAlunoSelecionado(e.target.value)}
                            >
                              <option value="">Selecione um aluno...</option>
                              {disponiveis.map(a => (
                                <option key={a.id} value={a.id}>{a.nome}</option>
                              ))}
                            </select>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setAddingTo(null); setAlunoSelecionado("") }}
                                className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold"
                              >
                                Cancelar
                              </button>
                              <button
                                disabled={!alunoSelecionado || adicionarAluno.isPending}
                                onClick={() => adicionarAluno.mutate({ rotaId: r.id, alunoId: alunoSelecionado })}
                                className="flex-1 h-10 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5"
                              >
                                {adicionarAluno.isPending
                                  ? <Loader2 className="animate-spin h-4 w-4" />
                                  : <><UserPlus className="h-4 w-4" />Confirmar</>}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <RotaModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
