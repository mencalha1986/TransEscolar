import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type { RegistrarCheckInRequest, CheckInDto } from "@/types/transporte"

export interface TransporteDto {
  id: string
  placa: string
  nomeMotorista: string
  capacidadeMaxima: number
  status: string
}

export async function listarTransportes(): Promise<TransporteDto[]> {
  const res = await api.get<ApiResponse<TransporteDto[]>>("/transportes")
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao listar transportes")
  return res.data.data
}

export async function listarCheckIns(data?: string): Promise<CheckInDto[]> {
  const params = data ? { data } : {}
  const res = await api.get<ApiResponse<CheckInDto[]>>("/transportes/checkins", { params })
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao listar check-ins")
  return res.data.data
}

export interface CheckInResultDto {
  id: string
  endereco?: string | null
}

export async function registrarCheckIn(data: RegistrarCheckInRequest): Promise<CheckInResultDto> {
  const res = await api.post<ApiResponse<CheckInResultDto>>("/transportes/checkins", data)
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao registrar check-in")
  return res.data.data
}
