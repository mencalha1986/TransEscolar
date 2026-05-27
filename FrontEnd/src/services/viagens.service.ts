import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"

export type StatusViagem = "AguardandoPartida" | "EmRota" | "Concluida"

export interface ViagemDto {
  id: string
  turno: string
  data: string
  status: StatusViagem
  latitudeAtual: number | null
  longitudeAtual: number | null
  iniciadaEm: string | null
  concluidaEm: string | null
}

export interface PercursoPontoDto {
  latitude: number
  longitude: number
  timestamp: string
}

export async function obterViagemAtual(): Promise<ViagemDto | null> {
  try {
    const res = await api.get<ApiResponse<ViagemDto>>("/viagens/atual")
    return res.data.success && res.data.data ? res.data.data : null
  } catch {
    return null
  }
}

export async function obterPercurso(viagemId: string): Promise<PercursoPontoDto[]> {
  const res = await api.get<ApiResponse<PercursoPontoDto[]>>(`/viagens/${viagemId}/percurso`)
  if (!res.data.success || !res.data.data) return []
  return res.data.data
}
