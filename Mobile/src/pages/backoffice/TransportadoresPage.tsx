import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTransportadores, useDeletarTransportador } from "@/hooks/useBackoffice"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { Plus, Building2, ChevronRight, LogIn, Trash2 } from "lucide-react"
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
  const deletar = useDeletarTransportador()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmDeleteNome, setConfirmDeleteNome] = useState("")

  async function handleAcessar(id: string, nome: string) {
    try {
      await impersonar(id)
      toast.success(`Acessando como ${nome}`)
      navigate("/dashboard")
    } catch (err) {
      toast.error((err as Error).message || "Erro ao acessar transportador")
    }
  }

  async function handleConfirmDelete() {
    if (!confirmDeleteId) return
    try {
      await deletar.mutateAsync(confirmDeleteId)
      toast.success("Transportador removido com sucesso.")
    } catch {
      toast.error("Erro ao remover transportador.")
    } finally {
      setConfirmDeleteId(null)
      setConfirmDeleteNome("")
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
              <div className="px-4 pb-3 flex gap-2">
                <button
                  onClick={() => handleAcessar(t.id, t.nomeEmpresa)}
                  className="flex-1 h-9 flex items-center justify-center gap-2 text-xs font-semibold text-primary border border-primary/30 rounded-xl active:bg-primary/5 transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Acessar como este cliente
                </button>
                <button
                  onClick={() => { setConfirmDeleteId(t.id); setConfirmDeleteNome(t.nomeEmpresa) }}
                  className="h-9 w-9 flex items-center justify-center text-red-500 border border-red-200 rounded-xl active:bg-red-50 transition-colors flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-8">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Remover cliente</h3>
              <p className="text-sm text-slate-500 mt-1">
                Tem certeza que deseja remover <strong>{confirmDeleteNome}</strong>? Esta ação apagará todos os dados associados e não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmDeleteId(null); setConfirmDeleteNome("") }}
                className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 active:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletar.isPending}
                className="flex-1 h-11 rounded-xl bg-red-500 text-sm font-semibold text-white active:opacity-80 disabled:opacity-50"
              >
                {deletar.isPending ? "Removendo..." : "Remover"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
