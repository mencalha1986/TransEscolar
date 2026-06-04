import { useQuery, useMutation } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { backofficeService } from "@/services/backoffice.service"
import type {
  CadastrarTransportadorRequest,
  CriarAssinaturaRequest,
  CriarPlanoRequest,
  RegistrarPagamentoAssinaturaRequest,
  StatusTransportador,
} from "@/types/backoffice"

export const BACKOFFICE_KEYS = {
  dashboard: ["backoffice", "dashboard"] as const,
  transportadores: ["backoffice", "transportadores"] as const,
  transportador: (id: string) => ["backoffice", "transportadores", id] as const,
  planos: ["backoffice", "planos"] as const,
  assinaturas: ["backoffice", "assinaturas"] as const,
  pagamentosAssinatura: (id: string) => ["backoffice", "assinaturas", id, "pagamentos"] as const,
  emailLogs: ["backoffice", "email-logs"] as const,
  viagensAtivas: ["backoffice", "monitoramento", "ativas"] as const,
  historicoRota: (transportadorId: string, data: string) =>
    ["backoffice", "monitoramento", "historico", transportadorId, data] as const,
}

export function useBackofficeDashboard() {
  return useQuery({
    queryKey: BACKOFFICE_KEYS.dashboard,
    queryFn: backofficeService.getDashboard,
  })
}

export function useTransportadores() {
  return useQuery({
    queryKey: BACKOFFICE_KEYS.transportadores,
    queryFn: backofficeService.listarTransportadores,
  })
}

export function useTransportador(id: string) {
  return useQuery({
    queryKey: BACKOFFICE_KEYS.transportador(id),
    queryFn: () => backofficeService.obterTransportador(id),
    enabled: !!id,
  })
}

export function useCadastrarTransportador() {
  return useMutation({
    mutationFn: (data: CadastrarTransportadorRequest) =>
      backofficeService.cadastrarTransportador(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKOFFICE_KEYS.transportadores })
    },
  })
}

export function useAlterarStatusTransportador() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusTransportador }) =>
      backofficeService.alterarStatus(id, status),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: BACKOFFICE_KEYS.transportadores })
      queryClient.invalidateQueries({ queryKey: BACKOFFICE_KEYS.transportador(id) })
    },
  })
}

export function usePlanos() {
  return useQuery({
    queryKey: BACKOFFICE_KEYS.planos,
    queryFn: backofficeService.listarPlanos,
  })
}

export function useCriarPlano() {
  return useMutation({
    mutationFn: (data: CriarPlanoRequest) => backofficeService.criarPlano(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKOFFICE_KEYS.planos })
    },
  })
}

export function useAssinaturas() {
  return useQuery({
    queryKey: BACKOFFICE_KEYS.assinaturas,
    queryFn: backofficeService.listarAssinaturas,
  })
}

export function useDeletarTransportador() {
  return useMutation({
    mutationFn: (id: string) => backofficeService.deletarTransportador(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKOFFICE_KEYS.transportadores })
    },
  })
}

export function useEmailLogs() {
  return useQuery({
    queryKey: BACKOFFICE_KEYS.emailLogs,
    queryFn: backofficeService.listarEmailLogs,
  })
}

export function useReenviarEmail() {
  return useMutation({
    mutationFn: (id: string) => backofficeService.reenviarEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKOFFICE_KEYS.emailLogs })
    },
  })
}

export function useCriarAssinatura() {
  return useMutation({
    mutationFn: (data: CriarAssinaturaRequest) => backofficeService.criarAssinatura(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BACKOFFICE_KEYS.assinaturas })
    },
  })
}

export function usePagamentosAssinatura(assinaturaId: string) {
  return useQuery({
    queryKey: BACKOFFICE_KEYS.pagamentosAssinatura(assinaturaId),
    queryFn: () => backofficeService.listarPagamentosAssinatura(assinaturaId),
    enabled: !!assinaturaId,
  })
}

export function useRegistrarPagamentoAssinatura() {
  return useMutation({
    mutationFn: (data: RegistrarPagamentoAssinaturaRequest) =>
      backofficeService.registrarPagamentoAssinatura(data),
    onSuccess: (_data, { assinaturaId }) => {
      queryClient.invalidateQueries({ queryKey: BACKOFFICE_KEYS.pagamentosAssinatura(assinaturaId) })
      queryClient.invalidateQueries({ queryKey: BACKOFFICE_KEYS.assinaturas })
    },
  })
}

export function useViagensAtivas() {
  return useQuery({
    queryKey: BACKOFFICE_KEYS.viagensAtivas,
    queryFn: backofficeService.listarViagensAtivas,
    refetchInterval: 30_000,
  })
}

export function useHistoricoRota(transportadorId: string, data: string) {
  return useQuery({
    queryKey: BACKOFFICE_KEYS.historicoRota(transportadorId, data),
    queryFn: () => backofficeService.obterHistoricoRota(transportadorId, data),
    enabled: !!transportadorId && !!data,
  })
}

export function useMinhaAssinatura() {
  return useQuery({
    queryKey: ["assinatura", "minha"],
    queryFn: backofficeService.obterMinhaAssinatura,
  })
}

export function useGerarPixAssinatura() {
  return useMutation({
    mutationFn: backofficeService.gerarPixAssinatura,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assinatura", "minha"] })
    },
  })
}

export function useMeusPagamentosAssinatura() {
  return useQuery({
    queryKey: ["assinatura", "minha", "pagamentos"],
    queryFn: backofficeService.listarMeusPagamentos,
  })
}
