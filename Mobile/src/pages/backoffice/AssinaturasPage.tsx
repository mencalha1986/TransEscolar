import { useAssinaturas } from "@/hooks/useBackoffice"
import { Receipt } from "lucide-react"
import type { StatusAssinatura } from "@/types/backoffice"

const STATUS_COLORS: Record<StatusAssinatura, string> = {
  Ativa: "bg-green-100 text-green-700",
  Inadimplente: "bg-red-100 text-red-700",
  Cancelada: "bg-slate-100 text-slate-600",
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR")
}

export function AssinaturasPage() {
  const { data: assinaturas, isLoading } = useAssinaturas()

  return (
    <div className="p-4 space-y-4 pb-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Assinaturas</h2>
        <p className="text-slate-500 text-sm">Contratos dos clientes</p>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-slate-500">Carregando...</div>
      ) : assinaturas?.length === 0 ? (
        <div className="py-10 text-center text-slate-500">Nenhuma assinatura encontrada.</div>
      ) : (
        <div className="space-y-3">
          {assinaturas?.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-50 rounded-xl flex-shrink-0">
                  <Receipt className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs text-slate-500 truncate">
                      {a.transportadorId.slice(0, 8)}...
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[a.status]}`}>
                      {a.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-primary mt-1">{formatCurrency(a.valorContratado)}/mês</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Próximo vencimento: {formatDate(a.dataProximoVencimento)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
