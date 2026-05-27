import { useMutation, useQuery } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { cancelarFalta, listarFaltas, registrarFalta } from "@/services/faltas.service"
import type { RegistrarFaltaRequest } from "@/services/faltas.service"

export function useFaltas(data?: string, alunoId?: string) {
  return useQuery({
    queryKey: ["faltas", data, alunoId],
    queryFn: () => listarFaltas(data, alunoId),
  })
}

export function useRegistrarFalta() {
  return useMutation({
    mutationFn: (req: RegistrarFaltaRequest) => registrarFalta(req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faltas"] }),
  })
}

export function useCancelarFalta() {
  return useMutation({
    mutationFn: (id: string) => cancelarFalta(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faltas"] }),
  })
}
