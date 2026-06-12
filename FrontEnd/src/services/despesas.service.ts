import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type { CriarDespesaRequest, DespesaDto, ListarDespesasParams, ResumoFinanceiroDto } from "@/types/despesa"

export async function listarDespesas(params?: ListarDespesasParams): Promise<DespesaDto[]> {
  const res = await api.get<ApiResponse<DespesaDto[]>>("/financeiro/despesas", { params })
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao listar despesas")
  return res.data.data
}

export async function obterDespesa(id: string): Promise<DespesaDto> {
  const res = await api.get<ApiResponse<DespesaDto>>(`/financeiro/despesas/${id}`)
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Despesa não encontrada")
  return res.data.data
}

export async function criarDespesa(data: CriarDespesaRequest): Promise<string> {
  const res = await api.post<ApiResponse<string>>("/financeiro/despesas", data)
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao registrar despesa")
  return res.data.data
}

export async function atualizarDespesa(id: string, data: CriarDespesaRequest): Promise<void> {
  const res = await api.put<ApiResponse<boolean>>(`/financeiro/despesas/${id}`, data)
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao atualizar despesa")
}

export async function excluirDespesa(id: string): Promise<void> {
  const res = await api.delete<ApiResponse<boolean>>(`/financeiro/despesas/${id}`)
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao excluir despesa")
}

export async function obterResumo(dataInicio: string, dataFim: string): Promise<ResumoFinanceiroDto> {
  const res = await api.get<ApiResponse<ResumoFinanceiroDto>>("/financeiro/resumo", {
    params: { dataInicio, dataFim },
  })
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao obter resumo")
  return res.data.data
}
