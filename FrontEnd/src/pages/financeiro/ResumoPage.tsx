import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { PageHeader } from "@/components/layout/PageHeader"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useResumoFinanceiro } from "@/hooks/useDespesas"
import { formatCurrency } from "@/lib/utils"
import { TIPO_DESPESA_LABELS, type TipoDespesa } from "@/types/despesa"

function getDefaultRange() {
  const now = new Date()
  const inicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const fim = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
  return { inicio, fim }
}

export function ResumoPage() {
  const { inicio, fim } = getDefaultRange()
  const [dataInicio, setDataInicio] = useState(inicio)
  const [dataFim, setDataFim] = useState(fim)

  const { data: resumo, isLoading } = useResumoFinanceiro(dataInicio, dataFim)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resumo Financeiro"
        description="Totais de despesas por período"
        actions={
          <Link to="/financeiro/despesas" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ArrowLeft className="h-4 w-4 mr-2" />Voltar
          </Link>
        }
      />

      {/* Filtro de período */}
      <div className="flex items-end gap-4 flex-wrap">
        <div className="space-y-1">
          <Label>De</Label>
          <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-40" />
        </div>
        <div className="space-y-1">
          <Label>Até</Label>
          <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-40" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : resumo ? (
        <div className="space-y-6">
          {/* Total geral */}
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">Total no período</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(resumo.totalGeral)}</p>
          </div>

          {/* Por tipo */}
          {Object.keys(resumo.totalPorTipo).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Por Tipo</h3>
              <div className="rounded-xl border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right w-28">% do total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(resumo.totalPorTipo)
                      .sort(([, a], [, b]) => b - a)
                      .map(([tipo, valor]) => (
                        <TableRow key={tipo}>
                          <TableCell>{TIPO_DESPESA_LABELS[tipo as TipoDespesa] ?? tipo}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(valor)}</TableCell>
                          <TableCell className="text-right text-muted-foreground text-sm">
                            {resumo.totalGeral > 0 ? `${((valor / resumo.totalGeral) * 100).toFixed(1)}%` : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Por veículo */}
          {Object.keys(resumo.totalPorVeiculo).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Por Veículo</h3>
              <div className="rounded-xl border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Placa</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(resumo.totalPorVeiculo)
                      .sort(([, a], [, b]) => b - a)
                      .map(([placa, valor]) => (
                        <TableRow key={placa}>
                          <TableCell className="font-mono">{placa}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(valor)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
