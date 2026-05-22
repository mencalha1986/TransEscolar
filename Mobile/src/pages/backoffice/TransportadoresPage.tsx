import { useNavigate } from "react-router-dom"
import { useTransportadores } from "@/hooks/useBackoffice"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { Plus, Building2, ChevronRight, LogIn } from "lucide-react"
import type { StatusTransportador } from "@/types/backoffice"

const STATUS_COLORS: Record<StatusTransportador, string> = {
  Ativo: "bg-green-100 text-green-700",
  Inativo: "bg-slate-100 text-slate-600",
  Suspenso: "bg-red-100 text-red-700",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR")
}

export function TransportadoresPage() {
  const navigate = useNavigate()
  const { impersonar } = useAuth()
  const { data: transportadores, isLoading } = useTransportadores()

  async function handleAcessar(id: string, nome: string) {
    try {
      await impersonar(id)
      toast.success(`Acessando como ${nome}`)
      navigate("/dashboard")
    } catch (err) {
      toast.error((err as Error).message || "Erro ao acessar transportador")
    }
  }

  return (
    <div className="p-4 space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Clientes</h2>
          <p className="text-slate-500 text-sm">Transportadores cadastrados</p>
        </div>
        <button
          onClick={() => navigate("/backoffice/transportadores/novo")}
          className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl active:opacity-80"
        >
          <Plus className="h-4 w-4" />
          Novo
        </button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-slate-500">Carregando...</div>
      ) : transportadores?.length === 0 ? (
        <div className="py-10 text-center text-slate-500">Nenhum cliente cadastrado.</div>
      ) : (
        <div className="space-y-3">
          {transportadores?.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <button
                onClick={() => navigate(`/backoffice/transportadores/${t.id}`)}
                className="w-full p-4 flex items-center gap-3 active:bg-slate-50 transition-colors"
              >
                <div className="p-2.5 bg-blue-50 rounded-xl flex-shrink-0">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 truncate">{t.nomeEmpresa}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[t.status]}`}>
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{t.email}</p>
                  <p className="text-xs text-slate-400">Desde {formatDate(t.criadoEm)}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
              </button>
              <div className="px-4 pb-3">
                <button
                  onClick={() => handleAcessar(t.id, t.nomeEmpresa)}
                  className="w-full h-9 flex items-center justify-center gap-2 text-xs font-semibold text-primary border border-primary/30 rounded-xl active:bg-primary/5 transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Acessar como este cliente
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
