import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { jwtDecode } from "jwt-decode"
import type { AuthUser, LoginRequest, LoginResponse } from "@/types/auth"
import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"

interface DecodedToken {
  sub: string
  email: string
  name: string
  [key: string]: unknown
  exp: number
}

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"

function decodeUser(token: string): AuthUser | null {
  try {
    const decoded = jwtDecode<DecodedToken>(token)
    if (decoded.exp * 1000 < Date.now()) return null
    const rawRole = decoded[ROLE_CLAIM] as string
    const perfil = rawRole as AuthUser["perfil"]
    const rawModuloFinanceiro = decoded["modulo_financeiro"]
    return {
      id: decoded.sub, email: decoded.email, nome: decoded.name, perfil,
      tipoOperacao: (decoded["tipo_operacao"] as string) ?? null,
      motoristaId: (decoded["motorista_id"] as string) ?? null,
      temModuloFinanceiro: rawModuloFinanceiro === "true" || rawModuloFinanceiro === true,
    }
  } catch {
    return null
  }
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isImpersonating: boolean
  login: (data: LoginRequest) => Promise<{ mustChangePassword: boolean }>
  logout: () => void
  impersonar: (transportadorId: string) => Promise<void>
  voltarParaBackoffice: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem("token")
    return token ? decodeUser(token) : null
  })
  const [isImpersonating, setIsImpersonating] = useState(
    () => !!localStorage.getItem("token_superadmin")
  )

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      const decoded = decodeUser(token)
      if (!decoded) {
        localStorage.removeItem("token")
        setUser(null)
      }
    }
  }, [])

  async function login(data: LoginRequest) {
    const response = await api.post<ApiResponse<LoginResponse>>("/auth/login", data)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error ?? "Erro ao fazer login")
    }
    const { token, mustChangePassword } = response.data.data
    localStorage.setItem("token", token)
    setUser(decodeUser(token))
    return { mustChangePassword }
  }

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("token_superadmin")
    setUser(null)
    setIsImpersonating(false)
  }

  async function impersonar(transportadorId: string): Promise<void> {
    const res = await api.post<ApiResponse<{ token: string }>>(
      `/backoffice/transportadores/${transportadorId}/impersonate`
    )
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.error ?? "Erro ao acessar transportador")
    }
    const currentToken = localStorage.getItem("token")!
    localStorage.setItem("token_superadmin", currentToken)
    localStorage.setItem("token", res.data.data.token)
    setUser(decodeUser(res.data.data.token))
    setIsImpersonating(true)
  }

  function voltarParaBackoffice(): void {
    const superAdminToken = localStorage.getItem("token_superadmin")
    if (!superAdminToken) return
    localStorage.setItem("token", superAdminToken)
    localStorage.removeItem("token_superadmin")
    setUser(decodeUser(superAdminToken))
    setIsImpersonating(false)
    window.location.href = "/backoffice"
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isImpersonating, login, logout, impersonar, voltarParaBackoffice }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
