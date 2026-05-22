import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, ClipboardList, X } from "lucide-react"
import { usePlanos, useCriarPlano } from "@/hooks/useBackoffice"

const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  precoMensal: z.string().min(1, "Preço é obrigatório"),
  limiteAlunos: z.string().optional(),
  descricao: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

const inputClass =
  "w-full h-11 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm"

export function PlanosPage() {
  const { data: planos, isLoading } = usePlanos()
  const { mutateAsync: criarPlano, isPending: criando } = useCriarPlano()
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      await criarPlano({
        nome: values.nome,
        precoMensal: Number(values.precoMensal),
        limiteAlunos: values.limiteAlunos ? Number(values.limiteAlunos) : undefined,
        descricao: values.descricao || undefined,
      })
      toast.success("Plano criado!")
      reset()
      setShowForm(false)
    } catch (err) {
      toast.error((err as Error).message || "Erro ao criar plano")
    }
  }

  return (
    <div className="p-4 space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Planos</h2>
          <p className="text-slate-500 text-sm">Planos de assinatura</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl active:opacity-80"
          >
            <Plus className="h-4 w-4" />
            Novo
          </button>
        )}
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Novo Plano</h3>
            <button onClick={() => { setShowForm(false); reset() }} className="text-slate-400 active:opacity-70">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Nome *</p>
              <input className={inputClass} placeholder="Plano Básico" {...register("nome")} />
              {errors.nome && <p className="text-red-600 text-xs mt-1">{errors.nome.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Preço Mensal (R$) *</p>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  placeholder="99,90"
                  {...register("precoMensal")}
                />
                {errors.precoMensal && <p className="text-red-600 text-xs mt-1">{errors.precoMensal.message}</p>}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Limite de Alunos</p>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="Ilimitado"
                  {...register("limiteAlunos")}
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Descrição</p>
              <input className={inputClass} placeholder="Descrição opcional" {...register("descricao")} />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); reset() }}
                className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm active:opacity-70"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={criando}
                className="flex-1 h-11 rounded-xl bg-primary text-white font-semibold text-sm active:opacity-80 disabled:opacity-60"
              >
                {criando ? "Criando..." : "Criar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {isLoading ? (
        <div className="py-10 text-center text-slate-500">Carregando...</div>
      ) : planos?.length === 0 ? (
        <div className="py-10 text-center text-slate-500">Nenhum plano cadastrado.</div>
      ) : (
        <div className="space-y-3">
          {planos?.map(plano => (
            <div key={plano.id} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl flex-shrink-0">
                  <ClipboardList className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 truncate">{plano.nome}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${plano.ativo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {plano.ativo ? "ATIVO" : "INATIVO"}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-primary mt-1">{formatCurrency(plano.precoMensal)}/mês</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {plano.limiteAlunos ? `Até ${plano.limiteAlunos} alunos` : "Alunos ilimitados"}
                  </p>
                  {plano.descricao && (
                    <p className="text-xs text-slate-400 mt-0.5">{plano.descricao}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
