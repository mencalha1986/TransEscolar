import { useAlunos } from "@/hooks/useAlunos"
import { Users, AlertCircle, Clock } from "lucide-react"

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
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

export function DashboardPage() {
  const { data: alunos, isLoading } = useAlunos()

  return (
    <div className="p-4 space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-slate-900">Olá, Motorista! 👋</h2>
        <p className="text-slate-500">Aqui está o resumo do dia.</p>
      </section>

      <div className="grid grid-cols-1 gap-4">
        <StatCard
          title="Total de Alunos"
          value={isLoading ? "..." : (alunos?.length ?? 0)}
          icon={Users}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Mensalidades Pendentes"
          value="-"
          icon={AlertCircle}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Próxima Parada"
          value="-"
          icon={Clock}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Alunos Recentes</h3>
          <button className="text-primary text-sm font-semibold">Ver todos</button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <p>Carregando...</p>
          ) : (
            alunos?.slice(0, 3).map(aluno => (
              <div key={aluno.id} className="bg-white p-3 rounded-xl flex items-center gap-3 border border-slate-50">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                  {aluno.nome.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{aluno.nome}</p>
                  <p className="text-xs text-slate-500">{aluno.escolaNome}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full font-medium">
                    {aluno.turno}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
