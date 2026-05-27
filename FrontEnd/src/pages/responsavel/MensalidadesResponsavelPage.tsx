import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useResponsavelPerfil } from "@/hooks/useResponsavel"
import { useMensalidades } from "@/hooks/useMensalidades"
import type { StatusMensalidade } from "@/types/mensalidade"

const STATUS_CONFIG: Record<StatusMensalidade, { label: string; className: string }> = {
  Pendente: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
  Pago: { label: "Pago", className: "bg-green-100 text-green-800" },
  Atrasado: { label: "Atrasado", className: "bg-red-100 text-red-800" },
}

const TURNO_LABEL: Record<string, string> = {
  Manha: "Manhã", Tarde: "Tarde", Noturno: "Noturno",
}

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR")
}

function formatMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function MensalidadesResponsavelPage() {
  const { data: perfil, isLoading: loadingPerfil } = useResponsavelPerfil()
  const alunoIds = new Set(perfil?.alunos.map(a => a.id) ?? [])

  const { data: todasMensalidades = [], isLoading: loadingMens } = useMensalidades()
  const mensalidades = todasMensalidades.filter(m => alunoIds.has(m.alunoId))

  const isLoading = loadingPerfil || loadingMens

  return (
    <div>
      <PageHeader title="Mensalidades" description="Situação das mensalidades dos seus filhos" />

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : mensalidades.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Nenhuma mensalidade encontrada.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Aluno</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Turno</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Competência</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vencimento</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mensalidades.map(m => {
                    const s = STATUS_CONFIG[m.status]
                    return (
                      <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{m.nomeAluno}</td>
                        <td className="px-4 py-3 text-muted-foreground">{TURNO_LABEL[m.turno] ?? m.turno}</td>
                        <td className="px-4 py-3 text-muted-foreground">{m.competencia}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatData(m.dataVencimento)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatMoeda(m.valor)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
