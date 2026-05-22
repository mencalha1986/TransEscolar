import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type { EscolaDto } from "@/types/escola"

export async function listarEscolas(): Promise<EscolaDto[]> {
  const res = await api.get<ApiResponse<EscolaDto[]>>("/escolas")
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao listar escolas")
  return res.data.data
}
