import { useQuery, useMutation } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { listarMensalidades, pagarMensalidade, type ListarMensalidadesParams } from "@/services/mensalidades.service"

export const MENSALIDADE_KEYS = {
  all: ["mensalidades"] as const,
  list: (params?: ListarMensalidadesParams) => [...MENSALIDADE_KEYS.all, { params }] as const,
}

export function useMensalidades(params?: ListarMensalidadesParams) {
  return useQuery({
    queryKey: MENSALIDADE_KEYS.list(params),
    queryFn: () => listarMensalidades(params),
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
