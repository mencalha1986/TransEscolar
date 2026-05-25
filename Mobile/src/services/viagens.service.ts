import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type { ViagemDto, IniciarViagemRequest, AtualizarPosicaoRequest } from "@/types/viagem"

export async function obterViagemAtual(): Promise<ViagemDto | null> {
  const res = await api.get<ApiResponse<ViagemDto | null>>("/viagens/atual")
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao obter viagem atual")
  return res.data.data ?? null
}

export async function iniciarViagem(data: IniciarViagemRequest): Promise<string> {
  const res = await api.post<ApiResponse<string>>("/viagens", data)
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao iniciar viagem")
  return res.data.data
}

export async function atualizarPosicao(viagemId: string, data: AtualizarPosicaoRequest): Promise<void> {
  const res = await api.put<ApiResponse<boolean>>(`/viagens/${viagemId}/posicao`, data)
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao atualizar posição")
}

export async function encerrarViagem(viagemId: string): Promise<void> {
  const res = await api.put<ApiResponse<boolean>>(`/viagens/${viagemId}/encerrar`, {})
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao encerrar viagem")
}
