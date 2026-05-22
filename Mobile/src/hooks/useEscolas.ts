import { useQuery } from "@tanstack/react-query"
import { listarEscolas } from "@/services/escolas.service"

export const ESCOLA_KEYS = {
  all: ["escolas"] as const,
}

export function useEscolas() {
  return useQuery({
    queryKey: ESCOLA_KEYS.all,
    queryFn: listarEscolas,
  })
}
