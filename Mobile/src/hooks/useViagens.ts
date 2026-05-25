import { useQuery, useMutation } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { obterViagemAtual, iniciarViagem, atualizarPosicao, encerrarViagem } from "@/services/viagens.service"
import type { IniciarViagemRequest, AtualizarPosicaoRequest } from "@/types/viagem"

export const VIAGEM_KEYS = {
  atual: ["viagem-atual"] as const,
}

export function useViagemAtual() {
  return useQuery({
    queryKey: VIAGEM_KEYS.atual,
    queryFn: obterViagemAtual,
    refetchInterval: 10_000,
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
    mutationFn: ({ viagemId, ...data }: { viagemId: string } & AtualizarPosicaoRequest) =>
      atualizarPosicao(viagemId, data),
  })
}

export function useEncerrarViagem() {
  return useMutation({
    mutationFn: (viagemId: string) => encerrarViagem(viagemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIAGEM_KEYS.atual })
    },
  })
}
