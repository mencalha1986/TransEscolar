import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type { CheckIn, CheckInDto, RegistrarCheckInRequest, TransporteDto } from "@/types/transporte"

export async function listarTransportes(): Promise<TransporteDto[]> {
  const res = await api.get<ApiResponse<TransporteDto[]>>("/transportes")
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao listar transportes")
  return res.data.data
}

export async function listarCheckIns(): Promise<CheckInDto[]> {
  const res = await api.get<ApiResponse<CheckInDto[]>>("/transportes/checkins")
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao listar check-ins")
  return res.data.data
}

export async function registrarCheckIn(data: RegistrarCheckInRequest): Promise<CheckIn> {
  const res = await api.post<ApiResponse<CheckIn>>("/transportes/checkins", data)
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao registrar check-in")
  return res.data.data
}
