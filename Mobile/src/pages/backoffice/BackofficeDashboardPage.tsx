import { useNavigate } from "react-router-dom"
import { useBackofficeDashboard } from "@/hooks/useBackoffice"
import { Building2, Users, AlertTriangle, GraduationCap, DollarSign, Mail, ChevronRight } from "lucide-react"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

export function BackofficeDashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useBackofficeDashboard()

  return (
    <div className="p-4 space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-slate-900">Backoffice</h2>
        <p className="text-slate-500 text-sm">Visão geral da plataforma</p>
      </section>

      <div className="grid grid-cols-1 gap-3">
        <StatCard
          title="Total de Clientes"
          value={isLoading ? "..." : (data?.totalTransportadores ?? 0)}
          icon={Building2}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Clientes Ativos"
          value={isLoading ? "..." : (data?.transportadoresAtivos ?? 0)}
          icon={Users}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          title="Inadimplentes"
          value={isLoading ? "..." : (data?.inadimplentes ?? 0)}
          icon={AlertTriangle}
          color="bg-red-50 text-red-600"
        />
        <StatCard
          title="Total de Alunos"
          value={isLoading ? "..." : (data?.totalAlunos ?? 0)}
          icon={GraduationCap}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Receita Mensal"
          value={isLoading ? "..." : formatCurrency(data?.receitaMensal ?? 0)}
          icon={DollarSign}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Ferramentas</h3>
        <button
          onClick={() => navigate("/backoffice/email-logs")}
          className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 active:bg-slate-50 transition-colors"
        >
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Mail className="h-5 w-5" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-slate-800 text-sm">Logs de Email</p>
            <p className="text-xs text-slate-500 mt-0.5">Histórico e reenvio de emails de acesso</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
      </section>
    </div>
  )
}
