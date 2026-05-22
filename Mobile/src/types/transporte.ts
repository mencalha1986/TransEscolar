export type TipoCheckIn = "Embarque" | "Desembarque"

export interface TransporteDto {
  id: string
  placa: string
  nomeMotorista: string
  capacidadeMaxima: number
  status: string
}

export interface CheckInDto {
  id: string
  alunoId: string
  alunoNome: string
  alunoTurno: string
  tipo: TipoCheckIn
  horaRegistro: string
  latitude?: number | null
  longitude?: number | null
}

export interface RegistrarCheckInRequest {
  alunoId: string
  tipo: TipoCheckIn
  latitude?: number | null
  longitude?: number | null
}
