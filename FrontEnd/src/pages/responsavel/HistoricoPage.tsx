import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useResponsavelPerfil } from "@/hooks/useResponsavel"
import { listarCheckIns } from "@/services/transportes.service"

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

export function HistoricoPage() {
  const hoje = new Date().toISOString().slice(0, 10)
  const [data, setData] = useState(hoje)
  const [alunoId, setAlunoId] = useState("")

  const { data: perfil } = useResponsavelPerfil()
  const alunoIds = new Set(perfil?.alunos.map(a => a.id) ?? [])

  const { data: checkIns = [], isLoading } = useQuery({
    queryKey: ["checkins", data],
    queryFn: () => listarCheckIns(data),
    enabled: !!data,
  })

  const filtrados = checkIns.filter(c => {
    const doFilho = alunoIds.has(c.alunoId)
    const doSelecionado = !alunoId || c.alunoId === alunoId
    return doFilho && doSelecionado
  })

  return (
    <div>
      <PageHeader title="Histórico" description="Registro de embarques e desembarques dos seus filhos" />

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="date"
          value={data}
          onChange={e => setData(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={alunoId}
          onChange={e => setAlunoId(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Todos os filhos</option>
          {perfil?.alunos.map(a => (
            <option key={a.id} value={a.id}>{a.nome}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : filtrados.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Nenhum registro encontrado para esta data.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filtrados.map(c => (
                <div key={c.id} className="flex items-start gap-3 px-4 py-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${c.tipo === "Embarque" ? "bg-blue-500" : "bg-green-500"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{c.alunoNome}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${c.tipo === "Embarque" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                        {c.tipo}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatHora(c.horaRegistro)}</p>
                    {c.endereco && (
                      <p className="text-xs text-muted-foreground truncate">{c.endereco}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
