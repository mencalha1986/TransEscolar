import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Copy, CheckCircle, QrCode } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchSelect } from "@/components/ui/search-select"
import { useMensalidades, useGerarMensalidade, usePagarMensalidade, useGerarPixMensalidade } from "@/hooks/useMensalidades"
import { useAlunos } from "@/hooks/useAlunos"
import { formatDate, formatCurrency } from "@/lib/utils"
import type { StatusMensalidade } from "@/types/mensalidade"
import type { AlunoDto } from "@/types/aluno"
import type { PixMensalidadeDto } from "@/services/mensalidades.service"

const statusColors: Record<StatusMensalidade, "default" | "secondary" | "destructive"> = {
  Pendente: "secondary",
  Pago: "default",
  Atrasado: "destructive",
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

function PixDialog({ pix, open, onClose }: { pix: PixMensalidadeDto; open: boolean; onClose: () => void }) {
  const [copiado, setCopiado] = useState(false)

  function copiarCodigo() {
    navigator.clipboard.writeText(pix.brCode)
    setCopiado(true)
    toast.success("Código PIX copiado!")
    setTimeout(() => setCopiado(false), 3000)
  }

  const expiresAt = new Date(pix.expiresAt)

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Pagamento via PIX</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          {pix.brCodeBase64 && (
            <img
              src={`data:image/png;base64,${pix.brCodeBase64}`}
              alt="QR Code PIX"
              className="w-48 h-48 border rounded-lg"
            />
          )}
          <p className="text-sm text-muted-foreground text-center">
            Escaneie o QR Code ou copie o código abaixo
          </p>
          <div className="w-full rounded-md border bg-muted p-3">
            <p className="text-xs font-mono break-all text-center select-all">{pix.brCode}</p>
          </div>
          <Button onClick={copiarCodigo} className="w-full gap-2" variant={copiado ? "secondary" : "default"}>
            {copiado ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiado ? "Copiado!" : "Copiar código PIX"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Válido até {expiresAt.toLocaleString("pt-BR")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const gerarSchema = z.object({
  alunoId: z.string().min(1, "Selecione o aluno"),
  mes: z.string().min(1, "Selecione o mês"),
  ano: z.string().min(4, "Informe o ano"),
})

type GerarFormValues = z.infer<typeof gerarSchema>

interface GerarDialogProps {
  open: boolean
  onClose: () => void
}

function GerarDialog({ open, onClose }: GerarDialogProps) {
  const { mutateAsync, isPending } = useGerarMensalidade()
  const { data: alunos } = useAlunos()
  const anoAtual = new Date().getFullYear()
  const mesAtual = String(new Date().getMonth() + 1)

  const { handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<GerarFormValues>({
    resolver: zodResolver(gerarSchema),
    defaultValues: { mes: mesAtual, ano: String(anoAtual) },
  })

  const alunoId = watch("alunoId")
  const mes = watch("mes")

  const alunoOptions = (alunos ?? []).map((a) => ({
    value: a.id,
    label: `${a.nome} — ${a.escolaNome}`,
  }))

  const alunoSelecionado = (alunos ?? []).find((a) => a.id === alunoId) as AlunoDto | undefined

  async function onSubmit(values: GerarFormValues) {
    try {
      await mutateAsync({ alunoId: values.alunoId, ano: parseInt(values.ano), mes: parseInt(values.mes) })
      toast.success("Mensalidade gerada com sucesso!")
      reset({ mes: mesAtual, ano: String(anoAtual) })
      onClose()
    } catch {
      toast.error("Não foi possível gerar a mensalidade. Verifique os dados e tente novamente.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset({ mes: mesAtual, ano: String(anoAtual) }); onClose() } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar Mensalidade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Aluno</Label>
            <SearchSelect
              options={alunoOptions}
              value={alunoId ?? ""}
              onChange={(v) => setValue("alunoId", v, { shouldValidate: true })}
              placeholder="Buscar aluno pelo nome..."
              emptyMessage="Nenhum aluno encontrado."
            />
            {errors.alunoId && <p className="text-destructive text-sm">{errors.alunoId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Mês</Label>
              <Select value={mes} onValueChange={(v) => setValue("mes", v ?? "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MESES.map((nome, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mes && <p className="text-destructive text-sm">{errors.mes.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Ano</Label>
              <Input
                type="number"
                min={2000}
                max={2100}
                {...{ onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue("ano", e.target.value) }}
                defaultValue={anoAtual}
              />
              {errors.ano && <p className="text-destructive text-sm">{errors.ano.message}</p>}
            </div>
          </div>

          {alunoSelecionado && (
            <p className="text-sm text-muted-foreground">
              Valor: <strong>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(alunoSelecionado.valorMensalidade)}</strong>
              {" · "}Vencimento: <strong>dia {alunoSelecionado.diaVencimento}</strong>
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Gerando..." : "Gerar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function MensalidadesPage() {
  const [alunoId, setAlunoId] = useState("")
  const [status, setStatus] = useState<StatusMensalidade | "">("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pixModal, setPixModal] = useState<PixMensalidadeDto | null>(null)
  const { data: mensalidades, isLoading, error } = useMensalidades(alunoId || undefined, status || undefined)
  const { data: alunos } = useAlunos()
  const { mutateAsync: pagar } = usePagarMensalidade()
  const { mutateAsync: gerarPix, isPending: gerandoPix } = useGerarPixMensalidade()

  const alunoOptions = [
    { value: "", label: "Todos os alunos" },
    ...(alunos ?? []).map((a) => ({ value: a.id, label: `${a.nome} — ${a.escolaNome}` })),
  ]

  async function handlePagar(id: string) {
    try {
      await pagar(id)
      toast.success("Pagamento registrado!")
    } catch (err) {
      toast.error("Não foi possível registrar o pagamento. Tente novamente.")
    }
  }

  async function handleGerarPix(id: string) {
    try {
      const pix = await gerarPix(id)
      setPixModal(pix)
    } catch (err) {
      toast.error("Não foi possível gerar o PIX. Tente novamente.")
    }
  }

  return (
    <div>
      <PageHeader
        title="Mensalidades"
        description="Controle de cobranças e pagamentos"
        actions={<Button onClick={() => setDialogOpen(true)}>+ Gerar Mensalidade</Button>}
      />

      <GerarDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

      {pixModal && (
        <PixDialog
          pix={pixModal}
          open={true}
          onClose={() => setPixModal(null)}
        />
      )}

      <div className="mb-4 flex gap-3 flex-wrap">
        <div className="w-72">
          <SearchSelect
            options={alunoOptions}
            value={alunoId}
            onChange={(v) => setAlunoId(v)}
            placeholder="Filtrar por aluno..."
            emptyMessage="Nenhum aluno encontrado."
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as StatusMensalidade | "")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Pago">Pago</SelectItem>
            <SelectItem value="Atrasado">Atrasado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-destructive mb-4">{(error as Error).message}</p>}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Turno</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="w-28">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : mensalidades?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Nenhuma mensalidade encontrada
                </TableCell>
              </TableRow>
            ) : (
              mensalidades?.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.nomeAluno}</TableCell>
                  <TableCell>{m.turno}</TableCell>
                  <TableCell>{m.nomesResponsaveis.join(", ") || "—"}</TableCell>
                  <TableCell>{formatCurrency(m.valor)}</TableCell>
                  <TableCell>{formatDate(m.dataVencimento)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[m.status]}>{m.status}</Badge>
                  </TableCell>
                  <TableCell>{m.dataPagamento ? formatDate(m.dataPagamento) : "—"}</TableCell>
                  <TableCell>
                    {m.status !== "Pago" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-1"
                          disabled={gerandoPix}
                          onClick={() => handleGerarPix(m.id)}
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          PIX
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handlePagar(m.id)}>
                          Manual
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
