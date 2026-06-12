export type Turno = "Manha" | "Tarde" | "Noturno"

export interface AlunoResumo {
  id: string
  nome: string
}

export interface Rota {
  id: string
  nome: string
  turno: Turno
  motoristaId?: string
  nomeMotorista?: string
  transporteId?: string
  placaTransporte?: string
  alunos: AlunoResumo[]
}

export interface CriarRotaRequest {
  nome: string
  turno: Turno
  motoristaId?: string
  transporteId?: string
}

export interface EditarRotaRequest {
  nome: string
  turno: Turno
  motoristaId?: string
  transporteId?: string
}
