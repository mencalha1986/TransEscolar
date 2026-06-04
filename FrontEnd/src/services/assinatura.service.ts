import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"

export interface MinhaAssinaturaDto {
  id: string
  status: "Ativa" | "Inadimplente" | "Cancelada"
  nomePlano: string
  valorContratado: number
  dataProximoVencimento: string
  temPixPendente: boolean
  pixExpiresAt?: string
}

export interface PixAssinaturaDto {
  brCode: string
  brCodeBase64: string
  expiresAt: string
}

export interface PagamentoAssinaturaDto {
  id: string
  valorPago: number
  competenciaMes: number
  competenciaAno: number
  dataPagamento: string
  observacao?: string
}

function unwrap<T>(r: { data: ApiResponse<T> }): T {
  if (!r.data.success) throw new Error(r.data.error ?? "Erro na requisição")
  return r.data.data!
}

export const assinaturaService = {
  obterMinha: () =>
    api.get<ApiResponse<MinhaAssinaturaDto>>("/assinatura/minha").then(unwrap),

  gerarPix: () =>
    api.post<ApiResponse<PixAssinaturaDto>>("/assinatura/minha/pix").then(unwrap),

  listarPagamentos: () =>
    api.get<ApiResponse<PagamentoAssinaturaDto[]>>("/assinatura/minha/pagamentos").then(r => {
      if (!r.data.success) throw new Error(r.data.error ?? "Erro")
      return r.data.data ?? []
    }),
}
