import { useMutation, useQuery } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { atualizarEscola, cadastrarEscola, deletarEscola, listarEscolas } from "@/services/escolas.service"
import type { AtualizarEscolaRequest } from "@/types/escola"

const KEYS = { all: ["escolas"] as const }

export function useEscolas() {
  return useQuery({ queryKey: KEYS.all, queryFn: listarEscolas })
}

export function useCadastrarEscola() {
  return useMutation({
    mutationFn: cadastrarEscola,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useAtualizarEscola() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AtualizarEscolaRequest }) => atualizarEscola(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useDeletarEscola() {
  return useMutation({
    mutationFn: (id: string) => deletarEscola(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
  })
}
