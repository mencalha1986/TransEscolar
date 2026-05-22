import { useQuery, useMutation } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { atualizarEscola, cadastrarEscola, deletarEscola, listarEscolas } from "@/services/escolas.service"
import type { AtualizarEscolaRequest, CadastrarEscolaRequest } from "@/types/escola"

export const ESCOLA_KEYS = {
  all: ["escolas"] as const,
}

export function useEscolas() {
  return useQuery({
    queryKey: ESCOLA_KEYS.all,
    queryFn: listarEscolas,
  })
}

export function useCadastrarEscola() {
  return useMutation({
    mutationFn: (data: CadastrarEscolaRequest) => cadastrarEscola(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ESCOLA_KEYS.all })
    },
  })
}

export function useAtualizarEscola() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AtualizarEscolaRequest }) =>
      atualizarEscola(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ESCOLA_KEYS.all })
    },
  })
}

export function useDeletarEscola() {
  return useMutation({
    mutationFn: (id: string) => deletarEscola(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ESCOLA_KEYS.all })
    },
  })
}
