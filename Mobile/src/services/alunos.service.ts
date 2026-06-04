import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type { AlunoDetalheDto, AlunoDto } from "@/types/aluno"

export async function listarAlunos(escolaId?: string): Promise<AlunoDto[]> {
  const params = escolaId ? { escolaId } : undefined
  const res = await api.get<ApiResponse<AlunoDto[]>>("/alunos", { params })
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao listar alunos")
  return res.data.data
}

export async function obterAluno(id: string): Promise<AlunoDetalheDto> {
  const res = await api.get<ApiResponse<AlunoDetalheDto>>(`/alunos/${id}`)
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Aluno não encontrado")
  return res.data.data
}

export async function cadastrarAluno(formData: FormData): Promise<AlunoDto> {
  const res = await api.post<ApiResponse<AlunoDto>>("/alunos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao cadastrar aluno")
  return res.data.data
}

export async function editarAluno(id: string, formData: FormData): Promise<string> {
  const res = await api.put<ApiResponse<string>>(`/alunos/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao editar aluno")
  return id
}

export async function deletarAluno(id: string): Promise<void> {
  const res = await api.delete<ApiResponse<boolean>>(`/alunos/${id}`)
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao deletar aluno")
}
