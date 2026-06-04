import { useNavigate } from "react-router-dom"
import { RefreshCw, ArrowLeft, Mail } from "lucide-react"
import { toast } from "sonner"
import { useEmailLogs, useReenviarEmail } from "@/hooks/useBackoffice"
import type { StatusEmailLog } from "@/types/backoffice"

const STATUS_STYLES: Record<StatusEmailLog, string> = {
  Enviado: "bg-green-100 text-green-700",
  Pendente: "bg-amber-100 text-amber-700",
  Falha: "bg-red-100 text-red-700",
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleString("pt-BR")
}

export function EmailLogsPage() {
  const navigate = useNavigate()
  const { data: logs, isLoading } = useEmailLogs()
  const reenviar = useReenviarEmail()

  async function handleReenviar(id: string) {
    try {
      await reenviar.mutateAsync(id)
      toast.success("Email reenviado com sucesso!")
    } catch {
      toast.error("Falha ao reenviar email.")
    }
  }

  return (
    <div className="p-4 space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl active:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Logs de Email</h2>
          <p className="text-slate-500 text-sm">Histórico de envios de acesso</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-slate-500">Carregando...</div>
      ) : !logs?.length ? (
        <div className="py-10 text-center text-slate-500">Nenhum log encontrado.</div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-indigo-50 rounded-xl flex-shrink-0">
                    <Mail className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{log.nome}</p>
                    <p className="text-xs text-slate-500 truncate">{log.destinatario}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_STYLES[log.status]}`}>
                  {log.status.toUpperCase()}
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-0.5 pl-1">
                <p>Criado: {formatDate(log.criadoEm)}</p>
                {log.enviadoEm && <p>Enviado: {formatDate(log.enviadoEm)}</p>}
                {log.erroMensagem && (
                  <p className="text-red-500 truncate" title={log.erroMensagem}>
                    Erro: {log.erroMensagem}
                  </p>
                )}
              </div>

              {log.status === "Falha" && (
                <button
                  onClick={() => handleReenviar(log.id)}
                  disabled={reenviar.isPending}
                  className="w-full h-9 flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-xl active:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reenviar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
