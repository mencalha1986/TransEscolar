import { useQuery } from "@tanstack/react-query"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { backofficeService } from "@/services/backoffice.service"

function StatCard({ title, value, icon, isLoading }: { title: string; value: string | number; icon: string; isLoading?: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className="text-2xl">{icon}</span>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{value}</div>}
      </CardContent>
    </Card>
  )
}

export function BackofficeDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["backoffice", "dashboard"],
    queryFn: backofficeService.getDashboard,
  })

  return (
    <div>
      <PageHeader title="Backoffice" description="Painel administrativo da plataforma" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total de Clientes" value={data?.totalTransportadores ?? 0} icon="🏢" isLoading={isLoading} />
        <StatCard title="Clientes Ativos" value={data?.transportadoresAtivos ?? 0} icon="✅" isLoading={isLoading} />
        <StatCard title="Inadimplentes" value={data?.inadimplentes ?? 0} icon="⚠️" isLoading={isLoading} />
        <StatCard title="Total de Alunos" value={data?.totalAlunos ?? 0} icon="🎒" isLoading={isLoading} />
        <StatCard
          title="Receita Mensal"
          value={`R$ ${(data?.receitaMensal ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon="💰"
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
