export type Perfil = "Admin" | "Motorista" | "Responsavel" | "SuperAdmin"
export type TipoOperacao = "Autonomo" | "Frota"

export interface AuthUser {
  id: string
  email: string
  nome: string
  perfil: Perfil
  tipoOperacao?: TipoOperacao
  temModuloFinanceiro: boolean
}

export interface LoginResponse {
  token: string
  mustChangePassword: boolean
}

export interface LoginRequest {
  email: string
  senha: string
}

export interface RegisterRequest {
  nome: string
  email: string
  senha: string
  perfil: Perfil
}

export interface AlterarSenhaRequest {
  senhaAtual: string
  novaSenha: string
}
