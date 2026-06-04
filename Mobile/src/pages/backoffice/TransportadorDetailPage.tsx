import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, LogIn, GraduationCap, Mail, Phone, Plus } from "lucide-react"
import { useTransportador, useAlterarStatusTransportador, useCriarAssinatura, usePlanos } from "@/hooks/useBackoffice"
import { useAuth } from "@/contexts/AuthContext"
import type { StatusTransportador } from "@/types/backoffice"

const STATUS_COLORS: Record<StatusTransportador, string> = {
  Ativo: "bg-green-100 text-green-700",
  Inativo: "bg-slate-100 text-slate-600",
  Suspenso: "bg-red-100 text-red-700",
}

function InfoRow({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: React.ElementType }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-b-0">
      {Icon && <Icon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />}
      <div className="flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  )
}

export function TransportadorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { impersonar } = useAuth()
  const { data: transportador, isLoading, error } = useTransportador(id!)
  const { mutateAsync: alterarStatus, isPending: alterando } = useAlterarStatusTransportador()
  const { mutateAsync: criarAssinatura, isPending: criandoAssinatura } = useCriarAssinatura()
  const { data: planos } = usePlanos()
  const [showAssinaturaForm, setShowAssinaturaForm] = useState(false)
  const [planoId, setPlanoId] = useState("")
  const [valorContratado, setValorContratado] = useState("")

  async function handleCriarAssinatura() {
    if (!planoId || !valorContratado) {
      toast.error("Preencha todos os campos")
      return
    }
    try {
      await criarAssinatura({ transportadorId: id!, planoId, valorContratado: parseFloat(valorContratado) })
      toast.success("Assinatura criada com sucesso")
      setShowAssinaturaForm(false)
      setPlanoId("")
      setValorContratado("")
    } catch (err) {
      toast.error((err as Error).message || "Erro ao criar assinatura")
    }
  }

  async function handleAcessar() {
    if (!transportador) return
    try {
      await impersonar(id!)
      toast.success(`Acessando como ${transportador.nomeEmpresa}`)
      navigate("/dashboard")
    } catch (err) {
      toast.error((err as Error).message || "Erro ao acessar")
    }
  }

  async function handleStatus(status: StatusTransportador) {
    try {
      await alterarStatus({ id: id!, status })
      toast.success(`Status alterado para ${status}`)
    } catch (err) {
      toast.error((err as Error).message || "Erro ao alterar status")
    }
  }

  return (
    <div className="pb-8">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b sticky top-0 z-10">
        <button
          onClick={() => navigate("/backoffice/transportadores")}
          className="text-slate-600 active:opacity-70"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Detalhe do Cliente</h1>
      </div>

      {error && <p className="m-4 text-red-600 text-sm">{(error as Error).message}</p>}

      {isLoading ? (
        <div className="p-4 space-y-3">
          <div className="h-6 bg-slate-200 animate-pulse rounded w-48" />
          <div className="h-4 bg-slate-200 animate-pulse rounded w-32" />
        </div>
      ) : transportador ? (
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{transportador.nomeEmpresa}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{transportador.cpfCnpj}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${STATUS_COLORS[transportador.status]}`}>
                {transportador.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-xl">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total de Alunos</p>
              <p className="text-xl font-bold text-slate-900">{transportador.totalAlunos}</p>
            </div>
          </div>

          {/* Contato */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Contato</h3>
            <InfoRow label="Nome" value={transportador.nomeContato} />
            <InfoRow label="Email" value={transportador.email} icon={Mail} />
            {transportador.telefone && (
              <InfoRow label="Telefone" value={transportador.telefone} icon={Phone} />
            )}
          </div>

          {/* Ações de status */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Alterar Status</h3>
            <div className="flex gap-2 flex-wrap">
              {transportador.status !== "Ativo" && (
                <button
                  onClick={() => handleStatus("Ativo")}
                  disabled={alterando}
                  className="flex-1 h-10 bg-green-100 text-green-700 font-semibold text-sm rounded-xl active:opacity-70 disabled:opacity-50"
                >
                  Ativar
                </button>
              )}
              {transportador.status !== "Suspenso" && (
                <button
                  onClick={() => handleStatus("Suspenso")}
                  disabled={alterando}
                  className="flex-1 h-10 bg-amber-100 text-amber-700 font-semibold text-sm rounded-xl active:opacity-70 disabled:opacity-50"
                >
                  Suspender
                </button>
              )}
              {transportador.status !== "Inativo" && (
                <button
                  onClick={() => handleStatus("Inativo")}
                  disabled={alterando}
                  className="flex-1 h-10 bg-slate-100 text-slate-700 font-semibold text-sm rounded-xl active:opacity-70 disabled:opacity-50"
                >
                  Inativar
                </button>
              )}
            </div>
          </div>

          {/* Assinatura */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Assinatura</h3>
              {!showAssinaturaForm && (
                <button
                  onClick={() => setShowAssinaturaForm(true)}
                  className="flex items-center gap-1 text-primary text-sm font-semibold active:opacity-70"
                >
                  <Plus className="h-4 w-4" />
                  Nova
                </button>
              )}
            </div>
            {showAssinaturaForm ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Plano</label>
                  <select
                    value={planoId}
                    onChange={e => setPlanoId(e.target.value)}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm bg-white"
                  >
                    <option value="">Selecione um plano</option>
                    {planos?.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nome} — R$ {p.precoMensal.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Valor contratado (R$)</label>
                  <input
                    type="number"
                    value={valorContratado}
                    onChange={e => setValorContratado(e.target.value)}
                    placeholder="0,00"
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAssinaturaForm(false)}
                    className="flex-1 h-10 bg-slate-100 text-slate-700 font-semibold text-sm rounded-xl active:opacity-70"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCriarAssinatura}
                    disabled={criandoAssinatura}
                    className="flex-1 h-10 bg-primary text-white font-semibold text-sm rounded-xl active:opacity-80 disabled:opacity-50"
                  >
                    {criandoAssinatura ? "Criando..." : "Criar"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Nenhuma assinatura ativa. Clique em "Nova" para criar.</p>
            )}
          </div>

          {/* Acessar */}
          <button
            onClick={handleAcessar}
            className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-white font-bold text-sm rounded-xl active:opacity-80"
          >
            <LogIn className="h-5 w-5" />
            Acessar como este cliente
          </button>
        </div>
      ) : null}
    </div>
  )
}
