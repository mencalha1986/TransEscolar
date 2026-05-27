import { useQuery } from "@tanstack/react-query"
import { obterMeuPerfil } from "@/services/responsaveis.service"
import { obterViagemAtual, obterPercurso } from "@/services/viagens.service"

export function useResponsavelPerfil() {
  return useQuery({
    queryKey: ["responsavel", "perfil"],
    queryFn: obterMeuPerfil,
  })
}

export function useViagemAtual() {
  return useQuery({
    queryKey: ["viagem", "atual"],
    queryFn: obterViagemAtual,
    refetchInterval: 15_000,
  })
}

export function usePercurso(viagemId: string | undefined) {
  return useQuery({
    queryKey: ["viagem", "percurso", viagemId],
    queryFn: () => obterPercurso(viagemId!),
    enabled: !!viagemId,
    refetchInterval: 15_000,
  })
}
