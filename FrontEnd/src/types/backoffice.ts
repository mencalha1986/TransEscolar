export type StatusTransportador = "Ativo" | "Inativo" | "Suspenso"
export type StatusAssinatura = "Ativa" | "Inadimplente" | "Cancelada"

export interface TransportadorResumo {
  id: string
  nomeEmpresa: string
  nomeContato: string
  email: string
  status: StatusTransportador
  criadoEm: string
  nomePlano?: string
  vitalicio: boolean
}

export interface TransportadorDetalhe {
  id: string
  nomeEmpresa: string
  nomeContato: string
  cpfCnpj: string
  email: string
  telefone?: string
  status: StatusTransportador
  totalAlunos: number
  criadoEm: string
  vitalicio: boolean
  nomePlano?: string
}

export interface Plano {
  id: string
  nome: string
  descricao?: string
  precoMensal: number
  limiteAlunos?: number
  limiteRotas?: number
  retencaoHistoricoDias?: number
  ativo: boolean
  totalClientes: number
}

export interface Assinatura {
  id: string
  transportadorId: string
  nomeTransportador: string
  planoId: string
  nomePlano: string
  valorContratado: number
  status: StatusAssinatura
  dataProximoVencimento: string
}

export interface PagamentoAssinatura {
  id: string
  valorPago: number
  competenciaMes: number
  competenciaAno: number
  dataPagamento: string
  observacao?: string
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
}

export interface CriarPlanoRequest {
  nome: string
  precoMensal: number
  limiteAlunos?: number
  descricao?: string
  limiteRotas?: number
  retencaoHistoricoDias?: number
}

export interface CriarAssinaturaRequest {
  planoId: string
  valorContratado: number
}

export interface RegistrarPagamentoRequest {
  valorPago: number
  competenciaMes: number
  competenciaAno: number
  observacao?: string
}

export type StatusEmailLog = "Pendente" | "Enviado" | "Falha"

export interface EmailLog {
  id: string
  destinatario: string
  nome: string
  transportadorId: string
  status: StatusEmailLog
  erroMensagem?: string
  enviadoEm?: string
  criadoEm: string
}
