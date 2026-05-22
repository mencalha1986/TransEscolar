export type StatusTransportador = "Ativo" | "Inativo" | "Suspenso"
export type StatusAssinatura = "Ativa" | "Inadimplente" | "Cancelada"

export interface TransportadorResumo {
  id: string
  nomeEmpresa: string
  nomeContato: string
  email: string
  status: StatusTransportador
  criadoEm: string
}

export interface TransportadorDetalhe {
  id: string
  nomeEmpresa: string
  nomeContato: string
  cpfCnpj: string
  email: string
  telefone?: string
  status: StatusTransportador
  planoId?: string
  totalAlunos: number
  criadoEm: string
}

export interface Plano {
  id: string
  nome: string
  descricao?: string
  precoMensal: number
  limiteAlunos?: number
  ativo: boolean
}

export interface Assinatura {
  id: string
  transportadorId: string
  planoId: string
  valorContratado: number
  status: StatusAssinatura
  dataProximoVencimento: string
}

export interface DashboardBackoffice {
  totalTransportadores: number
  transportadoresAtivos: number
  inadimplentes: number
  totalAlunos: number
  receitaMensal: number
}

export interface CadastrarTransportadorRequest {
  nomeEmpresa: string
  nomeContato: string
  cpfCnpj: string
  email: string
  telefone?: string
  planoId?: string
}

export interface CriarPlanoRequest {
  nome: string
  precoMensal: number
  limiteAlunos?: number
  descricao?: string
}
