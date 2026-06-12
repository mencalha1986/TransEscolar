import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Trash2, BarChart2 } from "lucide-react"
import { Link } from "react-router-dom"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDespesas, useCriarDespesa, useExcluirDespesa } from "@/hooks/useDespesas"
import { formatDate, formatCurrency } from "@/lib/utils"
import { TIPO_DESPESA_LABELS, type TipoDespesa } from "@/types/despesa"

const TIPOS: TipoDespesa[] = ["Combustivel", "Pedagio", "Manutencao", "Seguro", "IPVA", "Multa", "Lavagem", "Outro"]

const schema = z.object({
  tipo: z.enum(["Combustivel", "Pedagio", "Manutencao", "Seguro", "IPVA", "Multa", "Lavagem", "Outro"] as const),
  descricao: z.string().min(1, "Descrição obrigatória").max(300),
  valor: z.number().positive("Valor deve ser maior que zero"),
  dataLancamento: z.string().min(1, "Data obrigatória"),
  observacao: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function NovaDespesaDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutateAsync, isPending } = useCriarDespesa()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: "Combustivel",
      dataLancamento: new Date().toISOString().slice(0, 10),
    },
  })

  const tipo = watch("tipo")

  async function onSubmit(values: FormValues) {
    try {
      await mutateAsync({
        tipo: values.tipo,
        descricao: values.descricao,
        valor: values.valor,
        dataLancamento: values.dataLancamento,
        observacao: values.observacao || undefined,
      })
      toast.success("Despesa registrada!")
      reset()
      onClose()
    } catch {
      toast.error("Não foi possível registrar a despesa.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose() } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Despesa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setValue("tipo", v as TipoDespesa)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => (
                  <SelectItem key={t} value={t}>{TIPO_DESPESA_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Descrição</Label>
            <Input {...register("descricao")} placeholder="Ex: Abastecimento posto Shell" />
            {errors.descricao && <p className="text-destructive text-sm">{errors.descricao.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Valor (R$)</Label>
              <Input {...register("valor", { valueAsNumber: true })} type="number" step="0.01" placeholder="0,00" />
              {errors.valor && <p className="text-destructive text-sm">{errors.valor.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Data</Label>
              <Input {...register("dataLancamento")} type="date" />
              {errors.dataLancamento && <p className="text-destructive text-sm">{errors.dataLancamento.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Observação <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Input {...register("observacao")} placeholder="Informações adicionais..." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => { reset(); onClose() }}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DespesasPage() {
  const [novaOpen, setNovaOpen] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<TipoDespesa | "">("")
  const { data: despesas, isLoading } = useDespesas(filtroTipo ? { tipo: filtroTipo } : undefined)
  const { mutateAsync: excluir } = useExcluirDespesa()

  async function handleExcluir(id: string) {
    if (!confirm("Excluir esta despesa?")) return
    try {
      await excluir(id)
      toast.success("Despesa excluída.")
    } catch {
      toast.error("Não foi possível excluir.")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Despesas"
        description="Registro de gastos operacionais do veículo"
        actions={
          <div className="flex gap-2">
            <Link to="/financeiro/resumo" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <BarChart2 className="h-4 w-4 mr-2" />Resumo
            </Link>
            <Button size="sm" onClick={() => setNovaOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />Nova Despesa
            </Button>
          </div>
        }
      />

      {/* Filtro por tipo */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filtroTipo === "" ? "default" : "outline"}
          size="sm"
          onClick={() => setFiltroTipo("")}
        >
          Todos
        </Button>
        {TIPOS.map((t) => (
          <Button
            key={t}
            variant={filtroTipo === t ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroTipo(t)}
          >
            {TIPO_DESPESA_LABELS[t]}
          </Button>
        ))}
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}><Skeleton className="h-5 w-full" /></TableCell>
                </TableRow>
              ))
            ) : !despesas?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhuma despesa registrada.
                </TableCell>
              </TableRow>
            ) : (
              despesas.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Badge variant="outline">{TIPO_DESPESA_LABELS[d.tipo] ?? d.tipoDescricao}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{d.descricao}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{d.placaVeiculo ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(d.dataLancamento)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(d.valor)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleExcluir(d.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <NovaDespesaDialog open={novaOpen} onClose={() => setNovaOpen(false)} />
    </div>
  )
}
