import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type { AlterarSenhaRequest } from "@/types/auth"

export async function alterarSenha(data: AlterarSenhaRequest): Promise<void> {
  const res = await api.post<ApiResponse<null>>("/auth/alterar-senha", data)
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao alterar senha")
}
