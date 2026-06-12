import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type { CriarRotaRequest, EditarRotaRequest, Rota } from "@/types/rota"

function unwrap<T>(r: { data: ApiResponse<T> }): T {
  if (!r.data.success) throw new Error(r.data.error ?? "Erro na requisição")
  return r.data.data!
}

export const rotaService = {
  listar: () =>
    api.get<ApiResponse<Rota[]>>("/rotas").then(r => r.data.data ?? []),

  criar: (data: CriarRotaRequest) =>
    api.post<ApiResponse<string>>("/rotas", data).then(unwrap),

  editar: (id: string, data: EditarRotaRequest) =>
    api.put<ApiResponse<boolean>>(`/rotas/${id}`, data).then(unwrap),

  deletar: (id: string) =>
    api.delete<ApiResponse<boolean>>(`/rotas/${id}`).then(unwrap),

  adicionarAluno: (rotaId: string, alunoId: string) =>
    api.post<ApiResponse<boolean>>(`/rotas/${rotaId}/alunos/${alunoId}`).then(unwrap),

  removerAluno: (rotaId: string, alunoId: string) =>
    api.delete<ApiResponse<boolean>>(`/rotas/${rotaId}/alunos/${alunoId}`).then(unwrap),
}
