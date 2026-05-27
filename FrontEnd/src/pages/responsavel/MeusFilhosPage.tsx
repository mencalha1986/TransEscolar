import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useResponsavelPerfil } from "@/hooks/useResponsavel"
import { useAluno } from "@/hooks/useAlunos"
import { GraduationCap, School, Clock } from "lucide-react"

const TURNO_LABEL: Record<string, string> = {
  Manha: "Manhã", Tarde: "Tarde", Noturno: "Noturno",
}

function FilhoCard({ alunoId }: { alunoId: string }) {
  const { data: aluno, isLoading } = useAluno(alunoId)

  if (isLoading) return <Skeleton className="h-32 w-full rounded-xl" />
  if (!aluno) return null

  return (
    <Card>
      <CardContent className="p-5 flex gap-4 items-start">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
          {aluno.fotoBase64 ? (
            <img
              src={`data:image/jpeg;base64,${aluno.fotoBase64}`}
              alt={aluno.nome}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <GraduationCap className="h-7 w-7 text-primary" />
          )}
        </div>
        <div className="space-y-1 min-w-0">
          <p className="font-semibold text-base truncate">{aluno.nome}</p>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <School className="h-3.5 w-3.5" />
              {aluno.escolaNome}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {TURNO_LABEL[aluno.turno] ?? aluno.turno}
            </span>
          </div>
          {aluno.endereco && (
            <p className="text-xs text-muted-foreground">
              {aluno.endereco.logradouro}, {aluno.endereco.numero} — {aluno.endereco.bairro}, {aluno.endereco.cidade}/{aluno.endereco.estado}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function MeusFilhosPage() {
  const { data: perfil, isLoading } = useResponsavelPerfil()

  return (
    <div>
      <PageHeader title="Meus Filhos" description="Informações dos seus filhos no transporte escolar" />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : !perfil?.alunos.length ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Nenhum filho vinculado ao seu perfil.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {perfil.alunos.map(a => <FilhoCard key={a.id} alunoId={a.id} />)}
        </div>
      )}
    </div>
  )
}
