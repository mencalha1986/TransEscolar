import { useMutation, useQuery } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import type { CriarDespesaRequest, ListarDespesasParams } from "@/types/despesa"
import {
  criarDespesa,
  atualizarDespesa,
  excluirDespesa,
  listarDespesas,
  obterResumo,
} from "@/services/despesas.service"

export const DESPESA_KEYS = {
  all: ["despesas"] as const,
  list: (params?: ListarDespesasParams) => [...DESPESA_KEYS.all, params] as const,
  resumo: (dataInicio: string, dataFim: string) => ["despesas-resumo", dataInicio, dataFim] as const,
}

export function useDespesas(params?: ListarDespesasParams) {
  return useQuery({
    queryKey: DESPESA_KEYS.list(params),
    queryFn: () => listarDespesas(params),
  })
}

export function useResumoFinanceiro(dataInicio: string, dataFim: string) {
  return useQuery({
    queryKey: DESPESA_KEYS.resumo(dataInicio, dataFim),
    queryFn: () => obterResumo(dataInicio, dataFim),
    enabled: !!dataInicio && !!dataFim,
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

export function useAtualizarDespesa() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CriarDespesaRequest }) => atualizarDespesa(id, data),
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
