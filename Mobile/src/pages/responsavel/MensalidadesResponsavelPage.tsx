import { useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { usePerfilResponsavel } from "@/hooks/useResponsaveis"
import { useMensalidades } from "@/hooks/useMensalidades"
import type { StatusMensalidade } from "@/types/mensalidade"

const STATUS_CONFIG: Record<StatusMensalidade, { label: string; className: string }> = {
  Pendente: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
  Pago: { label: "Pago", className: "bg-green-100 text-green-800" },
  Atrasado: { label: "Atrasado", className: "bg-red-100 text-red-800" },
}

const TURNO_LABEL: Record<string, string> = {
  Manha: "Manhã", Tarde: "Tarde", Noturno: "Noturno",
}

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR")
}

function formatMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function MensalidadesResponsavelPage() {
  const navigate = useNavigate()
  const { data: perfil, isLoading: loadingPerfil } = usePerfilResponsavel()
  const alunoIds = new Set(perfil?.alunos.map(a => a.id) ?? [])

  const { data: todasMensalidades = [], isLoading: loadingMens } = useMensalidades()
  const mensalidades = todasMensalidades.filter(m => alunoIds.has(m.alunoId))

  const isLoading = loadingPerfil || loadingMens

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg active:bg-slate-100">
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Mensalidades</h2>
          <p className="text-xs text-slate-500">Situação das mensalidades dos seus filhos</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-100 h-20 animate-pulse" />)}
        </div>
      ) : mensalidades.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
          <p className="text-sm">Nenhuma mensalidade encontrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mensalidades.map(m => {
            const s = STATUS_CONFIG[m.status]
            return (
              <div key={m.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{m.nomeAluno}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {TURNO_LABEL[m.turno] ?? m.turno} · {m.competencia}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Venc. {formatData(m.dataVencimento)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-slate-900">{formatMoeda(m.valor)}</p>
                    <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${s.className}`}>
                      {s.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
