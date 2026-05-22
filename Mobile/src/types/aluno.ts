export interface AlunoDto {
  id: string
  nome: string
  dataNascimento: string
  escolaId: string
  escolaNome: string
  temFoto: boolean
  valorMensalidade: number
  diaVencimento: number
  turno: string
}

export interface AlunoDetalheDto extends AlunoDto {
  fotoBase64?: string | null
  responsaveis: {
    id: string
    nome: string
    telefone: string
  }[]
}
