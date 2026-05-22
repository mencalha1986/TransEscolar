import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"

export interface ResponsavelResumoDto {
  nome: string
  telefone: string
  email: string
}

export async function buscarResponsavelPorCpf(cpf: string): Promise<ResponsavelResumoDto | null> {
  try {
    const res = await api.get<ApiResponse<ResponsavelResumoDto>>("/responsaveis/por-cpf", {
      params: { cpf },
    })
    return res.data.success && res.data.data ? res.data.data : null
  } catch {
    return null
  }
}
