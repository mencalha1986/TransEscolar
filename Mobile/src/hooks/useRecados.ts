import { useQuery, useMutation } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { darCienciaRecado, deletarRecado, enviarRecado, listarRecados } from "@/services/recados.service"
import type { EnviarRecadoRequest } from "@/types/recado"

export const RECADO_KEYS = {
  all: ["recados"] as const,
}

export function useRecados() {
  return useQuery({
    queryKey: RECADO_KEYS.all,
    queryFn: listarRecados,
    refetchInterval: 30_000,
  })
}

export function useEnviarRecado() {
  return useMutation({
    mutationFn: (data: EnviarRecadoRequest) => enviarRecado(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECADO_KEYS.all })
    },
  })
}

export function useDeletarRecado() {
  return useMutation({
    mutationFn: (id: string) => deletarRecado(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECADO_KEYS.all })
    },
  })
}

export function useDarCienciaRecado() {
  return useMutation({
    mutationFn: (id: string) => darCienciaRecado(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECADO_KEYS.all })
    },
  })
}
