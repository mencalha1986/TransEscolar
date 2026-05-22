import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type { GerarMensalidadeRequest, MensalidadeDto, StatusMensalidade } from "@/types/mensalidade"

export interface ListarMensalidadesParams {
  alunoId?: string
  status?: StatusMensalidade
}

export async function listarMensalidades(params?: ListarMensalidadesParams): Promise<MensalidadeDto[]> {
  const res = await api.get<ApiResponse<MensalidadeDto[]>>("/mensalidades", { params })
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao listar mensalidades")
  return res.data.data
}

export async function gerarMensalidade(data: GerarMensalidadeRequest): Promise<MensalidadeDto> {
  const res = await api.post<ApiResponse<MensalidadeDto>>("/mensalidades/gerar", data)
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao gerar mensalidade")
  return res.data.data
}

export async function pagarMensalidade(id: string): Promise<void> {
  const hoje = new Date().toISOString().slice(0, 10)
  const res = await api.patch<ApiResponse<null>>(`/mensalidades/${id}/pagar`, { dataPagamento: hoje })
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao registrar pagamento")
}
