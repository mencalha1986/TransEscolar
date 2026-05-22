import { useState } from "react"
import { useMensalidades, usePagarMensalidade } from "@/hooks/useMensalidades"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Search, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export function MensalidadesPage() {
  const [search, setSearch] = useState("")
  const { data: mensalidades, isLoading } = useMensalidades()
  const { mutate: pagar, isPending } = usePagarMensalidade()

  const filtered = mensalidades?.filter(m =>
    m.nomeAluno.toLowerCase().includes(search.toLowerCase())
  )

  const handlePagar = (id: string) => {
    if (confirm("Confirmar recebimento desta mensalidade?")) {
      pagar(id, {
        onSuccess: () => toast.success("Pagamento registrado!"),
        onError: () => toast.error("Erro ao registrar pagamento.")
      })
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-slate-900">Financeiro</h2>
        <p className="text-slate-500">Controle de mensalidades</p>
      </div>

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

      <div className="space-y-3">
        {isLoading ? (
          <div className="py-10 text-center text-slate-500">Carregando dados...</div>
        ) : (
          filtered?.map(m => (
            <div key={m.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900">{m.nomeAluno}</h3>
                  <p className="text-xs text-slate-500">Vencimento: {formatDate(m.dataVencimento)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatCurrency(m.valor)}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    m.status === 'Pago' ? 'bg-green-100 text-green-700' :
                    m.status === 'Atrasado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {m.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {m.status !== 'Pago' && (
                <button
                  onClick={() => handlePagar(m.id)}
                  disabled={isPending}
                  className="w-full h-10 bg-primary text-white text-sm font-bold rounded-lg active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Baixar Pagamento
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
