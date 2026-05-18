import { useQuery, useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { backofficeService } from "@/services/backoffice.service"
import type { StatusTransportador } from "@/types/backoffice"

const statusColor: Record<StatusTransportador, string> = {
  Ativo: "default",
  Inativo: "secondary",
  Suspenso: "destructive",
}

export function TransportadoresPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({ queryKey: ["backoffice", "transportadores"], queryFn: backofficeService.listarTransportadores })

  const impersonar = useMutation({
    mutationFn: (id: string) => backofficeService.impersonar(id),
    onSuccess: (token) => {
      const tokenAnterior = localStorage.getItem("token")
      localStorage.setItem("token_superadmin", tokenAnterior ?? "")
      localStorage.setItem("token", token)
      window.location.href = "/"
    },
    onError: () => toast.error("Erro ao acessar transportador"),
  })

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Transportadores cadastrados na plataforma"
        actions={<Button onClick={() => navigate("/backoffice/transportadores/novo")}>+ Novo Transportador</Button>}
      />

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.nomeEmpresa}</TableCell>
                <TableCell>{t.nomeContato}</TableCell>
                <TableCell>{t.email}</TableCell>
                <TableCell>
                  <Badge variant={statusColor[t.status] as "default" | "secondary" | "destructive"}>{t.status}</Badge>
                </TableCell>
                <TableCell>{new Date(t.criadoEm).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/backoffice/transportadores/${t.id}`)}>
                    Detalhes
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => impersonar.mutate(t.id)} disabled={impersonar.isPending}>
                    Acessar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
