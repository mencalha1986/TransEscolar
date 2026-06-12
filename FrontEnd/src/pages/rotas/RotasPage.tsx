import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, Route, Users, ChevronDown, ChevronUp } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { rotaService } from "@/services/rota.service"
import { motoristaService } from "@/services/motorista.service"
import type { Rota, Turno } from "@/types/rota"

type FormState = { nome: string; turno: Turno; motoristaId: string; transporteId: string }
const empty: FormState = { nome: "", turno: "Manha", motoristaId: "", transporteId: "" }

const turnoLabel: Record<Turno, string> = { Manha: "Manhã", Tarde: "Tarde", Noturno: "Noturno" }
const turnoColor: Record<Turno, string> = {
  Manha: "bg-amber-100 text-amber-700",
  Tarde: "bg-blue-100 text-blue-700",
  Noturno: "bg-purple-100 text-purple-700",
}

export function RotasPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Rota | null>(null)
  const [form, setForm] = useState<FormState>(empty)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: rotas, isLoading } = useQuery({ queryKey: ["rotas"], queryFn: rotaService.listar })
  const { data: motoristas } = useQuery({ queryKey: ["motoristas"], queryFn: motoristaService.listar })

  const criar = useMutation({
    mutationFn: () => rotaService.criar({ nome: form.nome, turno: form.turno, motoristaId: form.motoristaId || undefined, transporteId: form.transporteId || undefined }),
    onSuccess: () => { toast.success("Rota criada!"); qc.invalidateQueries({ queryKey: ["rotas"] }); fechar() },
    onError: (e: Error) => toast.error(e.message),
  })

  const editar = useMutation({
    mutationFn: () => rotaService.editar(editing!.id, { nome: form.nome, turno: form.turno, motoristaId: form.motoristaId || undefined, transporteId: form.transporteId || undefined }),
    onSuccess: () => { toast.success("Rota atualizada!"); qc.invalidateQueries({ queryKey: ["rotas"] }); fechar() },
    onError: (e: Error) => toast.error(e.message),
  })

  const deletar = useMutation({
    mutationFn: (id: string) => rotaService.deletar(id),
    onSuccess: () => { toast.success("Rota removida!"); qc.invalidateQueries({ queryKey: ["rotas"] }) },
    onError: (e: Error) => toast.error(e.message),
  })

  function abrirNovo() { setEditing(null); setForm(empty); setOpen(true) }
  function abrirEditar(r: Rota) {
    setEditing(r)
    setForm({ nome: r.nome, turno: r.turno, motoristaId: r.motoristaId ?? "", transporteId: r.transporteId ?? "" })
    setOpen(true)
  }
  function fechar() { setOpen(false); setEditing(null); setForm(empty) }
  const set = (k: keyof FormState) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rotas"
        description="Configure as rotas de transporte e atribua motoristas e alunos"
        actions={<Button onClick={abrirNovo}><Plus className="h-4 w-4 mr-1" />Nova Rota</Button>}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : (rotas ?? []).length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Route className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Nenhuma rota cadastrada</p>
            <p className="text-sm mt-1">Crie a primeira rota para começar a organizar sua frota</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(rotas ?? []).map(r => (
            <Card key={r.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${turnoColor[r.turno]}`}>
                      {turnoLabel[r.turno]}
                    </span>
                    <CardTitle className="text-base truncate">{r.nome}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                      {expandedId === r.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => abrirEditar(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deletar.mutate(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                  <span>Motorista: <strong className="text-foreground">{r.nomeMotorista ?? "—"}</strong></span>
                  <span>Veículo: <strong className="text-foreground">{r.placaTransporte ?? "—"}</strong></span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{r.alunoIds.length} alunos</span>
                </div>
              </CardHeader>
              {expandedId === r.id && (
                <CardContent className="pt-0 pb-4">
                  {r.alunoIds.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum aluno vinculado a esta rota ainda.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {r.alunoIds.map(id => (
                        <Badge key={id} variant="secondary" className="text-xs">{id.slice(0, 8)}…</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Rota" : "Nova Rota"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={e => set("nome")(e.target.value)} placeholder="Ex: Rota Centro" />
            </div>
            <div className="space-y-1">
              <Label>Turno *</Label>
              <Select value={form.turno} onValueChange={(v: string | null) => { if (v) set("turno")(v) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manha">Manhã</SelectItem>
                  <SelectItem value="Tarde">Tarde</SelectItem>
                  <SelectItem value="Noturno">Noturno</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Motorista</Label>
              <Select value={form.motoristaId} onValueChange={(v: string | null) => set("motoristaId")(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motorista..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— Nenhum —</SelectItem>
                  {(motoristas ?? []).filter(m => m.ativo).map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                className="flex-1"
                disabled={criar.isPending || editar.isPending || !form.nome}
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
