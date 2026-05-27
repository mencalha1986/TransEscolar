import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"

export interface ResponsavelResumoDto {
  nome: string
  telefone: string
  email: string
}

export async function buscarResponsavelPorCpf(cpf: string): Promise<ResponsavelResumoDto | null> {
  try {
    const res = await api.get<ApiResponse<ResponsavelResumoDto>>("/responsaveis/por-cpf", {
      params: { cpf },
    })
    return res.data.success && res.data.data ? res.data.data : null
  } catch {
    return null
  }
}

export interface AlunoResumoDto {
  id: string
  nome: string
  turno: string
}

export interface TransportadorContatoDto {
  nomeEmpresa: string
  telefone?: string
  email: string
}

export interface PerfilResponsavelDto {
  responsavelId: string
  nome: string
  alunos: AlunoResumoDto[]
  transportador?: TransportadorContatoDto
}

export async function obterPerfilResponsavel(): Promise<PerfilResponsavelDto> {
  const res = await api.get<ApiResponse<PerfilResponsavelDto>>("/responsaveis/meu-perfil")
  if (!res.data.success || !res.data.data) throw new Error(res.data.error ?? "Perfil não encontrado")
  return res.data.data
}
