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
