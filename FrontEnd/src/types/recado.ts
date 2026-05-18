export type TipoRecado = "Geral" | "ParaResponsavel" | "ParaTurno" | "ParaEscola" | "DoResponsavel"
export type TurnoRecado = "Manha" | "Tarde" | "Noturno"

export interface RecadoDto {
  id: string
  conteudo: string
  tipo: TipoRecado
  autorNome: string
  criadoEm: string
  euEnviei: boolean
}

export interface EnviarRecadoRequest {
  conteudo: string
  tipo: TipoRecado
  destinatarioUsuarioId?: string | null
  turnoFiltro?: TurnoRecado | null
  escolaFiltroId?: string | null
}
