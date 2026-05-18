import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEscolas, useCadastrarEscola, useAtualizarEscola, useDeletarEscola } from "@/hooks/useEscolas"
import { formatPhone, formatCEP, onlyDigitsKeyDown } from "@/lib/masks"
import type { EscolaDto } from "@/types/escola"

const schema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  telefone: z.string().min(1, "Telefone obrigatório"),
  logradouro: z.string().min(1, "Logradouro obrigatório"),
  numero: z.string().min(1, "Número obrigatório"),
  bairro: z.string().min(1, "Bairro obrigatório"),
  cidade: z.string().min(1, "Cidade obrigatória"),
  estado: z.string().length(2, "Use a sigla do estado (ex: SP)"),
  cep: z.string().min(8, "CEP inválido"),
})

type FormValues = z.infer<typeof schema>

function EscolaForm({
  defaultValues,
  onSubmit,
  isPending,
  onCancel,
}: {
  defaultValues?: Partial<FormValues>
  onSubmit: (v: FormValues) => void
  isPending: boolean
  onCancel: () => void
}) {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1 sm:col-span-2">
        <Label>Nome da Escola</Label>
        <Input {...register("nome")} placeholder="Ex: E.E. João da Silva" />
        {errors.nome && <p className="text-destructive text-sm">{errors.nome.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>Telefone</Label>
        <Controller
          control={control}
          name="telefone"
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ""}
              placeholder="(11) 3333-0000"
              inputMode="numeric"
              onKeyDown={onlyDigitsKeyDown}
              onChange={(e) => field.onChange(formatPhone(e.target.value))}
            />
          )}
        />
        {errors.telefone && <p className="text-destructive text-sm">{errors.telefone.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>CEP</Label>
        <Controller
          control={control}
          name="cep"
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ""}
              placeholder="00000-000"
              inputMode="numeric"
              onKeyDown={onlyDigitsKeyDown}
              onChange={(e) => field.onChange(formatCEP(e.target.value))}
            />
          )}
        />
        {errors.cep && <p className="text-destructive text-sm">{errors.cep.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>Logradouro</Label>
        <Input {...register("logradouro")} placeholder="Rua, Avenida..." />
        {errors.logradouro && <p className="text-destructive text-sm">{errors.logradouro.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>Número</Label>
        <Input {...register("numero")} placeholder="123" />
        {errors.numero && <p className="text-destructive text-sm">{errors.numero.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>Bairro</Label>
        <Input {...register("bairro")} />
        {errors.bairro && <p className="text-destructive text-sm">{errors.bairro.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>Cidade</Label>
        <Input {...register("cidade")} />
        {errors.cidade && <p className="text-destructive text-sm">{errors.cidade.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>Estado (sigla)</Label>
        <Input {...register("estado")} placeholder="SP" maxLength={2} className="uppercase" />
        {errors.estado && <p className="text-destructive text-sm">{errors.estado.message}</p>}
      </div>
      <div className="sm:col-span-2 flex gap-2">
        <Button type="submit" disabled={isPending}>{isPending ? "Salvando..." : "Salvar"}</Button>
        <Button type="button" variant="outline" onClick={() => { onCancel(); reset() }}>Cancelar</Button>
      </div>
    </form>
  )
}

export function EscolasPage() {
  const [showForm, setShowForm] = useState(false)
  const [editEscola, setEditEscola] = useState<EscolaDto | null>(null)
  const { data, isLoading } = useEscolas()
  const { mutateAsync: cadastrar, isPending: cadastrando } = useCadastrarEscola()
  const { mutateAsync: atualizar, isPending: atualizando } = useAtualizarEscola()
  const { mutateAsync: deletar } = useDeletarEscola()

  async function onCadastrar(values: FormValues) {
    try {
      await cadastrar(values)
      toast.success("Escola cadastrada!")
      setShowForm(false)
    } catch (err) {
      toast.error("Não foi possível cadastrar a escola. Verifique os dados e tente novamente.")
    }
  }

  async function onAtualizar(values: FormValues) {
    if (!editEscola) return
    try {
      await atualizar({ id: editEscola.id, data: values })
      toast.success("Escola atualizada!")
      setEditEscola(null)
    } catch (err) {
      toast.error("Não foi possível atualizar a escola. Tente novamente.")
    }
  }

  async function onDeletar(escola: EscolaDto) {
    if (!window.confirm(`Remover "${escola.nome}"? Esta ação não pode ser desfeita.`)) return
    try {
      await deletar(escola.id)
      toast.success("Escola removida!")
    } catch (err) {
      toast.error("Não foi possível remover a escola. Tente novamente.")
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Escolas"
        description="Escolas atendidas pelo transportador"
        actions={<Button onClick={() => { setShowForm(!showForm); setEditEscola(null) }}>+ Nova Escola</Button>}
      />

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <EscolaForm
              onSubmit={onCadastrar}
              isPending={cadastrando}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhuma escola cadastrada.</TableCell></TableRow>
              ) : (data ?? []).map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.nome}</TableCell>
                  <TableCell>{e.cidade}</TableCell>
                  <TableCell className="hidden sm:table-cell">{e.telefone}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => { setEditEscola(e); setShowForm(false) }}
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDeletar(e)}
                        aria-label="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!editEscola} onOpenChange={(open) => { if (!open) setEditEscola(null) }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Escola</DialogTitle>
          </DialogHeader>
          {editEscola && (
            <EscolaForm
              defaultValues={{
                nome: editEscola.nome,
                telefone: editEscola.telefone,
                logradouro: editEscola.logradouro,
                numero: editEscola.numero,
                bairro: editEscola.bairro,
                cidade: editEscola.cidade,
                estado: editEscola.estado,
                cep: editEscola.cep,
              }}
              onSubmit={onAtualizar}
              isPending={atualizando}
              onCancel={() => setEditEscola(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
