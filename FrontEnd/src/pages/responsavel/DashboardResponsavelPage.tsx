import { useQuery } from "@tanstack/react-query"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useResponsavelPerfil } from "@/hooks/useResponsavel"
import { useMensalidades } from "@/hooks/useMensalidades"
import { listarCheckIns } from "@/services/transportes.service"
import { CreditCard, AlertTriangle, MapPin } from "lucide-react"

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

export function DashboardResponsavelPage() {
  const { data: perfil, isLoading: loadingPerfil } = useResponsavelPerfil()
  const alunoIds = new Set(perfil?.alunos.map(a => a.id) ?? [])

  const { data: todasMensalidades = [], isLoading: loadingMens } = useMensalidades()
  const mensalidades = todasMensalidades.filter(m => alunoIds.has(m.alunoId))
  const pendentes = mensalidades.filter(m => m.status === "Pendente")
  const atrasadas = mensalidades.filter(m => m.status === "Atrasado")

  const hoje = new Date().toISOString().slice(0, 10)
  const { data: checkIns = [], isLoading: loadingCheckins } = useQuery({
    queryKey: ["checkins", hoje],
    queryFn: () => listarCheckIns(hoje),
    enabled: alunoIds.size > 0,
  })
  const checkInsHoje = checkIns.filter(c => alunoIds.has(c.alunoId))

  const isLoading = loadingPerfil || loadingMens || loadingCheckins

  return (
    <div>
      <PageHeader title="Início" description="Resumo do transporte escolar dos seus filhos" />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
          {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mensalidades Pendentes</CardTitle>
              <CreditCard className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendentes.length}</div>
              {pendentes.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Total: {pendentes.reduce((s, m) => s + m.valor, 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className={atrasadas.length > 0 ? "border-red-300" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mensalidades Atrasadas</CardTitle>
              <AlertTriangle className={`h-5 w-5 ${atrasadas.length > 0 ? "text-red-500" : "text-muted-foreground/40"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${atrasadas.length > 0 ? "text-red-600" : ""}`}>{atrasadas.length}</div>
              {atrasadas.length > 0 && (
                <p className="text-xs text-red-500 mt-1">Regularize o pagamento</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Check-ins de hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingCheckins ? (
            <div className="px-4 pb-4 space-y-2">
              {[1, 2].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : checkInsHoje.length === 0 ? (
            <p className="px-4 pb-4 text-sm text-muted-foreground">Nenhum registro hoje.</p>
          ) : (
            <div className="divide-y">
              {checkInsHoje.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.tipo === "Embarque" ? "bg-blue-500" : "bg-green-500"}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{c.alunoNome}</span>
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${c.tipo === "Embarque" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      {c.tipo}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{formatHora(c.horaRegistro)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
