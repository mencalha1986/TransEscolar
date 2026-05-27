import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"

export interface FaltaDto {
  id: string
  alunoId: string
  alunoNome: string
  data: string
  motivo?: string
  criadoEm: string
}

export interface RegistrarFaltaRequest {
  alunoId: string
  data: string
  motivo?: string
}

export async function listarFaltas(data?: string, alunoId?: string): Promise<FaltaDto[]> {
  const res = await api.get<ApiResponse<FaltaDto[]>>("/faltas", {
    params: { ...(data ? { data } : {}), ...(alunoId ? { alunoId } : {}) },
  })
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao listar faltas")
  return res.data.data
}

export async function registrarFalta(req: RegistrarFaltaRequest): Promise<FaltaDto> {
  const res = await api.post<ApiResponse<FaltaDto>>("/faltas", req)
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao registrar falta")
  return res.data.data
}

export async function cancelarFalta(id: string): Promise<void> {
  const res = await api.delete<ApiResponse<boolean>>(`/faltas/${id}`)
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao cancelar falta")
}
