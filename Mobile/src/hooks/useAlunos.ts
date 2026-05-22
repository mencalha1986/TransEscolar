import { useQuery, useMutation } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { cadastrarAluno, editarAluno, listarAlunos, obterAluno } from "@/services/alunos.service"

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

export function useCadastrarAluno() {
  return useMutation({
    mutationFn: (formData: FormData) => cadastrarAluno(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALUNO_KEYS.all })
    },
  })
}

export function useEditarAluno(id: string) {
  return useMutation({
    mutationFn: (formData: FormData) => editarAluno(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALUNO_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ALUNO_KEYS.detail(id) })
    },
  })
}
