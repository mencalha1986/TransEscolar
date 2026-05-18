import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { backofficeService } from "@/services/backoffice.service"
import type { StatusTransportador } from "@/types/backoffice"

export function TransportadorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["backoffice", "transportadores", id],
    queryFn: () => backofficeService.obterTransportador(id!),
    enabled: !!id,
  })

  const alterarStatus = useMutation({
    mutationFn: (status: StatusTransportador) => backofficeService.alterarStatus(id!, status),
    onSuccess: () => {
      toast.success("Status atualizado!")
      qc.invalidateQueries({ queryKey: ["backoffice", "transportadores", id] })
    },
  })

  const impersonar = useMutation({
    mutationFn: () => backofficeService.impersonar(id!),
    onSuccess: (token) => {
      localStorage.setItem("token_superadmin", localStorage.getItem("token") ?? "")
      localStorage.setItem("token", token)
      window.location.href = "/"
    },
  })

  if (isLoading) return <Skeleton className="h-64 w-full" />
  if (!data) return <p>Transportador não encontrado.</p>

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.nomeEmpresa}
        description={`CPF/CNPJ: ${data.cpfCnpj}`}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
            <Button onClick={() => impersonar.mutate()} disabled={impersonar.isPending}>
              Acessar como este cliente
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Status</CardTitle></CardHeader>
          <CardContent>
            <Badge variant={data.status === "Ativo" ? "default" : data.status === "Suspenso" ? "destructive" : "secondary"}>
              {data.status}
            </Badge>
            <div className="flex gap-2 mt-3">
              {data.status !== "Ativo" && (
                <Button size="sm" variant="outline" onClick={() => alterarStatus.mutate("Ativo")}>Ativar</Button>
              )}
              {data.status !== "Suspenso" && (
                <Button size="sm" variant="destructive" onClick={() => alterarStatus.mutate("Suspenso")}>Suspender</Button>
              )}
              {data.status !== "Inativo" && (
                <Button size="sm" variant="ghost" onClick={() => alterarStatus.mutate("Inativo")}>Inativar</Button>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Total de Alunos</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.totalAlunos}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Contato</CardTitle></CardHeader>
          <CardContent>
            <p className="font-medium">{data.nomeContato}</p>
            <p className="text-sm text-muted-foreground">{data.email}</p>
            {data.telefone && <p className="text-sm text-muted-foreground">{data.telefone}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
