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

export interface ResponsavelDto {
  id: string
  nome: string
  cpf: string
  telefone: string
  email: string
}

export interface AlunoDetalheDto extends AlunoDto {
  fotoBase64?: string | null
  responsaveis: ResponsavelDto[]
}
