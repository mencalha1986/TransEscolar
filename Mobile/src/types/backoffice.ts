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

export interface PagamentoAssinatura {
  id: string
  valorPago: number
  competenciaMes: number
  competenciaAno: number
  dataPagamento: string
  observacao?: string
}

export interface CriarAssinaturaRequest {
  transportadorId: string
  planoId: string
  valorContratado: number
}

export interface RegistrarPagamentoAssinaturaRequest {
  assinaturaId: string
  valorPago: number
  competenciaMes: number
  competenciaAno: number
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
  planoId?: string
}

export interface CriarPlanoRequest {
  nome: string
  precoMensal: number
  limiteAlunos?: number
  descricao?: string
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

export interface ViagemAtiva {
  id: string
  transportadorId: string
  transportadorNome: string
  turno: string
  latitude?: number
  longitude?: number
  iniciadaEm?: string
  embarcados: number
  desembarcados: number
}

export interface CheckInHistorico {
  alunoNome: string
  tipo: string
  horaRegistro: string
  latitude?: number
  longitude?: number
  endereco?: string
}

export interface ViagemHistorico {
  id: string
  turno: string
  status: string
  iniciadaEm?: string
  concluidaEm?: string
  checkIns: CheckInHistorico[]
}

export interface HistoricoRota {
  transportadorId: string
  transportadorNome: string
  viagens: ViagemHistorico[]
}
