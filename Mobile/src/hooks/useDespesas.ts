import { useQuery, useMutation } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { criarDespesa, excluirDespesa, listarDespesas } from "@/services/despesas.service"
import type { CriarDespesaRequest } from "@/types/despesa"

export const DESPESA_KEYS = {
  all: ["despesas"] as const,
  list: () => [...DESPESA_KEYS.all] as const,
}

export function useDespesas() {
  return useQuery({
    queryKey: DESPESA_KEYS.list(),
    queryFn: () => listarDespesas(),
  })
}

export function useCriarDespesa() {
  return useMutation({
    mutationFn: (data: CriarDespesaRequest) => criarDespesa(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESPESA_KEYS.all })
    },
  })
}

export function useExcluirDespesa() {
  return useMutation({
    mutationFn: (id: string) => excluirDespesa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DESPESA_KEYS.all })
    },
  })
}
