export type StatusMensalidade = "Pendente" | "Pago" | "Atrasado"

export interface MensalidadeDto {
  id: string
  alunoId: string
  nomeAluno: string
  turno: string
  nomesResponsaveis: string[]
  competencia: string
  dataVencimento: string
  valor: number
  status: StatusMensalidade
  dataPagamento?: string | null
}
