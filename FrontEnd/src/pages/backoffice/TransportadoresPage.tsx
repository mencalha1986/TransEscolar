import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Trash2, Star } from "lucide-react"
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
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["backoffice", "transportadores"], queryFn: backofficeService.listarTransportadores })

  const impersonar = useMutation({
    mutationFn: (id: string) => backofficeService.impersonar(id),
    onSuccess: (token) => {
      const tokenAnterior = localStorage.getItem("token")
      localStorage.setItem("token_superadmin", tokenAnterior ?? "")
      localStorage.setItem("token", token)
      window.location.href = "/dashboard"
    },
    onError: () => toast.error("Erro ao acessar transportador"),
  })

  const deletar = useMutation({
    mutationFn: (id: string) => backofficeService.deletarTransportador(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backoffice", "transportadores"] })
      toast.success("Transportador removido!")
    },
    onError: () => toast.error("Não foi possível remover o transportador."),
  })

  async function onDeletar(id: string, nomeEmpresa: string) {
    if (!window.confirm(`Remover "${nomeEmpresa}"?\n\nEsta ação apagará todos os dados do cliente (alunos, responsáveis, mensalidades, etc.) e não pode ser desfeita.`)) return
    deletar.mutate(id)
  }

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
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">
                  <span className="flex items-center gap-1.5">
                    {t.nomeEmpresa}
                    {t.vitalicio && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />}
                  </span>
                </TableCell>
                <TableCell>{t.nomeContato}</TableCell>
                <TableCell>{t.email}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{t.nomePlano ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={statusColor[t.status] as "default" | "secondary" | "destructive"}>{t.status}</Badge>
                </TableCell>
                <TableCell>{new Date(t.criadoEm).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="flex gap-2 items-center">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/backoffice/transportadores/${t.id}`)}>
                    Detalhes
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => impersonar.mutate(t.id)} disabled={impersonar.isPending}>
                    Acessar
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDeletar(t.id, t.nomeEmpresa)}
                    disabled={deletar.isPending}
                    aria-label="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
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
