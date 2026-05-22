import { useQuery } from "@tanstack/react-query"
import { listarAlunos, obterAluno } from "@/services/alunos.service"

export const ALUNO_KEYS = {
  all: ["alunos"] as const,
  list: (escolaId?: string) => [...ALUNO_KEYS.all, { escolaId }] as const,
  detail: (id: string) => [...ALUNO_KEYS.all, id] as const,
}

export function useAlunos(escolaId?: string) {
  return useQuery({
    queryKey: ALUNO_KEYS.list(escolaId),
    queryFn: () => listarAlunos(escolaId),
  })
}

export function useAluno(id: string) {
  return useQuery({
    queryKey: ALUNO_KEYS.detail(id),
    queryFn: () => obterAluno(id),
    enabled: !!id,
  })
}
