import { useNavigate } from "react-router-dom"
import { useAlunos } from "@/hooks/useAlunos"
import { useMensalidades } from "@/hooks/useMensalidades"
import { useAuth } from "@/contexts/AuthContext"
import { Users, AlertCircle, AlertTriangle, DollarSign } from "lucide-react"

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

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: alunos, isLoading: loadingAlunos } = useAlunos()
  const { data: mensalidades, isLoading: loadingMensalidades } = useMensalidades()

  const pendentes = mensalidades?.filter(m => m.status === "Pendente").length ?? 0
  const atrasadas = mensalidades?.filter(m => m.status === "Atrasado").length ?? 0
  const valorAReceber =
    mensalidades
      ?.filter(m => m.status !== "Pago")
      .reduce((acc, m) => acc + m.valor, 0) ?? 0

  const loading = loadingAlunos || loadingMensalidades

  return (
    <div className="p-4 space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-slate-900">Olá, {user?.nome?.split(" ")[0]}! 👋</h2>
        <p className="text-slate-500">Aqui está o resumo do dia.</p>
      </section>

      <div className="grid grid-cols-1 gap-3">
        <StatCard
          title="Total de Alunos"
          value={loading ? "..." : (alunos?.length ?? 0)}
          icon={Users}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Mensalidades Pendentes"
          value={loading ? "..." : pendentes}
          icon={AlertCircle}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Mensalidades Atrasadas"
          value={loading ? "..." : atrasadas}
          icon={AlertTriangle}
          color="bg-red-50 text-red-600"
        />
        <StatCard
          title="Valor a Receber"
          value={loading ? "..." : formatCurrency(valorAReceber)}
          icon={DollarSign}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Alunos Recentes</h3>
          <button
            onClick={() => navigate("/alunos")}
            className="text-primary text-sm font-semibold"
          >
            Ver todos
          </button>
        </div>

        <div className="space-y-3">
          {loadingAlunos ? (
            <p className="text-slate-500 text-sm">Carregando...</p>
          ) : (
            alunos?.slice(0, 3).map(aluno => (
              <button
                key={aluno.id}
                onClick={() => navigate(`/alunos/${aluno.id}`)}
                className="w-full bg-white p-3 rounded-xl flex items-center gap-3 border border-slate-100 active:bg-slate-50 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-700">
                  {aluno.nome.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-slate-800">{aluno.nome}</p>
                  <p className="text-xs text-slate-500">{aluno.escolaNome}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full font-medium">
                  {aluno.turno}
                </span>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
