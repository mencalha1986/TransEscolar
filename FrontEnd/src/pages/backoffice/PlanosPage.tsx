import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { backofficeService } from "@/services/backoffice.service"

export function PlanosPage() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ["backoffice", "planos"], queryFn: backofficeService.listarPlanos })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: "", precoMensal: "", limiteAlunos: "", descricao: "" })

  const mutation = useMutation({
    mutationFn: () => backofficeService.criarPlano({
      nome: form.nome,
      precoMensal: Number(form.precoMensal),
      limiteAlunos: form.limiteAlunos ? Number(form.limiteAlunos) : undefined,
      descricao: form.descricao || undefined,
    }),
    onSuccess: () => {
      toast.success("Plano criado!")
      qc.invalidateQueries({ queryKey: ["backoffice", "planos"] })
      setShowForm(false)
      setForm({ nome: "", precoMensal: "", limiteAlunos: "", descricao: "" })
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

      {showForm && (
        <Card>
          <CardContent className="pt-6 grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <Label>Nome</Label>
              <Input value={form.nome} onChange={set("nome")} placeholder="Básico, Profissional..." />
            </div>
            <div className="space-y-1">
              <Label>Preço Mensal (R$)</Label>
              <Input type="number" value={form.precoMensal} onChange={set("precoMensal")} />
            </div>
            <div className="space-y-1">
              <Label>Limite de Alunos (vazio = ilimitado)</Label>
              <Input type="number" value={form.limiteAlunos} onChange={set("limiteAlunos")} />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Descrição</Label>
              <Input value={form.descricao} onChange={set("descricao")} />
            </div>
            <div className="col-span-2 flex gap-2">
              <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>Salvar</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Limite de Alunos</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data ?? []).map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.nome}</TableCell>
              <TableCell>R$ {p.precoMensal.toFixed(2)}</TableCell>
              <TableCell>{p.limiteAlunos ?? "Ilimitado"}</TableCell>
              <TableCell>
                <Badge variant={p.ativo ? "default" : "secondary"}>{p.ativo ? "Ativo" : "Inativo"}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
