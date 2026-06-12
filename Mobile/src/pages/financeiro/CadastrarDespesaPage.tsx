import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { toast } from "sonner"
import { useCriarDespesa } from "@/hooks/useDespesas"
import { useAuth } from "@/contexts/AuthContext"
import { TIPO_DESPESA_LABELS, TIPO_DESPESA_ICONE, type TipoDespesa } from "@/types/despesa"

const TIPOS: TipoDespesa[] = ["Combustivel", "Pedagio", "Manutencao", "Seguro", "IPVA", "Multa", "Lavagem", "Outro"]

export function CadastrarDespesaPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mutateAsync, isPending } = useCriarDespesa()

  const [tipo, setTipo] = useState<TipoDespesa>("Combustivel")
  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState("")
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [observacao, setObservacao] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const valorNum = parseFloat(valor.replace(",", "."))
    if (!descricao.trim()) return toast.error("Descrição obrigatória.")
    if (isNaN(valorNum) || valorNum <= 0) return toast.error("Valor inválido.")

    try {
      await mutateAsync({
        tipo,
        descricao: descricao.trim(),
        valor: valorNum,
        dataLancamento: data,
        observacao: observacao.trim() || undefined,
      })
      toast.success("Despesa registrada!")
      navigate("/financeiro/despesas")
    } catch {
      toast.error("Não foi possível registrar.")
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 bg-white">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl active:bg-slate-100"
        >
          <ChevronLeft className="h-6 w-6 text-slate-700" />
        </button>
        <div>
          <h2 className="font-bold text-slate-900">Nova Despesa</h2>
          <p className="text-xs text-slate-500">Registrar gasto operacional</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-5">
        {/* Tipo */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Tipo de despesa</label>
          <div className="grid grid-cols-2 gap-2">
            {TIPOS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors ${
                  tipo === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 bg-white text-slate-600 active:bg-slate-50"
                }`}
              >
                <span>{TIPO_DESPESA_ICONE[t]}</span>
                {TIPO_DESPESA_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Descrição</label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Abastecimento posto Shell"
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>

        {/* Valor + Data */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Valor (R$)</label>
            <input
              type="number"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              step="0.01"
              min="0"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
        </div>

        {/* Observação */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Observação <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Informações adicionais..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-14 bg-primary text-white font-bold rounded-2xl active:opacity-80 disabled:opacity-60 transition-opacity"
        >
          {isPending ? "Salvando..." : "Registrar Despesa"}
        </button>
      </form>
    </div>
  )
}
