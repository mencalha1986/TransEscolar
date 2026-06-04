import { useQuery } from "@tanstack/react-query"
import { PageHeader } from "@/components/layout/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { backofficeService } from "@/services/backoffice.service"
import type { StatusAssinatura } from "@/types/backoffice"

const statusColor: Record<StatusAssinatura, "default" | "secondary" | "destructive"> = {
  Ativa: "default",
  Inadimplente: "destructive",
  Cancelada: "secondary",
}

export function AssinaturasPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["backoffice", "assinaturas"],
    queryFn: backofficeService.listarAssinaturas,
  })

  return (
    <div>
      <PageHeader title="Assinaturas" description="Controle de assinaturas e pagamentos" />

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Próximo Vencimento</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.nomeTransportador}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{a.nomePlano}</TableCell>
                <TableCell>R$ {a.valorContratado.toFixed(2)}</TableCell>
                <TableCell>{new Date(a.dataProximoVencimento).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>
                  <Badge variant={statusColor[a.status]}>{a.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
