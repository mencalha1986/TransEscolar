import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAlunos } from "@/hooks/useAlunos"
import { useMensalidades } from "@/hooks/useMensalidades"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"

function StatCard({ title, value, icon, isLoading }: { title: string; value: string | number; icon: string; isLoading?: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className="text-2xl">{icon}</span>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const { data: alunos, isLoading: loadingAlunos } = useAlunos()
  const { data: mensalidades, isLoading: loadingMensalidades } = useMensalidades()

  const pendentes = mensalidades?.filter((m) => m.status === "Pendente") ?? []
  const atrasadas = mensalidades?.filter((m) => m.status === "Atrasado") ?? []
  const totalPendente = pendentes.reduce((acc, m) => acc + m.valor, 0)

  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral do sistema de transporte escolar" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Alunos"
          value={alunos?.length ?? 0}
          icon="🎒"
          isLoading={loadingAlunos}
        />
        <StatCard
          title="Mensalidades Pendentes"
          value={pendentes.length}
          icon="⏳"
          isLoading={loadingMensalidades}
        />
        <StatCard
          title="Mensalidades Atrasadas"
          value={atrasadas.length}
          icon="⚠️"
          isLoading={loadingMensalidades}
        />
        <StatCard
          title="Total a Receber"
          value={formatCurrency(totalPendente)}
          icon="💰"
          isLoading={loadingMensalidades}
        />
      </div>
    </div>
  )
}
