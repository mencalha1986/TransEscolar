export type TipoDespesa =
  | "Combustivel"
  | "Pedagio"
  | "Manutencao"
  | "Seguro"
  | "IPVA"
  | "Multa"
  | "Lavagem"
  | "Outro"

export const TIPO_DESPESA_LABELS: Record<TipoDespesa, string> = {
  Combustivel: "Combustível",
  Pedagio: "Pedágio",
  Manutencao: "Manutenção",
  Seguro: "Seguro",
  IPVA: "IPVA",
  Multa: "Multa",
  Lavagem: "Lavagem",
  Outro: "Outro",
}

export const TIPO_DESPESA_ICONE: Record<TipoDespesa, string> = {
  Combustivel: "⛽",
  Pedagio: "🛣️",
  Manutencao: "🔧",
  Seguro: "🛡️",
  IPVA: "📋",
  Multa: "🚨",
  Lavagem: "🚿",
  Outro: "💳",
}

export interface DespesaDto {
  id: string
  tipo: TipoDespesa
  tipoDescricao: string
  descricao: string
  valor: number
  dataLancamento: string
  transporteId?: string
  placaVeiculo?: string
  observacao?: string
  criadoEm: string
}

export interface CriarDespesaRequest {
  tipo: TipoDespesa
  descricao: string
  valor: number
  dataLancamento: string
  transporteId?: string
  observacao?: string
}
