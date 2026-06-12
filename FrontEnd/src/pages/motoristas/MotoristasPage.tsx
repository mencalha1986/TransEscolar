import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, UserCheck } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motoristaService } from "@/services/motorista.service"
import { formatPhone, formatCPFCNPJ, onlyDigitsKeyDown } from "@/lib/masks"
import type { Motorista } from "@/types/motorista"

type FormState = { nome: string; cpf: string; cnh: string; telefone: string }
const empty: FormState = { nome: "", cpf: "", cnh: "", telefone: "" }

export function MotoristasPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Motorista | null>(null)
  const [form, setForm] = useState<FormState>(empty)

  const { data: motoristas, isLoading } = useQuery({
    queryKey: ["motoristas"],
    queryFn: motoristaService.listar,
  })

  const criar = useMutation({
    mutationFn: () => motoristaService.criar({ nome: form.nome, cpf: form.cpf, cnh: form.cnh || undefined, telefone: form.telefone || undefined }),
    onSuccess: () => { toast.success("Motorista cadastrado!"); qc.invalidateQueries({ queryKey: ["motoristas"] }); fechar() },
    onError: (e: Error) => toast.error(e.message),
  })

  const editar = useMutation({
    mutationFn: () => motoristaService.editar(editing!.id, { nome: form.nome, cnh: form.cnh || undefined, telefone: form.telefone || undefined }),
    onSuccess: () => { toast.success("Motorista atualizado!"); qc.invalidateQueries({ queryKey: ["motoristas"] }); fechar() },
    onError: (e: Error) => toast.error(e.message),
  })

  const deletar = useMutation({
    mutationFn: (id: string) => motoristaService.deletar(id),
    onSuccess: () => { toast.success("Motorista removido!"); qc.invalidateQueries({ queryKey: ["motoristas"] }) },
    onError: (e: Error) => toast.error(e.message),
  })

  function abrirNovo() { setEditing(null); setForm(empty); setOpen(true) }
  function abrirEditar(m: Motorista) { setEditing(m); setForm({ nome: m.nome, cpf: m.cpf, cnh: m.cnh ?? "", telefone: m.telefone ?? "" }); setOpen(true) }
  function fechar() { setOpen(false); setEditing(null); setForm(empty) }
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Motoristas"
        description="Gerencie os motoristas da sua frota"
        actions={<Button onClick={abrirNovo}><Plus className="h-4 w-4 mr-1" />Novo Motorista</Button>}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>CNH</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>)}
                  </TableRow>
                ))
              ) : (motoristas ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Nenhum motorista cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                (motoristas ?? []).map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.nome}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{m.cpf}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{m.cnh ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{m.telefone ?? "—"}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {m.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => abrirEditar(m)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deletar.mutate(m.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Motorista" : "Novo Motorista"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={set("nome")} placeholder="Nome completo" />
            </div>
            {!editing && (
              <div className="space-y-1">
                <Label>CPF *</Label>
                <Input
                  value={form.cpf}
                  inputMode="numeric"
                  onKeyDown={onlyDigitsKeyDown}
                  onChange={e => setForm(f => ({ ...f, cpf: formatCPFCNPJ(e.target.value) }))}
                  placeholder="000.000.000-00"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label>CNH</Label>
              <Input value={form.cnh} onChange={set("cnh")} placeholder="Número da CNH" />
            </div>
            <div className="space-y-1">
              <Label>Telefone</Label>
              <Input
                value={form.telefone}
                inputMode="numeric"
                onKeyDown={onlyDigitsKeyDown}
                onChange={e => setForm(f => ({ ...f, telefone: formatPhone(e.target.value) }))}
                placeholder="(11) 99999-0000"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                className="flex-1"
                disabled={criar.isPending || editar.isPending}
                onClick={() => editing ? editar.mutate() : criar.mutate()}
              >
                {(criar.isPending || editar.isPending) ? "Salvando..." : "Salvar"}
              </Button>
              <Button variant="outline" onClick={fechar}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
