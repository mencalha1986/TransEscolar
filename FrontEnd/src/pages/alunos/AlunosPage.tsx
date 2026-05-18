import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useAlunos } from "@/hooks/useAlunos"
import { useEscolas } from "@/hooks/useEscolas"
import { formatDate } from "@/lib/utils"

export function AlunosPage() {
  const navigate = useNavigate()
  const [escolaId, setEscolaId] = useState("")
  const { data: alunos, isLoading, error } = useAlunos(escolaId || undefined)
  const { data: escolas } = useEscolas()

  return (
    <div>
      <PageHeader
        title="Alunos"
        description="Gerenciar cadastro de alunos"
        actions={
          <Button onClick={() => navigate("/alunos/novo")}>+ Novo Aluno</Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <Select value={escolaId} onValueChange={(v: string | null) => setEscolaId(v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por escola..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as escolas</SelectItem>
            {(escolas ?? []).map((e) => (
              <SelectItem key={e.id} value={e.id} label={`${e.nome} — ${e.cidade}`}>{e.nome} — {e.cidade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-destructive mb-4">{(error as Error).message}</p>}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Data de Nascimento</TableHead>
              <TableHead>Escola</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : alunos?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Nenhum aluno encontrado
                </TableCell>
              </TableRow>
            ) : (
              alunos?.map((aluno) => (
                <TableRow key={aluno.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/alunos/${aluno.id}`)}>
                  <TableCell className="font-medium">{aluno.nome}</TableCell>
                  <TableCell>{formatDate(aluno.dataNascimento)}</TableCell>
                  <TableCell>{aluno.escolaNome}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/alunos/${aluno.id}`) }}>
                        Ver
                      </Button>
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`/alunos/${aluno.id}/editar`) }}>
                        Editar
                      </Button>
                    </div>
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
