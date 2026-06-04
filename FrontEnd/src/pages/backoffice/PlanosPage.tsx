import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { backofficeService } from "@/services/backoffice.service"

export function PlanosPage() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ["backoffice", "planos"], queryFn: backofficeService.listarPlanos })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    nome: "",
    precoMensal: "",
    limiteAlunos: "",
    limiteRotas: "",
    retencaoHistoricoDias: "",
    descricao: "",
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => backofficeService.removerPlano(id),
    onSuccess: () => {
      toast.success("Plano removido!")
      qc.invalidateQueries({ queryKey: ["backoffice", "planos"] })
    },
    onError: (err: Error) => toast.error(err.message || "Erro ao remover plano"),
  })

  const mutation = useMutation({
    mutationFn: () => backofficeService.criarPlano({
      nome: form.nome,
      precoMensal: Number(form.precoMensal),
      limiteAlunos: form.limiteAlunos ? Number(form.limiteAlunos) : undefined,
      limiteRotas: form.limiteRotas ? Number(form.limiteRotas) : undefined,
      retencaoHistoricoDias: form.retencaoHistoricoDias ? Number(form.retencaoHistoricoDias) : undefined,
      descricao: form.descricao || undefined,
    }),
    onSuccess: () => {
      toast.success("Plano criado!")
      qc.invalidateQueries({ queryKey: ["backoffice", "planos"] })
      setShowForm(false)
      setForm({ nome: "", precoMensal: "", limiteAlunos: "", limiteRotas: "", retencaoHistoricoDias: "", descricao: "" })
    },
    onError: () => toast.error("Erro ao criar plano"),
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-4">
      <PageHeader
        title="Planos"
        description="Planos de assinatura disponíveis"
        actions={<Button onClick={() => setShowForm(!showForm)}>+ Novo Plano</Button>}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Plano</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <Label>Nome</Label>
              <Input value={form.nome} onChange={set("nome")} placeholder="Básico, Profissional..." />
            </div>
            <div className="space-y-1">
              <Label>Preço Mensal (R$)</Label>
              <Input type="number" value={form.precoMensal} onChange={set("precoMensal")} />
            </div>
            <div className="space-y-1">
              <Label>Limite de Alunos</Label>
              <Input type="number" value={form.limiteAlunos} onChange={set("limiteAlunos")} placeholder="Ilimitado" />
            </div>
            <div className="space-y-1">
              <Label>Limite de Rotas</Label>
              <Input type="number" value={form.limiteRotas} onChange={set("limiteRotas")} placeholder="Ilimitado" />
            </div>
            <div className="space-y-1">
              <Label>Retenção de Histórico (dias)</Label>
              <Input type="number" value={form.retencaoHistoricoDias} onChange={set("retencaoHistoricoDias")} placeholder="Ilimitado" />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Descrição</Label>
              <Input value={form.descricao} onChange={set("descricao")} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Alunos</TableHead>
            <TableHead>Rotas</TableHead>
            <TableHead>Histórico</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data ?? []).map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.nome}</TableCell>
              <TableCell>R$ {p.precoMensal.toFixed(2)}</TableCell>
              <TableCell>{p.limiteAlunos ?? "Ilimitado"}</TableCell>
              <TableCell>{p.limiteRotas ?? "Ilimitado"}</TableCell>
              <TableCell>{p.retencaoHistoricoDias ? `${p.retencaoHistoricoDias} dias` : "Ilimitado"}</TableCell>
              <TableCell>
                <Badge variant={p.ativo ? "default" : "secondary"}>{p.ativo ? "Ativo" : "Inativo"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (confirm(`Remover o plano "${p.nome}"?`)) deleteMutation.mutate(p.id)
                  }}
                >
                  Remover
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
