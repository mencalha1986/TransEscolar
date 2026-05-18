import { useState } from "react"
import { toast } from "sonner"
import { Trash2, MessageSquare } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useRecados, useEnviarRecado, useDeletarRecado } from "@/hooks/useRecados"
import { useEscolas } from "@/hooks/useEscolas"
import { useAuth } from "@/contexts/AuthContext"
import type { TipoRecado, TurnoRecado } from "@/types/recado"

const TIPO_LABELS: Record<TipoRecado, string> = {
  Geral: "Geral",
  ParaResponsavel: "Para responsável",
  ParaTurno: "Por turno",
  ParaEscola: "Por escola",
  DoResponsavel: "Do responsável",
}

const TIPO_COLORS: Record<TipoRecado, string> = {
  Geral: "bg-blue-100 text-blue-800",
  ParaResponsavel: "bg-purple-100 text-purple-800",
  ParaTurno: "bg-yellow-100 text-yellow-800",
  ParaEscola: "bg-green-100 text-green-800",
  DoResponsavel: "bg-orange-100 text-orange-800",
}

export function MuralPage() {
  const { user } = useAuth()
  const isAdmin = user?.perfil === "Admin" || user?.perfil === "SuperAdmin" || user?.perfil === "Motorista"
  const isResponsavel = user?.perfil === "Responsavel"

  const [conteudo, setConteudo] = useState("")
  const [tipo, setTipo] = useState<TipoRecado>(isResponsavel ? "DoResponsavel" : "Geral")
  const [turnoFiltro, setTurnoFiltro] = useState<TurnoRecado | "">("")
  const [escolaFiltroId, setEscolaFiltroId] = useState("")

  const { data: recados, isLoading } = useRecados()
  const { data: escolas } = useEscolas()
  const { mutateAsync: enviar, isPending } = useEnviarRecado()
  const { mutateAsync: deletar } = useDeletarRecado()

  async function onEnviar() {
    if (!conteudo.trim()) { toast.error("Digite o conteúdo do recado"); return }
    try {
      await enviar({
        conteudo: conteudo.trim(),
        tipo: isResponsavel ? "DoResponsavel" : tipo,
        turnoFiltro: tipo === "ParaTurno" && turnoFiltro ? turnoFiltro : null,
        escolaFiltroId: tipo === "ParaEscola" && escolaFiltroId ? escolaFiltroId : null,
      })
      toast.success("Recado enviado!")
      setConteudo("")
      setTurnoFiltro("")
      setEscolaFiltroId("")
    } catch (err) {
      toast.error("Não foi possível enviar o recado. Tente novamente.")
    }
  }

  async function onDeletar(id: string) {
    if (!window.confirm("Remover este recado?")) return
    try {
      await deletar(id)
      toast.success("Recado removido!")
    } catch (err) {
      toast.error("Não foi possível remover o recado. Tente novamente.")
    }
  }

  return (
    <div>
      <PageHeader
        title="Mural de Recados"
        description={isResponsavel ? "Deixe avisos para o transportador" : "Comunique-se com os responsáveis"}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form de envio */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Novo Recado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAdmin && (
              <div className="space-y-1">
                <Label>Destinatário</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as TipoRecado)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Geral">Geral (todos)</SelectItem>
                    <SelectItem value="ParaTurno">Por turno</SelectItem>
                    <SelectItem value="ParaEscola">Por escola</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {tipo === "ParaTurno" && (
              <div className="space-y-1">
                <Label>Turno</Label>
                <Select value={turnoFiltro} onValueChange={(v) => setTurnoFiltro(v as TurnoRecado)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o turno..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manha">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Noturno">Noturno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {tipo === "ParaEscola" && (
              <div className="space-y-1">
                <Label>Escola</Label>
                <Select value={escolaFiltroId} onValueChange={(v) => setEscolaFiltroId(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a escola..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(escolas ?? []).map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1">
              <Label>Mensagem</Label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={isResponsavel ? "Ex: Meu filho não vai à escola hoje..." : "Digite o recado..."}
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{conteudo.length}/500</p>
            </div>

            <Button className="w-full" onClick={onEnviar} disabled={isPending}>
              {isPending ? "Enviando..." : "Enviar Recado"}
            </Button>
          </CardContent>
        </Card>

        {/* Lista de recados */}
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
          ) : (recados ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">Nenhum recado ainda.</p>
            </div>
          ) : (
            (recados ?? []).map((r) => (
              <Card key={r.id} className={r.euEnviei ? "border-primary/30" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{r.autorNome}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIPO_COLORS[r.tipo]}`}>
                          {TIPO_LABELS[r.tipo]}
                        </span>
                        {r.euEnviei && (
                          <Badge variant="outline" className="text-xs">Você</Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{r.conteudo}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(r.criadoEm).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    {(r.euEnviei || isAdmin) && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive flex-shrink-0"
                        onClick={() => onDeletar(r.id)}
                        aria-label="Remover recado"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
