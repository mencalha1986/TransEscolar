import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Copy, RefreshCw, CheckCircle, AlertCircle, XCircle, CreditCard, Calendar, Receipt } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { assinaturaService, type PixAssinaturaDto } from "@/services/assinatura.service"
import { formatCurrency, formatDate } from "@/lib/utils"

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

const statusConfig = {
  Ativa: { label: "Ativa", variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
  Inadimplente: { label: "Inadimplente", variant: "destructive" as const, icon: AlertCircle, color: "text-red-600" },
  Cancelada: { label: "Cancelada", variant: "secondary" as const, icon: XCircle, color: "text-gray-500" },
}

function PixDialog({ pix, open, onClose }: { pix: PixAssinaturaDto; open: boolean; onClose: () => void }) {
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

export function AssinaturaPage() {
  const queryClient = useQueryClient()
  const [pixData, setPixData] = useState<PixAssinaturaDto | null>(null)

  const { data: assinatura, isLoading } = useQuery({
    queryKey: ["minha-assinatura"],
    queryFn: assinaturaService.obterMinha,
    retry: false,
  })

  const { data: pagamentos, isLoading: loadingPagamentos } = useQuery({
    queryKey: ["minha-assinatura-pagamentos"],
    queryFn: assinaturaService.listarPagamentos,
    retry: false,
  })

  const gerarPix = useMutation({
    mutationFn: assinaturaService.gerarPix,
    onSuccess: (data) => setPixData(data),
    onError: (err: Error) => toast.error(err.message),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  if (!assinatura) {
    return (
      <div className="space-y-4">
        <PageHeader title="Minha Assinatura" description="Gerencie seu plano e pagamentos" />
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CreditCard className="mx-auto h-12 w-12 mb-3 opacity-30" />
            <p>Nenhuma assinatura encontrada.</p>
            <p className="text-sm mt-1">Entre em contato com o suporte para regularizar.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const cfg = statusConfig[assinatura.status]
  const StatusIcon = cfg.icon
  const vencimento = new Date(assinatura.dataProximoVencimento)
  const hoje = new Date()
  const diasParaVencer = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      <PageHeader title="Minha Assinatura" description="Gerencie seu plano e histórico de pagamentos" />

      {/* Card principal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              {assinatura.nomePlano}
            </span>
            <Badge variant={cfg.variant} className="flex items-center gap-1.5">
              <StatusIcon className="h-3 w-3" />
              {cfg.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Valor mensal</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(assinatura.valorContratado)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Próximo vencimento</p>
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {formatDate(assinatura.dataProximoVencimento)}
              </p>
              {diasParaVencer >= 0 && diasParaVencer <= 7 && assinatura.status === "Ativa" && (
                <p className="text-xs text-amber-600 font-medium mt-0.5">
                  Vence em {diasParaVencer === 0 ? "hoje" : `${diasParaVencer} dia(s)`}
                </p>
              )}
              {assinatura.status === "Inadimplente" && (
                <p className="text-xs text-red-600 font-medium mt-0.5">
                  Vencida há {Math.abs(diasParaVencer)} dia(s)
                </p>
              )}
            </div>
          </div>

          {assinatura.status === "Inadimplente" && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <p className="font-medium">Assinatura inadimplente</p>
              <p className="text-xs mt-0.5">Sua assinatura está suspensa. Realize o pagamento para reativar o acesso completo ao sistema.</p>
            </div>
          )}

          {assinatura.status !== "Cancelada" && (
            <Button
              onClick={() => gerarPix.mutate()}
              disabled={gerarPix.isPending}
              className="gap-2"
            >
              {gerarPix.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              {gerarPix.isPending ? "Gerando PIX..." : "Pagar com PIX"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Histórico de pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4 text-primary" />
            Histórico de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingPagamentos ? (
            <div className="p-4 space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !pagamentos?.length ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              Nenhum pagamento registrado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competência</TableHead>
                  <TableHead>Data pagamento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagamentos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {MESES[(p.competenciaMes ?? 1) - 1]}/{p.competenciaAno}
                    </TableCell>
                    <TableCell>{formatDate(p.dataPagamento)}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(p.valorPago)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{p.observacao ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {pixData && (
        <PixDialog
          pix={pixData}
          open={true}
          onClose={() => {
            setPixData(null)
            queryClient.invalidateQueries({ queryKey: ["minha-assinatura"] })
          }}
        />
      )}
    </div>
  )
}
