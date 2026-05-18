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

export interface AlunoDetalheDto {
  id: string
  nome: string
  dataNascimento: string
  escolaId: string
  escolaNome: string
  fotoBase64?: string | null
  valorMensalidade: number
  diaVencimento: number
  turno: string
  responsaveis: ResponsavelDto[]
}

export interface CadastrarAlunoRequest {
  nome: string
  dataNascimento: string
  escolaId: string
  foto?: File | null
}
