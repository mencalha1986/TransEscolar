import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMensalidades, usePagarMensalidade, useGerarMensalidade } from "@/hooks/useMensalidades"
import { useAlunos } from "@/hooks/useAlunos"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Search, CheckCircle2, Plus, X } from "lucide-react"
import { toast } from "sonner"
import type { StatusMensalidade } from "@/types/mensalidade"

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

const gerarSchema = z.object({
  alunoId: z.string().min(1, "Selecione o aluno"),
  mes: z.string().min(1, "Selecione o mês"),
  ano: z.string().min(4, "Ano inválido"),
})

type GerarFormValues = z.infer<typeof gerarSchema>

const inputClass =
  "w-full h-11 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm"

const STATUS_TABS: { label: string; value: StatusMensalidade | "Todos" }[] = [
  { label: "Todos", value: "Todos" },
  { label: "Pendente", value: "Pendente" },
  { label: "Atrasado", value: "Atrasado" },
  { label: "Pago", value: "Pago" },
]

export function MensalidadesPage() {
  const [search, setSearch] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<StatusMensalidade | "Todos">("Todos")
  const [showGerar, setShowGerar] = useState(false)
  const [confirmPagar, setConfirmPagar] = useState<string | null>(null)

  const { data: mensalidades, isLoading } = useMensalidades()
  const { data: alunos } = useAlunos()
  const { mutateAsync: pagar, isPending: pagando } = usePagarMensalidade()
  const { mutateAsync: gerar, isPending: gerando } = useGerarMensalidade()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GerarFormValues>({
    resolver: zodResolver(gerarSchema),
    defaultValues: {
      mes: String(new Date().getMonth() + 1),
      ano: String(new Date().getFullYear()),
    },
  })

  const filtered = mensalidades?.filter(m => {
    const matchSearch = m.nomeAluno.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFiltro === "Todos" || m.status === statusFiltro
    return matchSearch && matchStatus
  })

  async function handlePagar(id: string) {
    try {
      await pagar(id)
      toast.success("Pagamento registrado!")
      setConfirmPagar(null)
    } catch (err) {
      toast.error((err as Error).message || "Erro ao registrar pagamento")
    }
  }

  async function handleGerar(values: GerarFormValues) {
    try {
      await gerar({
        alunoId: values.alunoId,
        mes: Number(values.mes),
        ano: Number(values.ano),
      })
      toast.success("Mensalidade gerada!")
      reset()
      setShowGerar(false)
    } catch (err) {
      toast.error((err as Error).message || "Erro ao gerar mensalidade")
    }
  }

  return (
    <div className="p-4 space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Financeiro</h2>
          <p className="text-slate-500 text-sm">Controle de mensalidades</p>
        </div>
        {!showGerar && (
          <button
            onClick={() => setShowGerar(true)}
            className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-3 py-2.5 rounded-xl active:opacity-80"
          >
            <Plus className="h-4 w-4" />
            Gerar
          </button>
        )}
      </div>

      {/* Formulário gerar mensalidade */}
      {showGerar && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Gerar Mensalidade</h3>
            <button onClick={() => { setShowGerar(false); reset() }} className="text-slate-400 active:opacity-70">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit(handleGerar)} className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Aluno</p>
              <select className={inputClass} {...register("alunoId")}>
                <option value="">Selecione o aluno...</option>
                {alunos?.map(a => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </select>
              {errors.alunoId && <p className="text-red-600 text-xs mt-1">{errors.alunoId.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Mês</p>
                <select className={inputClass} {...register("mes")}>
                  {MESES.map((m, i) => (
                    <option key={i + 1} value={String(i + 1)}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Ano</p>
                <input
                  type="number"
                  className={inputClass}
                  placeholder={String(new Date().getFullYear())}
                  {...register("ano")}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowGerar(false); reset() }}
                className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm active:opacity-70"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={gerando}
                className="flex-1 h-11 rounded-xl bg-primary text-white font-semibold text-sm active:opacity-80 disabled:opacity-60"
              >
                {gerando ? "Gerando..." : "Gerar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar aluno..."
          className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFiltro(tab.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              statusFiltro === tab.value
                ? "bg-primary text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-10 text-center text-slate-500">Carregando...</div>
        ) : filtered?.length === 0 ? (
          <div className="py-10 text-center text-slate-500">Nenhuma mensalidade encontrada.</div>
        ) : (
          filtered?.map(m => (
            <div key={m.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{m.nomeAluno}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Vencimento: {formatDate(m.dataVencimento)}
                  </p>
                  {m.dataPagamento && (
                    <p className="text-xs text-slate-500">
                      Pago em: {formatDate(m.dataPagamento)}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-bold text-primary">{formatCurrency(m.valor)}</p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.status === "Pago"
                        ? "bg-green-100 text-green-700"
                        : m.status === "Atrasado"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {m.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {m.status !== "Pago" && (
                confirmPagar === m.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmPagar(null)}
                      className="flex-1 h-10 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold active:opacity-70"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handlePagar(m.id)}
                      disabled={pagando}
                      className="flex-1 h-10 bg-green-600 text-white text-sm font-bold rounded-lg active:opacity-80 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Confirmar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmPagar(m.id)}
                    className="w-full h-10 bg-primary/10 text-primary text-sm font-bold rounded-lg active:opacity-70 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Baixar Pagamento
                  </button>
                )
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
