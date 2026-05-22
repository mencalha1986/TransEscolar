import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, School, MapPin, Phone, Pencil, Trash2, X, Check } from "lucide-react"
import { useEscolas, useCadastrarEscola, useAtualizarEscola, useDeletarEscola } from "@/hooks/useEscolas"
import type { EscolaDto } from "@/types/escola"

const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  telefone: z.string().optional().default(""),
  logradouro: z.string().optional().default(""),
  numero: z.string().optional().default(""),
  bairro: z.string().optional().default(""),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().length(2, "Use a sigla do estado (2 letras)"),
  cep: z.string().optional().default(""),
})

type FormValues = z.infer<typeof schema>

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-red-600 text-xs mt-1">{msg}</p>
}

const inputClass =
  "w-full h-11 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm"

function EscolaForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: {
  defaultValues?: Partial<FormValues>
  onSubmit: (v: FormValues) => void
  onCancel: () => void
  isPending: boolean
  submitLabel: string
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 p-4">
      <div>
        <p className="text-xs font-semibold text-slate-600 mb-1">Nome da escola *</p>
        <input className={inputClass} placeholder="Nome" {...register("nome")} />
        <FieldError msg={errors.nome?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-1">Cidade *</p>
          <input className={inputClass} placeholder="Cidade" {...register("cidade")} />
          <FieldError msg={errors.cidade?.message} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-1">Estado *</p>
          <input className={inputClass} placeholder="SP" maxLength={2} {...register("estado")} />
          <FieldError msg={errors.estado?.message} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-600 mb-1">Telefone</p>
        <input className={inputClass} placeholder="(11) 9999-9999" inputMode="tel" {...register("telefone")} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <p className="text-xs font-semibold text-slate-600 mb-1">Logradouro</p>
          <input className={inputClass} placeholder="Rua..." {...register("logradouro")} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-1">Número</p>
          <input className={inputClass} placeholder="123" {...register("numero")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-1">Bairro</p>
          <input className={inputClass} placeholder="Bairro" {...register("bairro")} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-1">CEP</p>
          <input className={inputClass} placeholder="00000-000" inputMode="numeric" {...register("cep")} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm active:opacity-70"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 h-11 rounded-xl bg-primary text-white font-semibold text-sm active:opacity-80 disabled:opacity-60"
        >
          {isPending ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  )
}

export function EscolasPage() {
  const { data: escolas, isLoading } = useEscolas()
  const { mutateAsync: cadastrar, isPending: cadastrando } = useCadastrarEscola()
  const { mutateAsync: atualizar, isPending: atualizando } = useAtualizarEscola()
  const { mutateAsync: deletar } = useDeletarEscola()

  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState<EscolaDto | null>(null)
  const [confirmandoDelete, setConfirmandoDelete] = useState<string | null>(null)

  async function handleCadastrar(values: FormValues) {
    try {
      await cadastrar(values)
      toast.success("Escola cadastrada!")
      setShowForm(false)
    } catch (err) {
      toast.error((err as Error).message || "Erro ao cadastrar escola")
    }
  }

  async function handleAtualizar(values: FormValues) {
    if (!editando) return
    try {
      await atualizar({ id: editando.id, data: values })
      toast.success("Escola atualizada!")
      setEditando(null)
    } catch (err) {
      toast.error((err as Error).message || "Erro ao atualizar escola")
    }
  }

  async function handleDeletar(id: string) {
    try {
      await deletar(id)
      toast.success("Escola removida!")
      setConfirmandoDelete(null)
    } catch (err) {
      toast.error((err as Error).message || "Erro ao remover escola")
    }
  }

  return (
    <div className="p-4 space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Escolas</h2>
          <p className="text-slate-500 text-sm">Escolas atendidas</p>
        </div>
        {!showForm && !editando && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl active:opacity-80"
          >
            <Plus className="h-4 w-4" />
            Nova
          </button>
        )}
      </div>

      {/* Formulário de cadastro */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h3 className="font-bold text-slate-800">Nova Escola</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 active:opacity-70">
              <X className="h-5 w-5" />
            </button>
          </div>
          <EscolaForm
            onSubmit={handleCadastrar}
            onCancel={() => setShowForm(false)}
            isPending={cadastrando}
            submitLabel="Cadastrar"
          />
        </div>
      )}

      {isLoading ? (
        <div className="py-10 text-center text-slate-500">Carregando...</div>
      ) : escolas?.length === 0 ? (
        <div className="py-10 text-center text-slate-500">Nenhuma escola cadastrada.</div>
      ) : (
        <div className="space-y-3">
          {escolas?.map(escola => (
            <div key={escola.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {editando?.id === escola.id ? (
                <>
                  <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <h3 className="font-bold text-slate-800">Editar Escola</h3>
                    <button onClick={() => setEditando(null)} className="text-slate-400 active:opacity-70">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <EscolaForm
                    defaultValues={{
                      nome: escola.nome,
                      telefone: escola.telefone,
                      logradouro: escola.logradouro,
                      numero: escola.numero,
                      bairro: escola.bairro,
                      cidade: escola.cidade,
                      estado: escola.estado,
                      cep: escola.cep,
                    }}
                    onSubmit={handleAtualizar}
                    onCancel={() => setEditando(null)}
                    isPending={atualizando}
                    submitLabel="Salvar"
                  />
                </>
              ) : confirmandoDelete === escola.id ? (
                <div className="p-4 space-y-3">
                  <p className="text-sm text-slate-700 font-medium">
                    Remover <strong>{escola.nome}</strong>?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmandoDelete(null)}
                      className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm active:opacity-70"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleDeletar(escola.id)}
                      className="flex-1 h-10 rounded-xl bg-red-600 text-white font-semibold text-sm active:opacity-80"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl">
                      <School className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{escola.nome}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span>{escola.cidade}{escola.estado ? `, ${escola.estado}` : ""}</span>
                      </div>
                      {escola.telefone && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span>{escola.telefone}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditando(escola)}
                        className="p-2 text-slate-500 active:opacity-70"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmandoDelete(escola.id)}
                        className="p-2 text-red-500 active:opacity-70"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
