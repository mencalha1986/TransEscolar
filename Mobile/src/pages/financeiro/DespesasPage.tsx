import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useDespesas, useExcluirDespesa } from "@/hooks/useDespesas"
import { TIPO_DESPESA_LABELS, TIPO_DESPESA_ICONE, type TipoDespesa } from "@/types/despesa"

const TIPOS: TipoDespesa[] = ["Combustivel", "Pedagio", "Manutencao", "Seguro", "IPVA", "Multa", "Lavagem", "Outro"]

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("pt-BR")
}

export function DespesasPage() {
  const navigate = useNavigate()
  const [filtro, setFiltro] = useState<TipoDespesa | "">("")
  const { data: despesas, isLoading } = useDespesas()
  const { mutateAsync: excluir } = useExcluirDespesa()

  const filtradas = filtro ? despesas?.filter(d => d.tipo === filtro) : despesas

  async function handleExcluir(id: string) {
    if (!confirm("Excluir esta despesa?")) return
    try {
      await excluir(id)
      toast.success("Despesa excluída.")
    } catch {
      toast.error("Não foi possível excluir.")
    }
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Despesas</h2>
          <p className="text-slate-500 text-sm">Gastos operacionais do veículo</p>
        </div>
        <button
          onClick={() => navigate("/financeiro/despesas/nova")}
          className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl active:opacity-80"
        >
          <Plus className="h-4 w-4" />
          Nova
        </button>
      </div>

      {/* Filtro por tipo */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFiltro("")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            filtro === "" ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          Todos
        </button>
        {TIPOS.map((t) => (
          <button
            key={t}
            onClick={() => setFiltro(t === filtro ? "" : t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filtro === t ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {TIPO_DESPESA_ICONE[t]} {TIPO_DESPESA_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-10 text-center text-slate-500">Carregando...</div>
        ) : !filtradas?.length ? (
          <div className="py-10 text-center text-slate-500">Nenhuma despesa registrada.</div>
        ) : (
          filtradas.map((d) => (
            <div
              key={d.id}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {TIPO_DESPESA_ICONE[d.tipo] ?? "💳"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-slate-900 text-sm truncate">{d.descricao}</p>
                    <p className="font-bold text-slate-800 text-sm flex-shrink-0">{formatCurrency(d.valor)}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{TIPO_DESPESA_LABELS[d.tipo]}</span>
                    {d.placaVeiculo && (
                      <>
                        <span className="text-slate-200">•</span>
                        <span className="text-xs font-mono text-slate-500">{d.placaVeiculo}</span>
                      </>
                    )}
                    <span className="text-slate-200">•</span>
                    <span className="text-xs text-slate-400">{formatDate(d.dataLancamento)}</span>
                  </div>
                  {d.observacao && (
                    <p className="text-xs text-slate-400 mt-1 truncate">{d.observacao}</p>
                  )}
                </div>
                <button
                  onClick={() => handleExcluir(d.id)}
                  className="p-2 rounded-lg text-slate-400 active:text-red-500 active:bg-red-50 transition-colors flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
