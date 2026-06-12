import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { obterFrotaAtiva } from "@/services/viagens.service"

export function useFrotaAtiva() {
  return useQuery({
    queryKey: ["frota", "ativa"],
    queryFn: obterFrotaAtiva,
    refetchInterval: 15_000,
    placeholderData: keepPreviousData,
  })
}
