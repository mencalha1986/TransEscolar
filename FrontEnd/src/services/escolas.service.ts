import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type { AtualizarEscolaRequest, CadastrarEscolaRequest, EscolaDto } from "@/types/escola"

export async function listarEscolas(): Promise<EscolaDto[]> {
  const res = await api.get<ApiResponse<EscolaDto[]>>("/escolas")
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao listar escolas")
  return res.data.data
}

export async function cadastrarEscola(data: CadastrarEscolaRequest): Promise<string> {
  const res = await api.post<ApiResponse<string>>("/escolas", data)
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao cadastrar escola")
  return res.data.data!
}

export async function atualizarEscola(id: string, data: AtualizarEscolaRequest): Promise<void> {
  const res = await api.put<ApiResponse<boolean>>(`/escolas/${id}`, data)
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao atualizar escola")
}

export async function deletarEscola(id: string): Promise<void> {
  const res = await api.delete<ApiResponse<boolean>>(`/escolas/${id}`)
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao remover escola")
}
