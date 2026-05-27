import { useState } from "react"
import { toast } from "sonner"
import { Trash2, CalendarX } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useResponsavelPerfil } from "@/hooks/useResponsavel"
import { useFaltas, useRegistrarFalta, useCancelarFalta } from "@/hooks/useFaltas"

function formatData(iso: string) {
  const [year, month, day] = iso.split("-")
  return `${day}/${month}/${year}`
}

const amanha = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

const hoje = new Date().toISOString().slice(0, 10)

export function AusenciaPage() {
  const { data: perfil, isLoading: loadingPerfil } = useResponsavelPerfil()
  const [alunoId, setAlunoId] = useState("")
  const [data, setData] = useState(amanha)
  const [motivo, setMotivo] = useState("")

  const { data: faltas = [], isLoading: loadingFaltas } = useFaltas()
  const { mutateAsync: registrar, isPending: registrando } = useRegistrarFalta()
  const { mutateAsync: cancelar } = useCancelarFalta()

  const alunoIds = new Set(perfil?.alunos.map(a => a.id) ?? [])
  const faltasFilhas = faltas.filter(f => alunoIds.has(f.alunoId))

  async function onRegistrar() {
    if (!alunoId) { toast.error("Selecione o aluno"); return }
    if (!data) { toast.error("Selecione a data"); return }
    try {
      await registrar({ alunoId, data, motivo: motivo.trim() || undefined })
      toast.success("Ausência registrada com sucesso!")
      setMotivo("")
      setData(amanha())
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar ausência")
    }
  }

  async function onCancelar(id: string) {
    if (!window.confirm("Cancelar esta ausência?")) return
    try {
      await cancelar(id)
      toast.success("Ausência cancelada.")
    } catch {
      toast.error("Não foi possível cancelar.")
    }
  }

  return (
    <div>
      <PageHeader title="Ausências" description="Informe quando seu filho não irá à escola" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarX className="h-4 w-4" />
              Registrar Ausência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingPerfil ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <div className="space-y-1">
                <Label>Aluno</Label>
                <select
                  value={alunoId}
                  onChange={e => setAlunoId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Selecione o aluno...</option>
                  {perfil?.alunos.map(a => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <Label>Data da ausência</Label>
              <input
                type="date"
                value={data}
                min={hoje}
                onChange={e => setData(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <Label>Motivo (opcional)</Label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none min-h-[80px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Ex: Consulta médica, viagem..."
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{motivo.length}/500</p>
            </div>

            <Button className="w-full" onClick={onRegistrar} disabled={registrando}>
              {registrando ? "Registrando..." : "Registrar Ausência"}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ausências Registradas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingFaltas ? (
                <div className="px-4 pb-4 space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : faltasFilhas.length === 0 ? (
                <p className="px-4 pb-4 text-sm text-muted-foreground">Nenhuma ausência registrada.</p>
              ) : (
                <div className="divide-y">
                  {faltasFilhas.map(f => (
                    <div key={f.id} className="flex items-start gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{f.alunoNome}</p>
                          <span className="text-sm font-semibold text-muted-foreground flex-shrink-0">{formatData(f.data)}</span>
                        </div>
                        {f.motivo && (
                          <p className="text-xs text-muted-foreground mt-0.5">{f.motivo}</p>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive flex-shrink-0 h-8 w-8"
                        onClick={() => onCancelar(f.id)}
                        aria-label="Cancelar ausência"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
