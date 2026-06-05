import { useMutation, useQuery } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import type { StatusMensalidade } from "@/types/mensalidade"
import type { GerarMensalidadeRequest } from "@/types/mensalidade"
import { gerarMensalidade, gerarPix, listarMensalidades, pagarMensalidade } from "@/services/mensalidades.service"

export const MENSALIDADE_KEYS = {
  all: ["mensalidades"] as const,
  list: (alunoId?: string, status?: StatusMensalidade) =>
    [...MENSALIDADE_KEYS.all, { alunoId, status }] as const,
}

export function useMensalidades(alunoId?: string, status?: StatusMensalidade) {
  return useQuery({
    queryKey: MENSALIDADE_KEYS.list(alunoId, status),
    queryFn: () => listarMensalidades({ alunoId, status }),
  })
}

export function useGerarMensalidade() {
  return useMutation({
    mutationFn: (data: GerarMensalidadeRequest) => gerarMensalidade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENSALIDADE_KEYS.all })
    },
  })
}

export function usePagarMensalidade() {
  return useMutation({
    mutationFn: (id: string) => pagarMensalidade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENSALIDADE_KEYS.all })
    },
  })
}

export function useGerarPixMensalidade() {
  return useMutation({
    mutationFn: (id: string) => gerarPix(id),
  })
}
