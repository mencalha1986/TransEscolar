import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type { AlterarSenhaRequest, LoginRequest, LoginResponse, RegisterRequest } from "@/types/auth"

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<ApiResponse<LoginResponse>>("/auth/login", data)
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Erro ao fazer login")
  return res.data.data
}

export async function register(data: RegisterRequest): Promise<void> {
  const res = await api.post<ApiResponse<null>>("/auth/register", data)
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao registrar")
}

export async function alterarSenha(data: AlterarSenhaRequest): Promise<void> {
  const res = await api.post<ApiResponse<null>>("/auth/alterar-senha", data)
  if (!res.data.success) throw new Error(res.data.error ?? "Erro ao alterar senha")
}
