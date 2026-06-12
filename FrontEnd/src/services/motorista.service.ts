import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type { CriarMotoristaRequest, EditarMotoristaRequest, Motorista } from "@/types/motorista"

function unwrap<T>(r: { data: ApiResponse<T> }): T {
  if (!r.data.success) throw new Error(r.data.error ?? "Erro na requisição")
  return r.data.data!
}

export const motoristaService = {
  listar: () =>
    api.get<ApiResponse<Motorista[]>>("/motoristas").then(r => r.data.data ?? []),

  criar: (data: CriarMotoristaRequest) =>
    api.post<ApiResponse<string>>("/motoristas", data).then(unwrap),

  editar: (id: string, data: EditarMotoristaRequest) =>
    api.put<ApiResponse<boolean>>(`/motoristas/${id}`, data).then(unwrap),

  deletar: (id: string) =>
    api.delete<ApiResponse<boolean>>(`/motoristas/${id}`).then(unwrap),
}
