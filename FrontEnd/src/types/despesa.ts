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

export interface ResumoFinanceiroDto {
  totalGeral: number
  totalPorTipo: Record<string, number>
  totalPorVeiculo: Record<string, number>
}

export interface CriarDespesaRequest {
  tipo: TipoDespesa
  descricao: string
  valor: number
  dataLancamento: string
  transporteId?: string
  observacao?: string
}

export interface ListarDespesasParams {
  dataInicio?: string
  dataFim?: string
  tipo?: TipoDespesa
  transporteId?: string
}
