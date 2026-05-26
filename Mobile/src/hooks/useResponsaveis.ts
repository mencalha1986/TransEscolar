import { useQuery } from "@tanstack/react-query"
import { obterPerfilResponsavel } from "@/services/responsaveis.service"

export const RESPONSAVEL_KEYS = {
  perfil: ["responsavel-perfil"] as const,
}

export function usePerfilResponsavel() {
  return useQuery({
    queryKey: RESPONSAVEL_KEYS.perfil,
    queryFn: obterPerfilResponsavel,
    retry: 1,
    staleTime: 5 * 60_000,
  })
}
