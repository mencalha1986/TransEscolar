export type Perfil = "Admin" | "Motorista" | "Responsavel" | "SuperAdmin"

export interface AuthUser {
  id: string
  email: string
  nome: string
  perfil: Perfil
  tipoOperacao?: string | null
  motoristaId?: string | null
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

export interface AlterarSenhaRequest {
  senhaAtual: string
  novaSenha: string
}
