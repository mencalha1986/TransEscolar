import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { obterViagemAtual, iniciarViagem, atualizarPosicao, encerrarViagem, listarViagens, obterPercurso } from "@/services/viagens.service"
import type { IniciarViagemRequest, AtualizarPosicaoRequest } from "@/types/viagem"

export const VIAGEM_KEYS = {
  atual: ["viagem-atual"] as const,
  historico: (data?: string) => ["viagens-historico", data] as const,
  percurso: (viagemId: string | null) => ["viagem-percurso", viagemId] as const,
}

export function useViagemAtual() {
  return useQuery({
    queryKey: VIAGEM_KEYS.atual,
    queryFn: obterViagemAtual,
    refetchInterval: 10_000,
    staleTime: 8_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })
}

export function useIniciarViagem() {
  return useMutation({
    mutationFn: (data: IniciarViagemRequest) => iniciarViagem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIAGEM_KEYS.atual })
    },
  })
}

export function useAtualizarPosicao() {
  return useMutation({
    mutationKey: ["gps-update"],
    mutationFn: ({ viagemId, ...data }: { viagemId: string } & AtualizarPosicaoRequest) =>
      atualizarPosicao(viagemId, data),
  })
}

export function useEncerrarViagem() {
  return useMutation({
    mutationFn: (viagemId: string) => encerrarViagem(viagemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIAGEM_KEYS.atual })
      queryClient.invalidateQueries({ queryKey: ["viagens-historico"] })
    },
  })
}

export function useViagensHistorico(data?: string) {
  return useQuery({
    queryKey: VIAGEM_KEYS.historico(data),
    queryFn: () => listarViagens(data),
  })
}

export function usePercursoViagem(viagemId: string | null) {
  return useQuery({
    queryKey: VIAGEM_KEYS.percurso(viagemId),
    queryFn: () => obterPercurso(viagemId!),
    enabled: !!viagemId,
  })
}
