import { useState } from "react"
import { toast } from "sonner"
import { Receipt, ChevronDown, ChevronUp, Plus } from "lucide-react"
import { useAssinaturas, usePagamentosAssinatura, useRegistrarPagamentoAssinatura } from "@/hooks/useBackoffice"
import type { StatusAssinatura } from "@/types/backoffice"

const STATUS_COLORS: Record<StatusAssinatura, string> = {
  Ativa: "bg-green-100 text-green-700",
  Inadimplente: "bg-red-100 text-red-700",
  Cancelada: "bg-slate-100 text-slate-600",
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR")
}

function AssinaturaCard({ assinatura }: { assinatura: { id: string; transportadorId: string; nomeTransportador: string; planoId: string; nomePlano: string; valorContratado: number; status: StatusAssinatura; dataProximoVencimento: string } }) {
  const [expanded, setExpanded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const now = new Date()
  const [mes, setMes] = useState(String(now.getMonth() + 1))
  const [ano, setAno] = useState(String(now.getFullYear()))
  const [valor, setValor] = useState("")
  const [obs, setObs] = useState("")

  const { data: pagamentos, isLoading: carregandoPagamentos } = usePagamentosAssinatura(
    expanded ? assinatura.id : ""
  )
  const { mutateAsync: registrar, isPending: registrando } = useRegistrarPagamentoAssinatura()

  async function handleRegistrar() {
    if (!valor) { toast.error("Informe o valor pago"); return }
    try {
      await registrar({
        assinaturaId: assinatura.id,
        valorPago: parseFloat(valor),
        competenciaMes: parseInt(mes),
        competenciaAno: parseInt(ano),
        observacao: obs || undefined,
      })
      toast.success("Pagamento registrado")
      setShowForm(false)
      setValor("")
      setObs("")
    } catch (err) {
      toast.error((err as Error).message || "Erro ao registrar pagamento")
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100">
      <button
        className="w-full p-4 flex items-start gap-3 active:opacity-70"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="p-2.5 bg-amber-50 rounded-xl flex-shrink-0">
          <Receipt className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-900 truncate">{assinatura.nomeTransportador}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[assinatura.status]}`}>
              {assinatura.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-primary font-medium mt-0.5">{assinatura.nomePlano}</p>
          <p className="text-lg font-bold text-slate-800 mt-1">{formatCurrency(assinatura.valorContratado)}/mês</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Próximo vencimento: {formatDate(assinatura.dataProximoVencimento)}
          </p>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 space-y-3 pt-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pagamentos</h4>
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-1 text-primary text-xs font-semibold active:opacity-70"
            >
              <Plus className="h-3.5 w-3.5" />
              Registrar
            </button>
          </div>

          {showForm && (
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Mês</label>
                  <select
                    value={mes}
                    onChange={e => setMes(e.target.value)}
                    className="w-full h-9 border border-slate-200 rounded-lg px-2 text-sm bg-white"
                  >
                    {MESES.map((m, i) => (
                      <option key={i} value={String(i + 1)}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Ano</label>
                  <input
                    type="number"
                    value={ano}
                    onChange={e => setAno(e.target.value)}
                    className="w-full h-9 border border-slate-200 rounded-lg px-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Valor pago (R$)</label>
                <input
                  type="number"
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                  placeholder="0,00"
                  className="w-full h-9 border border-slate-200 rounded-lg px-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Observação (opcional)</label>
                <input
                  type="text"
                  value={obs}
                  onChange={e => setObs(e.target.value)}
                  className="w-full h-9 border border-slate-200 rounded-lg px-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 h-9 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg active:opacity-70"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegistrar}
                  disabled={registrando}
                  className="flex-1 h-9 bg-primary text-white text-sm font-semibold rounded-lg active:opacity-80 disabled:opacity-50"
                >
                  {registrando ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          )}

          {carregandoPagamentos ? (
            <p className="text-xs text-slate-400 text-center py-2">Carregando...</p>
          ) : pagamentos?.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-2">Nenhum pagamento registrado.</p>
          ) : (
            <div className="space-y-2">
              {pagamentos?.map(p => (
                <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-b-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{MESES[p.competenciaMes - 1]}/{p.competenciaAno}</p>
                    {p.observacao && <p className="text-xs text-slate-400">{p.observacao}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{formatCurrency(p.valorPago)}</p>
                    <p className="text-xs text-slate-400">{formatDate(p.dataPagamento)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
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
            <AssinaturaCard key={a.id} assinatura={a} />
          ))}
        </div>
      )}
    </div>
  )
}
