export type TipoRecado = "Geral" | "ParaResponsavel" | "ParaTurno" | "ParaEscola" | "DoResponsavel"
export type TurnoRecado = "Manha" | "Tarde" | "Noturno"

export interface RecadoDto {
  id: string
  conteudo: string
  tipo: TipoRecado
  autorNome: string
  alunoNomes?: string | null
  criadoEm: string
  euEnviei: boolean
  cienciaAdmin: boolean
  cienciaAdminDadaEm?: string | null
}

export interface EnviarRecadoRequest {
  conteudo: string
  tipo: TipoRecado
  destinatarioUsuarioId?: string | null
  turnoFiltro?: TurnoRecado | null
  escolaFiltroId?: string | null
}
