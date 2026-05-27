import { useParams, useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAluno } from "@/hooks/useAlunos"
import { formatDate } from "@/lib/utils"

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function formatCPF(cpf: string) {
  const digits = cpf.replace(/\D/g, "")
  if (digits.length !== 11) return cpf
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return phone
}

function turnoLabel(turno: string) {
  return { Manha: "Manhã", Tarde: "Tarde", Noturno: "Noturno" }[turno] ?? turno
}

export function AlunoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: aluno, isLoading, error } = useAluno(id!)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detalhes do Aluno"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/alunos")}>Voltar</Button>
            {aluno && <Button onClick={() => navigate(`/alunos/${id}/editar`)}>Editar</Button>}
          </div>
        }
      />

      {error && <p className="text-destructive">{(error as Error).message}</p>}

      {isLoading ? (
        <div className="space-y-4 max-w-2xl">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      ) : aluno ? (
        <div className="space-y-6 max-w-2xl">
          {/* Foto e identificação */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24 shrink-0">
                  {aluno.fotoBase64 && (
                    <AvatarImage
                      src={`data:image/jpeg;base64,${aluno.fotoBase64}`}
                      alt={aluno.nome}
                    />
                  )}
                  <AvatarFallback className="text-3xl">{aluno.nome.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-3 flex-1">
                  <div>
                    <h2 className="text-xl font-semibold">{aluno.nome}</h2>
                    <Badge variant="secondary" className="mt-1">{turnoLabel(aluno.turno)}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoRow label="Data de Nascimento" value={formatDate(aluno.dataNascimento)} />
                    <InfoRow label="Escola" value={aluno.escolaNome ?? aluno.escolaId} />
                    <InfoRow
                      label="Mensalidade"
                      value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(aluno.valorMensalidade)}
                    />
                    <InfoRow label="Vencimento" value={`Dia ${aluno.diaVencimento}`} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          {aluno.endereco && (
            <Card>
              <CardHeader><CardTitle className="text-base">Endereço</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="Logradouro" value={aluno.endereco.logradouro} />
                  <InfoRow label="Número" value={aluno.endereco.numero} />
                  <InfoRow label="Bairro" value={aluno.endereco.bairro} />
                  <InfoRow label="Cidade" value={aluno.endereco.cidade} />
                  <InfoRow label="Estado" value={aluno.endereco.estado} />
                  <InfoRow
                    label="CEP"
                    value={aluno.endereco.cep.replace(/^(\d{5})(\d{3})$/, "$1-$2")}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Responsáveis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Responsáveis</CardTitle>
            </CardHeader>
            <CardContent>
              {aluno.responsaveis.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum responsável cadastrado.</p>
              ) : (
                <div className="space-y-4">
                  {aluno.responsaveis.map((resp, idx) => (
                    <div key={resp.id}>
                      {idx > 0 && <Separator className="mb-4" />}
                      <div className="grid grid-cols-2 gap-3">
                        <InfoRow label="Nome" value={resp.nome} />
                        <InfoRow label="CPF" value={formatCPF(resp.cpf)} />
                        <InfoRow label="Telefone" value={formatPhone(resp.telefone)} />
                        <InfoRow label="E-mail" value={resp.email} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
