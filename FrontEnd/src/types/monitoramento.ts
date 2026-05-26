export interface ViagemAtivaDto {
  id: string
  transportadorId: string
  transportadorNome: string
  turno: string
  latitude: number | null
  longitude: number | null
  iniciadaEm: string | null
  embarcados: number
  desembarcados: number
}

export interface CheckInHistoricoDto {
  alunoNome: string
  tipo: "Embarque" | "Desembarque"
  horaRegistro: string
  latitude: number | null
  longitude: number | null
  endereco: string | null
}

export interface ViagemHistoricoDto {
  id: string
  turno: string
  status: string
  iniciadaEm: string | null
  concluidaEm: string | null
  checkIns: CheckInHistoricoDto[]
}

export interface HistoricoRotaDto {
  transportadorId: string
  transportadorNome: string
  viagens: ViagemHistoricoDto[]
}
