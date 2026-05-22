import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type { EnviarRecadoRequest, RecadoDto } from "@/types/recado"

export async function listarRecados(): Promise<RecadoDto[]> {
  const res = await api.get<ApiResponse<RecadoDto[]>>("/recados")
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao listar recados")
  return res.data.data
}

export async function enviarRecado(data: EnviarRecadoRequest): Promise<string> {
  const res = await api.post<ApiResponse<string>>("/recados", data)
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao enviar recado")
  return res.data.data!
}

export async function deletarRecado(id: string): Promise<void> {
  const res = await api.delete<ApiResponse<boolean>>(`/recados/${id}`)
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao remover recado")
}
