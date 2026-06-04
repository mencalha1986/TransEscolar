import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, QrCode, Copy, Clock, CheckCircle2, AlertTriangle, XCircle, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { useMinhaAssinatura, useGerarPixAssinatura, useMeusPagamentosAssinatura } from "@/hooks/useBackoffice"
import type { PixDto } from "@/types/mensalidade"
import type { StatusAssinatura } from "@/types/backoffice"

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

const STATUS_STYLE: Record<StatusAssinatura, { label: string; color: string; icon: React.ElementType }> = {
  Ativa: { label: "Ativa", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  Inadimplente: { label: "Inadimplente", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  Cancelada: { label: "Cancelada", color: "bg-slate-100 text-slate-600", icon: XCircle },
}

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR")
}

export function MinhaAssinaturaPage() {
  const navigate = useNavigate()
  const { data: assinatura, isLoading } = useMinhaAssinatura()
  const { data: pagamentos, isLoading: loadingPagamentos } = useMeusPagamentosAssinatura()
  const { mutateAsync: gerarPix, isPending: gerando } = useGerarPixAssinatura()
  const [pixModal, setPixModal] = useState<PixDto | null>(null)
  const [mostrarPagamentos, setMostrarPagamentos] = useState(false)

  async function handleGerarPix() {
    try {
      const pix = await gerarPix()
      setPixModal(pix)
    } catch (err) {
      toast.error((err as Error).message || "Erro ao gerar PIX")
    }
  }

  function copiar(brCode: string) {
    navigator.clipboard.writeText(brCode).then(() => toast.success("Código PIX copiado!"))
  }

  const statusInfo = assinatura ? STATUS_STYLE[assinatura.status] : null

  return (
    <div className="pb-8">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-slate-600 active:opacity-70">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Minha Assinatura</h1>
      </div>

      {/* Modal PIX */}
      {pixModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setPixModal(null)}>
          <div
            className="bg-white w-full rounded-t-3xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-900 text-center">Pagar Assinatura via PIX</h3>
            <div className="flex justify-center">
              <img src={pixModal.brCodeBase64} alt="QR Code PIX" className="w-52 h-52 rounded-xl border border-slate-100" />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
              <Clock className="h-3.5 w-3.5" />
              <span>Válido até {new Date(pixModal.expiresAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Copia e cola</p>
              <p className="text-xs text-slate-700 break-all font-mono leading-relaxed">{pixModal.brCode}</p>
              <button
                onClick={() => copiar(pixModal.brCode)}
                className="w-full h-10 bg-primary text-white text-sm font-semibold rounded-xl active:opacity-80 flex items-center justify-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copiar código PIX
              </button>
            </div>
            <p className="text-xs text-slate-400 text-center">
              Após o pagamento, sua assinatura será renovada automaticamente.
            </p>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
          </div>
        ) : !assinatura ? (
          <div className="py-12 text-center text-slate-400">
            <p>Nenhuma assinatura ativa encontrada.</p>
            <p className="text-xs mt-1">Entre em contato com o suporte.</p>
          </div>
        ) : (
          <>
            {/* Card principal */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                    {assinatura.nomePlano}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-0.5">{formatCurrency(assinatura.valorContratado)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">por mês</p>
                </div>
                {statusInfo && (
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${statusInfo.color}`}>
                    <statusInfo.icon className="h-3.5 w-3.5" />
                    {statusInfo.label}
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-slate-50">
                <p className="text-xs text-slate-500">Próximo vencimento</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {formatDate(assinatura.dataProximoVencimento)}
                </p>
              </div>
            </div>

            {/* Aviso se inadimplente */}
            {assinatura.status === "Inadimplente" && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-700">Assinatura vencida</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Regularize o pagamento para continuar utilizando o sistema.
                  </p>
                </div>
              </div>
            )}

            {/* Botão PIX */}
            {assinatura.status !== "Cancelada" && (
              <button
                onClick={handleGerarPix}
                disabled={gerando}
                className="w-full h-14 bg-primary text-white font-bold text-sm rounded-2xl active:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2.5"
              >
                <QrCode className="h-5 w-5" />
                {gerando ? "Gerando QR Code..." : "Pagar via PIX"}
              </button>
            )}

            {/* Histórico de pagamentos */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <button
                onClick={() => setMostrarPagamentos(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 active:bg-slate-50"
              >
                <p className="text-sm font-semibold text-slate-800">Histórico de pagamentos</p>
                <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${mostrarPagamentos ? "rotate-90" : ""}`} />
              </button>

              {mostrarPagamentos && (
                <div className="border-t border-slate-50">
                  {loadingPagamentos ? (
                    <div className="p-4 space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : !pagamentos?.length ? (
                    <p className="text-center text-xs text-slate-400 py-6">
                      Nenhum pagamento registrado.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {pagamentos.map(p => (
                        <div key={p.id} className="flex items-center justify-between px-5 py-3">
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {MESES[(p.competenciaMes ?? 1) - 1]}/{p.competenciaAno}
                            </p>
                            <p className="text-xs text-slate-400">{formatDate(p.dataPagamento)}</p>
                          </div>
                          <p className="text-sm font-bold text-green-600">
                            {formatCurrency(p.valorPago)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
