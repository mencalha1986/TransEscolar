import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type { CriarDespesaRequest, DespesaDto } from "@/types/despesa"

export async function listarDespesas(): Promise<DespesaDto[]> {
  const res = await api.get<ApiResponse<DespesaDto[]>>("/financeiro/despesas")
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao listar despesas")
  return res.data.data
}

export async function criarDespesa(data: CriarDespesaRequest): Promise<string> {
  const res = await api.post<ApiResponse<string>>("/financeiro/despesas", data)
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao registrar despesa")
  return res.data.data
}

export async function excluirDespesa(id: string): Promise<void> {
  const res = await api.delete<ApiResponse<boolean>>(`/financeiro/despesas/${id}`)
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao excluir despesa")
}
