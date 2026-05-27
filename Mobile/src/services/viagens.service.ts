import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type { ViagemDto, IniciarViagemRequest, AtualizarPosicaoRequest, PercursoPontoDto } from "@/types/viagem"

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

export async function listarViagens(data?: string): Promise<ViagemDto[]> {
  const params = data ? { data } : {}
  const res = await api.get<ApiResponse<ViagemDto[]>>("/viagens", { params })
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao listar viagens")
  return res.data.data ?? []
}

export async function obterPercurso(viagemId: string): Promise<PercursoPontoDto[]> {
  const res = await api.get<ApiResponse<PercursoPontoDto[]>>(`/viagens/${viagemId}/percurso`)
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao obter percurso")
  return res.data.data ?? []
}
