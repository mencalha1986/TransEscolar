import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { RefreshCw } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { backofficeService } from "@/services/backoffice.service"
import type { StatusEmailLog } from "@/types/backoffice"

const statusVariant: Record<StatusEmailLog, "default" | "secondary" | "destructive"> = {
  Pendente: "secondary",
  Enviado: "default",
  Falha: "destructive",
}

export function EmailLogsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["backoffice", "email-logs"],
    queryFn: backofficeService.listarEmailLogs,
  })

  const reenviar = useMutation({
    mutationFn: (id: string) => backofficeService.reenviarEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backoffice", "email-logs"] })
      toast.success("Email reenviado com sucesso!")
    },
    onError: () => toast.error("Falha ao reenviar email."),
  })

  return (
    <div>
      <PageHeader
        title="Logs de Email"
        description="Histórico de envios de email de acesso"
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Destinatário</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enviado em</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Erro</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.destinatario}</TableCell>
                <TableCell>{log.nome}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[log.status]}>{log.status}</Badge>
                </TableCell>
                <TableCell>
                  {log.enviadoEm ? new Date(log.enviadoEm).toLocaleString("pt-BR") : "—"}
                </TableCell>
                <TableCell>{new Date(log.criadoEm).toLocaleString("pt-BR")}</TableCell>
                <TableCell className="max-w-xs truncate text-xs text-muted-foreground" title={log.erroMensagem}>
                  {log.erroMensagem ?? "—"}
                </TableCell>
                <TableCell>
                  {log.status === "Falha" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reenviar.mutate(log.id)}
                      disabled={reenviar.isPending}
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      Reenviar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {(data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhum log encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
