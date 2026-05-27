export type TurnoAluno = "Manha" | "Tarde" | "Noturno"
export type StatusViagem = "AguardandoPartida" | "EmRota" | "Concluida"

export interface ViagemDto {
  id: string
  turno: TurnoAluno
  data: string
  status: StatusViagem
  latitudeAtual?: number | null
  longitudeAtual?: number | null
  iniciadaEm?: string | null
  concluidaEm?: string | null
}

export interface PercursoPontoDto {
  latitude: number
  longitude: number
  timestamp: string
}

export interface IniciarViagemRequest {
  turno: TurnoAluno
}

export interface AtualizarPosicaoRequest {
  latitude: number
  longitude: number
}
