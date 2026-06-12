export interface Motorista {
  id: string
  nome: string
  cpf: string
  cnh?: string
  telefone?: string
  ativo: boolean
  criadoEm: string
}

export interface CriarMotoristaRequest {
  nome: string
  cpf: string
  cnh?: string
  telefone?: string
}

export interface EditarMotoristaRequest {
  nome: string
  cnh?: string
  telefone?: string
}
