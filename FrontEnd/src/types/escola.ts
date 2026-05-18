export interface EscolaDto {
  id: string
  nome: string
  cidade: string
  telefone: string
  logradouro: string
  numero: string
  bairro: string
  estado: string
  cep: string
}

export interface CadastrarEscolaRequest {
  nome: string
  telefone: string
  logradouro: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export interface AtualizarEscolaRequest {
  nome: string
  telefone: string
  logradouro: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}
