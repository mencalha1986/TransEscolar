import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type {
  Assinatura,
  AtualizarTransportadorRequest,
  CadastrarTransportadorRequest,
  CriarAssinaturaRequest,
  CriarPlanoRequest,
  DashboardBackoffice,
  EmailLog,
  MinhaAssinaturaDto,
  PagamentoAssinatura,
  PagamentoAssinaturaDto,
  Plano,
  RegistrarPagamentoAssinaturaRequest,
  StatusTransportador,
  TransportadorDetalhe,
  TransportadorResumo,
  ViagemAtiva,
  HistoricoRota,
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

  atualizarTransportador: (id: string, data: AtualizarTransportadorRequest) =>
    api.put<ApiResponse<boolean>>(`${BASE}/transportadores/${id}`, data).then(unwrap),

  vincularPlano: (id: string, planoId: string) =>
    api.put<ApiResponse<boolean>>(`${BASE}/transportadores/${id}/plano`, { planoId }).then(unwrap),

  marcarVitalicio: (id: string, vitalicio: boolean) =>
    api.patch<ApiResponse<boolean>>(`${BASE}/transportadores/${id}/vitalicio`, { vitalicio }).then(unwrap),

  impersonar: (id: string) =>
    api
      .post<ApiResponse<{ token: string }>>(`${BASE}/transportadores/${id}/impersonate`)
      .then(r => unwrap(r).token),

  listarPlanos: () =>
    api.get<ApiResponse<Plano[]>>(`${BASE}/planos`).then(unwrapList),

  criarPlano: (data: CriarPlanoRequest) =>
    api.post<ApiResponse<string>>(`${BASE}/planos`, data).then(unwrap),

  removerPlano: (id: string) =>
    api.delete<ApiResponse<boolean>>(`${BASE}/planos/${id}`).then(unwrap),

  listarAssinaturas: () =>
    api.get<ApiResponse<Assinatura[]>>(`${BASE}/assinaturas`).then(unwrapList),

  deletarTransportador: (id: string) =>
    api.delete<ApiResponse<boolean>>(`${BASE}/transportadores/${id}`).then(unwrap),

  listarEmailLogs: () =>
    api.get<ApiResponse<EmailLog[]>>(`${BASE}/email-logs`).then(unwrapList),

  reenviarEmail: (id: string) =>
    api.post<ApiResponse<boolean>>(`${BASE}/email-logs/${id}/reenviar`).then(unwrap),

  criarAssinatura: (data: CriarAssinaturaRequest) =>
    api.post<ApiResponse<string>>(`${BASE}/transportadores/${data.transportadorId}/assinatura`, {
      planoId: data.planoId,
      valorContratado: data.valorContratado,
    }).then(unwrap),

  listarPagamentosAssinatura: (assinaturaId: string) =>
    api.get<ApiResponse<PagamentoAssinatura[]>>(`${BASE}/assinaturas/${assinaturaId}/pagamentos`).then(unwrapList),

  registrarPagamentoAssinatura: (data: RegistrarPagamentoAssinaturaRequest) =>
    api.post<ApiResponse<string>>(`${BASE}/assinaturas/${data.assinaturaId}/pagamentos`, {
      valorPago: data.valorPago,
      competenciaMes: data.competenciaMes,
      competenciaAno: data.competenciaAno,
      observacao: data.observacao,
    }).then(unwrap),

  listarViagensAtivas: () =>
    api.get<ApiResponse<ViagemAtiva[]>>(`${BASE}/monitoramento/ativas`).then(unwrapList),

  obterHistoricoRota: (transportadorId: string, data: string) =>
    api.get<ApiResponse<HistoricoRota>>(`${BASE}/monitoramento/historico`, {
      params: { transportadorId, data },
    }).then(unwrap),

  obterMinhaAssinatura: () =>
    api.get<ApiResponse<MinhaAssinaturaDto>>("/assinatura/minha").then(unwrap),

  gerarPixAssinatura: () =>
    api.post<ApiResponse<import("@/types/mensalidade").PixDto>>("/assinatura/minha/pix").then(unwrap),

  listarMeusPagamentos: () =>
    api.get<ApiResponse<PagamentoAssinaturaDto[]>>("/assinatura/minha/pagamentos").then(unwrapList),
}
