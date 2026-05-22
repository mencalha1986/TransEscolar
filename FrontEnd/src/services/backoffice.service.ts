import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type {
  Assinatura,
  CadastrarTransportadorRequest,
  CriarAssinaturaRequest,
  CriarPlanoRequest,
  DashboardBackoffice,
  EmailLog,
  PagamentoAssinatura,
  Plano,
  RegistrarPagamentoRequest,
  StatusTransportador,
  TransportadorDetalhe,
  TransportadorResumo,
} from "@/types/backoffice"

const BASE = "/backoffice"

function unwrap<T>(r: { data: ApiResponse<T> }): T {
  if (!r.data.success) throw new Error(r.data.error ?? "Erro na requisição")
  return r.data.data!
}

function unwrapList<T>(r: { data: ApiResponse<T[]> }): T[] {
  if (!r.data.success) throw new Error(r.data.error ?? "Erro na requisição")
  return r.data.data ?? []
}

export const backofficeService = {
  getDashboard: () =>
    api.get<ApiResponse<DashboardBackoffice>>(`${BASE}/dashboard`).then(unwrap),

  listarTransportadores: () =>
    api.get<ApiResponse<TransportadorResumo[]>>(`${BASE}/transportadores`).then(unwrapList),

  obterTransportador: (id: string) =>
    api.get<ApiResponse<TransportadorDetalhe>>(`${BASE}/transportadores/${id}`).then(unwrap),

  cadastrarTransportador: (data: CadastrarTransportadorRequest) =>
    api.post<ApiResponse<string>>(`${BASE}/transportadores`, data).then(unwrap),

  alterarStatus: (id: string, status: StatusTransportador) =>
    api.patch<ApiResponse<boolean>>(`${BASE}/transportadores/${id}/status`, { status }),

  impersonar: (id: string) =>
    api.post<ApiResponse<{ token: string }>>(`${BASE}/transportadores/${id}/impersonate`).then(r => unwrap(r).token),

  deletarTransportador: (id: string) =>
    api.delete<ApiResponse<boolean>>(`${BASE}/transportadores/${id}`).then(unwrap),

  listarPlanos: () =>
    api.get<ApiResponse<Plano[]>>(`${BASE}/planos`).then(unwrapList),

  criarPlano: (data: CriarPlanoRequest) =>
    api.post<ApiResponse<string>>(`${BASE}/planos`, data).then(unwrap),

  listarAssinaturas: () =>
    api.get<ApiResponse<Assinatura[]>>(`${BASE}/assinaturas`).then(unwrapList),

  criarAssinatura: (transportadorId: string, data: CriarAssinaturaRequest) =>
    api.post<ApiResponse<string>>(`${BASE}/transportadores/${transportadorId}/assinatura`, data).then(unwrap),

  listarPagamentos: (assinaturaId: string) =>
    api.get<ApiResponse<PagamentoAssinatura[]>>(`${BASE}/assinaturas/${assinaturaId}/pagamentos`).then(unwrapList),

  registrarPagamento: (assinaturaId: string, data: RegistrarPagamentoRequest) =>
    api.post<ApiResponse<string>>(`${BASE}/assinaturas/${assinaturaId}/pagamentos`, data).then(unwrap),

  listarEmailLogs: () =>
    api.get<ApiResponse<EmailLog[]>>(`${BASE}/email-logs`).then(unwrapList),

  reenviarEmail: (id: string) =>
    api.post<ApiResponse<boolean>>(`${BASE}/email-logs/${id}/reenviar`).then(unwrap),
}
